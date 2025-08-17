import streamlit as st
import pandas as pd
import geopandas as gpd
import folium
from folium import plugins
from streamlit_folium import st_folium
import json
from datetime import datetime
import textwrap

# Set page config for full-screen layout
st.set_page_config(
    page_title="Area Planning Map",
    page_icon="🛰️",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# Custom CSS for full-screen layout
st.markdown("""
<style>
    html, body, .main {
        height: 100%;
        margin: 0;
        padding: 0;
    }
            
    .results-container {
        max-height: 40vh;
        overflow-y: auto;
        padding: 1rem;
        background: #f8f9fa;
        border-radius: 10px;
        margin: 1rem 0;
    }

    .full-screen-wrapper {
        display: flex;
        flex-direction: column;
        height: 100vh;
    }
            
    .main > div {
        padding-top: 0rem;
        padding-bottom: 0rem;
        padding-left: 0rem;
        padding-right: 0rem;
    }
    
    .block-container {
        padding-top: 1rem;
        padding-bottom: 0rem;
        padding-left: 1rem;
        padding-right: 1rem;
        max-width: none !important;
    }
    
    .main-header {
        font-size: 1.6rem;
        font-weight: bold;
        color: #2E7D32;
        text-align: center;
        margin-bottom: 0.5rem;
        padding: 0.5rem;
        background: linear-gradient(135deg, #E8F5E8 0%, #C8E6C9 100%);
        border-radius: 10px;
        border-left: 5px solid #4CAF50;
    }
    
    .analysis-card {
        background: linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%);
        padding: 1rem;
        border-radius: 10px;
        border-left: 5px solid #FF9800;
        margin: 0.5rem 0;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .area-summary {
        background: linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%);
        padding: 1rem;
        border-radius: 10px;
        border-left: 5px solid #2196F3;
        margin: 0.5rem 0;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    /* Hide Streamlit default elements */
    #MainMenu {visibility: hidden;}
    footer {visibility: hidden;}
    header {visibility: hidden;}
    
    /* Full-width map container */
    .map-container {
        flex: 1 1 auto;
        width: 100%;
        margin: 0;
    }
    
    .instructions {
        background: #e3f2fd;
        padding: 0.8rem;
        border-radius: 8px;
        border-left: 4px solid #2196f3;
        margin-bottom: 0.5rem;
    }
    
    /* Simple loading styles */
    .stSpinner > div {
        border-top-color: #2196F3 !important;
    }
</style>
""", unsafe_allow_html=True)

@st.cache_data
def load_geospatial_data():
    """Load kabupaten GeoJSON and SIMONTADI data"""
    try:
        kabupaten_gdf = gpd.read_file("data/kabupaten.geojson")
        df_simontadi = pd.read_csv("data/data_simotandi.csv")
        return kabupaten_gdf, df_simontadi
    except FileNotFoundError as e:
        st.error(f"Data file not found: {e}")
        return gpd.GeoDataFrame(), pd.DataFrame()

def create_planning_map():
    """Create interactive planning map with drawing tools"""
    # Create map centered on Indonesia
    m = folium.Map(location=[-2.5, 118], zoom_start=5, max_zoom=4, tiles=None)
    
    # Add base layers
    folium.TileLayer('OpenStreetMap', name='🗺 Basic Map', max_zoom=18).add_to(m)
    folium.TileLayer(
        tiles="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        attr="Esri Satellite",
        name="🛰 Satellite",
        max_zoom=18,
        control=True
    ).add_to(m)
    
    # Add drawing controls
    draw = plugins.Draw(
        draw_options={
            "polyline": True,
            "polygon": True,
            "circle": True,
            "rectangle": True,
            "marker": True,
            "circlemarker": False
        },
        edit_options={"edit": True}
    )
    draw.add_to(m)
    
    # Add other controls
    plugins.MeasureControl().add_to(m)
    plugins.Fullscreen().add_to(m)
    folium.LayerControl(position="topleft", collapsed=False).add_to(m)
    
    return m

def analyze_drawn_area(drawn_features, kabupaten_gdf, df_simontadi):
    """Analyze drawn features and return area information"""
    if not drawn_features:
        return []
    
    results = []
    drawn_gdf = gpd.GeoDataFrame.from_features(drawn_features, crs="EPSG:4326")
    drawn_gdf_m = drawn_gdf.to_crs(epsg=3857)  # Project to meters for area calculation
    
    metric_descriptions = {
        "BERA": "BERA (Luas Lahan Subur Yang Tidak Ditanami Selama Satu Musim)",
        "AIR": "AIR (Luas Lahan Berair)",
        "TANAM": "TANAM (Luas Lahan Fase Tanam: Umur 1 - 15 HST)",
        "VEG_1": "VEG_1 (Luas Lahan Fase Vegetasi Tahap 1: Umur 16 - 30 HST)",
        "VEG_2": "VEG_2 (Luas Lahan Fase Vegetasi Tahap 2: Umur 31 - 40 HST)",
        "MAX_VEG": "MAX_VEG (Luas Lahan Fase Vegetasi Maksimum: Umur 41 - 54 HST)",
        "GEN_1": "GEN_1 (Luas Lahan Fase Generasi Tanam ke-1: Umur 55 - 71 HST)",
        "GEN_2": "GEN_2 (Luas Lahan Fase Generasi Tanam ke-2: Umur 55 - 71 HST)",
        "PANEN": "PANEN (Luas Lahan Panen)",
        "LBS": "LBS (Luas Baku Sawah)"
    }
    
    for i, (_, row) in enumerate(drawn_gdf.iterrows()):
        centroid = row["geometry"].centroid
        
        # Find matching area in kabupaten data
        if not kabupaten_gdf.empty:
            matched_area = kabupaten_gdf[kabupaten_gdf.contains(centroid)]
            if not matched_area.empty:
                provinsi = matched_area.iloc[0]["prov_name"]
                kabupaten = matched_area.iloc[0]["alt_name"]
            else:
                provinsi = "Unknown"
                kabupaten = "Unknown"
        else:
            provinsi = "Unknown"
            kabupaten = "Unknown"
        
        # Calculate area
        polygon_m = drawn_gdf_m.iloc[i]["geometry"]
        area_sqm = polygon_m.area
        area_sqkm = area_sqm / 1e6
        
        # Get agricultural metrics
        agricultural_metrics = {}
        if not df_simontadi.empty and provinsi != "Unknown" and kabupaten != "Unknown":
            # Remove prefixes like "KABUPATEN", "KOTA", etc. and clean the name
            kabupaten_clean = kabupaten.upper()
            for prefix in ["KABUPATEN ", "KOTA ", "KAB. ", "KOTA ADMINISTRASI "]:
                if kabupaten_clean.startswith(prefix):
                    kabupaten_clean = kabupaten_clean.replace(prefix, "").strip()
            
            simon_match = pd.DataFrame()
            
            # Exact match after cleaning
            simon_match = df_simontadi[
                (df_simontadi["PROVINSI"].str.upper() == provinsi.upper()) 
                & (df_simontadi["KABKOT"].str.upper() == kabupaten_clean)
            ]
            
            # If no exact match, try partial matching (contains)
            if simon_match.empty:
                simon_match = df_simontadi[
                    (df_simontadi["PROVINSI"].str.upper() == provinsi.upper()) 
                    & (df_simontadi["KABKOT"].str.upper().str.contains(kabupaten_clean, na=False))
                ]
            
            # If still no match, try the other way around (kabupaten_clean contains KABKOT)
            if simon_match.empty:
                mask = df_simontadi.apply(
                    lambda row: (row["PROVINSI"].upper() == provinsi.upper()) and 
                               (kabupaten_clean.find(row["KABKOT"].upper()) != -1), 
                    axis=1
                )
                simon_match = df_simontadi[mask]
            
            if not simon_match.empty:
                # calculate average agricultural metrics across all kecamatan in the kabupaten
                metrics = simon_match[list(metric_descriptions.keys())].mean().round(2)
                agricultural_metrics = {
                    key: {
                        "description": desc.split("(", 1)[1].rstrip(")"),  # get text inside parentheses as description
                        "value": f"{metrics[key]:.2f}"
                    }
                    for key, desc in metric_descriptions.items()
                }

                # Add summary statistics
                kecamatan_count = len(simon_match)
                # agricultural_metrics["Jumlah Kecamatan"] = f"{kecamatan_count} kecamatan"
                
                # Add total metrics as well for reference
                # total_metrics = simon_match[list(metric_descriptions.keys())].sum()
                # agricultural_metrics["Deskripsi Paramter"] = f"Nilai parameter merupakan rata-rata dari {kecamatan_count} kecamatan pada Kabupaten/Kota {kabupaten_clean}"
        
        results.append({
            'area_id': i + 1,
            'coordinates': list(centroid.coords)[0],
            'provinsi': provinsi,
            'kabupaten': kabupaten,
            'area_sqm': area_sqm,
            'area_sqkm': area_sqkm,
            'jumlah_kecamatan': kecamatan_count,
            'agricultural_metrics': agricultural_metrics
        })
    
    return results

def main():
    # Header
    st.markdown('<div class="main-header">🛰️ Satellite Area Planning</div>', unsafe_allow_html=True)
    
    # Load data
    kabupaten_gdf, df_simontadi = load_geospatial_data()
    
    # Instructions
    st.markdown("""
    <div class="instructions">
        🖊️ <strong>Instruksi:</strong> gunakan tool drawing pada peta untuk memilih area of interest. Analisis terhadap area yang dipilih tersedia dibawah map.
    </div>
    """, unsafe_allow_html=True)
    
    # Create and display planning map with loading
    st.markdown('<div class="map-container">', unsafe_allow_html=True)
    
    # Show loading while creating map
    with st.spinner('🗺️ Loading interactive map...'):
        planning_map = create_planning_map()
        map_data = st_folium(
            planning_map,
            width="100%",
            height=600,
            key="planning_map",
            returned_objects=["all_drawings"]
        )
    st.markdown('</div>', unsafe_allow_html=True)
    
    # Analysis section - RIGHT HERE, immediately after map
    st.markdown('<div class="results-container">', unsafe_allow_html=True)
    
    if map_data and map_data.get("all_drawings"):
        # Export functionality
        col1, col2 = st.columns([3, 1])
        with col1:
            st.subheader("Hasil Analisis Area")
        
        
        drawn_features = map_data["all_drawings"]
        analysis_results = analyze_drawn_area(drawn_features, kabupaten_gdf, df_simontadi)
        
        with col2:
            if drawn_features:
                geojson_str = json.dumps({
                    "type": "FeatureCollection",
                    "features": drawn_features
                })
                st.download_button(
                    label="💾 Export GeoJSON",
                    data=geojson_str,
                    file_name=f"drawn_areas_{datetime.now().strftime('%Y%m%d_%H%M')}.geojson",
                    mime="application/geo+json"
                )
        
        # Display analysis for each drawn area
        for result in analysis_results:
            area_sqm_formatted = f"{result['area_sqm']:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")
            area_sqkm_formatted = f"{result['area_sqkm']:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")
            st.markdown(f"""
            <div class="area-summary">
                <h4 style="
                    font-size: 1.1rem;
                    font-weight: 600;
                    margin-bottom: 12px;
                    padding-bottom: 6px;
                    border-bottom: 2px solid #f0f2f5;
                    color: #2d3748;
                ">
                    📦 Area Plan #{result['area_id']}
                </h4>
                <div style="
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 12px;
                    color: #333;
                ">
                    <div style="line-height: 1.6;">
                        <strong style="color:#4a5568;">📍 Lokasi:</strong><br>
                        • Koordinat: {result['coordinates'][1]:.4f}, {result['coordinates'][0]:.4f}<br>
                        • Provinsi: {result['provinsi']}<br>
                        • Kabupaten: {result['kabupaten']}
                    </div>
                    <div style="line-height: 1.6;">
                        <strong style="color:#4a5568;">📐 Luas Area:</strong><br>
                        • {area_sqm_formatted} m²<br>
                        • {area_sqkm_formatted} km²
                    </div>
                </div>
            </div>
            """, unsafe_allow_html=True)
            
            # Agricultural metrics
            if result['agricultural_metrics']:
                html = f"""
            <div class="analysis-card">
            <h5>🌾 Tolok Ukur Pertanian untuk {result['kabupaten']}:</h5>
            <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(180px, 1fr));gap:0.75rem;">
            """
                for key, info in result['agricultural_metrics'].items():
                    html += f"""
            <div style="background:#f8fafc;border-radius:10px;padding:10px;text-align:center;border:1px solid #e2e8f0;box-shadow:0 2px 6px rgba(0,0,0,0.03);text-align: left;">
                <div style="font-size:1.2rem;color:#0f766e;margin-bottom:4px;font-weight:700;">{key} (Ha)</div>
                <div style="font-size:0.7rem;color:#64748b;margin-bottom:8px;font-weight:500;">{info['description']}</div>
                <div style="font-size:1.5rem;font-weight:800;color:#0ea5a4;">{info['value']}</div>
            </div>
            """
                html += f"""
            </div>
            <div style="margin-top:14px;font-size:0.8rem;text-align:left;color:#0f766e;">
            Nilai parameter merupakan rata-rata luas lahan dari {result['jumlah_kecamatan']} kecamatan pada {result['kabupaten']}<br><strong>HST: Hari Setelah Tanam</strong>
            </div>
            <div style="margin-top:14px;font-size:0.75rem;text-align:right;color:#94a3b8;">
                © 2025 All Rights Reserved By Pusdatin - Kementerian Pertanian RI
            </div>
            </div>
            """

                st.markdown(html, unsafe_allow_html=True)
            else:
                st.markdown(f"""
                <div class="analysis-card">
                    <p>⚠️ Tidak ditemukan metrics data agricultural untuk area ini.</p>
                    <p>© 2025 All Rights Reserved By Pusdatin - Kementerian Pertanian RI</p>
                </div>
                """, unsafe_allow_html=True)
                
        
        # Summary statistics
        if len(analysis_results) > 1:
            total_area = sum(r['area_sqkm'] for r in analysis_results)
            st.markdown(f"""
            <div class="analysis-card">
                <h5>📊 Summary Statistics:</h5>
                <p><strong>Total Area Plan:</strong> {len(analysis_results)}</p>
                <p><strong>Total Luas Area Plan:</strong> {total_area:.2f} km²</p>
            </div>
            """, unsafe_allow_html=True)
    
    else:
        st.markdown("""
        <div class="analysis-card">
            <h4>Area Planning</h4>
            <p>Gambar planning area pada map untuk meng-analisis potensi agricultural pada beberapa area yang berbeda:</p>
            <ul>
                <li>🔸 <strong>Polygon:</strong> Plan area dari titik-ke-titik (titik awal - titik akhir)</li>
                <li>🔹 <strong>Rectangle:</strong> Plan area dengan pane persegi</li>
                <li>⭕ <strong>Circle:</strong> Plan area dengan pane lingkaran</li>
                <li>📍 <strong>Marker:</strong> Pinpoint Lokasi tertentu</li>
            </ul>
            <p>Setiap area yang digambar akan menampilkan detail lokasi, pengukuran luas area, dan metric agrikultural jika tersedia</p>
        </div>
        """, unsafe_allow_html=True)
    
    st.markdown('</div>', unsafe_allow_html=True)
    

if __name__ == "__main__":
    main()
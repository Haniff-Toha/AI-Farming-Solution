import streamlit as st
import pandas as pd
import geopandas as gpd
import folium
from folium.features import GeoJsonTooltip
from folium import plugins
from streamlit_folium import st_folium
from branca.colormap import LinearColormap

# Set page config for full-screen layout
st.set_page_config(
    page_title="Agricultural Index Map",
    page_icon="🌾",
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
    
    .stSelectbox > div > div > div {
        background-color: #f0f2f6;
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
    
    .nav-container {
        flex: 0 0 auto;
    }
    
    /* Hide Streamlit default elements for cleaner look */
    #MainMenu {visibility: hidden;}
    footer {visibility: hidden;}
    header {visibility: hidden;}
    
    /* Fullscreen map container */
    .map-container {
        flex: 1 1 auto;
        width: 100%;
        margin: 0;
    }
    
    /* Stats container */
    .stats-container {
        margin-top: 1rem;
        padding: 0 1rem;
    }
</style>
""", unsafe_allow_html=True)

@st.cache_data
def load_agricultural_data():
    """Load agricultural index data"""
    try:
        df = pd.read_csv("data/indonesia_agricultural_index_by_province_data.csv")
        return df
    except FileNotFoundError:
        st.error("Agricultural index data file not found!")
        return pd.DataFrame()

@st.cache_data
def load_geojson_data():
    """Load GeoJSON data for provinces"""
    try:
        gdf = gpd.read_file("data/kabupaten.geojson")
        return gdf
    except FileNotFoundError:
        st.error("GeoJSON file not found!")
        return gpd.GeoDataFrame()

def create_agricultural_index_map(agri_df, geojson_gdf, selected_index):
    """Create agricultural index choropleth map"""
    if agri_df.empty or geojson_gdf.empty:
        return None
    
    # Standardize names for merge
    geojson_gdf['PROVINSI'] = geojson_gdf['prov_name'].str.upper()
    agri_df['Province'] = agri_df['Province'].str.upper()
    
    # Merge for coloring
    merged_gdf = geojson_gdf.merge(agri_df, left_on='PROVINSI', right_on='Province', how='left')
    
    # Create map
    m = folium.Map(location=[-2.5, 118], zoom_start=5, tiles=None)
    
    # Add base layers
    folium.TileLayer("OpenStreetMap", name="🗺 Basic Map").add_to(m)
    folium.TileLayer(
        tiles="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        attr="Esri Satellite", 
        name="🛰 Satellite", 
        control=True
    ).add_to(m)
    
    # Create color scale
    valid_values = merged_gdf[selected_index].dropna()
    if not valid_values.empty:
        vmin = valid_values.min()
        vmax = valid_values.max()
    else:
        vmin, vmax = 0, 1
    
    color_scale = LinearColormap(
        colors=["#d73027", "#fee08b", "#1a9850"],  # red → yellow → green
        vmin=vmin,
        vmax=vmax,
        caption="Nilai Persentase Index (%)"
    )
    
    # Add GeoJSON layer
    folium.GeoJson(
        merged_gdf,
        name=f"Nilai Persentase Index",
        style_function=lambda feature: {
            "fillColor": color_scale(feature["properties"][selected_index]) if feature["properties"][selected_index] is not None else "#d3d3d3",
            "color": "black",
            "weight": 0.5,
            "fillOpacity": 0.7,
        },
        highlight_function=lambda feature: {
            "fillColor": "#ffff99",
            "color": "blue",
            "weight": 2,
            "fillOpacity": 0.9,
        },
        tooltip=GeoJsonTooltip(
            fields=["Province", selected_index],
            aliases=["Provinsi:", "Nilai Index (%):"],
            localize=True
        )
    ).add_to(m)
    
    # Add controls
    color_scale.add_to(m)
    plugins.MeasureControl().add_to(m)
    plugins.Fullscreen().add_to(m)
    folium.LayerControl(position="topleft", collapsed=False).add_to(m)
    
    return m

def main():
    # Header
    st.markdown('<div class="main-header">🌾  Map Persentase Usaha Pertanian Perorangan <br/>yang Melakukan Langkah Tertentu dalam ' \
    'Rangka Mengurangi Risiko Lingkungan <br />Menurut Provinsi dan Jenis Langkah yang Dilakukan</div>', unsafe_allow_html=True)
    
    # Load data
    agri_df = load_agricultural_data()
    geojson_gdf = load_geojson_data()
    
    if agri_df.empty:
        st.error("Unable to load data. Please check file paths.")
        return
    
    # Navigation bar
    st.markdown('<div class="nav-container">', unsafe_allow_html=True)
    
    col1, col2, col3 = st.columns([1, 2, 1])
    
    with col2:
        # Index selection
        index_options = {
            "🌦️ Mempertimbangkan Jenis dan Iklim dalam Menentukan Dosis dan Frekuensi Pupuk": "Climate_Fertilizer_Consideration",
            "🧪 Melakukan Manajemen Nutrisi": "Nutrient_Management", 
            "🧂 Mendistribusikan Penerapan Pupuk Sintetis Selama Periode Pertumbuhan": "Synthetic_Fertilizer_Distribution"
        }
        
        selected_label = st.selectbox(
            "🔍 Pilih langkah agricultural untuk menampilkan nilai presentase index per Provinsi:",
            list(index_options.keys()),
            index=1,
            key="index_selector"
        )
        selected_index = index_options[selected_label]
    
    st.markdown('</div>', unsafe_allow_html=True)

    with st.spinner('Proses Analisis Data...'):
        try:
            # Create and display map
            agricultural_map = create_agricultural_index_map(agri_df, geojson_gdf, selected_index)
            
            if agricultural_map:
                # Show statistics in a compact format
                if not agri_df.empty:
                    st.markdown('<div class="stats-container">', unsafe_allow_html=True)
                    stats = agri_df[selected_index].describe()
                    
                    stats_html = f"""
                        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.75rem; margin-bottom: 1rem;">
                            <div style="background: #f0fdf4; border-radius: 12px; padding: 1rem; text-align: center; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
                                <div style="font-size: 0.85rem; color: #15803d; font-weight: 500;">Average</div>
                                <div style="font-size: 1.5rem; font-weight: 700; color: #065f46;">{stats['mean']:.1f}%</div>
                            </div>
                            <div style="background: #fefce8; border-radius: 12px; padding: 1rem; text-align: center; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
                                <div style="font-size: 0.85rem; color: #854d0e; font-weight: 500;">Median</div>
                                <div style="font-size: 1.5rem; font-weight: 700; color: #713f12;">{stats['50%']:.1f}%</div>
                            </div>
                            <div style="background: #ecfdf5; border-radius: 12px; padding: 1rem; text-align: center; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
                                <div style="font-size: 0.85rem; color: #047857; font-weight: 500;">Min</div>
                                <div style="font-size: 1.5rem; font-weight: 700; color: #065f46;">{stats['min']:.1f}%</div>
                            </div>
                            <div style="background: #fef9c3; border-radius: 12px; padding: 1rem; text-align: center; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
                                <div style="font-size: 0.85rem; color: #a16207; font-weight: 500;">Max</div>
                                <div style="font-size: 1.5rem; font-weight: 700; color: #854d0e;">{min(stats['max'], 100):.1f}%</div>
                            </div>
                        </div>
                        """

                    st.markdown(stats_html, unsafe_allow_html=True)
                    st.markdown("© Hasil Survey Ekonomi Pertanian (SEP) 2024 Badan Pusat Statistik Indonesia")
                    st.markdown('</div>', unsafe_allow_html=True)
                
                st.markdown('<div class="map-container">', unsafe_allow_html=True)
                with st.spinner('Loading Map...'):
                    map_data = st_folium(
                        agricultural_map, 
                        width="100%", 
                        height=600, 
                        key="agricultural_index_map",
                        returned_objects=["last_object_clicked"]
                    )
                st.markdown('</div>', unsafe_allow_html=True)
                
            else:
                st.error("Unable to create map. Please check data files.")

        except Exception as e:
                st.error(f"Error creating map: {str(e)}")
                st.info("Please check your data files and try again.")
    # st.markdown("© Hasil Survey Ekonomi Pertanian (SEP) 2024 Badan Pusat Statistik Indonesia")

if __name__ == "__main__":
    main()
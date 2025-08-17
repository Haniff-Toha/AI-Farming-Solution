import streamlit as st
import pandas as pd
import geopandas as gpd
import folium
from folium.features import GeoJsonTooltip
from folium import plugins
from streamlit_folium import st_folium
import plotly.express as px
# import matplotlib.pyplot as plt

# Set page config for full-screen layout
st.set_page_config(
    page_title="Crop Production Map",
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
    
    .nav-container {
        background: white;
        padding: 0.8rem;
        border-radius: 10px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        margin-bottom: 0.5rem;
    }
    
    .info-card {
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
    
    .stSelectbox > div > div > div {
        background-color: #f0f2f6;
    }
    
    .stRadio > div {
        display: flex;
        flex-direction: row;
        gap: 2rem;
    }
    
    /* Stats and info sections */
    .content-section {
        padding: 0 1rem;
        margin-top: 1rem;
    }
</style>
""", unsafe_allow_html=True)

@st.cache_data
def load_crop_data():
    """Load crop production data"""
    try:
        df_luaspanen = pd.read_csv("data/bdsp_luaspanen_tanamanpangan_kabupaten_2020_2025.csv")
        df_produksi = pd.read_csv("data/bdsp_produksi_tanamanpangan_kabupaten_2020_2025.csv")
        df_produktivitas = pd.read_csv("data/bdsp_produktivitas_tanamanpangan_kabupaten_2020_2025.csv")
        return df_luaspanen, df_produksi, df_produktivitas
    except FileNotFoundError as e:
        st.error(f"Data file not found: {e}")
        return pd.DataFrame(), pd.DataFrame(), pd.DataFrame()

@st.cache_resource
def load_geojson_data():
    """Load kabupaten GeoJSON data"""
    try:
        gdf = gpd.read_file("data/kabupaten.geojson")
        return gdf
    except FileNotFoundError:
        st.error("GeoJSON file not found!")
        return gpd.GeoDataFrame()
def create_crop_production_map(selected_df, selected_year, selected_crop, selected_metric_label, geojson_gdf):
    """Create crop production choropleth map with improved matching logic"""
    if selected_df.empty or geojson_gdf.empty:
        return None
    
    # Filter dan agrgasi data
    df_filtered = selected_df[
        selected_df["Komoditas"] == selected_crop
    ][["Provinsi", "Kabupaten", str(selected_year)]].copy()
    
    if df_filtered.empty:
        return None
    
    # Remove rows with null/zero values in the year column
    # df_filtered = df_filtered.dropna(subset=[str(selected_year)])
    # df_filtered = df_filtered[df_filtered[str(selected_year)] > 0]
    
    if df_filtered.empty:
        return None
    
    # Aggregate by kabupaten
    df_agg = df_filtered.groupby(
        ["Provinsi", "Kabupaten"], as_index=False
    )[str(selected_year)].sum()
    df_agg.rename(columns={str(selected_year): "value"}, inplace=True)
    
    # match geojson dengan dataset
    geojson_work = geojson_gdf.copy()

    geojson_work['PROVINSI_CLEAN'] = (geojson_work['prov_name']
                                     .str.upper()
                                     .str.strip()
                                     .str.replace(r'\s+', ' ', regex=True))
    
    # Clean geojson nama kabupaten tetap gunakan KOTA
    geojson_work['KABUPATEN_CLEAN'] = (geojson_work['name']
                                      .str.upper()
                                      .str.strip()
                                      .str.replace("KABUPATEN ", "", regex=False)
                                      .str.replace("KAB. ", "", regex=False)
                                      .str.replace(r'\s+', ' ', regex=True))
    
    # clean dataset
    df_agg['PROVINSI_CLEAN'] = (df_agg['Provinsi']
                               .str.upper()
                               .str.strip()
                               .str.replace(r'\s+', ' ', regex=True))
    
    # handling bug Kota Sukabumi dan Kabupaten Sukabumi
    # dalam dataset
    df_agg.loc[df_agg['PROVINSI_CLEAN'] == 'SUKABUMI', 'PROVINSI_CLEAN'] = 'JAWA BARAT'
    df_agg['KABUPATEN_RAW'] = (df_agg['Kabupaten']
                              .str.upper()
                              .str.strip()
                              .str.replace(r'\s+', ' ', regex=True))
    df_agg['KABUPATEN_CLEAN'] = (df_agg['KABUPATEN_RAW']
                                .str.replace("KABUPATEN ", "", regex=False)
                                .str.replace("KAB. ", "", regex=False))
    
    # dalam geojson
    geojson_work['KABUPATEN_CLEAN'] = (geojson_work['name']
                                      .str.upper()
                                      .str.strip()
                                      .str.replace("KABUPATEN ", "", regex=False)
                                      .str.replace("KAB. ", "", regex=False)
                                      .str.replace(r'\s+', ' ', regex=True))
    
    # Special cases mapping - nama di dataset -> nama di geojson
    special_cases_mapping = {
        'MUSI BANYUASIN': 'MUSI BANYU ASIN',
        'MAHAKAM ULU': 'MAHAKAM HULU',
        'FAKFAK': 'FAK-FAK',
        'BATAM': 'BATAM',
        'SIAK': 'SIAK',
        'DUMAI': 'DUMAI',
        'DONGGALA': 'DONGGALA',
        'POSO': 'POSO',
        'TOBA': 'TOBA SAMOSIR',
        'LUBUKLINGGAU': 'LUBUK LINGGAU',
        'PADANGSIDIMPUAN': 'PADANG SIDIMPUAN',
        "PAREPARE" : "PARE-PARE",
        'MAMUJU UTARA/PASANGKAYU': 'MAMUJU UTARA'
    }
    
    # Apply special case mappings to dataset
    df_agg['KABUPATEN_CLEAN'] = df_agg['KABUPATEN_CLEAN'].replace(special_cases_mapping)
    
    # Exact match on both province and kabupaten
    merged_gdf = geojson_work.merge(
        df_agg[['PROVINSI_CLEAN', 'KABUPATEN_CLEAN', 'value']],
        left_on=['PROVINSI_CLEAN', 'KABUPATEN_CLEAN'],
        right_on=['PROVINSI_CLEAN', 'KABUPATEN_CLEAN'],
        how='left'
    )
    
    exact_matches = merged_gdf['value'].notna().sum()
    
    # kabupaten-only match - fallback jika tidak ada match
    if exact_matches < len(df_agg) * 0.5:  
        unmatched_geo = merged_gdf[merged_gdf['value'].isna()].copy()
        
        # For kabupaten-only matching, hapus prefix KOTA
        unmatched_geo['KABUPATEN_NO_KOTA'] = unmatched_geo['KABUPATEN_CLEAN'].str.replace("KOTA ", "", regex=False)
        df_agg_no_kota = df_agg.copy()
        df_agg_no_kota['KABUPATEN_NO_KOTA'] = df_agg_no_kota['KABUPATEN_CLEAN'].str.replace("KOTA ", "", regex=False)
        
        # fallback matching
        kabupaten_agg = df_agg_no_kota.copy()
        
        # untuk kasus Sukabumi:No agregasi Kota Sukabumi & Kab.Sukabumi
        sukabumi_variants = kabupaten_agg[kabupaten_agg['KABUPATEN_NO_KOTA'] == 'SUKABUMI']
        multiple_sukabumi = len(sukabumi_variants['PROVINSI_CLEAN'].unique()) > 1 or \
                               len(kabupaten_agg[kabupaten_agg['KABUPATEN_NO_KOTA'] == 'SUKABUMI']) > 1
        
        if multiple_sukabumi:
            non_sukabumi_data = kabupaten_agg[kabupaten_agg['KABUPATEN_NO_KOTA'] != 'SUKABUMI']
            kabupaten_only_data = non_sukabumi_data.groupby('KABUPATEN_NO_KOTA')['value'].sum().reset_index()
        else:
            kabupaten_only_data = kabupaten_agg.groupby('KABUPATEN_NO_KOTA')['value'].sum().reset_index()
        
        kabupaten_only_merge = unmatched_geo.merge(
            kabupaten_only_data,
            left_on='KABUPATEN_NO_KOTA',
            right_on='KABUPATEN_NO_KOTA',
            how='left',
            suffixes=('', '_kabupaten_match')
        )
        
        # Update dataframe dengan kabupaten-only matches
        mask = merged_gdf['value'].isna()
        merged_gdf.loc[mask, 'value'] = kabupaten_only_merge['value_kabupaten_match'].values

    m = folium.Map(location=[-2.5, 118], zoom_start=5, tiles=None)

    folium.TileLayer("OpenStreetMap", name="🗺 Basic Map").add_to(m)
    folium.TileLayer(
        tiles="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        attr="Esri Satellite", 
        name="🛰 Satellite", 
        control=True
    ).add_to(m)
    
    # color scale
    valid_values = merged_gdf["value"].dropna()
    if not valid_values.empty:
        vmin = valid_values.min()
        vmax = valid_values.max()
        if vmin > vmax:
            vmin, vmax = vmax, vmin
    else:
        vmin, vmax = 0, 1
    
    color_scale = folium.LinearColormap(
        colors=["#ffffcc", "#18ce3d", "#03640E"],
        vmin=vmin,
        vmax=vmax,
        caption=f"{selected_metric_label} - {selected_crop} ({selected_year})"
    )
    
    folium.GeoJson(
        merged_gdf,
        name=f"{selected_metric_label}",
        style_function=lambda feature: {
            "fillColor": color_scale(feature["properties"]["value"]) if feature["properties"]["value"] is not None else "#d3d3d3",
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
            fields=["KABUPATEN_CLEAN", "PROVINSI_CLEAN", "value"],
            aliases=["Kabupaten:", "Provinsi:", f"{selected_metric_label}:"],
            localize=True,
            sticky=False,
            direction='top',
            opacity=0.9
        )
    ).add_to(m)

    
    # Add controls
    color_scale.add_to(m)
    plugins.MeasureControl().add_to(m)
    plugins.Fullscreen().add_to(m)
    folium.LayerControl(position="topleft", collapsed=False).add_to(m)
    
    return m, merged_gdf

def get_summary_stats(df, year_col):
    """Get summary statistics for the data"""
    if df.empty or year_col not in df.columns:
        return None
    
    valid_data = df[year_col].dropna()
    if valid_data.empty:
        return None
    
    return {
        'count': len(valid_data),
        'mean': valid_data.mean(),
        'median': valid_data.median(),
        'min': valid_data.min(),
        'max': valid_data.max(),
        'total': valid_data.sum()
    }

def format_idr(value, decimals=2):
    return f"{value:,.{decimals}f}".replace(",", "X").replace(".", ",").replace("X", ".")

def main():
    # Header
    st.markdown('<div class="main-header">🌾 Map Luas Panen, Produksi, Produktivitas Tanaman Pangan' \
    ' <br/ >menurut Provinsi/Kabupaten</div>', unsafe_allow_html=True)
    
    # Load data
    df_luaspanen, df_produksi, df_produktivitas = load_crop_data()
    geojson_gdf = load_geojson_data()
    
    if df_luaspanen.empty:
        st.error("Unable to load crop data. Please check file paths.")
        return
    
    # Navigation bar
    st.markdown('<div class="nav-container">', unsafe_allow_html=True)
    
    # Create three columns for navigation
    col1, col2, col3 = st.columns(3)
    
    with col1:
        # Year selection
        available_years = [2020, 2021, 2022, 2023, 2024, 2025]
        selected_year = st.selectbox(
            "🗓️ Tahun:",
            available_years,
            index=2,  # Default to 2023
            key="year_selector"
        )
    
    with col2:
        # Crop selection
        crop_list = sorted(df_luaspanen["Komoditas"].unique())
        selected_crop = st.selectbox(
            "🌾 Komoditas:",
            crop_list,
            index=4,
            key="crop_selector"
        )
    
    with col3:
        # Metric selection
        metric_options = {
            "Luas Panen (Ha)": df_luaspanen,
            "Produksi (Ton)": df_produksi,
            "Produktivitas (Kuintal/Ha)": df_produktivitas
        }
        selected_metric_label = st.selectbox(
            "📊 Jenis Data:",
            list(metric_options.keys()),
            index=1,
            key="metric_selector"
        )
        selected_df = metric_options[selected_metric_label]
    
    st.markdown('</div>', unsafe_allow_html=True)
    
    # Create and display map
    with st.spinner('Proses Analisis Data...'):
        try:
            crop_map, merged_data = create_crop_production_map(
                selected_df, selected_year, selected_crop, selected_metric_label, geojson_gdf
            )
            if crop_map:
                # Show statistics
                col1, col2, col3, col4, col5 = st.columns(5)
                
                # Get statistics
                stats = get_summary_stats(merged_data, "value")
                if stats:
                    cards_html = ""

                    # Card 1: Total Area
                    cards_html += f"""
                    <div style="background: #f0fdf4; border-radius: 12px; padding: 1rem; text-align: center; 
                                box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
                        <div style="font-size: 0.85rem; color: #15803d; font-weight: 500;">Total Kabupaten/Kota</div>
                        <div style="font-size: 1.5rem; font-weight: 700; color: #065f46;">{stats['count']:,}</div>
                    </div>
                    """

                    # Card 2: Total Luas/Produksi/Produktivitas
                    if selected_metric_label == "Luas Panen (Ha)":
                        label = f"Total Luas Panen {selected_crop}"
                        value = f"{format_idr(stats['total'], 0)} Ha"
                    elif selected_metric_label == "Produksi (Ton)":
                        label = f"Total Produksi {selected_crop}"
                        value = f"{format_idr(stats['total'], 0)} Ton"
                    else:
                        label = f"Total Produktivitas {selected_crop}"
                        value = f"{format_idr(stats['total'], 0)} Kuintal/Ha"

                    cards_html += f"""
                    <div style="background: #fefce8; border-radius: 12px; padding: 1rem; text-align: center; 
                                box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
                        <div style="font-size: 0.85rem; color: #854d0e; font-weight: 500;">{label}</div>
                        <div style="font-size: 1.5rem; font-weight: 700; color: #713f12;">{value}</div>
                    </div>
                    """

                    # Card 3: Mean
                    cards_html += f"""
                    <div style="background: #ecfdf5; border-radius: 12px; padding: 1rem; text-align: center; 
                                box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
                        <div style="font-size: 0.85rem; color: #047857; font-weight: 500;">Mean</div>
                        <div style="font-size: 1.5rem; font-weight: 700; color: #065f46;">{format_idr(stats['mean'], 2)}</div>
                    </div>
                    """

                    # Card 4: Median
                    cards_html += f"""
                    <div style="background: #fef9c3; border-radius: 12px; padding: 1rem; text-align: center; 
                                box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
                        <div style="font-size: 0.85rem; color: #a16207; font-weight: 500;">Median</div>
                        <div style="font-size: 1.5rem; font-weight: 700; color: #854d0e;">{format_idr(stats['median'], 2)}</div>
                    </div>
                    """

                    # Card 5: Max Value
                    cards_html += f"""
                    <div style="background: #f0fdf4; border-radius: 12px; padding: 1rem; text-align: center; 
                                box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
                        <div style="font-size: 0.85rem; color: #15803d; font-weight: 500;">Nilai Tertinggi {selected_metric_label}</div>
                        <div style="font-size: 1.5rem; font-weight: 700; color: #065f46;">{format_idr(stats['max'], 2)}</div>
                    </div>
                    """

                    # Wrap in grid
                    cards_html = f"""
                    <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 1rem;">
                        {cards_html}
                    </div>
                    """

                    st.markdown(cards_html, unsafe_allow_html=True)
                    st.markdown("© Pusat Data dan Sistem Informasi Kementerian Pertanian")
                
                with st.spinner('Loading Map...'):
                    st.markdown('<div class="map-container">', unsafe_allow_html=True)
                    # MODIFIED: Don't capture return data to prevent reloads
                    st_folium(
                        crop_map,
                        width="100%",
                        height=600,
                        key="crop_production_map",
                        use_container_width=True
                    )
                    st.markdown('</div>', unsafe_allow_html=True)
                
                # Content section with statistics and information
                st.markdown('<div class="content-section">', unsafe_allow_html=True)

                
                #Data quality information
                null_count = len(merged_data[merged_data["value"].isnull()])
                if null_count > 0:
                    # Get the missing areas
                    missing_areas = merged_data[merged_data["value"].isnull()]
                    
                    st.markdown(f"""
                    <div class="info-card">
                        <h5>ℹ️ Informasi Lingkupan Data</h5>
                        <p><strong>Area dengan data:</strong> {len(merged_data) - null_count:,} kabupaten/kota</p>
                        <p><strong>Area tanpa data:</strong> {null_count:,} kabupaten/kota</p>
                        <p><strong>Persentase Linkup Data:</strong> {((len(merged_data) - null_count) / len(merged_data) * 100):.1f}%</p>
                    </div>
                    """, unsafe_allow_html=True)
                    
                    # Show missing areas in an expander
                    with st.expander(f"🔍 Lihat {null_count} Area Tanpa Data", expanded=False):
                        st.markdown("**Area yang tidak memiliki data:**")
                        
                        # Group by province for better organization
                        if not missing_areas.empty:
                            missing_by_prov = missing_areas.groupby('PROVINSI_CLEAN')
                            
                            for prov_name, group in missing_by_prov:
                                kabupaten_list = group['KABUPATEN_CLEAN'].tolist()
                                st.markdown(f"**{prov_name}** ({len(kabupaten_list)} area{'s' if len(kabupaten_list) > 1 else ''})")
                                
                                # Display kabupaten in columns for better layout
                                cols = st.columns(3)
                                for i, kabupaten in enumerate(sorted(kabupaten_list)):
                                    cols[i % 3].markdown(f"• {kabupaten}")
                                
                                st.markdown("---")
                        
                        st.markdown("© Pusat Data dan Sistem Informasi Kementerian Pertanian")
                else:
                    zero_count = len(merged_data[merged_data["value"] == 0])
                    st.markdown(f"""
                    <div class="info-card">
                        <h5>ℹ️ Informasi Lingkupan Data</h5>
                        <p><strong>Semua area memiliki data:</strong> {len(merged_data):,} kabupaten/kota</p>
                        <p><strong>Persentase Linkup Data:</strong> 100.0%</p>
                        <p><strong>Total Kabupaten/Kota dengan nilai {selected_metric_label} nol:</strong> {zero_count:,}</p>
                        <p>© Pusat Data dan Sistem Informasi Kementerian Pertanian</p>
                    </div>
                    """, unsafe_allow_html=True)

                # Top performing kabupaten
                if not merged_data.empty:
                    top_areas = merged_data.dropna(subset=["value"]).nlargest(10, "value")
                    # st.dataframe(top_areas)
                    # st.dataframe(merged_data.head(10))
                    if not top_areas.empty:
                        st.markdown(f"""
                        <div class="info-card">
                            <h5>🏆 Top 10 Kabupaten/Kota - {selected_metric_label} - Komoditas: {selected_crop} - Tahun: {selected_year}</h5>
                        </div>
                        """, unsafe_allow_html=True)
                        
                        col1, col2 = st.columns([3, 2])
                        
                        #Layout chart
                        with col1:
                            chart_data = top_areas.copy()
                            chart_data['display_name'] = chart_data['KABUPATEN_CLEAN'].str.title() + ', ' + chart_data['PROVINSI_CLEAN'].str.title()
                            chart_data = chart_data.sort_values('value', ascending=True)  

                            fig = px.bar(
                                chart_data, 
                                x='value',
                                y='display_name', 
                                color='value',
                                orientation='h',
                                color_continuous_scale=['#ffeb3b', '#4caf50', '#1b5e20'],
                                text="value",
                                labels={
                                    'display_name': 'Kabupaten/Kota',
                                    'value': selected_metric_label
                                }
                            )
                            
                            # Customize layout chart
                            fig.update_layout(
                                height=500,
                                xaxis_title=selected_metric_label,
                                yaxis_title="Kabupaten/Kota",
                                showlegend=False,
                                plot_bgcolor='rgba(0,0,0,0)',
                                paper_bgcolor='rgba(0,0,0,0)',
                                margin=dict(l=10, r=10, t=30, b=10),
                                dragmode=False
                            )

                            # fitur interaktif chart
                            config_intv = {
                                # 'staticPlot': True,
                                'displayModeBar': False,
                                'showTips': True,
                                'editable': False,    
                                'selectable': False,
                                'dragmode':False
                            }
                            
                            # nilai labels di akhir bar
                            fig.update_traces(
                                texttemplate='%{x:,.0f}',
                                # textposition='outside',
                                textposition=[
                                    "outside" if v > top_areas["value"].max() * 0.15 else "outside"
                                    for v in top_areas["value"]
                                ],
                                textfont_size=10
                            )
                            
                            # Display chart
                            st.plotly_chart(fig, use_container_width=True, config=config_intv)
                            
                            # statistik singkat dibawah chart
                            st.markdown(f"**📈 Statistik Singkat {selected_metric_label} {selected_crop} Top 10 Kabupaten/Kota:**")
                            col1a, col1b, col1c = st.columns(3)
                            with col1a:
                                st.metric(
                                    "Nilai Tertinggi", 
                                    f"{format_idr(top_areas.iloc[0]['value'], 2)}", 
                                    f"{top_areas.iloc[0]['KABUPATEN_CLEAN'].title()}"
                                )
                            with col1b:
                                avg_top10 = top_areas['value'].mean()
                                st.metric(
                                    "Rata-rata", 
                                    f"{format_idr(avg_top10, 2)}"
                                )
                            with col1c:
                                total_top10 = top_areas['value'].sum()
                                st.metric(
                                    f"Total {selected_metric_label} dari Top 10 Kabupaten/Kota", 
                                    f"{format_idr(total_top10, 2)}"
                                )
                        
                        #layout tabel
                        with col2:
                            st.markdown("**📋 Tabel Detail Top 10 Kabupaten/Kota**")
                            
                            # buat detailed table
                            display_df = top_areas.copy()
                            display_df['Rank'] = range(1, len(display_df) + 1)
                            display_df['Kabupaten'] = display_df['KABUPATEN_CLEAN'].str.title()
                            display_df['Provinsi'] = display_df['PROVINSI_CLEAN'].str.title()
                            display_df[selected_metric_label] = display_df['value'].apply(lambda x: format_idr(x, 2))
                            
                            # Display formatted table
                            st.dataframe(
                                display_df[['Rank', 'Kabupaten', 'Provinsi', selected_metric_label]],
                                use_container_width=True,
                                hide_index=True,
                                height=350,
                                column_config={
                                    "Rank": st.column_config.NumberColumn(
                                        "Peringkat",
                                        width="small"
                                    ),
                                    "Kabupaten": st.column_config.TextColumn(
                                        "🏘️ Kabupaten/Kota",
                                        width="medium"
                                    ),
                                    "Provinsi": st.column_config.TextColumn(
                                        "📍 Provinsi",
                                        width="medium"
                                    ),
                                    selected_metric_label: st.column_config.TextColumn(
                                        f"📊 Value",
                                        width="small"
                                    )
                                }
                            )
                            
                            # Informasi Perbandingan Data
                            st.markdown("**🔍 Informasi Perbandingan:**")
                            
                            # Gap peringkat #1 dan  #2
                            if len(top_areas) >= 2:
                                gap_pct = ((top_areas.iloc[0]['value'] - top_areas.iloc[1]['value']) / top_areas.iloc[0]['value'] * 100)
                                st.markdown(f"• **Gap Peringkat 1 & 2:** {gap_pct:.1f}%")
                            
                            # koef. variasi
                            std_val = top_areas['value'].std()
                            mean_val = top_areas['value'].mean()
                            cv = (std_val / mean_val * 100) if mean_val > 0 else 0
                            st.markdown(f"• **Koefisien Variasi (CV):** {cv:.1f}%")
                            
                            # Dominance dari top 3
                            if len(top_areas) >= 3:
                                top3_share = top_areas.head(3)['value'].sum() / top_areas['value'].sum() * 100
                                st.markdown(f"• **Share Top 3:** {top3_share:.1f}%")
                            
                            # Range - gap
                            value_range = top_areas['value'].max() - top_areas['value'].min()
                            st.markdown(f"• **Range:** {format_idr(value_range, 2)}")
                        
                        st.markdown("© Pusat Data dan Sistem Informasi Kementerian Pertanian")
                
                st.markdown('</div>', unsafe_allow_html=True)
                
            else:
                st.warning(f"No data available for {selected_crop} in {selected_year}. Please try a different combination.")
                
                # Tampilkan komoditas yang tersedia dari tahun pilihan
                available_data = selected_df[selected_df[str(selected_year)].notna()]
                if not available_data.empty:
                    available_crops = sorted(available_data["Komoditas"].unique())
                    st.info(f"**Available crops for {selected_year}:** {', '.join(available_crops[:10])}{'...' if len(available_crops) > 10 else ''}")
        
        except Exception as e:
            st.error(f"Error creating map: {str(e)}")
            st.info("Please check your data files and try again.")

if __name__ == "__main__":
    main()
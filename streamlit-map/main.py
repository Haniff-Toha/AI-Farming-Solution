import streamlit as st

# Set page config
st.set_page_config(
    page_title="Indonesian Agriculture Maps",
    page_icon="🌾",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS for navigation
st.markdown("""
<style>
    .main-nav {
        background: linear-gradient(135deg, #E8F5E8 0%, #C8E6C9 100%);
        padding: 2rem;
        border-radius: 15px;
        text-align: center;
        margin: 2rem 0;
        box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }
    
    .nav-button {
        display: inline-block;
        background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
        color: white;
        padding: 1rem 2rem;
        margin: 0.5rem;
        border-radius: 10px;
        text-decoration: none;
        font-weight: bold;
        font-size: 1.1rem;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        transition: transform 0.2s;
    }
    
    .nav-button:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0,0,0,0.3);
    }
    
    .description-card {
        background: white;
        padding: 1.5rem;
        border-radius: 10px;
        margin: 1rem 0;
        border-left: 5px solid #4CAF50;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
</style>
""", unsafe_allow_html=True)

def main():
    st.markdown("""
    <div class="main-nav">
        <h1>🌾 Indonesia Agriculture GIS</h1>
        <p style="font-size: 1.2rem; color: #666;">Maps Interaktif dan Analisis Tools</p>
    </div>
    """, unsafe_allow_html=True)
    
    # Navigation options
    st.markdown("## 🗺️ Fitur GIS yang tersedia")
    
    col1, col2, col3 = st.columns(3)
    
    with col1:
        st.markdown("""
        <div class="description-card">
            <h3>🌾 Indeks Pertanian</h3>
            <p>Jelajahi pertimbangan iklim & pupuk, manajemen nutrisi, dan distribusi pupuk sintetis di seluruh provinsi di Indonesia.</p>
            <p><strong>Fitur:</strong></p>
            <ul>
                <li>Peta choropleth per provinsi</li>
                <li>Pilihan metrik interaktif</li>
                <li>Ringkasan statistik</li>
                <li>Visualisasi layar penuh</li>
            </ul>
        </div>
        """, unsafe_allow_html=True)

    with col2:
        st.markdown("""
        <div class="description-card">
            <h3>🛰️ Perencanaan Wilayah</h3>
            <p>Peta interaktif dengan alat gambar untuk seleksi wilayah dan analisis pertanian.</p>
            <p><strong>Fitur:</strong></p>
            <ul>
                <li>Alat gambar (poligon, lingkaran, persegi)</li>
                <li>Perhitungan luas secara real-time</li>
                <li>Analisis metrik pertanian</li>
                <li>Fitur ekspor GeoJSON</li>
            </ul>
        </div>
        """, unsafe_allow_html=True)

    with col3:
        st.markdown("""
        <div class="description-card">
            <h3>📊 Produksi Tanaman</h3>
            <p>Visualisasi data produksi tanaman (luas panen, produksi, produktivitas) berdasarkan kabupaten/kota.</p>
            <p><strong>Fitur:</strong></p>
            <ul>
                <li>Data multi-tahun (2020–2025)</li>
                <li>Berbagai jenis tanaman</li>
                <li>Detail tingkat kabupaten</li>
                <li>Peringkat kinerja terbaik</li>
            </ul>
        </div>
        """, unsafe_allow_html=True)

if __name__ == "__main__":
    main()
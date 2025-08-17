import os

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

LANGUAGES = {
    'en': 'English',
    'id': 'Indonesia',
}

BASE_PRICES = {
    "Cabai Merah Keriting": 48000,
    "Bawang Merah": 35000,
    "Beras Medium": 13500
}

REGIONAL_FACTORS = {
    "Jawa Timur": 1.0, 
    "Jawa Barat": 1.05,
    "Sumatera Utara": 1.1,
    "Sulawesi Selatan": 1.15 
}

PROVINCES = {
    "Aceh": [4.6951, 96.7494], "Sumatera Utara": [2.1154, 99.5451], "Sumatera Barat": [-0.9471, 100.3543], 
    "Riau": [0.5071, 101.4478], "Kepulauan Riau": [3.9457, 108.1428], "Jambi": [-1.6101, 103.6131],
    "Bengkulu": [-3.5778, 102.3464], "Sumatera Selatan": [-3.5761, 103.9103], "Kepulauan Bangka Belitung": [-2.7410, 106.4406],
    "Lampung": [-4.5586, 105.4068], "Banten": [-6.4058, 106.0640], "DKI Jakarta": [-6.2088, 106.8456],
    "Jawa Barat": [-6.9175, 107.6191], "Jawa Tengah": [-7.1509, 110.1402], "DI Yogyakarta": [-7.8754, 110.4262],
    "Jawa Timur": [-7.5361, 112.2384], "Bali": [-8.4095, 115.1889], "Nusa Tenggara Barat": [-8.6529, 117.3616],
    "Nusa Tenggara Timur": [-8.6574, 121.0794], "Kalimantan Barat": [-0.0224, 111.4753], "Kalimantan Tengah": [-1.6814, 113.3824],
    "Kalimantan Selatan": [-3.0926, 115.2838], "Kalimantan Timur": [0.5387, 116.4239], "Kalimantan Utara": [2.9542, 116.2410],
    "Gorontalo": [0.6999, 122.4467], "Sulawesi Utara": [1.5428, 124.7219], "Sulawesi Tengah": [-1.4300, 121.4456],
    "Sulawesi Barat": [-2.8441, 119.2321], "Sulawesi Selatan": [-3.6447, 119.9975], "Sulawesi Tenggara": [-4.1449, 122.1746],
    "Maluku": [-3.2384, 130.1453], "Maluku Utara": [1.5739, 127.8087], "Papua Barat": [-1.3362, 133.1747],
    "Papua": [-4.2699, 138.0804], "Papua Tengah": [-3.9399, 136.2421], "Papua Pegunungan": [-4.3332, 139.5292],
    "Papua Selatan": [-7.0212, 139.4678], "Papua Barat Daya": [-1.2239, 131.0857]
}

COMMODITIES = {
    "Padi": {"tanam": [11, 12, 1, 5, 6], "panen": [3, 4, 8, 9], "icon": "🌾"},
    "Jagung": {"tanam": [11, 12, 4, 5], "panen": [2, 3, 7, 8], "icon": "🌽"},
    "Cabai Merah": {"tanam": [4, 5], "panen": [7, 8, 9], "icon": "🌶️"},
    "Bawang Merah": {"tanam": [3, 4], "panen": [6, 7, 8], "icon": "🧅"},
    "Kelapa Sawit": {"tanam": [], "panen": list(range(1, 13)), "icon": "🌴"},
}

FEATURE_RANGES = {
    'Temparature': (25, 38),
    'Humidity': (50, 72),
    'Soil Moisture': (25, 65),
    'Nitrogen': (4, 42),
    'Potassium': (0, 19),
    'Phosphorous': (0, 42)
}

DISTRICTS_CHOICES = [
    "TUMKUR", "BELGAUM", "HASSAN", "BELLARY", "DAVANGERE", "HAVERI",
    "CHAMARAJANAGAR", "CHITRADURGA", "GULBARGA", "MYSORE", "SHIMOGA",
    "DHARWAD", "CHIKMAGALUR", "BANGALORE_RURAL", "BIDAR", "MANDYA",
    "GADAG", "BAGALKOT", "BIJAPUR", "RAICHUR", "KOPPAL", "UTTAR_KANNAD",
    "BENGALURU_URBAN", "KOLAR", "KODAGU", "UDUPI", "DAKSHIN_KANNAD",
    "CHIKBALLAPUR", "RAMANAGARA", "YADGIR"
]

CROPS_CHOICES = [
    "Maize", "Rice", "Sunflower", "Jowar", "Dry chillies", "Horse-gram",
    "Groundnut", "Ragi", "Onion", "Moong(Green Gram)", "Urad", "Coconut",
    "Gram", "Cotton(lint)", "Arhar/Tur", "Potato", "Sesamum", "Niger seed",
    "Other Kharif pulses", "Sugarcane", "Other  Rabi pulses", "Castor seed",
    "Coriander", "Turmeric", "Bajra", "Banana", "Arecanut", "Cowpea(Lobia)",
    "Dry ginger", "Small millets", "Rapeseed &Mustard", "Wheat", "Garlic",
    "Safflower", "Linseed", "Black pepper", "Sweet potato", "Tobacco",
    "Peas & beans (Pulses)", "Soyabean", "Cashewnut", "Cardamom", "Tapioca",
    "Mesta", "Sannhamp", "Brinjal", "Other Fresh Fruits", "Mango", "Pome Fruit",
    "Citrus Fruit", "Paddy", "Tomato", "Beans & Mutter(Vegetable)", "Grapes",
    "Papaya", "Cashewnut Processed", "Cashewnut Raw", "Atcanut (Raw)", "Arcanut (Processed)"
]

SEASONS_CHOICES = ["Kharif", "Rabi", "WholeYear", "Summer"]

# SOIL_TYPE_MAPPING = {'Black': 0, 'Clayey': 1, 'Loamy': 2, 'Red': 3, 'Sandy': 4}

# CROP_TYPE_MAPPING = {'Barley': 0, 'Cotton': 1, 'Ground Nuts': 2, 'Maize': 3, 'Millets': 4, 'Oil seeds': 5, 'Paddy': 6, 'Pulses': 7, 'Sugarcane': 8, 'Tobacco': 9, 'Wheat': 10}
SOIL_TYPE_MAPPING = {'Hitam': 0, 'Liat': 1, 'Lempung': 2, 'Merah': 3, 'Berpasir': 4}

CROP_TYPE_MAPPING = {
    'Jelai': 0,
    'Kapas': 1,
    'Kacang Tanah': 2,
    'Jagung': 3,
    'Jewawut / Serealia kecil': 4,
    'Oil seeds': 5,
    'Padi': 6,
    'Kacang-kacangan': 7,
    'Tebu': 8,
    'Tembakau': 9,
    'Gandum': 10
}


FERTILIZER_NAME_MAPPING = {0: '10-26-26', 1: '14-35-14', 2: '17-17-17', 3: '20-20', 4: '28-28', 5: 'DAP', 6: 'Urea'}

FERTILIZER_DESCRIPTIONS = {
    '10-26-26': (
        "Pupuk seimbang ini mengandung 10% Nitrogen (N), 26% Fosfor (P), dan 26% Kalium (K). "
        "Sangat efektif untuk tanaman yang membutuhkan perkembangan akar yang kuat dan peningkatan pembungaan. "
        "Kandungan Fosfor (P) yang tinggi membantu pembentukan akar, sehingga ideal digunakan pada tahap awal pertumbuhan tanaman atau saat pindah tanam. "
        "Kalium (K) mendukung kesehatan tanaman secara keseluruhan dengan memperkuat kemampuan tanaman dalam melawan penyakit dan stres, termasuk kekeringan."
    ),
    '14-35-14': (
        "Pupuk ini mengandung 14% Nitrogen (N), 35% Fosfor (P), dan 14% Kalium (K), menjadikannya pilihan yang kaya Fosfor (P). "
        "Sangat berguna untuk tanaman yang membutuhkan pengembangan akar dan pembungaan yang signifikan. "
        "Tingkat Fosfor (P) yang tinggi mendorong perkembangan awal tanaman dan meningkatkan fase berbunga. "
        "Sementara kadar Nitrogen (N) dan Kalium (K) yang sedang memastikan pertumbuhan daun yang memadai dan kesehatan tanaman secara keseluruhan, "
        "formulasi ini sangat cocok untuk tanaman berbunga dan tanaman umbi."
    ),
    '17-17-17': (
        "Pupuk serbaguna yang mengandung 17% Nitrogen (N), 17% Fosfor (P), dan 17% Kalium (K). "
        "Rasio nutrisi yang seimbang ini dirancang untuk penggunaan umum pada berbagai jenis tanaman, memberikan nutrisi yang lengkap. "
        "Nitrogen (N) mendorong pertumbuhan daun yang hijau dan subur; Fosfor (P) mendorong perkembangan akar yang kuat dan transfer energi yang efisien dalam tanaman; "
        "Kalium (K) membantu dalam pengaturan air, aktivasi enzim, dan ketahanan terhadap penyakit. Pupuk ini sering digunakan saat dibutuhkan pendekatan nutrisi yang seimbang sepanjang musim tanam."
    ),
    '20-20': (
        "Pupuk ini menawarkan 20% Nitrogen (N) dan 20% Fosfor (P). Ini merupakan pupuk yang kaya Nitrogen (N), ideal untuk mendorong pertumbuhan daun dan vegetatif, yang penting pada tahap awal pertumbuhan tanaman. "
        "Kandungan Fosfor (P) mendukung pengembangan akar dan transfer energi, membantu tanaman untuk lebih cepat beradaptasi. "
        "Formulasi ini sangat cocok untuk sayuran daun, sereal, dan tanaman lain yang membutuhkan pertumbuhan bagian atas yang kuat."
    ),
    '28-28': (
        "Mengandung 28% Nitrogen (N) dan 28% Fosfor (P), pupuk ini dirancang untuk memberikan dorongan Nitrogen (N) dan Fosfor (P) yang kuat pada tanaman. "
        "Kandungan Nitrogen (N) yang tinggi mendorong pertumbuhan daun yang hijau dan subur, cocok untuk fase vegetatif. "
        "Fosfor (P) memastikan sistem akar yang kokoh dan membantu proses pembungaan dan pembuahan, sangat penting bagi tanaman yang membutuhkan dukungan akar yang luas atau yang tumbuh di tanah dengan kadar Fosfor (P) rendah."
    ),
    'DAP': (
        "Di-Amonium Fosfat (DAP) adalah pupuk yang banyak digunakan, mengandung 18% Nitrogen (N) dan 46% Fosfor (P). "
        "Pupuk tinggi Fosfor (P) ini ideal untuk merangsang pertumbuhan akar serta meningkatkan pembungaan dan produksi buah. "
        "Nitrogen (N) mendukung pertumbuhan daun dan batang yang kuat, sementara Fosfor (P) sangat penting untuk pengembangan akar dan transfer energi, "
        "menjadikan DAP sangat bermanfaat pada tahap awal pertumbuhan tanaman atau saat hasil uji tanah menunjukkan kadar Fosfor (P) yang rendah."
    ),
    'Urea': (
        "Urea adalah pupuk Nitrogen (N) berkonsentrasi tinggi yang mengandung 46% Nitrogen (N). Dikenal karena memberikan pelepasan Nitrogen (N) secara cepat, "
        "yang penting untuk merangsang pertumbuhan daun yang cepat dan hijau. "
        "Nitrogen (N) merupakan komponen utama klorofil, senyawa yang digunakan tanaman dalam fotosintesis, dan sangat vital untuk tanaman daun, rumput, dan serealia. "
        "Urea sering diaplikasikan pada tanaman yang membutuhkan peningkatan Nitrogen (N) dengan cepat, terutama pada tahap awal pertumbuhan atau ketika muncul tanda-tanda kekurangan Nitrogen (N)."
    )
}
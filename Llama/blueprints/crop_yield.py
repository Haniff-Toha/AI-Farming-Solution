from flask import Blueprint, request, jsonify
import pandas as pd
from models import get_crop_yield_model_indonesia, get_client
from constant import LANGUAGES
import re

crop_yield_bp = Blueprint('crop_yield_bp', __name__)

def normalize_input(input_dict, min_vals, max_vals):
    norm_input = {}
    for key in input_dict:
        if key in min_vals and key in max_vals:
            denom = max_vals[key] - min_vals[key]
            if denom == 0:
                norm_input[key] = 0  # Or handle division by zero differently
            else:
                norm_input[key] = (input_dict[key] - min_vals[key]) / denom
        else:
            raise KeyError(f"Missing key '{key}' in min/max data.")
    return pd.DataFrame([norm_input])


@crop_yield_bp.route('/crop_yield', methods=['POST'])
def crop_yield():
    data = request.get_json()

    # Get inputs
    area = float(data.get('Area', 1))
    district = data.get('District', '')
    crop = data.get('Crop', '')
    season = data.get('Season', '')
    lang = request.form.get('language', 'id')

    crop_name_map = {
        "Padi": "Rice, paddy",
        "Jagung": "Maize",
        "Kedelai": "Soybeans",
        "Ubi Jalar": "Sweet potatoes",
        "Singkong": "Cassava",
        "Kentang": "Potatoes"
    }
    mapped_crop = crop_name_map.get(crop, "")

    crop_data = {
        "Kemarau": {'average_rain_fall_mm_per_year': 200, 'avg_temp': 30, 'pesticides_tonnes': 3},
        "Hujan": {'average_rain_fall_mm_per_year': 300, 'avg_temp': 26, 'pesticides_tonnes': 2},
        "Pancaroba": {'average_rain_fall_mm_per_year': 250, 'avg_temp': 28, 'pesticides_tonnes': 2}
    }

    model, data_max, data_min = get_crop_yield_model_indonesia()

    # Build raw input dict
    raw_input = {
        'average_rain_fall_mm_per_year': crop_data[season]['average_rain_fall_mm_per_year'],
        'avg_temp': crop_data[season]['avg_temp'],
        'pesticides_tonnes': crop_data[season]['pesticides_tonnes'],
    }

    # Normalize numeric input
    normalized = normalize_input(raw_input, data_min, data_max).iloc[0].to_dict()

    # Add categorical (boolean) features
    normalized['Country_Indonesia'] = True
    crop_columns = [
        'Item_Cassava',
        'Item_Maize',
        'Item_Potatoes',
        'Item_Rice, paddy',
        'Item_Soybeans',
        'Item_Sweet potatoes'
    ]
    for col in crop_columns:
        normalized[col] = (col == f"Item_{mapped_crop}")

    # Make into DataFrame
    final_input = pd.DataFrame([normalized])

    # Predict yield per hectare
    predicted_yield_hg_per_ha = model.predict(final_input)[0]

    # Total yield
    # Convert to tons/ha
    predicted_yield_per_ha = predicted_yield_hg_per_ha * 0.0001

    # Total yield in tons
    total_yield = predicted_yield_per_ha * area
    
    prompt = f"""Anda adalah seorang ahli pertanian yang menganalisis perkiraan panen.
    Sajikan informasi dengan data ini:
    
    ---Predicted Crop Yield =  {round(total_yield, 2)}---
    ---Yield per Hectare =  {round(predicted_yield_per_ha, 2)}---
    ---Area =  {area}---
    ---District =  {district}---
    ---Crop =  {crop}---
    ---Season =  {season}---
    
    dalam format berikut (gunakan Bahasa {LANGUAGES[lang]}):

    ---AWAL PENJELASAN---
    Penjelasan: [Definisi mengenai perkiraan tersebut, jelaskan dengan bahasa sederhana agar petani mudah memahami.]
    ---AKHIR PENJELASAN---

    ---AWAL REKOMENDASI---
    Rekomendasi:
    - [Rekomendasi 1]
    - [Rekomendasi 2]
    - [Rekomendasi 3]
    ---AKHIR REKOMENDASI---

    Template ini digunakan untuk memprediksi hasil panen berdasarkan jenis tanaman, musim tanam, dan luas lahan.
    """
    
    client = get_client()

    completion = client.chat.completions.create(
        model="meta-llama/llama-4-scout-17b-16e-instruct", 
        messages=[
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt},
                ]
            }
        ],
        temperature=0.7,
        max_tokens=1024,
    )

    raw_llm_output = completion.choices[0].message.content
    # reasoning_content = completion.choices[0].message.reasoning_content

    parsed_penjelasan = "Tidak ada penjelasan spesifik."
    parsed_rekomendasi = []

    penjelasan_match = re.search(r'---AWAL PENJELASAN---(.*?)---AKHIR PENJELASAN---', raw_llm_output, re.DOTALL)
    if penjelasan_match:
        parsed_penjelasan = penjelasan_match.group(1).strip().replace("Penjelasan:", "").strip()

    rekomendasi_match = re.search(r'---AWAL REKOMENDASI---(.*?)---AKHIR REKOMENDASI---', raw_llm_output, re.DOTALL)
    if rekomendasi_match:
        content = rekomendasi_match.group(1)
        parsed_rekomendasi = [line.strip().lstrip('- ').strip() for line in content.split('\n') if line.strip() and line.strip().startswith('-')]
    
    return jsonify({
        'Predicted Crop Yield': round(total_yield, 2),
        'Yield per Hectare': round(predicted_yield_per_ha, 2),
        'Area': area,
        'District': district,
        'Crop': crop,
        'Season': season,
        'Year': 2025,
        'Description': parsed_penjelasan,
        'recomendation': parsed_rekomendasi,
        'raw_llm_out':raw_llm_output
    })

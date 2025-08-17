from flask import Blueprint, request, jsonify
from constant import LANGUAGES
from models import get_crop_model, get_crop_scaler_minmax, get_crop_scaler_standard, get_client
import re
import numpy as np

crop_rec_bp = Blueprint("crop_rec_bp", __name__)

@crop_rec_bp.route("/crop_rec",methods=['POST'])
def crop_recom():
    data = request.get_json()

    # Extract data from the request
    N = data.get('n')
    P = data.get('p')
    K = data.get('k')
    temperature = data.get('temperature')
    humidity = data.get('humidity')
    ph = data.get('ph')
    rainfall = data.get('rainfall')

    feature_list = [N, P, K, temperature, humidity, ph, rainfall]
    single_pred = np.array(feature_list).reshape(1, -1)

    model = get_crop_model()
    ms = get_crop_scaler_minmax()
    sc = get_crop_scaler_standard()
    
    scaled_features = ms.transform(single_pred)
    final_features = sc.transform(scaled_features)
    prediction = model.predict(final_features)

    crop_dict = {1: "Beras", 2: "Jagung", 3: "Bayam Molucca", 4: "Kapas", 5: "Kelapa", 6: "Pepaya", 7: "Jeruk",
                8: "Apel", 9: "Melon", 10: "Semangka", 11: "Anggur", 12: "Mangga", 13: "Pisang",
                14: "Delima", 15: "Kacang Lentil", 16: "Kacang Hijau Hitam/Kacang Urd", 17: "Kacang Hujau", 18: "Kacang Koro Padang",
                19: "Kacang Gude", 20: "Kacang Merah", 21: "Chickpea/Kacang Arab", 22: "Kopi"}

    if prediction[0] in crop_dict:
        crop = crop_dict[prediction[0]]
        # result = "{} adalah pilihan yang cocok untuk ditanam berdasarkan parameter lahan".format(crop)
    else:
        result = "Sorry, we could not determine the best crop to be cultivated with the provided data."

    #-------------------- Response LLM -----------------------------
    lang = request.form.get('language', 'id')
    if lang not in LANGUAGES:
        return jsonify({"error": f"Unsupported language code. Supported codes are: {', '.join(LANGUAGES.keys())}"}), 400
    prompt = f"""
    Anda berperan sebagai seorang **Analis Agrikultur profesional**. 
    Tugas Anda adalah mengevaluasi hasil prediksi model machine learning untuk merekomendasikan jenis tanaman (crop) berdasarkan data lingkungan dan tanah, 
    lalu menyusun analisis yang **ringkas, terstruktur, dan mudah dipahami oleh petani**.
    Sajikan informasi dengan data ini:
    
    ---Natrium (N) = {N}
    ---Phospor (P) = {P}
    ---Potasium (K) = {K}
    ---Suhu Udara (Temperature) = {temperature}°C
    ---Kelembapan (Humidity) = {humidity}%
    ---Ph Tanah = {ph}
    ---Curah Hujan (Rainfall) = {rainfall} mm
    ---Bibit Rekomendasi model = **{crop}**

    dalam format berikut (gunakan Bahasa {LANGUAGES[lang]}):

    ---AWAL PENJELASAN---
    Penjelasan: [Definisi mengenai rekomendasi bibit tersebut, jelaskan dengan bahasa sederhana agar petani mudah memahami.]
    ---AKHIR PENJELASAN---

    ---AWAL REKOMENDASI---
    Rekomendasi:
    - [Rekomendasi 1]
    - [Rekomendasi 2]
    - [Rekomendasi 3]
    ---AKHIR REKOMENDASI---

    **Instruksi Penting:**  
    - Gunakan bahasa yang **padat, lugas, dan praktis**.  
    - Hindari kalimat panjang atau teknis yang sulit dipahami petani.  
    - Fokus pada informasi **yang bisa langsung diterapkan di lapangan**.
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
        temperature=0.3,
        max_tokens=1024,
    )

    raw_llm_output = completion.choices[0].message.content
    # reasoning_content = completion.choices[0].message.reasoning_content

    penjelasan_match = re.search(r'---AWAL PENJELASAN---(.*?)---AKHIR PENJELASAN---', raw_llm_output, re.DOTALL)
    if penjelasan_match:
        parsed_penjelasan = penjelasan_match.group(1).strip().replace("Penjelasan:", "").strip()

    rekomendasi_match = re.search(r'---AWAL REKOMENDASI---(.*?)---AKHIR REKOMENDASI---', raw_llm_output, re.DOTALL)
    if rekomendasi_match:
        content = rekomendasi_match.group(1)
        parsed_rekomendasi = [line.strip().lstrip('- ').strip() for line in content.split('\n') if line.strip() and line.strip().startswith('-')]
    
    #================================================================
    return jsonify({
        'Nitrogen': N,
        'Phosporus': P,
        'Potassium': K,
        'Temperature': temperature,
        'Humidity': humidity,
        'Ph': ph,
        'Rainfall': rainfall,
        'Description': parsed_penjelasan,
        'recomendation':parsed_rekomendasi,
        'PredictedCrop': crop,
        'raw_llm_out':raw_llm_output
    })
    
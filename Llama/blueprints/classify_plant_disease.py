from flask import Blueprint, request, jsonify
from constant import LANGUAGES
from models import get_client
import base64
import re

classify_plant_disease_bp = Blueprint("classify_plant_disease_bp", __name__)

@classify_plant_disease_bp.route('/classify_plant_disease', methods=['POST'])
def classify_plant_disease():
    if 'image' not in request.files:
        return jsonify({"error": "No image file provided"}), 400

    lang = request.form.get('language', 'id')

    if lang not in LANGUAGES:
        return jsonify(
            {
                "error": f"Unsupported language code. Supported codes are: {', '.join(LANGUAGES.keys())}"
            }
        ), 400

    image_file = request.files['image']
    try:
        image_data_url = f"data:image/jpeg;base64,{base64.b64encode(image_file.read()).decode()}"
    except Exception as e:
        return jsonify({"error": f"Failed to read image file: {str(e)}"}), 500

    prompt = f"""Anda adalah seorang ahli pertanian yang menganalisis penyakit tanaman.
    Sajikan informasi dalam format berikut (gunakan Bahasa {LANGUAGES[lang]}):
    [SELALU GUNAKAN BAHASA INDONESIA!]

    ---AWAL DIAGNOSIS---
    Diagnosis: [Nama Penyakit]
    Tingkat Risiko: [Rendah/Sedang/Tinggi]
    Perkiraan Dampak Panen: [Persentase atau Deskripsi, misal: Penurunan 30-50%]
    ---AKHIR DIAGNOSIS---

    ---AWAL PENJELASAN---
    Penjelasan: [Definisi atau penyebab penyakit, jelaskan dengan bahasa sederhana agar petani mudah memahami.]
    ---AKHIR PENJELASAN---

    ---AWAL REKOMENDASI---
    Rekomendasi:
    - [Rekomendasi 1]
    - [Rekomendasi 2]
    - [Rekomendasi 3]
    ---AKHIR REKOMENDASI---

    Analisis gambar tanaman yang diberikan dan hasilkan diagnosis, penjelasan, dan rekomendasi tindakan.
    Pastikan format keluaran persis seperti yang diminta.
    Jika tidak ada penyakit terdeteksi, nyatakan "Tidak terdeteksi" pada Diagnosis.
    """

    client = get_client()

    completion = client.chat.completions.create(
        model="meta-llama/llama-4-scout-17b-16e-instruct", 
        messages=[
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt},
                    {"type": "image_url", "image_url": {"url": image_data_url}}
                ]
            }
        ],
        temperature=0.7,
        max_tokens=1024,
    )

    raw_llm_output = completion.choices[0].message.content
    # reasoning_content = completion.choices[0].message.reasoning_content


    parsed_diagnosis = "Tidak terdeteksi"
    parsed_tingkat_risiko = "Tidak ada"
    parsed_dampak_panen = "Tidak ada"
    parsed_penjelasan = "Tidak ada penjelasan spesifik."
    parsed_rekomendasi = []

    diagnosis_match = re.search(r'---AWAL DIAGNOSIS---(.*?)---AKHIR DIAGNOSIS---', raw_llm_output, re.DOTALL)
    if diagnosis_match:
        content = diagnosis_match.group(1)
        diag_line = re.search(r'Diagnosis: (.*)', content)
        if diag_line: parsed_diagnosis = diag_line.group(1).strip()
        risiko_line = re.search(r'Tingkat Risiko: (.*)', content)
        if risiko_line: parsed_tingkat_risiko = risiko_line.group(1).strip()
        dampak_line = re.search(r'Perkiraan Dampak Panen: (.*)', content)
        if dampak_line: parsed_dampak_panen = dampak_line.group(1).strip()

    penjelasan_match = re.search(r'---AWAL PENJELASAN---(.*?)---AKHIR PENJELASAN---', raw_llm_output, re.DOTALL)
    if penjelasan_match:
        parsed_penjelasan = penjelasan_match.group(1).strip().replace("Penjelasan:", "").strip()

    rekomendasi_match = re.search(r'---AWAL REKOMENDASI---(.*?)---AKHIR REKOMENDASI---', raw_llm_output, re.DOTALL)
    if rekomendasi_match:
        content = rekomendasi_match.group(1)
        parsed_rekomendasi = [line.strip().lstrip('- ').strip() for line in content.split('\n') if line.strip() and line.strip().startswith('-')]

    return jsonify({
        "diagnosis": parsed_diagnosis,
        "tingkat_risiko": parsed_tingkat_risiko,
        "dampak_panen": parsed_dampak_panen,
        "penjelasan": parsed_penjelasan,
        "rekomendasi": parsed_rekomendasi,
        "language": LANGUAGES[lang],
        "status": "success",
        "raw_llm": raw_llm_output
    }), 200

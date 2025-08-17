from flask import Blueprint, request, jsonify, g
from constant import LANGUAGES
from models import get_client
import re
import pandas as pd
from datetime import datetime, timedelta
# import random
# import math
import os

market_prices_new_bp = Blueprint("market_prices_new_bp", __name__)

@market_prices_new_bp.route('/market_prices_new', methods=['GET'])
def get_market_price_new():
    g.request_time = datetime(2025, 7, 27) 
    commodity = request.args.get('commodity')
    region = request.args.get('region')
    period = request.args.get('period', '30d') # Default 30 hari

    csv_path = os.path.join(os.path.dirname(__file__), '..', 'dataset', 'sp2kp_90days_1Agustus2025_national_history.csv')
    df_sp2kp_90_4agustus = pd.read_csv(csv_path)
    # df_sp2kp_90_4agustus = pd.read_csv('../dataset/sp2kp_90days_1Agustus2025_national_history.csv')

    if not commodity or not region:
        return jsonify({"error": "Parameter 'commodity', 'region', and 'period' are required"}), 400

    # period_map = {'30d': 30, '90d': 90, '365d': 365}
    period_map = {'30d': 30, '90d': 90}
    period_days = period_map.get(period, 30)

    summary = get_commodity_summary(df_sp2kp_90_4agustus, commodity, period_days)

    return(summary)

def get_commodity_summary(df, komoditas, days=30):
    # Ensure tanggal_data is datetime
    df['tanggal_data'] = pd.to_datetime(df['tanggal_data'])
    # Filter by commodity
    df_filtered = df[df['variant_nama'] == komoditas].copy()
    # Sort by date
    df_filtered = df_filtered.sort_values('tanggal_data')
    # Filter last N days
    if days is not None:
        max_date = df_filtered['tanggal_data'].max()
        min_date = max_date - pd.Timedelta(days=days)
        df_filtered = df_filtered[df_filtered['tanggal_data'] >= min_date]
    # Prepare JSON
    historical_prices = [
        {"date": d.strftime("%Y-%m-%d"), "price": float(p)}
        for d, p in zip(df_filtered['tanggal_data'], df_filtered['harga_rata_rata'])
    ]

    # satuan display
    satuan_display = "Liter" if "minyak" in komoditas.lower() else "Kg"

    #-------------------- Response LLM -----------------------------
    lang = request.form.get('language', 'id')
    if lang not in LANGUAGES:
        return jsonify({"error": f"Unsupported language code. Supported codes are: {', '.join(LANGUAGES.keys())}"}), 400
    prompt = f"""
    Anda berperan sebagai seorang **Analis Harga & Pasar Komoditas Pangan di Indonesia**. 
    Tugas Anda adalah menganalisis hasil timeseries harga rata-rata suatu komoditas diindonesia,
    buat analisis yang **ringkas, terstruktur, dan mudah dipahami** hanya dalam satu kalimat.

    ### Data Masukan:
    - **Komoditas:** {komoditas}
    - **Periode harga dalam:** {days} hari terakhir
    - **Historis harga:** {historical_prices}
    
    Dalam format berikut (Gunakan Bahasa **{LANGUAGES[lang]}**):
    ---ANALISIS DATA--- 
    Sampaikan analisis singkat apakah tren harga dalam periode ini cenderung **stabil**, **meningkat**, **menurun**, **fluktuatif**, dan/atau **perlu perhatian** atau tidak, berikat rekomendasi secara ringkas jika diperlukan
    *Catatan: Jangan mempertanyakan kelengkapan data! & perhatikan tren {historical_prices} secara menyeluruh, jangan sebutkan harga tertentu!*
    
    ---
    **Instruksi Penting:**  
    - Gunakan bahasa yang **padat, lugas, dan praktis**.  
    - Hindari kalimat panjang atau teknis yang sulit dipahami.
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

    # Ambil 'Analisis Data Masukkan'
    if raw_llm_output:
        # penjelasan_match = re.search(r'---ANALISIS DATA---', raw_llm_output, re.DOTALL)
        penjelasan_match = re.search(r'---ANALISIS DATA---\s*(.*?)\s*(?:---|\Z)', raw_llm_output, re.DOTALL)
        if penjelasan_match:
            trend_analysis = penjelasan_match.group(1).strip()
        else:
            trend_analysis = raw_llm_output
    else:
        trend_analysis = raw_llm_output
    #================================================================

    result = {
        "commodity": komoditas,
        "current_price": float(df_filtered['harga_rata_rata'].iloc[-1]) if not df_filtered.empty else None,
        "highest_price_period": float(df_filtered['harga_rata_rata'].max()) if not df_filtered.empty else None,
        "lowest_price_period": float(df_filtered['harga_rata_rata'].min()) if not df_filtered.empty else None,
        "average_price": float(df_filtered['harga_rata_rata'].mean()) if not df_filtered.empty else None,
        "satuan_display": satuan_display,
        "historical_prices": historical_prices,
        # "region": "Nanti Ditambah",
        "trend_analysis": trend_analysis,
        'raw_llm_out':raw_llm_output
    }
    return result
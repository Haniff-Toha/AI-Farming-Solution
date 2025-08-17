from flask import Blueprint, request, jsonify, g
from constant import BASE_PRICES, REGIONAL_FACTORS
from datetime import datetime, timedelta
import random
import math

market_prices_bp = Blueprint("market_prices_bp", __name__)

@market_prices_bp.route('/market_prices', methods=['GET'])
def get_market_prices():
    g.request_time = datetime(2025, 7, 27) 
    commodity = request.args.get('commodity')
    region = request.args.get('region')
    period = request.args.get('period', '30d') # Default 30 hari

    if not commodity or not region:
        return jsonify({"error": "Parameter 'commodity', 'region', and 'period' are required"}), 400

    period_map = {'30d': 30, '90d': 90, '365d': 365}
    period_days = period_map.get(period, 30)

    prices = generate_realistic_price_data(commodity, region, period_days)
    
    if not prices:
        return jsonify({"error": "Data tidak tersedia"}), 404

    current_price = prices[-1]['price']
    last_7_days_prices = [p['price'] for p in prices[-7:]]
    trend_value = prices[-1]['price'] - prices[0]['price'] # Tren selama periode
    
    trend_analysis = "Harga cenderung stabil dalam periode ini."
    if trend_value > (current_price * 0.1): # Kenaikan lebih dari 10%
        trend_analysis = "Harga menunjukkan tren naik yang kuat. Ini bisa menjadi sinyal positif untuk menjual."
    elif trend_value < -(current_price * 0.1): # Penurunan lebih dari 10%
        trend_analysis = "Harga menunjukkan tren turun yang kuat. Disarankan untuk menahan penjualan dan memantau pasar."

    response = {
        "commodity": commodity,
        "region": region,
        "current_price": current_price,
        "highest_price_period": max(p['price'] for p in prices),
        "lowest_price_period": min(p['price'] for p in prices),
        "trend_analysis": trend_analysis,
        "historical_prices": prices
    }
    
    return jsonify(response)

def generate_realistic_price_data(commodity, region, period_days):
    """
    Mensimulasikan data harga dengan mempertimbangkan faktor musim, hari besar, dan siklus di Indonesia.
    Ini adalah PENGGANTI dari koneksi API langsung yang memerlukan registrasi/kunci.
    """
    if commodity not in BASE_PRICES:
        return []

    price_data = []
    base_price = BASE_PRICES[commodity]
    regional_multiplier = REGIONAL_FACTORS.get(region, 1.0)
    
    today = getattr(g, 'request_time', datetime.now())

    for i in range(period_days):
        current_date = today - timedelta(days=i)
        day_of_year = current_date.timetuple().tm_yday
        month = current_date.month

        seasonal_factor = 1.0
        if commodity in ["Cabai Merah Keriting", "Bawang Merah"]:
            if 1 <= month <= 3 or 10 <= month <= 12:
                seasonal_factor = 1.15 # Harga naik 15% di musim hujan

        # Faktor Hari Besar (Idul Fitri sekitar Maret-April 2025)
        lebaran_factor = 1.0
        # Puncak permintaan 30 hari sebelum Idul Fitri (29 Maret 2025)
        days_to_lebaran = (datetime(2025, 3, 29) - current_date).days
        if 0 < days_to_lebaran <= 30:
            lebaran_factor = 1.5 - (days_to_lebaran / 30) * 0.5 
        # Faktor Siklus Tanam & Panen (menggunakan gelombang sinus)
        # Puncak harga (paceklik) di awal tahun, terendah (panen raya) di pertengahan tahun
        cycle_factor = 1.0 + 0.15 * math.sin((day_of_year / 365.0) * 2 * math.pi - (math.pi / 2))

        # Faktor Volatilitas Harian
        random_noise = random.uniform(-0.03, 0.03)

        # Hitung harga final
        final_price = base_price * regional_multiplier * seasonal_factor * lebaran_factor * cycle_factor * (1 + random_noise)
        
        price_data.append({
            "date": current_date.strftime('%Y-%m-%d'),
            "price": round(final_price / 100) * 100 # Bulatkan ke ratusan terdekat
        })

    return sorted(price_data, key=lambda x: x['date'])

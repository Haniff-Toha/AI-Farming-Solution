from flask import Blueprint, jsonify
from constant import PROVINCES
import random

pest_outbreaks_bp = Blueprint("pest_outbreaks_bp", __name__)

@pest_outbreaks_bp.route('/pest_outbreaks', methods=['GET'])
def get_pest_outbreaks():
    outbreaks = []
    sample_provinces = random.sample(list(PROVINCES.keys()), 5)
    for province_name in sample_provinces:
        coords = PROVINCES[province_name]
        lat, lon = coords[0] + random.uniform(-0.5, 0.5), coords[1] + random.uniform(-0.5, 0.5)
        outbreaks.append({
            "id": f"pest_{province_name.replace(' ', '_').lower()}",
            "coords": [lat, lon],
            "pest_name": random.choice(["Wereng Batang Coklat", "Ulat Grayak", "Lalat Buah"]),
            "severity": random.choice(["Rendah", "Sedang", "Tinggi"])
        })
    return jsonify(outbreaks)

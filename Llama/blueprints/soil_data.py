from flask import Blueprint, request, jsonify
from blueprints.harvest_prediction import get_harvest_prediction
from constant import PROVINCES
import random

soil_data_bp = Blueprint("soil_data_bp", __name__)

@soil_data_bp.route('/soil_data', methods=['GET'])
def get_soil_data():
    commodity_filter = request.args.get('commodity')
    relevant_provinces = []
    if commodity_filter and commodity_filter != "Semua":
        temp_harvest_data = get_harvest_prediction().get_json()
        relevant_provinces = [p['province'] for p in temp_harvest_data]
    else:
        relevant_provinces = list(PROVINCES.keys())

    soil_data = {}
    for province in relevant_provinces:
        soil_data[province] = {
            "ph_level": round(random.uniform(5.5, 7.5), 1),
            "moisture": f"{random.randint(30, 70)}%",
            "nutrient_level": random.choice(["Rendah", "Cukup", "Optimal"])
        }
    return jsonify(soil_data)

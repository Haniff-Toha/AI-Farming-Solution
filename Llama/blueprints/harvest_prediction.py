from flask import Blueprint, request, jsonify
from constant import PROVINCES, COMMODITIES
from datetime import datetime
import random

harvest_prediction_bp = Blueprint("harvest_prediction_bp", __name__)

@harvest_prediction_bp.route('/harvest_prediction', methods=['GET'])
def get_harvest_prediction():
    commodity_filter = request.args.get('commodity')
    current_month = datetime.now().month
    prediction_data = []

    for province, coords in PROVINCES.items():
        province_commodities = random.sample(list(COMMODITIES.keys()), k=random.randint(2, 4))
        harvesting_now = [f'{COMMODITIES[c]["icon"]} {c}' for c in province_commodities if current_month in COMMODITIES[c]["panen"]]
        
        if commodity_filter and commodity_filter != "Semua":
            if not any(commodity_filter in s for s in harvesting_now):
                is_planting = any(commodity_filter == c and current_month in COMMODITIES[c]["tanam"] for c in province_commodities)
                if not is_planting:
                    continue

        prediction_data.append({
            "province": province,
            "coords": coords,
            "harvesting_now": harvesting_now if harvesting_now else ["Masa Tanam / Perawatan"],
        })
        
    return jsonify(prediction_data)

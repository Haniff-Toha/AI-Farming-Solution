from flask import Blueprint, request, jsonify
from blueprints.harvest_prediction import get_harvest_prediction
from constant import PROVINCES
import random

weather_data_bp = Blueprint("weather_data_bp", __name__)

@weather_data_bp.route('/weather_data', methods=['GET'])
def get_weather_data():
    commodity_filter = request.args.get('commodity')
    relevant_provinces = []
    if commodity_filter and commodity_filter != "Semua":
        temp_harvest_data = get_harvest_prediction().get_json()
        relevant_provinces = [p['province'] for p in temp_harvest_data]
    else:
        relevant_provinces = list(PROVINCES.keys())

    weather_data = {}
    for province in relevant_provinces:
        weather_data[province] = {
            "temperature": f"{random.randint(25, 32)}°C",
            "humidity": f"{random.randint(70, 95)}%",
            "wind_speed": f"{random.randint(5, 20)} km/h",
            "precipitation_chance": f"{random.randint(10, 80)}%"
        }
    return jsonify(weather_data)

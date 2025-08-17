from flask import Blueprint, request, jsonify, g
from constant import PROVINCES, COMMODITIES
from datetime import datetime, timedelta
import random
import math

land_monitoring_bp = Blueprint("land_monitoring_bp", __name__)

@land_monitoring_bp.route('/land_monitoring', methods=['GET'])
def get_land_monitoring():
    commodity_filter = request.args.get('commodity')
    current_month = datetime.now().month
    monitoring_data = []
    
    provinces_with_issues = random.sample(list(PROVINCES.keys()), k=8)
    idle_provinces = provinces_with_issues[:3]
    drought_provinces = provinces_with_issues[3:6]
    pest_provinces = provinces_with_issues[6:]

    for province, coords in PROVINCES.items():
        # Simulasi aktivitas
        province_commodities = random.sample(list(COMMODITIES.keys()), k=3)
        activities = []
        for commodity in province_commodities:
            if current_month in COMMODITIES[commodity]["tanam"]:
                activities.append(f"Penanaman {commodity}")
            elif current_month in COMMODITIES[commodity]["panen"]:
                activities.append(f"Panen {commodity}")
        
        dominant_activity = random.choice(activities) if activities else "Perawatan Rutin"

        # Logika Filter
        if commodity_filter and commodity_filter != "Semua":
            if not any(commodity_filter in s for s in activities):
                continue # Lewati provinsi ini jika tidak cocok dengan filter

        data = {
            "province": province, "coords": coords, "is_idle": False,
            "risk_level": "Rendah", "risk_reason": "optimal",
            "risk_reason_display": "Kondisi optimal",
            "dominant_activity": dominant_activity
        }
        
        if province in idle_provinces:
            data.update({
                "is_idle": True, "risk_level": "Tinggi", "risk_reason": "idle",
                "risk_reason_display": "Lahan tidak produktif (tidur)", "dominant_activity": "Tidak Ada Aktivitas"
            })
        elif province in drought_provinces:
            data.update({"risk_level": "Sedang", "risk_reason": "drought", "risk_reason_display": "Potensi kekeringan"})
        elif province in pest_provinces:
            data.update({"risk_level": "Tinggi", "risk_reason": "pest_outbreak", "risk_reason_display": "Terdeteksi serangan hama"})
        
        monitoring_data.append(data)
        
    return jsonify(monitoring_data)

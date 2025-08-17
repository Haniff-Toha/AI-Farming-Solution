from flask import Flask
from blueprints.chat import chat_bp
from blueprints.classify_plant_disease import classify_plant_disease_bp
from blueprints.market_prices import market_prices_bp
from blueprints.land_monitoring import land_monitoring_bp
from blueprints.harvest_prediction import harvest_prediction_bp
from blueprints.weather_data import weather_data_bp
from blueprints.soil_data import soil_data_bp
from blueprints.pest_outbreaks import pest_outbreaks_bp
from blueprints.contextual_info import contextual_info_bp
from blueprints.fert_predict import fert_predict_bp
from blueprints.crop_rec import crop_rec_bp
from blueprints.crop_yield import crop_yield_bp
from blueprints.market_price_new import market_prices_new_bp
from blueprints.market_price_region_new import market_prices_region_new_bp

def load_routes(app: Flask):
    app.register_blueprint(chat_bp)
    app.register_blueprint(classify_plant_disease_bp)
    app.register_blueprint(market_prices_bp)
    app.register_blueprint(land_monitoring_bp)
    app.register_blueprint(harvest_prediction_bp)
    app.register_blueprint(weather_data_bp)
    app.register_blueprint(soil_data_bp)
    app.register_blueprint(pest_outbreaks_bp)
    app.register_blueprint(contextual_info_bp)
    app.register_blueprint(fert_predict_bp)
    app.register_blueprint(crop_rec_bp)
    app.register_blueprint(crop_yield_bp)

    app.register_blueprint(market_prices_new_bp)
    app.register_blueprint(market_prices_region_new_bp)
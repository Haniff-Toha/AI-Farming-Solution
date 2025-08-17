from flask import Blueprint, request, jsonify
from constant import SOIL_TYPE_MAPPING, CROP_TYPE_MAPPING, FERTILIZER_NAME_MAPPING, FERTILIZER_DESCRIPTIONS
from models import get_fertilizer_model
import pandas as pd

fert_predict_bp = Blueprint("fert_predict_bp", __name__)

@fert_predict_bp.route('/fert_predict', methods=['POST'])
def fert_predict():
    data = request.get_json()
    soil_type_inverse_mapping = {v: k for k, v in SOIL_TYPE_MAPPING.items()}
    crop_type_inverse_mapping = {v: k for k, v in CROP_TYPE_MAPPING.items()}

    # Randomly choose a soil type and crop type if not provided
    # soil_type = SOIL_TYPE_MAPPING.get(data.get('Soil Type', random.choice(list(SOIL_TYPE_MAPPING.keys()))))
    # crop_type = CROP_TYPE_MAPPING.get(data.get('Crop Type', random.choice(list(CROP_TYPE_MAPPING.keys()))))
    # temperature = random.randint(*feature_ranges['Temparature'])
    # humidity = random.randint(*feature_ranges['Humidity'])
    # soil_moisture = random.randint(*feature_ranges['Soil Moisture'])
    # nitrogen = random.randint(*feature_ranges['Nitrogen'])
    # potassium = random.randint(*feature_ranges['Potassium'])
    # phosphorous = random.randint(*feature_ranges['Phosphorous'])

    soil_type = SOIL_TYPE_MAPPING.get(data.get('SoilType'))
    crop_type = CROP_TYPE_MAPPING.get(data.get('CropType'))
    temperature = data.get('Temperature')
    humidity = data.get('Humidity')
    soil_moisture = data.get('SoilMoisture')
    nitrogen = data.get('Nitrogen')
    potassium = data.get('Potassium')
    phosphorous = data.get('Phosphorous')

    # Create the input DataFrame for the model
    df_input = pd.DataFrame([{
        'Temparature': temperature,
        'Humidity': humidity,
        'Soil Moisture': soil_moisture,
        'Soil Type': soil_type,
        'Crop Type': crop_type,
        'Nitrogen': nitrogen,
        'Potassium': potassium,
        'Phosphorous': phosphorous
    }])

    model_fert = get_fertilizer_model()
    
    # Make prediction
    prediction = model_fert.predict(df_input)[0]

    # Decode the prediction back to the fertilizer name
    fertilizer_name = FERTILIZER_NAME_MAPPING.get(prediction, 'Unknown')

    # Get the fertilizer description
    fertilizer_description = FERTILIZER_DESCRIPTIONS.get(fertilizer_name, 'No description available')

    # Return the result as JSON
    return jsonify({
        'Fertilizer Name': fertilizer_name,
        'Description': fertilizer_description,
        'Soil Type': soil_type_inverse_mapping[soil_type],
        'Crop Type': crop_type_inverse_mapping[crop_type],
        'Temparature': temperature,
        'Humidity': humidity,
        'Soil Moisture': soil_moisture,
        'Nitrogen': nitrogen,
        'Potassium': potassium,
        'Phosphorous': phosphorous
    })

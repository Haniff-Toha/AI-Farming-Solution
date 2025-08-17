import joblib
from groq import Groq
from langchain_groq import ChatGroq
from constant import GROQ_API_KEY
import pickle
# from openai import OpenAI

# Internal cache
_fertilizer_model = None
_yield_model = None
_ohe_model = None
_crop_model = None
_crop_scaler_standard = None
_crop_scaler_minmax = None
_client = None
_llm = None
_crop_yield_model_indonesia = None
_indonesia_max_data = None
_indonesia_min_data = None
_deepseek_client= None

def get_fertilizer_model():
    global _fertilizer_model
    if _fertilizer_model is None:
        _fertilizer_model = joblib.load("Models/rf_model_fertrecom.pkl")
    return _fertilizer_model


def get_yield_model():
    global _yield_model
    if _yield_model is None:
        _yield_model = joblib.load("Models/RF_Model_yieldrecom.pkl")
    return _yield_model


def get_ohe_model():
    global _ohe_model
    if _ohe_model is None:
        _ohe_model = joblib.load("Models/OHE_Encoder_yieldrecom.pkl")
    return _ohe_model


def get_crop_model():
    global _crop_model
    if _crop_model is None:
        _crop_model = joblib.load("Models/model_croprecom.pkl")
    return _crop_model


def get_crop_scaler_standard():
    global _crop_scaler_standard
    if _crop_scaler_standard is None:
        _crop_scaler_standard = joblib.load("Models/standscaler_croprecom.pkl")
    return _crop_scaler_standard


def get_crop_scaler_minmax():
    global _crop_scaler_minmax
    if _crop_scaler_minmax is None:
        _crop_scaler_minmax = joblib.load("Models/minmaxscaler_croprecom.pkl")
    return _crop_scaler_minmax


def get_llm():
    global _llm
    if _llm is None:
        _llm = ChatGroq(
            model="llama3-70b-8192",
            temperature=0.7,
        )
    return _llm

def get_client():
    global _client
    if _client is None:
        _client = Groq(api_key=GROQ_API_KEY)
    return _client

def get_crop_yield_model_indonesia():
    global _crop_yield_model_indonesia
    global _indonesia_max_data
    global _indonesia_min_data
    
    if _crop_yield_model_indonesia is None:
        _crop_yield_model_indonesia = pickle.load(open('Models/yield_model_indonesia.sav', 'rb'))
    
    if _indonesia_max_data is None:
        _indonesia_max_data = pickle.load(open('Models/indonesia_max.data', 'rb'))
    
    if _indonesia_min_data is None:
        _indonesia_min_data = pickle.load(open('Models/indonesia_min.data', 'rb'))
        
    return _crop_yield_model_indonesia, _indonesia_max_data, _indonesia_min_data
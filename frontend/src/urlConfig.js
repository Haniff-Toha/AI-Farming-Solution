export const api = "http://localhost:5001/api/";
export const API = "http://localhost:5001/api/";
export const API_ML = "http://127.0.0.1:5000";
export const API_MAP = "http://localhost:5002";
export const API_WEATHER = "https://api.openweathermap.org/data/2.5/forecast";

export const API_ENDPOINTS = {
  LOGIN: "/v1/user/login",
  REGISTER: "/v1/user/new",
  PROFILE: "/v1/user/me",

  GET_CROP: "/v1/crop/getcrops",
  ADD_CROP: "/v1/crop/createcrop",
  EDIT_CROP: "/v1/crop/updatecrop/",
  DELETE_CROP: "/v1/crop/deletecrop/",

  //Machine Learning
  PLANT_DISEASE: "/classify_plant_disease",
  CHAT: "/chat",
  MARKET: "/market_prices_new",
  MARKET_REGION: "/market_prices_region_new",

  COMMODITY_CONDITION: "/contextual_info?condition=",
  COMMODITY_HARVEST: "/harvest_prediction",
  COMMODITY_LAND:"/land_monitoring",
  COMMODITY_WEATHER:"/weather_data",
  COMMODITY_SOIL:"/soil_data",
  COMMODITY_PEST:"/pest_outbreaks",

  CROP_YIELD:"/crop_yield",
  FERT_PREDICT: "/fert_predict",
  CROP_RECOMMENDATION: "/crop_rec",

  //MAP
  AGRICULTURAL_INDEX: "/agriculture_index",
  AREA_PLANNING: "/areaplanning",
  INDEX_PANEN: "/indexpanen"
};
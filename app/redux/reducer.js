export const SET_ONLINE = 'SET_ONLINE';
export const SET_USE_LOCATION = 'SET_USE_LOCATION';
export const SET_CITY_LIST = 'SET_CITY_LIST';
export const SET_SELECTED_CITY = 'SET_SELECTED_CITY';
export const SET_CURRENT_WEATHER = 'SET_CURRENT_WEATHER';
export const SET_CURRENT_LOCATION = 'SET_CURRENT_LOCATION';
export const SET_LOADING = 'SET_LOADING';
export const SET_ERROR = 'SET_ERROR';

const initialState = { online:true, useLocation:true, cityList: [], selectedCity: {}, currentWeather: {}, currentLocation:{ lat: 0, lon: 0, timestamp:0 }, timestamp: 0, loading: false, error: '' };

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case SET_ONLINE:
      return { ...state, online: action.payload };
    case SET_USE_LOCATION:
      return { ...state, useLocation: action.payload };
    case SET_CITY_LIST:
      return { ...state, cityList: action.payload.data, timestamp:1/*action.payload.timestamp*/ };
    case SET_SELECTED_CITY:
      return { ...state, selectedCity: action.payload.data };
    case SET_CURRENT_WEATHER:
      return { ...state, currentWeather: action.payload.data, timestamp:1/*action.payload.timestamp*/ };
    case SET_CURRENT_LOCATION: {
      let _lat = ('lat' in action.payload) ? action.payload.lat : state.currentLocation.lat;
      let _lon = ('lon' in action.payload) ? action.payload.lon : state.currentLocation.lon;
      let _timestamp = ('timestamp' in action.payload) ? action.payload.timestamp : 0;
      return { ...state, currentLocation: { lat:_lat, lon:_lon, timestamp:_timestamp } };
    }
    case SET_LOADING:
      return { ...state, loading: action.payload };
    case SET_ERROR:
      return { ...state, error: action.payload };
    default:
      return state;
  }
}

export function setOnline(data:bool) {
  return {
    type: SET_ONLINE,
    payload: data
  };
}

export function setUseLocation(data:bool) {
  return {
    type: SET_USE_LOCATION,
    payload: data
  };
}

export function setCityList(data:array) {
  return {
    type: SET_CITY_LIST,
    payload: data
  };
}

export function setSelectedCity(data:object) {
  return {
    type: SET_SELECTED_CITY,
    payload: data,
  };
}

export function setCurrentWeather(data:object) {
  return {
    type: SET_CURRENT_WEATHER,
    payload: data,
  };
}
export function setCurrentLocation(data:object) {
  return {
    type: SET_CURRENT_LOCATION,
    payload: data,
  };
}

export function setLoading(data:ool) {
  return {
    type: SET_LOADING,
    payload: data,
  };
}

export function setError(data:string) {
  return {
    type: SET_ERROR,
    payload: data,
  };
}
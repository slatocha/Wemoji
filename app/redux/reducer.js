export const SET_ONLINE = 'SET_ONLINE';
export const SET_USE_LOCATION = 'SET_USE_LOCATION';
export const SET_CITY_LIST = 'SET_CITY_LIST';
export const UPDATE_CITY_LIST = 'UPDATE_CITY_LIST';
export const SET_SELECTED_CITY = 'SET_SELECTED_CITY';
export const SET_CURRENT_WEATHER = 'SET_CURRENT_WEATHER';
export const SET_CURRENT_LOCATION = 'SET_CURRENT_LOCATION';
export const SET_LOADING = 'SET_LOADING';
export const SET_ERROR = 'SET_ERROR';

const initialState = { online:true, useLocation:true, cityList: { list:[], cnt:0, timestamp:0 }, selectedCity: {}, currentWeather: {}, currentLocation:{ lat: 0, lon: 0, timestamp:0 }, timestamp: 0, loading: false, error:{title:'', msg:'', additional:'', show:false} };

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case SET_ONLINE:
      return { ...state, online: action.payload };
    case SET_USE_LOCATION:
      return { ...state, useLocation: action.payload };
    case SET_CITY_LIST: {
      let _list = ('data' in action.payload && action.payload.data && 'list' in action.payload.data && Array.isArray(action.payload.data.list)) ? action.payload.data.list : state.cityList.list;
      let _cnt = ('data' in action.payload && action.payload.data && 'cnt' in action.payload.data) ? action.payload.data.cnt : state.cityList.cnt;
      let _timestamp = ('timestamp' in action.payload && action.payload.timestamp) ? action.payload.timestamp : state.cityList.timestamp;
      return { ...state, cityList:{list:_list, cnt:_cnt, timestamp:_timestamp} };
    }
    case UPDATE_CITY_LIST: {
      let _list = state.cityList.list;
      let _cnt = state.cityList.cnt;
      let _timestamp = ('timestamp' in action.payload && action.payload.timestamp) ? action.payload.timestamp : state.cityList.timestamp;
      // add the new city to the store
      if ('data' in action.payload && action.payload.data && Object.keys(action.payload.data).length > 0) {
        _list.push(action.payload.data);
        _cnt+=1;
      }
      return { ...state, cityList:{list:_list, cnt:_cnt, timestamp:_timestamp} };
    }
    case SET_SELECTED_CITY:
      return { ...state, selectedCity: action.payload.data };
    case SET_CURRENT_WEATHER:
      return { ...state, currentWeather: action.payload.data, timestamp:action.payload.timestamp };
    case SET_CURRENT_LOCATION: {
      let _lat = ('lat' in action.payload) ? action.payload.lat : state.currentLocation.lat;
      let _lon = ('lon' in action.payload) ? action.payload.lon : state.currentLocation.lon;
      let _timestamp = ('timestamp' in action.payload) ? action.payload.timestamp : 0;
      return { ...state, currentLocation: { lat:_lat, lon:_lon, timestamp:_timestamp } };
    }
    case SET_LOADING:
      return { ...state, loading: action.payload };
    case SET_ERROR: {
      let _title = ('title' in action.payload) ? action.payload.title : '';
      let _msg = ('msg' in action.payload) ? action.payload.msg : '';
      let _additional = ('additional' in action.payload) ? action.payload.additional : '';
      let _show = action.payload && Object.keys(action.payload).length > 0
      return { ...state, error:{title:_title, msg:_msg, additional:_additional, show:_show } };
    }
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

export function setCityList(data:object) {
  return {
    type: SET_CITY_LIST,
    payload: data
  };
}

export function updateCityList(data:object) {
  return {
    type: UPDATE_CITY_LIST,
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

export function setLoading(data:bool) {
  return {
    type: SET_LOADING,
    payload: data,
  };
}

export function setError(data:object) {
  return {
    type: SET_ERROR,
    payload: data,
  };
}
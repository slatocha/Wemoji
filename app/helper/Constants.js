//////////////////////////////////////////////////////////////////////////////////////
// Default Application settings
//////////////////////////////////////////////////////////////////////////////////////
import { name, version } from '../../package.json';
export const APP_NAME = name || 'Wemoji';
export const APP_VERSION = version || "0.0.1";

// will disable console.log for the whole APP in index.js
export const DEBUG_LOGGING = false;


//////////////////////////////////////////////////////////////////////////////////////
// open weather map settings
//////////////////////////////////////////////////////////////////////////////////////
export const WEATHER_API_KEY = 'aefbbb5f318df3cb32108331e66575ef'; // please use your own key its free anyway
export const API_APPENDIX = '&APPID='+WEATHER_API_KEY
// possile values 'metric'; 'imperial'; '' => Kelvin
export const API_DEFAULT_UNITS = 'metric'; 

export const setWeatherAPIUnits = units => { 
  switch(units) { 
    case 'imperial' : return '&units=imperial';
    case 'metric' : return '&units=metric';
    default : return '';
  } 
}

export const getTemperatureUnit = units => { 
  switch(units) { 
    case 'imperial' : return '°F';
    case 'metric' : return '°C';
    default : return 'K';
  } 
}
export const getHumidityUnit = () => { return '%'   }
export const getPressureUnit = () => { return 'hPa' }


export const BASE_URL = 'http://api.openweathermap.org/data/2.5';

export const URL_SEVERAL_INITIAL = BASE_URL + '/group?id=3186886,3193935,3191648,3190261' + setWeatherAPIUnits('metric') + API_APPENDIX;

export const getSerchUrlForCity = (search, units) => { return BASE_URL + '/weather?q=' + search + (units ? setWeatherAPIUnits(units) : setWeatherAPIUnits()) + API_APPENDIX }

export const getSearchUrlByLatLon = (lat,lon, units) => { return BASE_URL + '/weather?lat=' + lat + '&lon=' + lon + (units ? setWeatherAPIUnits(units) : setWeatherAPIUnits()) + API_APPENDIX }

export const getSerchForcastUrlForCity = (search, units) => { return BASE_URL + '/forcast?q=' + search + (units ? setWeatherAPIUnits(units) : setWeatherAPIUnits()) + API_APPENDIX }

export const getSerchForcastUrlForCityId = (cityId, units) => { return BASE_URL + '/forcast?id=' + cityId + (units ? setWeatherAPIUnits(units) : setWeatherAPIUnits()) + API_APPENDIX }

export const getSearchForcastUrlByLatLon = (lat,lon, units) => { return BASE_URL + '/forcast?lat=' + lat + '&lon=' + lon + (units ? setWeatherAPIUnits(units) : setWeatherAPIUnits()) + API_APPENDIX }

export const getIconUrlForIcon = icon => { return 'http://openweathermap.org/img/wn/' + icon + '@2x.png' }
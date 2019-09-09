//////////////////////////////////////////////////////////////////////////////////////
// Default Application settings
//////////////////////////////////////////////////////////////////////////////////////
export const DEBUG_LOGGING = true;


//////////////////////////////////////////////////////////////////////////////////////
// open weather map settings
//////////////////////////////////////////////////////////////////////////////////////
export const WEATHER_API_KEY = 'aefbbb5f318df3cb32108331e66575ef'; // please use your own key its free anyway
export const API_APPENDIX = '&APPID='+WEATHER_API_KEY

export const UNITS = '&units=metric';

export const BASE_URL = 'http://api.openweathermap.org/data/2.5';

export const URL_SEVERAL_INITIAL = BASE_URL + '/group?id=3186886,3193935,3191648,3190261' + UNITS + API_APPENDIX;

export const getSerchUrlForCity = search => { return BASE_URL + '/weather?q=' + search + UNITS + API_APPENDIX }

export const getSearchUrlByLatLon = (lat,lon) => { return BASE_URL + '/weather?lat=' + lat + '&lon=' + lon + UNITS + API_APPENDIX }

export const getIconUrlForIcon = icon => { return 'http://openweathermap.org/img/wn/' + icon + '@2x.png' }
import { createSelector } from 'reselect';

// create memoized selectors for state reselection if no changes happend
export const getOnline = createSelector(state => state.online, online => online);
export const getUseLocation = createSelector(state => state.useLocation, useLocation => useLocation);
export const getCityList = createSelector(state => state.cityList, cityList => cityList);
export const getSelectedCity = createSelector(state => state.selectedCity, selectedCity => selectedCity);
export const getCurrentWeather = createSelector(state => state.currentWeather, currentWeather => currentWeather);
export const getCurrentLocation = createSelector(state => state.currentLocation, currentLocation => currentLocation);
export const getTimestamp = createSelector(state => state.timestamp, timestamp => timestamp);
export const getLoading = createSelector(state => state.loading, loading => loading);
export const getError = createSelector(state => state.error, error => error);
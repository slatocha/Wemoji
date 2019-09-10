import React, { memo, useState, useEffect } from 'react';
import { View, Text, Button, Share } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from 'react-navigation-hooks'
import { Icon } from 'react-native-elements'

import {setCityList, setCurrentWeather, setLoading, setError} from '../redux/reducer';

import { 
  API_DEFAULT_UNITS, 
  getTemperatureUnit,
  getPressureUnit,
  getHumidityUnit, 
  URL_SEVERAL_INITIAL, 
  getSearchUrlByLatLon, 
  APP_NAME } from '../helper/Constants';

import { getOnline,
         getCurrentLocation, 
         getCurrentWeather,
         getCityList,
         getTimestamp,
         getLoading} from '../redux/selectors';

const WeatherDetail = memo(({navigation}) => {
  // be careful to never call useNavigation in the press callback. Call hooks directly from the render function!
  const { navigate } = useNavigation();
  // redux
  const dispatch = useDispatch();
  const cityList = useSelector(getCityList);
  const online = useSelector(getOnline);
  const timestamp = useSelector(getTimestamp);
  const currentLocation = useSelector(getCurrentLocation);
  const currentWeather = useSelector(getCurrentWeather);
  const loading = useSelector(getLoading);

  // basic share functionallity
  const onShare = async () => {
    try {
      let _city = currentWeather && 'name' in currentWeather ? currentWeather.name : 'undefined';
      let _temp = currentWeather && 'main' in currentWeather && currentWeather.main ? currentWeather.main.temp : 'undefined';
      
      const result = await Share.share({
        title:'Wemoji',
        message:APP_NAME + ': Current temperature for ' + _city + ' is ' + _temp + ' ' + getTemperatureUnit(API_DEFAULT_UNITS),
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
        } else {
          // shared
          console.log('WeatherDetail::onShare - shared');
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
        console.log('WeatherDetail::onShare - dismissed');
      }
    } catch (error) {
      dispatch(setError(error.message));
    }
  };
  
  //react
  useEffect(() => {
    const getWeather = async (url) => {
      try {
        // console.log("the url: ", url)
        const resp = await fetch(url)
        const data = await resp.json()

        // console.log("WeatherDetail:: weather response: ", resp)
        console.log("WeatherDetail:: weather data:", data)
        
        // return data
        dispatch(setCurrentWeather({data:data}));
        dispatch(setLoading(false));
        // reset the navigation title
        if (data && 'name' in data) navigation.setParams({ title: data.name });
      } catch (err) {
        console.log('WeatherDetail:: weather error:',err)
      }
    }
    // load data if the timestamp has a diff of min 10 minutes to now 
    // or on forced refresh with refresh control
    // if (timestamp == 0 && online) getWeather(URL_SEVERAL_INITIAL);
    if (online) {
      if (!loading && currentLocation.lat != 0 && currentLocation.lon != 0 && timestamp == 0) {
        dispatch(setLoading(true));
        getWeather(getSearchUrlByLatLon(currentLocation.lat,currentLocation.lon,API_DEFAULT_UNITS));
      }
    }
  });
  // set an array of vars or nothing to listen to on mount and update example => },[currentLocation,timestamp]);
  // set an empty array to only use the effect on Mount
  // use severa useEffects to get different behaviours
  useEffect(() => {
    // reset the navigation title
    if (currentWeather && 'name' in currentWeather) {
      navigation.setParams({ title: currentWeather.name, onShare:onShare });
    }
  },[currentWeather]);

  let renderWeather = () => {
    let loaded = currentWeather && Object.keys(currentWeather).length > 0 && 'name' in currentWeather && 'main' in currentWeather;
    return(
      loaded  ? <View>
                  <Text>City: {currentWeather.name}</Text>
                  <Text>Temperature: {currentWeather.main.temp} {getTemperatureUnit(API_DEFAULT_UNITS)}</Text>
                  <Text>Humidity: {currentWeather.main.humidity} {getHumidityUnit()}</Text>
                  <Text>Pressure: {currentWeather.main.pressure} {getPressureUnit()}</Text>
                </View>
              : null
    );
  }
  return (
    <View>
      <Text>Connection: {online ? "online" : "offline"}</Text>
      <Text>Location: {'lat:' + currentLocation.lat + '; lon:' + currentLocation.lon}</Text>
      {renderWeather()}
    </View>
  );
})

WeatherDetail.navigationOptions = ({ navigation }) => ({
  title: navigation.getParam('title', APP_NAME),
  headerLeft: (
    <Button onPress={() => navigation.navigate('List')} title="Cities"/>
  ),
  headerRight: (
    // <TouchableOpacity onPress={navigation.getParam('onShare', () => {})}>
    //   <Icon /* raised*/ name='share' type='font-awesome' /*color='#f50'*/ />
    // </TouchableOpacity>
    // <Button onPress={navigation.getParam('onShare', () => {})} title="Share" />
    <Icon /* raised*/ name='share' type='font-awesome' /*color='#f50'*/ onPress={navigation.getParam('onShare', () => {})} />
  ),
  headerRightContainerStyle: {
    paddingRight: 10
  },
})

/**
  example options

  WeatherDetail.navigationOptions = ({ navigation }) => ({
  title: "CitiesList",
  headerTitleStyle: {
    textAlign: "left",
    fontFamily: "OpenSans-Regular",
    fontSize: 24
  },
  headerTintColor: "rgba(255,255,255,0.8)",
  headerBackground: (
    <LinearGradient
      colors={["#4cbdd7", "#3378C3"]}
      start={{ x: 0, y: 1 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    />
  ),
  headerRightContainerStyle: {
    paddingRight: 10
  },
  headerRight: (
    <TouchableOpacity onPress={() => navigation.navigate("List")}>
      <Ionicons name="ios-search" size={25} color="white" left={20} />
    </TouchableOpacity>
  )
});
 */

export default WeatherDetail;

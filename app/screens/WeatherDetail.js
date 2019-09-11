import React, { memo, useState, useEffect } from 'react';
import { SafeAreaView, StyleSheet, View, Text, Button, Share, TouchableOpacity } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from 'react-navigation-hooks';
import { Icon } from 'react-native-elements';
import Permissions from 'react-native-permissions';

import AsyncStorage from "@react-native-community/async-storage";

import {setCurrentWeather, setCurrentLocationWeather, setLoading, setError} from '../redux/reducer';

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
         getCurrentLocationWeather,
         getTimestamp,
         getLoading,
         getUseLocation} from '../redux/selectors';

import { COLOR_ERROR_BG,
         COLOR_ERROR_TINT,
         COLOR_BG,
         COLOR_TINT,
         COLOR_ICON,
         COLOR_ICON_ERROR } from '../helper/Colors';

import { ERROR_OFFLINE, ERROR_WEATHER_API, ERROR_SHARE } from '../helper/Error';

const WeatherDetail = memo(({navigation}) => {
  // be careful to never call useNavigation in the press callback. Call hooks directly from the render function!
  const { navigate } = useNavigation();
  // redux
  const dispatch = useDispatch();
  const online = useSelector(getOnline);
  const timestamp = useSelector(getTimestamp);
  const currentLocation = useSelector(getCurrentLocation);
  const currentLocationWeather = useSelector(getCurrentLocationWeather);
  const currentWeather = useSelector(getCurrentWeather);
  const loading = useSelector(getLoading);
  const useLocation = useSelector(getUseLocation);

  // default
  useEffect(() => {
   dispatch(setLoading(false));
  },[]);

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
      dispatch(setError(ERROR_SHARE));
    }
  };
  
  // react - useEffect
  // set an array of vars or nothing to listen to on mount and update example => useEffect(() => {...},[currentLocation,timestamp]);
  // set an empty array to only use the effect on Mount
  // use several useEffects to get different behaviours

  // weather effect
  useEffect(() => {
    const getWeather = async (url, loc) => {
      try {
        // console.log("the url: ", url)
        const resp = await fetch(url)
        const data = await resp.json()

        // console.log("WeatherDetail:: weather response: ", resp)
        console.log("WeatherDetail:: weather data:", data)
        
        // return data
        dispatch(setCurrentLocationWeather({data:data, timestamp:new Date().getTime()}));
        dispatch(setCurrentWeather({data:data, timestamp:new Date().getTime()}));

        dispatch(setLoading(false));
        // reset the navigation title
        if (data && 'name' in data) navigation.setParams({ title: data.name });
      } catch (err) {
        console.log('WeatherDetail:: weather error:',err)
        dispatch(setLoading(false));
        dispatch(setError(ERROR_WEATHER_API));
      }
    }
    // load data if the timestamp has a diff of min 10 seconds to now 
    // or on forced refresh with refresh control
    if (online && useLocation) {
      if ( !loading && 
           currentLocation.lat && currentLocation.lon && 
           Math.abs(new Date().getTime() - timestamp) > (10 * 1 * 1000)) {
        dispatch(setLoading(true));
        getWeather(getSearchUrlByLatLon(currentLocation.lat,currentLocation.lon,API_DEFAULT_UNITS));
      }
    }
  });

  // header nameing and share effect
  useEffect(() => {
    // reset the navigation title
    if (currentWeather && 'name' in currentWeather) {
      navigation.setParams({ title: currentWeather.name, onShare:onShare });
    }
  },[currentWeather]);

  // online change effect
  useEffect(() => {
    // reset the navigation title
    navigation.setParams({ online:online, onDispatch:() => {dispatch(setError(ERROR_OFFLINE))} });
  },[online]);



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

  let renderLocationWeather = () => {
    let loaded = currentLocationWeather && Object.keys(currentLocationWeather).length > 0 && 'name' in currentLocationWeather && 'main' in currentLocationWeather;
    return(
      loaded  ? <View>
                  <Text>City: {currentLocationWeather.name}</Text>
                  <Text>Temperature: {currentLocationWeather.main.temp} {getTemperatureUnit(API_DEFAULT_UNITS)}</Text>
                  <Text>Humidity: {currentLocationWeather.main.humidity} {getHumidityUnit()}</Text>
                  <Text>Pressure: {currentLocationWeather.main.pressure} {getPressureUnit()}</Text>
                  <Text>from current Loc</Text>
                </View>
              : null
    );
  }


  return (
    <SafeAreaView style={styles.safeAreaView}>
      <View style={[styles.body, online ? {} : styles.bodyError]}>
        <Text>Connection: {online ? "online" : "offline"}</Text>
        <Text>Location: {'lat:' + currentLocation.lat + '; lon:' + currentLocation.lon}</Text>
        {useLocation ? renderLocationWeather() : renderWeather()}
      </View>
    </SafeAreaView>
  );
})

WeatherDetail.navigationOptions = ({ navigation }) => ({
  title: navigation.getParam('title', APP_NAME),
  headerLeft: (
    <TouchableOpacity onPress={() => navigation.navigate('List')}>
      <Icon /* raised*/ name='bars' type='font-awesome' color={navigation.getParam('online', true) ? COLOR_ICON : COLOR_ICON_ERROR} />
    </TouchableOpacity>
    // <Icon name='globe' type='font-awesome' /*color='#f50'*/ onPress={() => navigation.navigate('List')} />
    // <Button onPress={() => navigation.navigate('List')} title="Cities"/>
  ),
  headerRight: (
    navigation.getParam('online', true) ? <TouchableOpacity onPress={navigation.getParam('onShare', () => {})}>
                                            <Icon name='share' type='font-awesome' color={navigation.getParam('online', true) ? COLOR_ICON : COLOR_ICON_ERROR} />
                                          </TouchableOpacity>
                                        : <TouchableOpacity onPress={navigation.getParam('onDispatch', () => {})}>
                                            <Icon name='exclamation-triangle' type='font-awesome' color={navigation.getParam('online', true) ? COLOR_ICON : COLOR_ICON_ERROR} />
                                         </TouchableOpacity>
    // <Button onPress={navigation.getParam('onShare', () => {})} title="Share" />
    // <Icon /* raised*/ name='share' type='font-awesome' /*color='#f50'*/ onPress={navigation.getParam('onShare', () => {})} />
  ),
  headerTintColor: navigation.getParam('online', true) ? COLOR_TINT : COLOR_ERROR_TINT,
  headerStyle:{
    backgroundColor: navigation.getParam('online', true) ? COLOR_BG : COLOR_ERROR_BG,
    borderColor: navigation.getParam('online', true) ? COLOR_BG : COLOR_ERROR_BG,
    shadowColor: 'transparent',
    borderBottomWidth: 0,
  },
  headerLeftContainerStyle: {
    paddingLeft: 10
  },
  headerRightContainerStyle: {
    paddingRight: 10
  },
})

const styles = StyleSheet.create({
  safeAreaView: {
    flex:1,
  },
  body: {
    flex:1,
    backgroundColor: COLOR_BG,
  },
  bodyError: {
    color:COLOR_ERROR_TINT,
    backgroundColor: COLOR_ERROR_BG,
  },
});

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

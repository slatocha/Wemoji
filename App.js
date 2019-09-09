import React, { memo, useState, useEffect } from 'react';
import { StyleSheet, View, Text, Alert } from 'react-native';

import { Provider, useSelector, useDispatch } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import { createStackNavigator } from 'react-navigation-stack';
import { createAppContainer } from 'react-navigation';

import Permissions from 'react-native-permissions';

import NetInfo from "@react-native-community/netinfo";
import Geolocation from '@react-native-community/geolocation';

import {setOnline, setCurrentLocation, setUseLocation, setError} from './app/redux/reducer';

import CityList from './app/screens/CityList';
import WeatherDetail from './app/screens/WeatherDetail';

import {URL_SEVERAL_INITIAL} from './app/helper/Constants';

import { getCurrentLocation, getUseLocation, getOnline } from './app/redux/selectors';

///////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////
// redux && storage
import { store, persistor } from './app/redux/store';
///////////////////////////////////////////////////////////////////////////////////////////


///////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////
// screens && navigation
const Stack = createStackNavigator({
  Home: {
    screen: WeatherDetail
  },
  List: {
    screen: CityList
  }
});
const AppContainer = createAppContainer(Stack);
///////////////////////////////////////////////////////////////////////////////////////////


///////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////
// custom react hook to check the network connection that returns only a boolean connection info
const useNetInfo = () => {
  const [netInfo, setNetInfo] = useState(false)

  // used with event listener to listen for network changes, especially the network connection
  onChange = newState => { setNetInfo(newState) }

  useEffect(() => {
    NetInfo.isConnected.fetch().then().done(connectionInfo => { setNetInfo(connectionInfo) })
    NetInfo.isConnected.addEventListener('connectionChange', onChange)

    // specify how to cleanup after this event...similar to componentWillUnmount but this also cleans up effects from the previous render
    return () => { NetInfo.isConnected.removeEventListener('connectionChange', onChange) }
  }, [])
  
  return netInfo;
}
///////////////////////////////////////////////////////////////////////////////////////////


///////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////
// custom react hook to get the users location if allowed
const useUserLocation = () => {
  const [location, setLocation] = useState(false);
  const [error, setError] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const useLocation = useSelector(getUseLocation)
  const locationOptions = Platform.OS === 'android' ? null : { enableHighAccuracy: true, timeout: 100000, maximumAge: 1000 };

  useEffect(() => {
    const getCurrentPosition = async (options) =>  {
      Geolocation.getCurrentPosition(
          position => setLocation(position),
          error => setError(error),
          options
      );
    }

    const getUserLocation = async () => {
      let permission = await Permissions.check('location');
      if (permission !== 'authorized') {
         Alert.alert(
            'Location Disabled',
            'If you want to use your location than please enable it, otherwise cancel and choose an available location.',
            [ 
              {text: 'Go to settings', onPress: () => Permissions.openSettings()},
              {text: 'Cancel', onPress: () => setDisabled(true),style: 'cancel'},
            ],
            {cancelable: false}
        );
        setError({message:'Permission: '+permission});
          // throw new Error('Not authorized: ' + permission);
      }
      return await getCurrentPosition(locationOptions);
    }

    try {
        if (useLocation) getUserLocation(); 
    } catch (error) {
        setError(error);
    }
  }, [])
  
  return {error:error, data:location, hasError:(error) ? true : false, disabled:disabled};
}
///////////////////////////////////////////////////////////////////////////////////////////


// App Wrapper to be able to use react-redux with the Main App functional component
const Wrapper = memo(() => {
  // redux
  const dispatch = useDispatch(); 
  const online = useSelector(getOnline);
  const useLocation = useSelector(getUseLocation)
  const currentLocation = useSelector(getCurrentLocation)
  // custom hooks
  const netInfo = useNetInfo();
  const location = useUserLocation();
  // react
  useEffect(() => {
    // network handling
    if (online != netInfo) dispatch(setOnline(netInfo));
    // geolocation handling
    if (useLocation) {
      if (location) {
        if (location.disabled) dispatch(setUseLocation(false));
        else if (location.hasError) dispatch(setError(location.error.message))
        else if (location.data && currentLocation.timestamp == 0) {
          dispatch(setCurrentLocation({lat:location.data.coords.latitude, lon:location.data.coords.longitude, timestamp:location.data.timestamp}))
        }
      }
    }
  });
  // set an array of vars or nothing to listen to on mount and update example => },[useLocation,location]);
  // set an empty array to only use the effect on Mount
  // use severa useEffects to get different behaviours

  return(
    <View style={styles.container}>
      <AppContainer/>
    </View>
  );
})


// Main App functional component
const App = () => {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <Wrapper />
      </PersistGate>
    </Provider>
  );
}

export default App;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  }
});

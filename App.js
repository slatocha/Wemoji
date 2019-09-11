import React, { memo, useState, useEffect } from 'react';
import { StyleSheet, View, Text, Easing, Animated } from 'react-native';

import { Provider, useSelector, useDispatch } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import { createStackNavigator } from 'react-navigation-stack';
import { createAppContainer } from 'react-navigation';

import Permissions from 'react-native-permissions';

import NetInfo from "@react-native-community/netinfo";
import Geolocation from '@react-native-community/geolocation';

import SplashScreen from 'react-native-splash-screen';

import {setOnline, setCurrentLocation, setUseLocation, setError} from './app/redux/reducer';

import CityList from './app/screens/CityList';
import WeatherDetail from './app/screens/WeatherDetail';

import {URL_SEVERAL_INITIAL} from './app/helper/Constants';

import { getCurrentLocation, getUseLocation, getOnline } from './app/redux/selectors';

import { ERROR_LOCATION, ERROR_LOCATION_DISABLED } from './app/helper/Error';

import ErrorModal from './app/custom/ErrorModal';

///////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////
// redux && storage
import { store, persistor } from './app/redux/store';
///////////////////////////////////////////////////////////////////////////////////////////


///////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////
// screens && navigation && transition
const Stack = createStackNavigator(
  {
    Home: {
      screen: WeatherDetail
    },
    List: {
      screen: CityList
    }
  },
  {
    headerMode: 'screen',
    mode: 'card',
    defaultNavigationOptions: {
      gesturesEnabled: false,
    },
    transitionConfig: () => ({
      transitionSpec: {
        duration: 300,
        easing: Easing.out(Easing.poly(4)),
        timing: Animated.timing,
      },
      screenInterpolator: sceneProps => {
        const { layout, position, scene } = sceneProps;
        const { index } = scene;

        const width = layout.initWidth;
        const translateX = position.interpolate({
          inputRange: [index - 1, index, index + 1],
          outputRange: [-width, 0, 0],
        });

        const opacity = position.interpolate({
          inputRange: [index - 1, index, index + 1],
          outputRange: [1, 1, 1],
        });

        return { opacity, transform: [{ translateX }] };
      },
    }),
  }
);
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
  const useLocation = useSelector(getUseLocation);
  const [authorization, setAuthorization] = useState('');
  const locationOptions = Platform.OS === 'android' ? null : { enableHighAccuracy: true, timeout: 100000, maximumAge: 1000 };

  useEffect(() => {
    const getCurrentPosition = async (options) =>  {
      Geolocation.getCurrentPosition(
          position => setLocation(position),
          error => setError(ERROR_LOCATION),
          options
      );
    }

    const getUserLocation = async () => {
      let permission = await Permissions.check('location');
      // permission states are: authorized || denied || restricted || undetermined
      if (permission !== 'authorized') {
        // unneded because the ErrorModal will handle the error view
        //  Alert.alert(
        //     ERROR_LOCATION_DISABLED.title,
        //     ERROR_LOCATION_DISABLED.msg + ' Permission: ' + permission,
        //     [ 
        //       {text: 'Go to settings', onPress: () => Permissions.openSettings()},
        //       {text: 'Cancel', onPress: () => setDisabled(true),style: 'cancel'},
        //     ],
        //     {cancelable: false}
        // );
        // throw new Error('Not authorized: ' + permission);
        setAuthorization(permission);
        setError({title:ERROR_LOCATION_DISABLED.title, msg:ERROR_LOCATION_DISABLED.msg + ' Permission: ' + permission,additional:''});
      }
      return await getCurrentPosition(locationOptions);
    }

    try {
        if (useLocation) getUserLocation(); 
    } catch (error) {
        setError(error);
    }
  }, [])
  
  return {error:error, data:location, hasError:(error) ? true : false, disabled:disabled, permission:authorization};
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

  // react - useEffect
  // set an array of vars or nothing to listen to on mount and update example => useEffect(() => {},[useLocation,location]);
  // set an empty array to only use the effect on Mount
  // use severa useEffects to get different behaviours

  useEffect(() => {
    // network handling
    if (online != netInfo) dispatch(setOnline(netInfo));
    // geolocation handling
    if (useLocation) {
      if (location) {
        if (location.disabled) dispatch(setUseLocation(false));
        else if (location.hasError) {
          dispatch(setError(location.error))
          // permission states are: authorized || denied || restricted || undetermined
          if (location.permission !== 'undetermined') dispatch(setUseLocation(false))
        }
        else if (location.data && currentLocation.timestamp == 0) {
          dispatch(setCurrentLocation({lat:location.data.coords.latitude, lon:location.data.coords.longitude, timestamp:location.data.timestamp}))
        }
      }
    }
  });

  return(
    <View style={styles.container}>
      <AppContainer/>
      <ErrorModal />
    </View>
  );
})


// Main App functional component
const App = () => {
  // fire SplashScreen hide only once on component did mount
  useEffect(() => {
    SplashScreen.hide();
  },[]);

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

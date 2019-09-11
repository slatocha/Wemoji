import React, {Fragment, PureComponent} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  // StatusBar,
  FlatList,
  ActivityIndicator,
  TouchableOpacity
} from 'react-native';

import { SearchBar, ListItem, Icon } from 'react-native-elements';

import {
  Header,
  Colors,
  DebugInstructions,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';

import { connect } from 'react-redux';

import { APP_NAME, APP_VERSION, API_DEFAULT_UNITS, getTemperatureUnit, URL_SEVERAL_INITIAL, getIconUrlForIcon, getSerchUrlForCity, API_FETCH_DIFF_IN_MS } from '../helper/Constants';

import { getOnline,
         getUseLocation,
         getCurrentLocation, 
         getCurrentWeather,
         getCityList,
         getTimestamp,
         getCurrentLocationWeather } from '../redux/selectors';

import {setCurrentWeather, setCurrentLocationWeather, setCityList, updateCityList, setError, setUseLocation} from '../redux/reducer';

import { COLOR_ERROR_BG,
         COLOR_ERROR_TINT,
         COLOR_BG,
         COLOR_TINT,
         COLOR_ICON,
         COLOR_ICON_ERROR,
         COLOR_WHITE } from '../helper/Colors';

import { ERROR_OFFLINE, ERROR_WEATHER_API, ERROR_CITY_SEARCH, ERROR_CITY_NOT_FOUND } from '../helper/Error';

const SEARCH_AFTER_PASSED_MS = 2000;

/**
  Weather API -> Open Weather Map

  // initial cities... get them by "id" because it's faster according to API documentation
  [
    {
      "id": 3186886,
      "name": "Zagreb",
      "country": "HR",
      "coord": {
        "lon": 15.97798,
        "lat": 45.814442
      }
    },
    {
      "id": 3193935,
      "name": "Osijek",
      "country": "HR",
      "coord": {
        "lon": 18.69389,
        "lat": 45.551109
      }
    },{
      "id": 3191648,
      "name": "Rijeka",
      "country": "HR",
      "coord": {
        "lon": 14.40917,
        "lat": 45.34306
      }
    },
    {
      "id": 3190261,
      "name": "Split",
      "country": "HR",
      "coord": {
        "lon": 16.43915,
        "lat": 43.508911
      }
    },
  ]

  // API efficiency -> https://openweathermap.org 

  1) We recommend making calls to the API no more than one time every 10 minutes for one location (city / coordinates / zip-code). This is due to the fact that weather data in our system is updated no more than one time every 10 minutes.

  2) The server name is api.openweathermap.org. Please, never use the IP address of the server.

  3) Better call API by city ID instead of a city name, city coordinates or zip code to get a precise result.
     // http://bulk.openweathermap.org/sample/city.list.json.gz

  4) if data exceeds the limit response:
    {  
      "cod": 429,
      "message": "Your account is temporary blocked due to exceeding of requests limitation of your subscription type. Please choose the proper subscription http://openweathermap.org/price"
    }

 */


class CityList extends PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      search: '',
      searching: false,
      online: props.online,
      scrollable: true,
    }
    this.searchTimer;
  }

  static propTypes = {
    // currentLocation: PropTypes.object,
    // currentWeather: PropTypes.object,
  }

  handleDetail(item) {
    // console.log("CityList::handleDetail",item);
    this.props.setCurrentWeather({data:item, timestamp:new Date().getTime()});
    this.props.navigation.navigate('Home');
  }

  handleDetailCurrentLocation(item) {
    // console.log("CityList::handleDetailCurrentLocation",item);
    this.props.setCurrentLocationWeather({data:item, timestamp:new Date().getTime()});
    this.props.navigation.navigate('Home');
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    // update the online param in navigation to indicate offline state
    if (prevState.online !== nextProps.online || nextProps.navigation.getParam('online') !== nextProps.online) nextProps.navigation.setParams({ online:nextProps.online, onDispatch:() => {nextProps.setError(ERROR_OFFLINE)} });
    return nextProps.online === prevState.online ? {}
                                                 : {online:nextProps.online};
  }

  componentWillUnmount() {
    this.clearSearchTimer();
  }

  componentDidMount() {
    console.log("CityList::componentDidMount");
    let {online, cityList} = this.props;
    // set the initial online state
    this.props.navigation.setParams({ online:online });

    // get the weather initially, but also if the api has newer Weather to show
    if ((cityList.timestamp == 0 || Math.abs(cityList.timestamp - new Date().getTime()) > API_FETCH_DIFF_IN_MS) && online) this.getWeather(URL_SEVERAL_INITIAL);
  }

  keyExtractor = (item, index) => index.toString();

  renderItem = ({ item }) => (
    <ListItem
      containerStyle={styles.listItem}
      title={item.name}
      subtitle={"Temperature: " + item.main.temp.toString() + ' ' + getTemperatureUnit(API_DEFAULT_UNITS)}
      leftAvatar={{
        source: item.weather && Array.isArray(item.weather) && item.weather.length > 0 && { uri: getIconUrlForIcon(item.weather[0].icon) },
        title: item.name
      }}
      onPress={() => this.handleDetail(item)}
      bottomDivider
      chevron
    />
  )

  render() {
    let { search, scrollable } = this.state;
    let { cityList: { list },
          online,
          useLocation,
          currentLocationWeather } = this.props;

    return (
      <Fragment>
        {/* <StatusBar barStyle="dark-content" /> */}
        <SafeAreaView style={styles.safeAreaView}>
            <View style={[styles.body, online ? {} : styles.bodyError]}>
              <SearchBar
                placeholder="City..."
                onChangeText={this.updateSearch}
                showLoading={search != ''}
                value={search}
              />
              <ListItem
                containerStyle={styles.listItem}
                title={'Current Location'}
                onPress={() => {}}
                bottomDivider
                switch={{onValueChange:val => {console.log("change",val), this.props.setUseLocation(val); if (!val) this.props.setCurrentLocationWeather({data:{}, timestamp:0});}, value:useLocation}}
              />
              {(list.length > 0) ? <FlatList 
                                    ListHeaderComponent={
                                      currentLocationWeather && Object.keys(currentLocationWeather).length > 0 ? <ListItem
                                                                                                                    containerStyle={styles.listItem}
                                                                                                                    title={currentLocationWeather.name}
                                                                                                                    subtitle={
                                                                                                                      <View style={styles.subtitleView}>
                                                                                                                        <Icon name='location-arrow' type='font-awesome' color={COLOR_ICON} size={20}/>
                                                                                                                        <Text style={styles.subtitleText}>{"Temperature: " + currentLocationWeather.main.temp.toString() + ' ' + getTemperatureUnit(API_DEFAULT_UNITS)}</Text>
                                                                                                                      </View>
                                                                                                                    }
                                                                                                                    leftAvatar={{
                                                                                                                      source: currentLocationWeather.weather && Array.isArray(currentLocationWeather.weather) && currentLocationWeather.weather.length > 0 && { uri: getIconUrlForIcon(currentLocationWeather.weather[0].icon) },
                                                                                                                      title: 'current location'
                                                                                                                    }}
                                                                                                                    onPress={() => this.handleDetail(currentLocationWeather)}
                                                                                                                    bottomDivider 
                                                                                                                    chevron />
                                                                                                                : null
                                    }
                                    ListFooterComponent={
                                      <View style={[styles.body, online ? {} : styles.bodyError]}>
                                        <Text style={styles.footerText}>{APP_NAME + ' - v: ' + APP_VERSION}</Text>
                                      </View>
                                    }
                                    keyExtractor = {this.keyExtractor}
                                    data={list} 
                                    renderItem={this.renderItem}
                                    scrollEnabled={scrollable} /> 
                                  : <ActivityIndicator size="large" color={online ? COLOR_TINT : COLOR_ERROR_TINT} />}
            </View>
        </SafeAreaView>
      </Fragment>
    );
  }

  clearSearchTimer () {
    // Handle an undefined timer rather than null
    this.searchTimer !== undefined ? clearTimeout(this.searchTimer) : null;
  }
  
  async getWeather (url) {
    try {
      this.setState({searching:true});
      console.log("the url: ", url)
      const resp = await fetch(url)

      const data = await resp.json()

      console.log("the response: ", resp)
      console.log("the data:", data)
      
      // return data
      this.props.setCityList({data:data, timestamp:new Date().getTime()});
      this.setState({searching:false, search:''});
    } catch (err) {
      console.log('the error:',err)
      this.props.setError(ERROR_WEATHER_API);
    }
  }

  async searchWeather (url) {
    try {
      this.setState({searching:true});
      console.log("searchWeather - the url: ", url)
      const resp = await fetch(url)

      const data = await resp.json()

      console.log("searchWeather - the response: ", resp)
      console.log("searchWeather - the data:", data)

      // save successful data
      if ('status' in resp && resp.status) {
        if (resp.status === 200) {
          this.props.updateCityList({data:data, timestamp:new Date().getTime()})
          this.setState({searching:false, search:''});
        }
        else if (resp.status === 404) {
          this.setState({searching:false, search:''});
          this.props.setError(ERROR_CITY_NOT_FOUND);
        } 
        else {
          this.setState({searching:false, search:''});
          this.props.setError(ERROR_CITY_SEARCH);
        }
      }
    } catch (err) {
      console.log('searchWeather - the error:',err)
      this.props.setError(ERROR_CITY_SEARCH);
    }
  }

  updateSearch = search => {
    this.setState({ search }, () => {
      // console.log('this.state.search:',this.state.search);
      if ((typeof search === 'string' || search instanceof String) && search.length > 3) {
        // if not serching {}
        if (!this.state.searching) {
          this.searchAfterTimeout(() => {
            console.log('fetch something', getSerchUrlForCity(search, API_DEFAULT_UNITS))
            let findCityByExpression = '^('+search+').*$';
            let city = this.props.cityList.list.filter(i => new RegExp(findCityByExpression, 'g').test(i.name));
            if (city && Array.isArray(city) && city.length > 0) {
              console.log("The city is present in data:",this.props.cityList.list,city);
            } 
            else {
              console.log("The city to search is: ",search, city);
              this.searchWeather(getSerchUrlForCity(search, API_DEFAULT_UNITS));
            }
          },SEARCH_AFTER_PASSED_MS);
        } else console.log('trying to fetch something');
      }
    });
  }

  /**
    @param {function} onComplete
    @param {number} time
    */
  searchAfterTimeout = (onComplete = null, time = 3000) => {
    if (onComplete != null) {
      if (this.searchTimer) clearTimeout(this.searchTimer);
      this.searchTimer = setTimeout(onComplete, time);
    }
  }
}

const bindAction = (dispatch) => {
  return {
    setCurrentWeather: weather => dispatch(setCurrentWeather(weather)),
    setCurrentLocationWeather: weather => dispatch(setCurrentLocationWeather(weather)),
    setCityList: data => dispatch(setCityList(data)),
    updateCityList: data => dispatch(updateCityList(data)),
    setError: err => dispatch(setError(err)),
    setUseLocation: use => dispatch(setUseLocation(use)),
  };
}

const mapStateToProps = state => {
  return Object.assign({}, state, {
    online: getOnline(state),
    timestamp: getTimestamp(state),
    currentWeather: getCurrentWeather(state),
    currentLocationWeather: getCurrentLocationWeather(state),
    currentLocation: getCurrentLocation(state),
    cityList: getCityList(state),
    useLocation: getUseLocation(state),
  });
}

CityList.navigationOptions = ({ navigation }) => ({
  headerRight: (
    navigation.getParam('online', true) ? null
                                        : <TouchableOpacity onPress={navigation.getParam('onDispatch', () => {})}>
                                            <Icon name='exclamation-triangle' type='font-awesome' color={navigation.getParam('online', true) ? COLOR_ICON : COLOR_ICON_ERROR} />
                                          </TouchableOpacity>
  ),
  headerTintColor: navigation.getParam('online', true) ? COLOR_TINT : COLOR_ERROR_TINT,
  headerStyle:{
    backgroundColor: navigation.getParam('online', true) ? COLOR_BG : COLOR_ERROR_BG,
    shadowColor: 'transparent',
    borderBottomWidth: 0,
  },
  headerRightContainerStyle: {
    paddingRight: 10
  },
})

export default connect(mapStateToProps, bindAction)(CityList);

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
  listItem: {
    backgroundColor:COLOR_BG,
  },
  subtitleView: {
    flexDirection: 'row',
  },
  subtitleText: {
    paddingLeft: 5,
    fontSize:15
  },
  footerText: {
    color:"#bdbdbd",
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    paddingTop:20,
    paddingHorizontal: 24,
  },
});

import React, {Fragment, PureComponent} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  // StatusBar,
  FlatList,
  ActivityIndicator,
  Alert,
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

import { APP_NAME, API_DEFAULT_UNITS, getTemperatureUnit, URL_SEVERAL_INITIAL, getIconUrlForIcon, getSerchUrlForCity } from '../helper/Constants';

import { getOnline,
         getCurrentLocation, 
         getCurrentWeather,
         getCityList,
         getTimestamp } from '../redux/selectors';

import {setCurrentWeather, setCityList, updateCityList, setError} from '../redux/reducer';

import { COLOR_ERROR_BG,
         COLOR_ERROR_TINT,
         COLOR_BG,
         COLOR_TINT,
         COLOR_ICON,
         COLOR_ICON_ERROR } from '../helper/Colors';

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

  static getDerivedStateFromProps(nextProps, prevState) {
    // update the online param in navigation to indicate offline state
    if (prevState.online !== nextProps.online || nextProps.navigation.getParam('online') !== nextProps.online) nextProps.navigation.setParams({ online:nextProps.online });
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

    // get the weather initially, but only if the timestamp was never set or is older than needed
    if (cityList.timestamp == 0 && online) this.getWeather(URL_SEVERAL_INITIAL);
  }

  keyExtractor = (item, index) => index.toString();

  renderItem = ({ item }) => (
    <ListItem
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
    let {search, errorMsg} = this.state;
    let { cityList: { list },
          online } = this.props;

    return (
      <Fragment>
        {/* <StatusBar barStyle="dark-content" /> */}
        <SafeAreaView style={styles.safeAreaView}>
            <View style={[styles.body, online ? {} : styles.bodyError]}>
              {(list.length > 0) ? <FlatList 
                                    ListHeaderComponent={
                                      <SearchBar
                                      placeholder="City..."
                                      onChangeText={this.updateSearch}
                                      showLoading={search != ''}
                                      value={search}
                                    />
                                    }
                                    keyExtractor = {this.keyExtractor}
                                    data={list} 
                                    renderItem={this.renderItem} /> 
                                  : <ActivityIndicator size="large" color="#0000ff" />}
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
          
          Alert.alert(
            'Error',
            ('message' in data && data.message) ? data.message : '',
            [
              {text: 'OK', onPress: () => {
                this.setState({searching:false, search:''});
              }},
            ],
            {cancelable: false},
          );
        } 
        else {
          Alert.alert(
            'Error',
            ('message' in data && data.message) ? data.message : '',
            [
              {text: 'OK', onPress: () => {
                this.setState({searching:false, search:''});
              }},
            ],
            {cancelable: false},
          );
        }
      }
    } catch (err) {
      console.log('searchWeather - the error:',err)
    }
  }

  updateSearch = search => {
    this.setState({ search }, () => {
      console.log('this.state.search:',this.state.search);
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
    setCityList: data => dispatch(setCityList(data)),
    updateCityList: data => dispatch(updateCityList(data)),
    setError: msg => dispatch(setError(msg)),
  };
}

const mapStateToProps = state => {
  return Object.assign({}, state, {
    online: getOnline(state),
    timestamp: getTimestamp(state),
    currentWeather: getCurrentWeather(state),
    currentLocation: getCurrentLocation(state),
    cityList: getCityList(state),
  });
}

CityList.navigationOptions = ({ navigation }) => ({
  headerRight: (
    navigation.getParam('online', true) ? null
                                        : <TouchableOpacity 
                                            onPress={() => { Alert.alert(
                                                                'Offline',
                                                                APP_NAME + ' is offline, please check your internet connection.',
                                                                [ 
                                                                  // {text: 'Go to settings', onPress: () => Permissions.openSettings()},
                                                                  {text: 'Ok', onPress: () => {} ,style: 'cancel'},
                                                                ],
                                                                {cancelable: false}
                                                            )}}>
                                            <Icon 
                                              name='exclamation-triangle' 
                                              type='font-awesome' 
                                              color={navigation.getParam('online', true) ? COLOR_ICON : COLOR_ICON_ERROR} 
                                              />
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
  sectionContainer: {
    marginTop: 24,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.black,
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
    color: Colors.dark,
  },
  highlight: {
    fontWeight: '700',
  },
  footer: {
    color: Colors.dark,
    fontSize: 12,
    fontWeight: '600',
    padding: 4,
    paddingRight: 12,
    textAlign: 'right',
  },
});

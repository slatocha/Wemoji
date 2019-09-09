/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

import {DEBUG_LOGGING} from './app/helper/Constants';

// disable global console logging if not in debug mode
if (!DEBUG_LOGGING) { console.log = () => {}; } 

AppRegistry.registerComponent(appName, () => App);

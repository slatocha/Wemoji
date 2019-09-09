
import AsyncStorage from "@react-native-community/async-storage";

import { createStore, applyMiddleware } from 'redux';
import { persistStore, persistReducer } from 'redux-persist';

// import thunk from 'redux-thunk';

// import rootReducer from './index';
import reducer from './reducer';

///////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////
// REDUX && storage
///////////////////////////////////////////////////////////////////////////////////////////
// Middleware: Redux Persist Config
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  // Whitelist (Save Specific Reducers)
  whitelist: [
    'reducer',
  ],
  // Blacklist (Don't Save Specific Reducers) // when optimizing the app
  // blacklist: [
  //   'otherReducer',
  // ],
};
const persistedReducer = persistReducer(persistConfig, reducer);// rootReducer);

const store = createStore(
  persistedReducer,
  // applyMiddleware(thunk),
);
let persistor = persistStore(store);

export { store, persistor };
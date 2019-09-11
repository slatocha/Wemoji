
import AsyncStorage from "@react-native-community/async-storage";

import { createStore/*, applyMiddleware*/ } from 'redux';
import { persistStore, persistReducer } from 'redux-persist';
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2';

// import thunk from 'redux-thunk';

// import rootReducer from './index';
import reducer from './reducer';

///////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////
// REDUX && storage
///////////////////////////////////////////////////////////////////////////////////////////
// Middleware: Redux Persist Config
const persistConfig = {
  timeout: null,
  key: 'root',
  storage: AsyncStorage,
  stateReconciler: autoMergeLevel2,
  // Whitelist (Save Specific Reducers)
  // whitelist: [
  //   'reducer',
  // ],
  // Blacklist (Don't Save Specific Reducers) // when optimizing the app
  // blacklist: [
  //   'otherReducer',
  // ],
};
const persistedReducer = persistReducer(persistConfig, reducer);// rootReducer);


export const store = createStore(
    persistedReducer,
    // applyMiddleware(thunk),
  );
export const persistor = persistStore(store, null, () => {
    console.log("rehydrated redux store:",store.getState())
});
import React, { memo, useState, useEffect } from 'react';
import { Overlay } from 'react-native-elements';
import { StyleSheet, View, Text, TouchableHighlight } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';

import { ERROR_RESET } from '../helper/Error';

import { setError } from '../redux/reducer';
import { getError } from '../redux/selectors';

// show an custom alert like modal ocerlay if needed
const ErrorModal = memo(() => {
  const dispatch = useDispatch(); 
  const error = useSelector(getError);

  // return nothing if no error present
  if (!error.show) return null;

  return (
    <Overlay
      isVisible={error.show}
      animationType="fade"
      // transparent={false}
      onBackdropPress={() => { if (error.show) dispatch(setError(ERROR_RESET)) }}
      onRequestClose={() => { if (error.show) dispatch(setError(ERROR_RESET)) }}
      >
      <View>
        <Text>{error.title}</Text>
        <Text>{error.msg}</Text>
        <TouchableHighlight
          onPress={() => {
            dispatch(setError(ERROR_RESET))
          }}>
          <Text>OK</Text>
        </TouchableHighlight>
      </View>
    </Overlay>
  );
});

export default ErrorModal;
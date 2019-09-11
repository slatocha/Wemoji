import React, { memo, useState, useEffect } from 'react';
import { Overlay, Button } from 'react-native-elements';
import { StyleSheet, View, Text, Dimensions } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';

import { ERROR_RESET } from '../helper/Error';

import { setError } from '../redux/reducer';
import { getError } from '../redux/selectors';

import { COLOR_WHITE, COLOR_PASTEL_BLUE } from '../helper/Colors';

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
      overlayBackgroundColor={'rgba(249, 102, 94, 1)'}
      width="auto"
      height={200}
      borderRadius={12}
      >
      <View style={styles.body}>
        <Text style={styles.titleText}>{error.title}</Text>
        <Text style={styles.msgText}>{error.msg}</Text>
        <Button
          style={styles.button}
          title="OK"
          
          // type="outline"
          onPress={() => {
            dispatch(setError(ERROR_RESET))
          }}
        />
      </View>
    </Overlay>
  );
});

export default ErrorModal;

const styles = StyleSheet.create({
  body: {
    flex:1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  titleText: {
    color:'#fff',
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    paddingTop:25,
    paddingBottom:10,
    paddingHorizontal: 24,
  },
  msgText: {
    color:'#fff',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    paddingTop:20,
    paddingHorizontal: 24,
  },
  button: {
    paddingTop:20,
    width:150
  }
});
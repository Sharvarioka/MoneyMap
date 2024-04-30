import React, {useState,useCallback} from 'react';
import {StyleSheet, Text, View,Dimensions} from 'react-native';
import {Accelerometer} from 'expo-sensors';
import { useFocusEffect } from '@react-navigation/native';

export default function Excel(props) {
  const [data, setData] = useState({
    x: 0,
    y: 0,
    z: 0,
  });
  const [subscription, setSubscription] = useState(null);

  const _subscribe =() => {
    // console.log("in subscribe");
    setSubscription(
      Accelerometer.addListener(accelerometerData => {
        setData(accelerometerData);
        props.getSpeed(accelerometerData);
      }),
    );
  };

  const _unsubscribe = () => {
    // console.log("in excel unsub")

    subscription && subscription.remove();
    setSubscription(null);
    Accelerometer.removeAllListeners();
  };

    useFocusEffect(
    useCallback(() => {
      // console.log("in excel useeffect")
     _subscribe();
      Accelerometer.setUpdateInterval(1000);

      return () => {
        _unsubscribe();
      };
    }, [])
  );

  const {x, y, z} = data;
  return (
    null
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Dimensions.get('window').height/81,
  },
  text: {
    textAlign: 'center',
  },
});

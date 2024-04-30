import React,{useEffect} from 'react';
import {PermissionsAndroid, BackHandler,Alert} from 'react-native';
import {SignUp, Root,FirstPage} from './screens/index';
import {createStackNavigator} from '@react-navigation/stack';
import {NavigationContainer, DefaultTheme} from '@react-navigation/native';

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    border: 'transparent',
  },
};


const Stack = createStackNavigator();


async function askPermission() {
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      {
        title: 'Budget App Microphone Permission',
        message: 'Budget App needs access to your microphone ',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      },
    );
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      // console.log("You can use the mic");
    } else {
      // console.log("mic permission denied");
    }
  } catch (err) {
    console.warn(err);
  }

  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      {
        title: 'Budget App storage Permission',
        message: 'Budget App needs access to your storage ',
        // buttonNeutral: "Ask Me Later",
        // buttonNegative: "Cancel",
        buttonPositive: 'OK',
      },
    );
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      // console.log("You can use the storage");
    } else {
      // console.log("storage permission denied");
    }
  } catch (err) {
    console.warn(err);
  }
}

const App = () => {
  askPermission();
  
  return (
    <NavigationContainer theme={theme}>
      <Stack.Navigator
        detachInactiveScreens={true}
        screenOptions={{
          headerShown: false,
        }}>
        <Stack.Screen name="FirstPage" component={FirstPage} />          
        <Stack.Screen name="SignUp" component={SignUp} />
        <Stack.Screen name="Root" component={Root} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;

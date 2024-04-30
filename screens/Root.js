import React from 'react';
import {connect} from 'react-redux';
import {Alert,View,Text} from 'react-native';
import {changeProfileName} from '../actions/profileName';
import {Home, EditBudget, InfoScreen, HowToUse} from './';
import AsyncStorage from '@react-native-async-storage/async-storage';


import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
} from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';

const onLogOut = (changeProfileName,navigation) => async () => {
  await changeProfileName({profileName: 'User'});
  await AsyncStorage.removeItem('key');
  // console.log(await AsyncStorage.getItem('key'));  
   navigation.navigate('SignUp');
  
};

const Drawer = createDrawerNavigator();

const Root = ({changeProfileName,navigation}) => {
  return (
    <Drawer.Navigator
      drawerContent={props => {
        return (
          <DrawerContentScrollView {...props}>
            <DrawerItemList {...props} />
            <DrawerItem
              label="LogOut"
              style={{backgroundColor: 'tomato'}}
              onPress={() =>
                Alert.alert(
                  'Log out',
                  'Do you want to logout?',
                  [
                    {
                      text: 'Cancel',
                      onPress: () => {
                        return null;
                      },
                    },
                    {
                      text: 'Confirm',
                      onPress: onLogOut(changeProfileName, navigation),
                    },
                  ],
                  {cancelable: false},
                )
              }
            />
          </DrawerContentScrollView>
        );
      }}>
       
      <Drawer.Screen
        name="Daily Expense"
        component={Home}
        options={{unmountOnBlur: true}}
      />
      <Drawer.Screen
        name="Expense Summary"
        component={InfoScreen}
        options={{unmountOnBlur: true}}
      />
      <Drawer.Screen
        name="Edit Budget"
        component={EditBudget}
        options={{unmountOnBlur: true}}
      />
      <Drawer.Screen
        name="How to use the app?"
        component={HowToUse}
        options={{unmountOnBlur: true}}
      />
    </Drawer.Navigator>
  );
};

const mapDispatchToProps = dispatch => {
  return {
    changeProfileName: profileName => dispatch(changeProfileName(profileName)),
  };
};

export default connect(null,mapDispatchToProps)(Root);

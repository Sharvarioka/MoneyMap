import React,{useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  TextInput,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  ToastAndroid,
  Alert,
  Switch,
  Dimensions
} from 'react-native';
import Root from './Root';
import LinearGradient from 'react-native-linear-gradient';
import {COLORS, SIZES, FONTS, icons} from '../constants';
import {backend_url} from '../urlconstants';
import {changeProfileName} from '../actions/profileName';
import {connect} from 'react-redux';
import {updateIsLoading} from '../actions/generalActions';
import {LoadingComponent} from './index';
import AsyncStorage from '@react-native-async-storage/async-storage';
const SignUp = ({
  navigation,
  changeProfileName,
  changeIsLoading,
  isLoading,
  profileName
}) => {
  const [showPassword, setShowPassword] = React.useState(false);
  const [value, setValue] = React.useState(0);
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [fullName, setFullName] = React.useState('');
  const [phoneNumber, setPhoneNumber] = React.useState('');
  const [rememberMe,setRememberMe] = React.useState(false)

 
 
  const onLogin = async () => {
    //login
    const loginResponse = await fetch(backend_url + '/login', {
      method: 'POST',
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({username, password}),
    });

    const ResponseData = await loginResponse.json();

    if (ResponseData?.length == 0 && !ResponseData[0]?.password) {
      Alert.alert('Invalid credentials!');
    } 
    else {
      await clearStates(); 
      navigation.navigate('Root');
    }
    await changeIsLoading({isLoading: false});
  };

  const onSignUp = async () => {
    const signUpResponse = await fetch(backend_url + '/signup', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({fullName, phoneNumber, username, password}),
    });

    const ResponseData = await signUpResponse.json();

    if (ResponseData?.code == 'ER_DUP_ENTRY') {
      Alert.alert('User with same credential already exists');
    } else {
      await addBudget();
      await clearStates();
      navigation.navigate('Root');
    }
    await changeIsLoading({isLoading: false});
  };

  const addBudget = async () => {
    const budgetResponse = await fetch(backend_url + '/addBudget', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({username, budget: 4000, balance: 4000}),
    });

    const ResponseData = await budgetResponse.json();
    if (ResponseData?.code) {
      ToastAndroid.show('Problem with add budget call', ToastAndroid.LONG);
    }
  };

  const onloginOrSignup = async () => {
    await changeIsLoading({isLoading: true});
    await changeProfileName({profileName: username});
    // console.log("iiiiii",profileName);
     if (rememberMe === true) {
      //user wants to be remembered.
        await rememberUser();
      } 
    await onContinue();
  
  };
  const onAlreadyLoggedIn = async() =>{
    const user =  await getRememberedUser();
    if(user && user!=='User'){
      await changeProfileName({profileName: user});
      navigation.navigate("Root")
      
    }
    else{
      ToastAndroid.show("no logged in user",ToastAndroid.LONG);
    }
  }

  const clearStates = async () => {
    setUsername('');
    setPassword('');
    setPhoneNumber('');
    setFullName('');
  };

  const onContinue = async () => {
    //server request
    if (value == 1) {
      await onSignUp();
    } else {
      await onLogin();
    }
  };

  function renderHeader() {
    return (
      <>
        <View
           style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: Dimensions.get('window').width/12,
            height: Dimensions.get('window').height/12,
          }}>
          <TouchableOpacity
            style={{
              flexDirection: 'column',
              marginTop: SIZES.padding * 2,
              paddingHorizontal: SIZES.padding * 2,
              backgroundColor: COLORS.gray,
              marginLeft: SIZES.padding * 2,
              borderRadius: SIZES.radius / 1.5
            }}
            onPress={() => setValue(1)}>
            <Text
              style={{
                marginTop: Dimensions.get('window').width/30,
                marginLeft: SIZES.padding,
                color: COLORS.black,
                justifyContent: 'center',
                alignItems: 'center',
                ...FONTS.h3,
              }}>
              Sign Up
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              flexDirection: 'column',
              alignItems: 'center',
              marginTop: SIZES.padding * 2,
              paddingHorizontal: SIZES.padding * 2,
              marginRight: SIZES.padding * 2,
              borderRadius: SIZES.radius / 1.5,
              backgroundColor: COLORS.gray,
            }}
            onPress={() => setValue(0)}>
            <Text
              style={{
                marginTop: Dimensions.get('window').width/30,
                marginLeft: SIZES.padding,
                color: COLORS.black,
                justifyContent: 'center',
                alignItems: 'center',
                ...FONTS.h3,
              }}>
              Login
            </Text>
          </TouchableOpacity>
            
          {/* <TouchableOpacity
          style={{
            height: Dimensions.get('window').height/13.5,
            backgroundColor: COLORS.black,
            borderRadius: SIZES.radius / 1.5,
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onPress={onloginOrSignup}>
          <Text style={{color: COLORS.white, ...FONTS.h3}}>Continue</Text>
        </TouchableOpacity> */}


        </View>
      </>
    );
  }

  function renderLogin() {
    return (
      <View
        style={{
          marginTop: SIZES.padding * 3,
          marginHorizontal: SIZES.padding * 3,
        }}>
        <View style={{marginTop: SIZES.padding * 3}}>
          <Text style={{color: COLORS.black, ...FONTS.body3}}>
            Username
          </Text>
          <TextInput
            onChange={ev => setUsername(ev.nativeEvent.text)}
            value={username}
            style={{
              marginVertical: SIZES.padding,
              borderBottomColor: COLORS.black,
              borderBottomWidth: 1,
              height: Dimensions.get('window').height/15,
              color: COLORS.black,
              ...FONTS.body3,
            }}
            placeholder="Enter Username"
            placeholderTextColor={COLORS.white}
            selectionColor={COLORS.black}
          />
        </View>

        {/* Password */}
        <View style={{marginTop: SIZES.padding * 2}}>
          <Text style={{color: COLORS.black, ...FONTS.body3}}>
            Password
          </Text>
          <TextInput
            onChange={ev => setPassword(ev.nativeEvent.text)}
            value={password}
            style={{
              marginVertical: SIZES.padding,
              borderBottomColor: COLORS.black,
              borderBottomWidth: 1,
              height:Dimensions.get('window').height/15,
              color: COLORS.black,
              ...FONTS.body3,
            }}
            placeholder="Enter Password"
            placeholderTextColor={COLORS.white}
            selectionColor={COLORS.black}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity
            style={{
              position: 'absolute',
              right: 0,
              bottom: Dimensions.get('window').width/41.1,
              height: Dimensions.get('window').height/27,
              width: Dimensions.get('window').height/27,
            }}
            onPress={() => setShowPassword(!showPassword)}>
            <Image
              source={showPassword ? icons.disable_eye : icons.eye}
              style={{
                height: Dimensions.get('window').height/40.5,
                width: Dimensions.get('window').width/20.5,
                tintColor: COLORS.black,
              }}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  function renderSignUp() {
    return (
      <View
        style={{
          marginTop: SIZES.padding * 3,
          marginHorizontal: SIZES.padding * 3,
        }}>
        <View style={{marginTop: SIZES.padding * 3}}>
          <Text style={{color: COLORS.black, ...FONTS.body3}}>
            Full Name
          </Text>
          <TextInput
            onChange={ev => setFullName(ev.nativeEvent.text)}
            value={fullName}
            style={{
              marginVertical: SIZES.padding,
              borderBottomColor: COLORS.black,
              borderBottomWidth: 1,
              height: Dimensions.get('window').height/15,
              color: COLORS.black,
              ...FONTS.body3,
            }}
            placeholder="Enter Full Name"
            placeholderTextColor={COLORS.white}
            selectionColor={COLORS.black}
          />
        </View>

        <View style={{marginTop: SIZES.padding * 3}}>
          <Text style={{color: COLORS.black, ...FONTS.body3}}>
            Username
          </Text>
          <TextInput
            onChange={ev => setUsername(ev.nativeEvent.text)}
            value={username}
            style={{
              marginVertical: SIZES.padding,
              borderBottomColor: COLORS.black,
              borderBottomWidth: 1,
              height: Dimensions.get('window').height/15,
              color: COLORS.black,
              ...FONTS.body3,
            }}
            placeholder="Enter Username"
            placeholderTextColor={COLORS.white}
            selectionColor={COLORS.black}
          />
        </View>

        {/* Phone Number */}
        <View style={{marginTop: SIZES.padding * 2}}>
          <Text style={{color: COLORS.black, ...FONTS.body3}}>
            Phone Number
          </Text>

          <View style={{flexDirection: 'row'}}>
            {/* Phone Number */}
            <TextInput
              onChange={ev => setPhoneNumber(ev.nativeEvent.text)}
              value={phoneNumber}
              style={{
                flex: 1,
                marginVertical: SIZES.padding,
                borderBottomColor: COLORS.black,
                borderBottomWidth: 1,
                height: Dimensions.get('window').height/15,
                color: COLORS.black,
                ...FONTS.body3,
              }}
              placeholder="Enter Phone Number"
              placeholderTextColor={COLORS.white}
              selectionColor={COLORS.black}
              keyboardType={'numeric'}
            />
          </View>
        </View>

        {/* Password */}
        <View style={{marginTop: SIZES.padding * 2}}>
          <Text style={{color: COLORS.black, ...FONTS.body3}}>
            Password
          </Text>
          <TextInput
            onChange={ev => setPassword(ev.nativeEvent.text)}
            value={password}
            style={{
              marginVertical: SIZES.padding,
              borderBottomColor: COLORS.black,
              borderBottomWidth: 1,
              height:Dimensions.get('window').height/15,
              color: COLORS.black,
              ...FONTS.body3,
            }}
            placeholder="Enter Password"
            placeholderTextColor={COLORS.white}
            selectionColor={COLORS.black}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity
            style={{
              position: 'absolute',
              right: 0,
              bottom: Dimensions.get('window').width/41.1,
              height: Dimensions.get('window').height/27,
              width: Dimensions.get('window').height/27,
            }}
            onPress={() => setShowPassword(!showPassword)}>
            <Image
              source={showPassword ? icons.disable_eye : icons.eye}
              style={{
                height: Dimensions.get('window').height/40.55,
                width: Dimensions.get('window').width/20.55,
                tintColor: COLORS.black,
              }}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  function renderButton() {
    return (
      <View style={{margin: SIZES.padding * 3}}>
        <TouchableOpacity
          style={{
            height: Dimensions.get('window').height/13.5,
            backgroundColor: COLORS.black,
            borderRadius: SIZES.radius / 1.5,
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onPress={onloginOrSignup}>
          <Text style={{color: COLORS.white, ...FONTS.h3}}>Continue</Text>
        </TouchableOpacity>
      </View>
    );
  }

  function renderRememberMeButton() {
    return (
      <View style={{margin: SIZES.padding * 3}}>
        <TouchableOpacity
          style={{
            height: Dimensions.get('window').height/13.5,
            backgroundColor: COLORS.black,
            borderRadius: SIZES.radius / 1.5,
            alignItems: 'center',
            justifyContent: 'center',
            marginTop:Dimensions.get('window').width / 3,
          }}
          onPress={onAlreadyLoggedIn}>
          <Text style={{color: COLORS.white, ...FONTS.h3}}>Already Logged In</Text>
        </TouchableOpacity>
      </View>
    );
  }

  function renderCheckButton() {
    return (
      <View style={{flexDirection: 'row',
      justifyContent: 'space-between',flex:1,justifyContent:'center',alignContent:'center'}}>
        <Switch
          value={rememberMe}
          onValueChange={(value) => toggleRememberMe(value)}
          /><Text>Keep me logged in</Text>
        </View>
    )
  }

  function toggleRememberMe(value){
    setRememberMe(value)
  }
  const rememberUser= async () => {
    try {
      await AsyncStorage.setItem('key',username);
    } catch (error) {
      // Error saving data
    }
    };
    const getRememberedUser= async () =>{
    try {
      const loggedUser = await AsyncStorage.getItem('key');
      if (loggedUser!== null) {
        // We have username!!
        return loggedUser;
      }
    } catch (error) {
      // Error retrieving data
    }
    };


  function renderForms() {
    if (isLoading.isLoading) {
      return <LoadingComponent />;
    }
   
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : null}
        style={{flex: 1}}>
        <LinearGradient
          colors={['lightseagreen','lightcyan']}
          style={{flex: 1}}>
          <ScrollView>
            {renderHeader()}
            {value ? renderSignUp() : renderLogin()}
            {renderButton()}
            {renderCheckButton()}
            {renderRememberMeButton()}
          </ScrollView>
        </LinearGradient>
      </KeyboardAvoidingView>
    );
  }

  return <>{renderForms()}</>;
};

const mapStateToProps = state => ({
  budget: state.budget,
  isLoading: state.appState,
  profileName: state.profileName
});

const mapDispatchToProps = dispatch => {
  return {
    changeProfileName: profileName => dispatch(changeProfileName(profileName)),
    changeIsLoading: isLoading => dispatch(updateIsLoading(isLoading)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(SignUp);

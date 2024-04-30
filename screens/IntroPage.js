import React from 'react';

import { SafeAreaView, Text,Image,Dimensions,Alert,ToastAndroid} from 'react-native';

const introPage = () => {
  return (
    <SafeAreaView
      style={{
        flex: 1,      
      }}>
        <Image style={{width:Dimensions.get('window').width,height:Dimensions.get('window').height}}
        source={require('../budgetbackground.png')}
        />
        {/* <View>
        ToastAndroid.show('Please go to How to use the app to know the working of of application',ToastAndroid.LONG);

        </View> */}
    
    </SafeAreaView>
  )
}
export default introPage;



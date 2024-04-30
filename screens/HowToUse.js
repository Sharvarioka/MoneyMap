import React from 'react';

import { SafeAreaView, Text,View,Dimensions } from 'react-native';

const HowToUse = () => {
  return (
    <SafeAreaView
      style={{
        flex: 1,      
        backgroundColor:'antiquewhite '
      }}>
        <View style={{top:Dimensions.get('window').height/40.55}}>
        <Text style={{fontSize:Dimensions.get('window').height/45.55, fontWeight:'bold',lineHeight: Dimensions.get('window').height/27}}>This application uses haptic interfaces and voice!</Text>
        <Text style={{fontSize:Dimensions.get('window').height/54,lineHeight: Dimensions.get('window').height/27}}>Shake your phone, record the expense which consists of title, expense amount, and expense type(credit/debit).If the expense entry is recorded correctly, swipe from left to save. {'\n'} 
          You can tap to edit the particular expense-attribute using name of the attribute and your input (eg. Expense 600). {'\n'} Shake the phone to discard the whole entry.</Text>
 
        </View>
    </SafeAreaView>
  )
}
export default HowToUse;
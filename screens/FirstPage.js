import React, { Component } from 'react';
import { StyleSheet, ScrollView , StatusBar, Text, View,Dimensions } from 'react-native';
import IntroPage from './IntroPage'
import SignUp from './SignUp';

export default class FirstPage extends Component {
constructor(props){
 super(props)
 this.state = {
  component : <IntroPage />
 }
}
componentDidMount(){

    // Start counting when the page is loaded
    this.timeoutHandle = setTimeout(()=>{
         this.setState({ component: <SignUp navigation={this.props.navigation} /> })
    }, 5000);
}

componentWillUnmount(){
    clearTimeout(this.timeoutHandle); 
}

render() {
return (
 this.state.component
);
}
}
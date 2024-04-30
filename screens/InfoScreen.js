import React, { Component } from 'react';
import { StyleSheet, ScrollView , StatusBar, Text, View,Dimensions } from 'react-native';
import PieChart from 'react-native-pie-chart';
import {connect} from 'react-redux';
class InfoScreen extends Component {
  render() {
    const widthAndHeight = Dimensions.get('window').height/3.2
    const {
      budget,
      balance,
      expenses
    }=this.props.budget;
    const series = [budget,balance,expenses]
    const sliceColor = ['#ffa07a','#8fbc8f','#f0e68c']

    return (
      <ScrollView style={{flex: 1}}>
        <View style={styles.container}>
          {/* <Text style={styles.title}>Expense Summary</Text> */}
          <PieChart
            widthAndHeight={widthAndHeight}
            series={series}
            sliceColor={sliceColor}
            doughnut={true}
            coverRadius={0.45}
            coverFill={'#FFF'}
          />
        </View>

        <View style={{marginTop:Dimensions.get('window').height/27,backgroundColor:'#696969',height:Dimensions.get('window').height/8.11}}>
        <View style={styles.RowViewStyle}>
        <Text style={styles.Budget}>Budget</Text>
        <Text style={styles.Balance}>Balance</Text>
        <Text style={styles.Expense}>Expense</Text>
        </View>

        <View style={styles.RowViewStyle}>
        <Text style={{marginLeft:Dimensions.get('window').width/20.55,fontSize:17}}>Rs.</Text>
        <Text style={styles.BudgetText}>{this.props.budget.budget.toString()}</Text>
        <Text style={styles.BalanceText}>{this.props.budget.balance.toString()}</Text>
        <Text style={styles.ExpenseText}>{this.props.budget.expenses.toString()}</Text>
        </View>
        </View>


      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    marginTop:Dimensions.get('window').height/16
  },
  title: {
    fontSize: Dimensions.get('window').height/33.8,
    margin: Dimensions.get('window').height/81.1
  },
  Budget: {
    fontSize: Dimensions.get('window').height/47.7,
    marginLeft:Dimensions.get('window').width/5.8,
    color: '#ffa07a',
    textAlign: 'left',
    fontWeight: 'bold',
  },
  Balance: {
    fontSize: Dimensions.get('window').height/47.7,
    color: '#8fbc8f',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  Expense: {
    fontSize: Dimensions.get('window').height/47.7,
    color: '#f0e68c',
    marginRight:Dimensions.get('window').width/41.1,
    textAlign: 'right',
    fontWeight: 'bold',
  },

  BudgetText: {
    fontSize: Dimensions.get('window').height/47.7,
    marginLeft:-Dimensions.get('window').width/4.11,
    color: 'black',
    // textAlign: 'left'
  },
  BalanceText: {
    fontSize: 17,
    color: 'black',
    marginLeft:-Dimensions.get('window').width/13.7
    // textAlign: 'center'
   
  },
  ExpenseText: {
    fontSize: Dimensions.get('window').height/47.7,
    color: 'black',
    marginRight:Dimensions.get('window').width/41.1,
   
  },
  RowViewStyle:{
   
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    marginTop:10
  }
});

const mapStateToProps = state => ({
  budget: state.budget,
  balance : state.balance
});

export default connect(mapStateToProps)(InfoScreen);

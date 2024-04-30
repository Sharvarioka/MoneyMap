import React, {Component} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Alert,
  ToastAndroid,
  TouchableOpacity,
  Dimensions
} from 'react-native';
import 'react-native-gesture-handler';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {changeBudget, changeBalance} from '../actions/budget';
import {backend_url} from '../urlconstants';

class EditBudget extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tempBudget: this.props.budget.budget.toString(),
      tempBalance: this.props.budget.balance.toString(),
    };
  }

  editBudgetTextInput = () => {
    return (
      <View style={styles.screendesign}>
        <View style={styles.rowDesign}>
          <Text style={styles.textStyle}>Set new budget</Text>
          <TextInput
            style={styles.input}
            onChange={ev =>
              this.setState({
                tempBudget: ev.nativeEvent.text,
              })
            }
            value={this.state.tempBudget}
            placeholder="Edit budget value"
          />
        </View>
        <View style={styles.rowDesign}>
          <Text style={styles.textStyle}>Set new balance</Text>
          <TextInput
            style={styles.input}
            onChange={ev =>
              this.setState({
                tempBalance: ev.nativeEvent.text,
              })
            }
            value={this.state.tempBalance}
            placeholder="Edit balance value"
          />
        </View>
        <View></View>

        <TouchableOpacity
          onPress={this.onEditBudget}
          style={styles.appButtonContainer}>
          <Text style={styles.appButtonText}>Save</Text>
        </TouchableOpacity>
      </View>
    );
  };

  onEditBudget = async () => {
    let newBudget = parseInt(this.state.tempBudget) || 0;
    if (newBudget > this.state.tempBalance) {
      Alert.alert('You are setting budget more than your balance:(');
    } else {
      ToastAndroid.show('Updated', ToastAndroid.SHORT);
      this.props.changeBudget({budget: newBudget});
      this.props.changeBalance({
        balance: parseInt(this.state.tempBalance) || 0,
      });
      await fetch(backend_url + '/updateBudget', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          budget: newBudget,
          balance: this.state.tempBalance,
          username: this.props.profileName.profileName,
        }),
      });
    }
  };

  render() {
    return <View style={styles.container}>{this.editBudgetTextInput()}</View>;
  }
}

const styles = StyleSheet.create({
  input: {
    height: Dimensions.get('window').height/20.27,
    // margin: 12,
    padding: 10,
    width: Dimensions.get('window').width/2,
    marginRight: Dimensions.get('window').width/41.1,
    borderRadius: Dimensions.get('window').width/13.7,
    backgroundColor: 'white',
    fontSize: Dimensions.get('window').height/54,
    color:'black'
  },
  container: {
    flex: 1,
    backgroundColor: 'moccasin',
    // alignItems: 'center',
    // justifyContent: 'center',
    width:"100%",
  },

  textStyle: {
    fontSize: 18,
    color: 'black',
    marginLeft: 20,
  },
  rowDesign: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 40,
    marginLeft: 0,
  },
  screendesign: {
    marginTop: Dimensions.get('window').width/20.55,
  },

  appButtonContainer: {
    elevation: Dimensions.get('window').height/101,
    backgroundColor: 'darkseagreen',
    borderRadius: Dimensions.get('window').height/81.1,
    paddingVertical: Dimensions.get('window').height/81.1,
    paddingHorizontal: 12,
    marginTop: Dimensions.get('window').height/40.55,
    width: Dimensions.get('window').width/2,
    marginLeft: Dimensions.get('window').width/4.1,
  },
  appButtonText: {
    fontSize: Dimensions.get('window').height/45,
    color: 'black',
    fontWeight: 'bold',
    alignSelf: 'center',
    textTransform: 'uppercase',
  },
});

const mapStateToProps = state => ({
  budget: state.budget,
  balance: state.balance,
  profileName: state.profileName,
});

const mapDispatchToProps = dispatch =>
  bindActionCreators({changeBudget, changeBalance}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(EditBudget);

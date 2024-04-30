import React, {Component} from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Alert,
  ToastAndroid,
  Dimensions,
  BackHandler,
  TouchableOpacity,
  Image
} from 'react-native';
import {COLORS, SIZES, FONTS, icons} from '../constants';

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {
  Table,
  Row,
  Rows,
  TableWrapper,
  Cell,
} from 'react-native-table-component';
import AudioRecord from 'react-native-audio-record';
import * as RNFS from 'react-native-fs';
import {backend_url} from '../urlconstants';
import {
  TapGestureHandler,
  State,
  Swipeable,
} from 'react-native-gesture-handler';
import {Excel, LoadingComponent} from './index';
import {changeBudget, changeBalance, changeExpense} from '../actions/budget';
import {changeCurrentUserExpenses} from '../actions/currentUserExpensesAction';
import {updateIsLoading} from '../actions/generalActions';
import wordsToNumbers from 'words-to-numbers';
import uuid from 'react-native-uuid';
// import HowToUse from './HowToUse';
class Home extends Component {
  constructor(props) {
    super(props);
    this.options = {
      sampleRate: 16000, // default 44100
      channels: 1, // 1 or 2, default 1
      bitsPerSample: 16, // 8 or 16, default 16
      audioSource: 6, // android only (see below)
      wavFile: 'test.wav', // default 'audio.wav'
    };
    AudioRecord.init(this.options);
    this.state = {
      currentExpenseTitle: '',
      currentExpense: '',
      currentExpenseType: '',
      // expenses: 0,
      show: false,
      currentDate: '',
      isTapped: false,
      currentTab: 'Home',
      isRecordingStarted: false,
    };
  }

  async componentDidMount() {
    await this.refreshPage();
    BackHandler.addEventListener('hardwareBackPress', this.backAction);
  }

  refreshPage = async () => {
    await this.props.updateIsLoading({isLoading: true});

    const userBudgets = await fetch(backend_url + '/getBudget', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({username: this.props.profileName.profileName}),
    });
    
    const budgets = await userBudgets.json();

    await this.props.changeBudget({budget: budgets[0].budget});
    await this.props.changeBalance({balance: budgets[0].balance});

    const currentUserAllExpenses = await fetch(backend_url + '/getEntries', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: this.props.profileName.profileName,
      }),
    });
    const currentUserExpensesList = await currentUserAllExpenses.json();
    let allexpensesForUser = [];
    currentUserExpensesList.forEach(element => {
      let expenseArray = [];
      expenseArray.push(element.title);
      expenseArray.push(element.amount);
      expenseArray.push(element.expensetype);
      expenseArray.push(element.date);
      expenseArray.push(element.id);
      allexpensesForUser.push(expenseArray);
    });
    let pastExpenses = 0;
    allexpensesForUser.forEach(expense => {
      if(expense[2]==='debit' || expense[2]==='Debit'){
          pastExpenses += expense[1]
      }
    });
    await this.props.changeCurrentUserExpenses({
      currentUserExpenses: allexpensesForUser,
    });
    await this.props.changeExpense({expenses: pastExpenses});
    this.props.updateIsLoading({isLoading: false});
  };

  handleBackButton = () => {
    // this.props.navigation.goBack(null);
    return true;
  };

  async componentWillUnmount() {
    // console.log("in willunmount");
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackButton);
  }

  backAction = () => {
    ToastAndroid.show('Use Menu button to move to other screens', ToastAndroid.LONG);
    return true;
  };

  onSingleTapEvent = async event => {
    if (event?.nativeEvent?.state === State.ACTIVE) {
      this.setState({
        isTapped: true,
      });
      await this.onStartRecord();
    }
  };

  onStopRecord = async () => {
    ToastAndroid.show('Recording stopped!', ToastAndroid.SHORT);
    const j = await AudioRecord.stop();
    const readFile = await RNFS.readFile(j, 'base64');
    const response = await fetch(backend_url + '/sendaudio', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sound: readFile,
      }),
    });
    const responseJson = await response.json();
    
    await this.parseRecordingString(wordsToNumbers(responseJson.text));
    this.setState({isRecordingStarted: false});
  };

  onStartRecord = async () => {
    if (!this.state.isRecordingStarted) {
      ToastAndroid.show('Recording started!', ToastAndroid.LONG);
      AudioRecord.start();
      this.setState({isRecordingStarted: true});
      setTimeout(this.onStopRecord, 5000);
    }
  };

  onExitModal = async () => {
    if (
      !(
        this.state.currentExpenseType == 'debit' ||
        this.state.currentExpenseType == 'credit'
      )
    ) {
      ToastAndroid.show(
        'Please enter expense type as debit/credit',
        ToastAndroid.SHORT,
      );
    } else {
      if (isNaN(this.state.currentExpense)) {
        ToastAndroid.show('Expense must be numeric!', ToastAndroid.SHORT);
      } else {
        await this.onSaveExpense();
        this.onCancelExpense();
      }
    }
  };

  onCancelExpense = () => {
    this.setState({show: false});
  };

  onSaveExpense = async () => {
    var {currentExpenseTitle, currentExpense, currentExpenseType, currentDate} =
      this.state;
    let newExpense = [];
    newExpense.push(currentExpenseTitle);
    newExpense.push(currentExpense);
    newExpense.push(currentExpenseType);
    newExpense.push(currentDate);

    let expenses;
    let balance;
    let budget;
    if (currentExpenseType == 'debit' || currentExpenseType == 'Debit') {
      // expenses = this.state.expenses + currentExpense;
      expenses = this.props.budget.expenses + currentExpense;
      balance = this.props.budget.balance - currentExpense;
      budget = this.props.budget.budget - currentExpense;
    } else if (
      currentExpenseType == 'credit' ||
      currentExpenseType == 'Credit'
    ) {
      // expenses = this.state.expenses;
      expenses = this.props.budget.expenses;
      balance = this.props.budget.balance + currentExpense;
      budget = this.props.budget.budget;
    }
    if (budget < 0) {
      Alert.alert(
        'Oops! You are spending more than your budget :o',
        'You can set new budget ;)',
      );
    } else {
      await fetch(backend_url + '/addEntry', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: this.props.profileName.profileName,
          title: currentExpenseTitle,
          amount: currentExpense,
          expensetype: currentExpenseType,
          date: currentDate.toString(),
          uniqueId:uuid.v4()
        }),
      });

      let expenseList = [...this.props.currentUserExpenses.currentUserExpenses];
      expenseList.push(newExpense);

      await this.props.changeCurrentUserExpenses({
        currentUserExpenses: expenseList,
      });
      await this.props.changeBudget({budget: budget});
      await this.props.changeBalance({balance: balance});
      await this.props.changeExpense({expenses: expenses});
      await fetch(backend_url + '/updateBudget', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          budget: budget,
          balance: balance,
          username: this.props.profileName.profileName,
        }),
      });
    }

    this.setState({
      currentExpense: '',
      currentExpenseTitle: '',
      currentExpenseType: '',
      currentDate: '',
    });
    await this.refreshPage();
  };

  editDistance = async (resource, text1, text2, text3) => {
    let m = resource.length;
    let n = text1.length;
    resource = resource.toLowerCase();
    text1 = text1.toLowerCase();
    text2 = text2.toLowerCase();
    text3 = text3.toLowerCase();

    let c = new Array(m + 1).fill(0);
    c.forEach((x, index) => {
      c[index] = new Array(n + 1);
    });
    let b = [];
    for (let j = 0; j <= m; j++) c[j][0] = j;
    for (let j = 0; j <= n; j++) c[0][j] = j;

    for (let i = 1; i <= m; i++)
      for (let j = 1; j <= n; j++) {
        var delta = 0;
        if (resource[i - 1] != text1[j - 1]) delta = 1;
        c[i][j] = Math.min(
          c[i - 1][j] + 1,
          c[i][j - 1] + 1,
          c[i - 1][j - 1] + delta,
        );
      }

    let res = text1;
    let dist = c[m][n];

    n = text2.length;
    c = new Array(m + 1).fill(0);
    c.forEach((x, index) => {
      c[index] = new Array(n + 1);
    });
    b = [];
    for (let j = 0; j <= m; j++) c[j][0] = j;
    for (let j = 0; j <= n; j++) c[0][j] = j;

    for (let i = 1; i <= m; i++)
      for (let j = 1; j <= n; j++) {
        var delta = 0;
        if (resource[i - 1] != text2[j - 1]) delta = 1;
        c[i][j] = Math.min(
          c[i - 1][j] + 1,
          c[i][j - 1] + 1,
          c[i - 1][j - 1] + delta,
        );
      }

    if (c[m][n] < dist) {
      dist = c[m][n];
      res = text2;
    }

    n = text3.length;
    c = new Array(m + 1).fill(0);
    c.forEach((x, index) => {
      c[index] = new Array(n + 1);
    });
    b = [];
    for (let j = 0; j <= m; j++) c[j][0] = j;
    for (let j = 0; j <= n; j++) c[0][j] = j;

    for (let i = 1; i <= m; i++)
      for (let j = 1; j <= n; j++) {
        var delta = 0;
        if (resource[i - 1] != text3[j - 1]) delta = 1;
        c[i][j] = Math.min(
          c[i - 1][j] + 1,
          c[i][j - 1] + 1,
          c[i - 1][j - 1] + delta,
        );
      }

    if (c[m][n] < dist && text3 != ' ') {
      dist = c[m][n];
      res = text3;
    }
    //console.log(res)
    return res;
  };

  
  demoparse = async dataInput =>{
    // console.log(dataInput);
    let recordingArray = dataInput.split(' ');
    if (!this.state.show) {
      const recordingArrayLength = recordingArray.length;
      let parsedExpenseTitle = '';
      let filteredTitle='';
      var i;
    
      const newDate = new Date();
      const dateString = newDate.toDateString()+' '+newDate.toString().split(' ')[4]
      
      // let d = recordingArray.includes("debit");
      // let c = recordingArray.includes("credit");
      let editedCurrentExpenseType;
      if(recordingArray.includes("debit") || recordingArray.includes("debited")|| recordingArray.includes("debiting")|| recordingArray.includes("spend")|| recordingArray.includes("spent") || recordingArray.includes("purchased")|| recordingArray.includes("purchase")|| recordingArray.includes("purchasing")){
        editedCurrentExpenseType='debit'
      }
      else{
        editedCurrentExpenseType='credit'
      }
      
      let expString = dataInput.match( /\d+/g )[0];
      let exp = parseInt(expString );
      let itemToBeRemoved = [expString,"credit","debit","rupees","spend","spent","spending","purchase","purchased","purchasing","debited","debiting","credited","crediting"];
      var filteredparsedExpenseTitle = recordingArray.filter(item => !itemToBeRemoved.includes(item))
      // console.log("f is",filteredparsedExpenseTitle);
      for (i = 0; i <= filteredparsedExpenseTitle.length - 1; i++) {
        filteredTitle += filteredparsedExpenseTitle[i]+" ";
      }
      // console.log("filteredtitle",filteredTitle);
      this.setState({
        currentExpenseTitle: filteredTitle,
        currentExpense:exp,
        currentExpenseType: editedCurrentExpenseType,
        currentDate: dateString,
        show: true,
      });
    }
  }

  parseRecordingString = async dataInput => {
    // console.log(dataInput);
    let recordingArray = dataInput.split(' ');

    if (this.state.isTapped && this.state.show) {
      const recordingArrayLength = recordingArray.length;
      var recordedResource = recordingArray[0].toLowerCase();

      //call function to determine whether it is title or expense or type
      let resource = await this.editDistance(
        recordedResource,
        'title',
        'expense',
        'type',
      );

      if (resource == 'title') {
        let parsedExpenseTitle = '';
        for (var i = 1; i < recordingArrayLength; i++) {
          parsedExpenseTitle += recordingArray[i];
        }
        this.setState({
          currentExpenseTitle: parsedExpenseTitle,
        });
      }

      if (resource == 'expense') {
        this.setState({
          currentExpense: parseInt(recordingArray[recordingArrayLength - 1]),
        });
      }

      if (resource == 'type') {
        //call function to determine whether it is credit or debit
        let editedCurrentExpenseType = 
        await this.editDistance(
          recordingArray[recordingArrayLength - 1],
          'credit',
          'debit',
          ' ',
        );
        // console.log('expense type is',editedCurrentExpenseType)
        this.setState({
          currentExpenseType: editedCurrentExpenseType,
        });
      }
      this.setState({
        isTapped: false,
      });
    }
    else{
    const arrayNumber = recordingArray.some((element)=> typeof parseInt(element) === 'number')
      if (!this.state.show && recordingArray.length>=3 && arrayNumber) {
        const recordingArrayLength = recordingArray.length;
        let parsedExpenseTitle = '';
        let filteredTitle='';
        var i;
      
        const newDate = new Date();
        const dateString = newDate.toDateString()+' '+newDate.toString().split(' ')[4];
       
        let editedCurrentExpenseType;
        if(recordingArray.includes("debit") || recordingArray.includes("debited")|| recordingArray.includes("debiting")|| recordingArray.includes("spend")|| recordingArray.includes("spent") || recordingArray.includes("purchased")|| recordingArray.includes("purchase")|| recordingArray.includes("purchasing")){
          editedCurrentExpenseType='debit'
        }
        else{
          editedCurrentExpenseType='credit'
        }
        
        let expString = dataInput.match( /\d+/g )[0];
        let exp = parseInt(expString );
        let itemToBeRemoved = [expString,"credit","debit","rupees"];
        var filteredparsedExpenseTitle = recordingArray.filter(item => !itemToBeRemoved.includes(item))
        // console.log("f is",filteredparsedExpenseTitle);
        for (i = 0; i <= filteredparsedExpenseTitle.length - 1; i++) {
          filteredTitle += filteredparsedExpenseTitle[i]+" ";
        }
        // console.log("filteredtitle",filteredTitle);
        this.setState({
          currentExpenseTitle: filteredTitle,
          currentExpense:exp,
          currentExpenseType: editedCurrentExpenseType,
          currentDate: dateString,
          show: true,
        }); 
    }
    else{
      Alert.alert("No expense amount recorded. Please record again!");
    }
  }
  };

  getSpeed = async data => {
    const {x, y, z} = data;
    if (
      Math.abs(this.round(x)) +
        Math.abs(this.round(y)) +
        Math.abs(this.round(z)) >
      2
    ) {
      if (this.state.show) {
        this.onCancelExpense();
      } else {
        await this.onStartRecord();
      }
    }
  };

  onSwipeFromLeft = () => {
    if (this.state.show) {
      this.onExitModal();
    }
  };

  leftSwipeActions = () => {
    return <Text style={styles.textswipeSaved}>Saved:)</Text>;
  };

  round = n => {
    if (!n) {
      return 0;
    }
    return Math.floor(n * 100) / 100;
  };

  deleteEntry = async (rowData, index, e, data) => {
    // console.log('rowdata is', rowData);
  

    await fetch(backend_url + '/deleteEntry', {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: rowData[4]

      }),
    });
    const expenseType = rowData[2];
    const expense = rowData[1];
    const currentBudget = this.props.budget.budget;
    const currentBalance = this.props.budget.balance;
    let newBudget = currentBudget;
    let newBalance = currentBalance;
    if (expenseType === 'credit') {
      newBalance = currentBalance - expense;
    } else if (expenseType === 'debit') {
      newBudget = currentBudget + expense;
      newBalance = currentBalance + expense;
    }


   
    await fetch(backend_url + '/updateBudget', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        budget: newBudget,
        balance: newBalance,
        username: this.props.profileName.profileName,
      }),
    });

    await this.refreshPage();
  };

  renderExpenseTableOrAddExpense = () => {
    const {show} = this.state;
    const element = (rowData, data, index) => (
      <TouchableOpacity
        onPress={e => this.deleteEntry(rowData, index, e, data)}>
        <View style={{justifyContent:'center',alignContent:'center'}}>
          <Image source={icons.close}
          style={[styles.btn,{backgroundColor:'red'}]}/>
        </View>
      </TouchableOpacity>
    );

    if (!show) {
      return (
        <>
        <View style={[styles.container,{flexDirection: 'row',
              justifyContent: 'space-between'}]}>
          <View
            height={Dimensions.get('window').height / 20}
            width = {Dimensions.get('window').width/1.2}
            alignContent={'center'}
            justifyContent={'center'}
            // backgroundColor={'red'}
            >
            <Text style={{justifyContent:'center',alignContent:'center',fontWeight:'bold',fontSize:Dimensions.get('window').height / 40.55, color:'green'}}>Welcome {this.props.profileName.profileName}</Text>
          </View>

          <View>
           <TouchableOpacity onPress={() => {this.props.navigation.navigate('Root', { screen: 'How to use the app?' })}}>
           <Image source={icons.info} style={[styles.btn,{backgroundColor:'blue'}]}></Image>
             </TouchableOpacity>
          </View>
        </View>
         

          
          
           {/* <TouchableOpacity
          style={{
            height: Dimensions.get('window').height/13.5,
            backgroundColor: COLORS.black,
            borderRadius: SIZES.radius / 1.5,
            alignItems: 'center',
            justifyContent: 'center',
            marginTop:Dimensions.get('window').width / 3,
          }}
          onPress={()=> this.demoparse(wordsToNumbers("book for 700 rupees credit"))}>
          <Text style={{color: COLORS.red, ...FONTS.h3}}>demoparse</Text>
        </TouchableOpacity>  */}
        

          <View
            style={{
              flexDirection: 'row',
              marginVertical: SIZES.padding * 2,
            }}></View>
          <View
            style={{
              backgroundColor: 'white',
              flex: 1,
              flexDirection: 'row',
              justifyContent: 'space-between',
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
            }}>
            <View style={styles.budget}>
              <Text>Budget:{this.props.budget?.budget?.toString()}</Text>
            </View>

            <View style={styles.remaining}>
              <Text>Balance:{this.props.budget?.balance?.toString()}</Text>
            </View>

            <View style={styles.expense}>
              <Text>Expense:{this.props.budget?.expenses?.toString()}</Text>
            </View>
            

            <ScrollView style={styles.expenseTable}>
              <Table borderStyle={{borderWidth: 1, borderColor: '#ffa1d2'}}>
                <Row
                  data={['Title', 'Cost', 'Type', 'Date', '']}
                  style={styles.HeadStyle}
                  textStyle={styles.TableText}
                />
                {this.props.currentUserExpenses.currentUserExpenses.map(
                  (rowData, index) => (
                    <TableWrapper key={index} style={styles.row}>
                      {rowData.map((cellData, cellIndex) => (
                        <Cell
                          key={cellIndex}
                          data={
                            cellIndex === 4
                              ? element(rowData, cellData, index)
                              : cellData
                          }
                          textStyle={styles.text}
                        />
                      ))}
                    </TableWrapper>
                  ),
                )}
              </Table>
            </ScrollView>
           
          </View>
        </>
      );
    }

    return (
      <View>
        <View style={styles.textInStyle}>
          <Text style={styles.textHeading}>This is your expense</Text>
          <Text style={styles.textTitles}>
            Title: {this.state.currentExpenseTitle}
          </Text>
          <Text style={styles.textTitles}>
            Expense: {this.state.currentExpense.toString()}
          </Text>
          <Text style={styles.textTitles}>
            Type: {this.state.currentExpenseType}
          </Text>
          <Text style={styles.textTitles}>Date: {this.state.currentDate}</Text>
          <View>
            <TapGestureHandler onHandlerStateChange={this.onSingleTapEvent}>
              <View style={styles.rectangle} backgroundColor="lightcoral">
                <Text style={styles.textswipe}>Tap to Edit</Text>
              </View>
            </TapGestureHandler>
            <Text style={styles.textswipe}>Shake to Discard</Text>
            <Swipeable
              onSwipeableLeftOpen={this.onSwipeFromLeft}
              renderLeftActions={this.leftSwipeActions}>
              <View style={styles.rectangle} backgroundColor="darkseagreen">
                <Text style={styles.textswipe}>Swipe Right to Save</Text>
              </View>
            </Swipeable>
          </View>
        </View>
      </View>
    );
  };

  renderHome = () => {
    const {
      isLoading: {isLoading},
    } = this.props;

    if (isLoading) {
      return <LoadingComponent />;
    }

    return (
      <View style={styles.HomeScreen}>
        {this.renderExpenseTableOrAddExpense()}
      </View>
    );
  };

  render() {
    return (
      <>
        <Excel getSpeed={this.getSpeed} />
        {this.renderHome()}
      </>
    );
  }
}

const styles = StyleSheet.create({
  modalstyle: {
    height: Dimensions.get('window').height / 40.55,
    width: Dimensions.get('window').width / 20.55,
  },
  HomeScreen: {
    flexGrow: 1,
    backgroundColor: 'white',
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  rectangle: {
    height: Dimensions.get('window').height / 13.5,
    marginTop: Dimensions.get('window').height / 81,
  },
  container: {
    flex: 1,
    maxHeight: Dimensions.get('window').height / 20,
    marginLeft:15,
    marginRight:15,
    alignItems: 'flex-start',
    justifyContent: 'flex-start'
  },
  menustyle: {
    // flex:1,
    backgroundColor: 'darksalmon',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    height: '100%',
    width: '100%',
  },
  textInStyle: {
    justifyContent: 'center',
    alignContent: 'center',
    marginTop: Dimensions.get('window').height / 10,
    marginBottom: Dimensions.get('window').height / 10,
    backgroundColor: 'lightgoldenrodyellow',
    borderColor: 'white',
    margin: Dimensions.get('window').width / 10,
    borderColor: 'brown',
    borderWidth: 1,
  },

  textStyle: {
    fontSize: Dimensions.get('window').height / 32.44,
    marginTop: Dimensions.get('window').height / 47.7,
    paddingVertical: Dimensions.get('window').height / 27,
    color: '#631b87',
    textAlign: 'center',
    fontWeight: 'bold',
  },

  textHeading: {
    fontSize: Dimensions.get('window').height / 47.7,
    paddingVertical: Dimensions.get('window').height / 27,
    color: 'midnightblue',
    textAlign: 'center',
    fontWeight: 'bold',
  },

  textTitles: {
    fontSize: Dimensions.get('window').height / 54,
    paddingVertical: Dimensions.get('window').height / 40.55,
    color: 'black',
    textAlign: 'left',
    left: 10,
  },

  textswipe: {
    fontSize: Dimensions.get('window').height / 54,
    paddingVertical: Dimensions.get('window').height / 40.55,
    color: 'black',
    textAlign: 'center',
    left: Dimensions.get('window').height / 81,
  },

  textswipeSaved: {
    fontSize: Dimensions.get('window').height / 54,
    paddingVertical: Dimensions.get('window').height / 40.55,
    color: 'black',
    textAlign: 'left',
    left: Dimensions.get('window').height / 81,
    marginTop: Dimensions.get('window').height / 81,
    marginRight: 0,
    color: 'green',
  },

  budget: {
    width: Dimensions.get('window').width / 3,
    height: Dimensions.get('window').height / 20.55,
    backgroundColor: 'lightsalmon',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: Dimensions.get('window').height / 40.55,
  },

  remaining: {
    width: Dimensions.get('window').width / 3,
    height: Dimensions.get('window').height / 20.55,
    backgroundColor: 'darkseagreen',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: Dimensions.get('window').height / 40.55,
  },
  expense: {
    width: Dimensions.get('window').width / 3,
    height: Dimensions.get('window').height / 20.55,
    backgroundColor: 'khaki',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: Dimensions.get('window').height / 20.55,
  },
  HeadStyle: {
    height: Dimensions.get('window').height / 16,
    alignContent: 'center',
    backgroundColor: '#ffe0f0',
  },
  TableText: {
    margin: Dimensions.get('window').height / 81,
  },
  expenseTable: {
    flex: 1,
    position: 'absolute',
    top: Dimensions.get('window').height / 11.6,
    right: 0,
    left: 0,
    bottom: 0,
    // height:300,
    maxHeight: 500,
  },
  deleteButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 100,
    backgroundColor: 'red',
    marginTop: 0,
    marginLeft: Dimensions.get('window').width - 70,
  },
  deleteText: {
    fontSize: Dimensions.get('window').height / 45,
    color: 'white',
    fontWeight: 'bold',
    alignSelf: 'center',
  },
  btnText: {
    textAlign: 'center', 
    color: '#fff'
  },
  btn: { 
  height: Dimensions.get('window').height/42,
  width: Dimensions.get('window').width/22,
  tintColor: "white",
  marginLeft:30
  },
  row: {
    flexDirection: 'row', 
    backgroundColor: '#FFF1C1'
  },
});

const mapStateToProps = state => ({
  budget: state.budget,
  balance: state.balance,
  expenses: state.expenses,
  profileName: state.profileName,
  currentUserExpenses: state.currentUserExpenses,
  isLoading: state.appState,
});

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      changeBudget,
      changeBalance,
      changeExpense,
      changeCurrentUserExpenses,
      updateIsLoading,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(Home);

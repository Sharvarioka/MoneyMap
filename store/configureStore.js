import {createStore, combineReducers} from 'redux';

import budgetReducer from '../reducers/budgetReducer';
import generalReducer from '../reducers/generalReducer';
import currentUserExpensesReducer from '../reducers/userExpenseReducer';
import usernameReducer from '../reducers/usernameReducer';

const rootReducer = combineReducers({
  budget: budgetReducer,
  profileName: usernameReducer,
  currentUserExpenses: currentUserExpensesReducer,
  appState: generalReducer,
});

const configureStore = () => {
  return createStore(rootReducer);
};

export default configureStore;

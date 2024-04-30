import {EDIT_BUDGET,EDIT_BALANCE,EDIT_EXPENSE} from '../ReduxConstants';

const initialState = {
  budget: 2000,
  balance:4000,
  expenses:0
};

const budgetReducer = (state = initialState, action) => {
  switch (action.type) {
    case EDIT_BUDGET:
      return {
        ...state,
        budget: action.payload.budget,
      };

      case EDIT_BALANCE:
      return {
        ...state,
        balance: action.payload.balance,
      };

      case EDIT_EXPENSE:
      return {
        ...state,
        expenses: action.payload.expenses,
      };
      
    default:
      return state;
  }
};

export default budgetReducer;

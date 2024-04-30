import {CURRENT_USER_EXPENSES} from '../ReduxConstants';
const initialState = {
  currentUserExpenses: [],
};

const currentUserExpensesReducer = (state = initialState, action) => {
  switch (action.type) {
    case CURRENT_USER_EXPENSES:
      return {
        ...state,
        currentUserExpenses: action.payload.currentUserExpenses,
      };

    default:
      return state;
  }
};

export default currentUserExpensesReducer;

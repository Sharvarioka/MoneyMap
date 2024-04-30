import {UPDATE_IS_LOADING} from '../ReduxConstants';

const initialState = {
  isLoading: false,
};

const generalReducer = (state = initialState, action) => {
  switch (action.type) {
    case UPDATE_IS_LOADING:
      return {
        ...state,
        isLoading: action.payload.isLoading,
      };

    default:
      return state;
  }
};

export default generalReducer;

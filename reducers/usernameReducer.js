import {UPDATE_PROFILE} from '../ReduxConstants';
const initialState = {
  profileName: 'User',
};

const usernameReducer = (state = initialState, action) => {
  switch (action.type) {
    case UPDATE_PROFILE:
      return {
        ...state,
        profileName: action.payload.profileName,
      };

    default:
      return state;
  }
};

export default usernameReducer;

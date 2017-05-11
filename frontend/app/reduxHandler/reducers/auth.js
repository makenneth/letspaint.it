import ActionTypes from 'actionTypes';

const getUsername = () => {
  return `user${Math.floor(Math.random() * 50)}`;
};

const initialState = {
  isLoading: false,
  user: null,
};

export default function Auth(state = { username: getUsername() }, action) {
  switch (action.type) {
    case ActionTypes.LOG_IN_REQUEST:
      return {
        ...state,
        isLoading: true,
      };

    case ActionTypes.LOG_IN_SUCCESS:
      return {
        ...state,
        isLoading: false,
      };

    case ActionTypes.LOG_IN_FAILURE:
      return {
        ...state,
        isLoading: false,
      };

    case ActionTypes.GET_USER_INFO_REQUEST:
      return {
        ...state,
        isLoading: true,
      };

    case ActionTypes.GET_USER_INFO_SUCCESS:
      return {
        ...state,
        info: action.info,
        isLoading: false
      };

    case ActionTypes.GET_USER_INFO_FAILURE:
      return {
        ...state,
        isLoading: false,
        err: action.err,
      };

    default:
      return state;
  }
}

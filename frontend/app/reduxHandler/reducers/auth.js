import ActionTypes from 'actionTypes';

const initialState = {
  isLoading: false,
  isLoaded: false,
  info: null,
};

export default function Auth(state = initialState, action) {
  switch (action.type) {
    case ActionTypes.AUTH_REQUEST:
      return {
        ...state,
        isLoaded: false,
        isLoading: true,
      };

    case ActionTypes.AUTH_SUCCESS:
      return {
        ...state,
        isLoading: false,
      };

    case ActionTypes.AUTH_FAILURE:
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
      // stop loading when username is acknowledged by the server
      return {
        ...state,
        isLoaded: true,
        isLoading: false,
        info: action.info,
      };

    case ActionTypes.GET_USER_INFO_FAILURE:
      return {
        ...state,
        isLoading: false,
        err: action.err,
      };

    case ActionTypes.USER_INFO_SET:
      return {
        ...state,
        isLoading: false,
      };

    default:
      return state;
  }
}

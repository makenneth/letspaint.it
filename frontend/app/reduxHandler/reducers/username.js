import { ActionTypees } from 'actionTypes';

const initialState = {
  isLoading: false,
  err: null,
  isAvailable: false,
};

export default function username(state = initialState, action) {
  switch (action.type) {
    case ActionTypes.SET_USERNAME_REQUEST:
      return {
        ...state,
        isLoading: true,
      };

    case ActionTypes.SET_USERNAME_SUCCESS:
      return {
        ...state,
        isLoading: false,
      };

    case ActionTypes.SET_USERNAME_FAILURE:
      return {
        ...state,
        isLoading: false,
        err: action.err,
      };

    case ActionTypes.IS_USERNAME_AVAILABLE_REQUEST:
      return {
        ...state,
        isLoading: true,
        isAvailable: false,
      };

    case ActionTypes.IS_USERNAME_AVAILABLE_SUCCESS:
      return {
        ...state,
        isLoading: false,
        isAvailable: true,
      };

    case ActionTypes.IS_USERNAME_AVAILABLE_FAILURE:
      return {
        ...state,
        isLoading: false,
        err: action.err,
      };
  }
}

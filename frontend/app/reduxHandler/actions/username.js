import ActionTypes from 'actionTypes';
import request from 'utils/request';

export function setUsername(username) {
  return (dispatch) => {
    dispatch(setUsernameRequest());
    return request('/api/username', {
      type: 'POST',
      query: {
        username,
      },
    }).then((data) => {
      dispatch(setUsernameSuccess(data.user));
    }).catch((err) => {
      dispatch(setUsernameFailure(err));
    })
  };
};

export function setUsernameRequest() {
  return {
    type: ActionTypes.SET_USERNAME_REQUEST,
  };
}

export function setUsernameSuccess(user) {
  return {
    type: ActionTypes.SET_USERNAME_SUCCESS,
    user,
  };
}

export function setUsernameFailure(err) {
  return {
    type: ActionTypes.SET_USERNAME_FAILURE,
    err,
  };
}

export function isUsernameAvailable(username) {
  return (dispatch) => {
    dispatch(isUsernameAvailableRequest());
    return request('/api/username', {
      type: 'GET',
      query: {
        username,
      },
    }).then((data) => {
      dispatch(isUsernameAvailableSuccess(data.bool));
    }).catch((err) => {
      dispatch(isUsernameAvailableFailure(err));
    })
  };
};

export function isUsernameAvailableRequest() {
  return {
    type: ActionTypes.IS_USERNAME_AVAILABLE_REQUEST,
  };
}

export function isUsernameAvailableSuccess(bool) {
  return {
    type: ActionTypes.IS_USERNAME_AVAILABLE_SUCCESS,
    bool,
  };
}

export function isUsernameAvailableFailure(err) {
  return {
    type: ActionTypes.IS_USERNAME_AVAILABLE_FAILURE,
    err,
  };
}

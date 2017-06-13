import ActionTypes from 'actionTypes';
import request from 'utils/request';
import startWebsocket from 'middleware/socketHandler';
import store from 'reduxHandler/store';
import { setUserInfo } from './auth';
import { browserHistory } from 'react-router';

export function setUsername(username) {
  return (dispatch) => {
    dispatch(setUsernameRequest());
    return request('/api/username', {
      method: 'POST',
      credentials: 'include',
      query: {
        username,
      },
    }).then(({ data }) => {
      dispatch(setUsernameSuccess(data.user));
      const websocket = startWebsocket(store);
      websocket.onopen = function() {
        dispatch(setUserInfo(data.user));
      };
      browserHistory.push('/');
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
      method: 'GET',
      query: {
        username,
      },
    }).then((res) => {
      dispatch(isUsernameAvailableSuccess(res.data.isAvailable.available));
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

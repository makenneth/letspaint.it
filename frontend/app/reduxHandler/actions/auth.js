import ActionTypes from 'actionTypes';
import request from 'utils/request';
import { browserHistory } from 'react-router';
import startWebsocket from 'middleware/socketHandler';
import store from 'reduxHandler/store';
import { setUserInfo } from './paint';

export function checkAuth() {
  return (dispatch) => {
    // first check if token in cookie
    // if not, reject
    // if yes, then send a request to getUserInfo
    // which will return the current info if logged in

    return dispatch(getUserInfo());
  };
}

export function logIn(type) {
  return (dispatch) => {
    dispatch(authRequest());
    return request('/oauth/login', {
      type: 'GET',
      credentials: 'include',
      query: { type: 'google' },
    }).then((res) => {
      const newWindow = window.open(res.url, 'Sign In to letspaint');
      const int = setInterval(checkIfWindowCloses, 500);
      function checkIfWindowCloses() {
        if (newWindow.closed) {
          console.log('closed');
          clearInterval(int);
          if (document.cookie.oauth_error) {
            // display error
          }
        }
      }
    }).catch((err) => {
      dispatch(authError(err));
      console.warn(err);
    });
  };
}

export function signUp() {
  return (dispatch) => {
    dispatch(authRequest());
    return request('/oauth/signup', {
      type: 'GET',
      credentials: 'include',
      query: { type: 'google' },
    }).then((res) => {
      const newWindow = window.open(res.url, 'Sign Up with letspaint');
      const int = setInterval(checkIfWindowCloses, 500);
      function checkIfWindowCloses() {
        if (newWindow.closed) {
          clearInterval(int);
          console.log(document.cookie);
        }
      }
    }).catch((err) => {
      dispatch(authError(err));
      console.warn(err);
    });
  };
}

function authSuccess() {
  return {
    type: ActionTypes.AUTH_SUCCESS,
  };
}

function authError(err) {
  return {
    type: ActionTypes.AUTH_ERROR,
    err,
  };
}

function authRequest() {
  return {
    type: ActionTypes.AUTH_REQUEST,
  };
}

export function getUserInfo() {
  return (dispatch) => {
    dispatch(getUserInfoRequest());
    return request('/api/user', {
      type: 'GET',
      credentials: 'include',
    }).then(
      res => {
        const info = res.info;
        startWebsocket(store);
        // instead should send token to websocket ??
        dispatch(setUserInfo(info));
        dispatch(getUserInfoSuccess(info));
      },
      err => dispatch(getUserInfoFailure(err)),
    ).catch(err => {
      console.warn(err);
    });
  };
}

function getUserInfoRequest() {
  return {
    type: ActionTypes.GET_USER_INFO_REQUEST,
  };
}

function getUserInfoSuccess(info) {
  return {
    type: ActionTypes.GET_USER_INFO_SUCCESS,
    info,
  };
}

function getUserInfoFailure(err) {
  return {
    type: ActionTypes.GET_USER_INFO_FAILURE,
    err,
  };
}

export function setUserInfo(info) {
  return {
    type: ActionTypes.SET_USER_INFO,
    info,
  };
}

import ActionTypes from 'actionTypes';
import request from 'utils/request';
import { browserHistory } from 'react-router';
import startWebsocket from 'middleware/socketHandler';
import store from 'reduxHandler/store';
import { startLoading, stopLoading } from './loader';
import { alertSuccessMessage, alertErrorMessage } from './alert';

export function loadAuth() {
  return dispatch => (
    dispatch(getUserInfo())
      .then(res => {
        const { user } = res.data;
        const websocket = startWebsocket(store);
        websocket.onopen = function() {
          dispatch(setUserInfo(user));
        };
        dispatch(alertSuccessMessage('Logged in successfully'));
        dispatch(getUserInfoSuccess(user));
        return Promise.resolve(true);
      }, (err) => {
        dispatch(getUserInfoFailure(err));
        return Promise.resolve(false);
      })
  );
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
          clearInterval(int);
          if (document.cookie.oauth_error) {
            dispatch(alertErrorMessage(document.cookie.oauth_error));
          } else {
            dispatch(getUserInfo());
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
    }).then(
      res => (
        new Promise((resolve, reject) => {
          const newWindow = window.open(res.url, 'Sign Up with letspaint');
          const int = setInterval(checkIfWindowCloses, 500);
          function checkIfWindowCloses() {
            if (newWindow.closed) {
              clearInterval(int);
              if (document.cookie.oauth_error) {
                dispatch(alertErrorMessage(document.cookie.oauth_error));
                return reject(document.cookie.oauth_error);
              } else {
                return resolve(true);
              }
            }
          }
        })
      ),
      err => dispatch(authError(err))
    )
    .then(() => (
      dispatch(getUserInfo())
        .then(res => {
          const info = res.info;
          startWebsocket(store);
          // instead should send token to websocket ??
          dispatch(setUserInfo(info));
          dispatch(alertSuccessMessage('Logged in successfully'));
          dispatch(getUserInfoSuccess(info));
          browserHistory.push('/');
        }, err => {
          dispatch(getUserInfoFailure(err));
          dispatch(alertErrorMessage(err));
        })
     ))
    .catch((err) => {
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

export function setUserInfo(user) {
  return {
    type: ActionTypes.SET_USER_INFO,
    user,
  };
}

import ActionTypes from 'actionTypes';
import request from 'utils/request';
import { browserHistory } from 'react-router';
import { getCookie } from 'utils/cookie'
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
      query: { type },
    }).then((res) => {
      const newWindow = window.open(res.url, 'Sign In to letspaint');
      const int = setInterval(checkIfWindowCloses, 500);
      function checkIfWindowCloses() {
        if (newWindow.closed) {
          clearInterval(int);
          const error = getCookie('auth_error');
          const success = getCookie('auth_success');
          if (error) {
            document.cookie = 'auth_error=; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
            dispatch(getUserInfoFailure(error));
            dispatch(alertErrorMessage(error));
            return Promise.resolve(false);
          }
          if (success) {
            document.cookie = 'auth_success=; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
            dispatch(getUserInfo())
              .then(res => {
                const { user } = res.data;
                dispatch(alertSuccessMessage('Logged in successfully'));
                dispatch(getUserInfoSuccess(user));
                if (user && user.username) {
                  const websocket = startWebsocket(store);
                  websocket.onopen = function() {
                    dispatch(setUserInfo(user));
                  };
                  browserHistory.push('/');
                } else {
                  browserHistory.push('/profile/username');
                }
              }, err => {
                dispatch(getUserInfoFailure(err));
                dispatch(alertErrorMessage(err.message));
              });
          } else {
            dispatch(getUserInfoFailure(null));
          }
        }
      }
    }).catch((err) => {
      dispatch(authError(err));
      console.warn(err);
    });
  };
}

export function signUp(type) {
  return (dispatch) => {
    dispatch(authRequest());
    return request('/oauth/signup', {
      type: 'GET',
      credentials: 'include',
      query: { type },
    }).then(
      res => (
        new Promise((resolve, reject) => {
          const newWindow = window.open(res.url, 'Sign Up with letspaint');
          const int = setInterval(checkIfWindowCloses, 500);
          function checkIfWindowCloses() {
            if (newWindow.closed) {
              clearInterval(int);
              const error = getCookie('oauth_error');
              const success = getCookie('auth_success');
              if (error) {
                document.cookie = 'auth_error=; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
                dispatch(alertErrorMessage(error));
                return reject(error);
              } else if (success) {
                document.cookie = 'auth_success=; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
                return dispatch(getUserInfo())
                  .then(res => {
                    const { user } = res.data;
                    dispatch(alertSuccessMessage('Logged in successfully'));
                    dispatch(getUserInfoSuccess(user));
                    browserHistory.push('/profile/username');
                  }, err => {
                    dispatch(getUserInfoFailure(err));
                    dispatch(alertErrorMessage(err.message));
                  })
              } else {
                dispatch(getUserInfoFailure(null));
              }
            }
          }
        })
      ),
      err => dispatch(authError(err))
    )
  };
}

export function logOut() {
  return (dispatch) => {
    dispatch(logOutRequest());
    return request('/api/logout', {
      method: 'DELETE',
      credentials: 'include',
    }).then(
      () => {
        dispatch(alertSuccessMessage('Logged out successfully'));
        dispatch(logOutSuccess());
        browserHistory.push('/login');
      },
      () => {
        dispatch(alertSuccessMessage('Logged out successfully'));
        dispatch(logOutSuccess());
        browserHistory.push('/login');
      });
  }
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

function logOutRequest() {
  return {
    type: ActionTypes.LOG_OUT_REQUEST,
  };
}

function logOutSuccess() {
  return {
    type: ActionTypes.LOG_OUT_SUCCESS,
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

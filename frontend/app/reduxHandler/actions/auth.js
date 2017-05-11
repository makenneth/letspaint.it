import ActionTypes from 'actionTypes';
import request from 'utils/request';
import { browserHistory } from 'react-router';

export function logIn(type) {
  return (dispatch) => {
    return request('/oauth/login', {
      type: 'GET',
      credentials: 'include',
      query: { type: 'google' },
    }).then((res) => {
      const newWindow = window.open(res.url, 'Sign In to letspaint');
      const int = setInterval(checkIfWindowCloses, 500);
      function checkIfWindowCloses() {
        if (newWindow.closed) {
          // dispatch(logInSuccess());
          clearInterval(int);
          console.log(document.cookie);
          // dispatch(getUserInfo());
        }
      }
    }).catch((err) => {
      // alertError
      console.warn(err);
    })
  };
}

export function getUserInfo() {
  return (dispatch) => {
    dispatch(getUserInfoRequest());
    return request('/user', {
      type: 'GET',
      credentials: 'include',
    }).then(
      res => dispatch(getUserInfoSuccess(info)),
      err => dispatch(getUserInfoFailure(err)),
    ).catch(err => {
      console.warn(err);
    });
  }
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

import ActionTypes from 'actionTypes';

export function clearAlertMessage() {
  return {
    type: ActionTypes.CLEAR_ALERT_MESSAGE,
  };
}

export function alertSuccessMessage(message) {
  return {
    type: ActionTypes.ALERT_MESSAGE,
    message,
    messageType: 'success',
  };
}

export function alertErrorMessage(message) {
  return {
    type: ActionTypes.ALERT_MESSAGE,
    message,
    messageType: 'error',
  };
}


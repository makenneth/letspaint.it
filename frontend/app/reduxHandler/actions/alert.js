import ActionTypes from 'actionTypes';

export function clearAlertMessage() {
  return {
    type: ActionTypes.CLEAR_ALERT_MESSAGE,
  };
}

export function alertSuccessMessage(alertMessage) {
  return {
    type: ActionTypes.ALERT_MESSAGE,
    alertMessage,
    alertType: 'success',
  };
}

export function alertErrorMessage(alertMessage) {
  return {
    type: ActionTypes.ALERT_MESSAGE,
    alertMessage,
    alertType: 'error',
  };
}


import ActionTypes from 'actionTypes';

export function clearAlertMessage() {
  return {
    type: ActionTypes.CLEAR_ALERT_MESSAGE,
  };
}

export function alertSuccessMessage(alertMessage, timeout = 'normal') {
  return {
    type: ActionTypes.ALERT_MESSAGE,
    alertMessage,
    alertType: 'success',
    timeout,
  };
}

export function alertWarningMessage(alertMessage, timeout = 'normal') {
  return {
    type: ActionTypes.ALERT_MESSAGE,
    alertMessage,
    alertType: 'warning',
    timeout,
  };
}

export function alertErrorMessage(alertMessage, timeout = 'normal') {
  return {
    type: ActionTypes.ALERT_MESSAGE,
    alertMessage,
    alertType: 'error',
    timeout,
  };
}


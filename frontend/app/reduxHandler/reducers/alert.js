import ActionTypes from 'actionTypes';

const initialState = {
  alertType: null,
  alertMessage: null,
};

export default function alert(state = initialState, action) {
  switch (action.type) {
    case ActionTypes.CLEAR_ALERT_MESSAGE:
      return initialState;

    case ActionTypes.ALERT_MESSAGE:
      return {
        alertType: action.alertType,
        alertMessage: action.alertMessage,
      };

    default:
      return state;
  }
}

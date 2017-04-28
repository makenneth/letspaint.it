import ActionTypes from 'actionTypes';

export function paintInputMade(input) {
  return {
    type: ActionTypes.PAINT_INPUT_MADE,
    input,
  };
}

export function paintInputReceived(input) {
  return {
    type: ActionTypes.PAINT_INPUT_RECEIVED,
    input,
  };
}

export function initialStateUpdate(data) {
  return {
    type: ActionTypes.INITIAL_STATE_UPDATE,
    state,
  };
}

export function pickColor(idx) {
  return {
    type: ActionTypes.COLOR_PICKED,
    color: idx,
  };
}

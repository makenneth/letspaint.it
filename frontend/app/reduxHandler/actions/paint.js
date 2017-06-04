import ActionTypes from 'actionTypes';

export function paintInputMade(input) {
  return (dispatch, getState) => {
    const { username } = getState().auth;
    dispatch(makePaintInput(Object.assign({}, input, { username })));
  };
}

function makePaintInput(input) {
  return {
    type: ActionTypes.PAINT_INPUT_MADE,
    input,
  };
}

export function pickColor(idx) {
  return {
    type: ActionTypes.COLOR_PICKED,
    color: idx,
  };
}

export function setCenter(center) {
  return {
    type: ActionTypes.SET_CENTER,
    center,
  };
}

export function adjustCanvasScale(scale) {
  return {
    type: ActionTypes.ADJUST_CANVAS_SCALE,
    scale,
  };
}

export function startCanvasLoading() {
  return {
    type: ActionTypes.START_CANVAS_LOADING,
  };
}

import ActionTypes from 'actionTypes';
import { IMAGE_WIDTH, IMAGE_HEIGHT } from 'constants';

const initialState = {
  color: 32,
  center: [50, 50],
  scale: 5,
}

export default function Canvas(state = initialState, action) {
  switch (action.type) {
    case ActionTypes.COLOR_PICKED:
      return {
        ...state,
        color: action.color,
      };

    case ActionTypes.SET_CENTER:
      return {
        ...state,
        center: action.center,
      };

    case ActionTypes.ADJUST_CANVAS_SCALE: {
      const { scale, center } = state;
      const newX = Math.floor(center[0] * (scale / action.scale));
      const newY = Math.floor(center[1] * (scale / action.scale));
      return {
        ...state,
        scale: action.scale,
        center: [newX, newY],
      };
    }

    default:
      return state;
  }
}

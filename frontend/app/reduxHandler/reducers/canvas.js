import ActionTypes from 'actionTypes';
import { IMAGE_WIDTH, IMAGE_HEIGHT } from 'constants';

const initialState = {
  color: 32,
  center: [50, 50],
  scale: 5,
};

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
      let newX = center[0] * (scale / action.scale);
      let newY = center[1] * (scale / action.scale);
      const newRadius = IMAGE_WIDTH / 2 / action.scale;
      if (newX < newRadius) {
        newX = newRadius;
      } else if (newX > center - newRadius) {
        newX = center - newRadius;
      }
      if (newY < newRadius) {
        newY = newRadius;
      } else if (newY > center - newRadius) {
        newY = center - newRadius;
      }
      return {
        ...state,
        scale: action.scale,
        center: [Math.round(newX), Math.round(newY)],
      };
    }

    default:
      return state;
  }
}

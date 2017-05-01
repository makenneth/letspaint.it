import ActionTypes from 'actionTypes';
import { IMAGE_WIDTH, IMAGE_HEIGHT } from 'constants';

import {
  initialImageData,
  updatePixel,
  updateUsernames,
  setGrid,
  setUsernames,
} from 'reduxHandler/helpers/grid';

const initialState = {
  data: initialImageData(IMAGE_WIDTH, IMAGE_HEIGHT),
  usernames: new Array(IMAGE_WIDTH * IMAGE_HEIGHT),
}

export default function Grid(state = initialState, action) {
  switch (action.type) {
    case ActionTypes.PAINT_INPUT_RECEIVED:
    case ActionTypes.PAINT_INPUT_MADE: {
      const { pos, color, username } = action.input;
      return {
        ...state,
        data: updatePixel(state.data, pos, color),
        usernames: updateUsernames(state.usernames, pos, username),
      };
    }
    case ActionTypes.INITIAL_STATE_UPDATE:
      return {
        ...state,
        data: setGrid(action.grid),
        usernames: setUsernames(action.grid),
      };

    default:
      return state;
  }
}

import ActionTypes from 'actionTypes';
import { IMAGE_WIDTH, IMAGE_HEIGHT } from 'constants';

import {
  initialImageData,
  updatePixel,
  updateUsernames,
  setGrid,
  setPartialUsernames,
  setPartialGrid,
} from 'reduxHandler/helpers/grid';

const initialState = {
  data: initialImageData(IMAGE_WIDTH, IMAGE_HEIGHT),
  usernames: [],
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
        data: setGrid(action.grid.colors),
        usernames: action.grid.usernames,
      };

    case ActionTypes.PARTIAL_INITIAL_STATE_UPDATE:
      return {
        ...state,
        data: setPartialGrid(action.grid.colors),
        usernames: setPartialUsernames(action.grid.usernames),
      };

    default:
      return state;
  }
}

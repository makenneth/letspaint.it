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
  rateInterval: null,
  usernames: [],
  connectedUsers: 0,
  ranking: [],
  isLoading: true,
  isFetched: false,
};

export default function Grid(state = initialState, action) {
  switch (action.type) {
    case ActionTypes.START_CANVAS_LOADING:
      return {
        ...state,
        isLoading: true,
      };
    case ActionTypes.PAINT_INPUT_RECEIVED: {
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
        isFetched: true,
        isLoading: false,
        data: setGrid(action.grid.colors),
        usernames: action.grid.usernames,
      };

    case ActionTypes.PARTIAL_INITIAL_STATE_UPDATE:
      return {
        ...state,
        isLoading: false,
        data: setPartialGrid(action.grid.colors),
        usernames: setPartialUsernames(action.grid.usernames),
      };

    case ActionTypes.SET_INPUT_RATE:
      return {
        ...state,
        rateInterval: action.rate,
      };

    default:
      return state;
  }
}

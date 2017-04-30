import ActionTypes from 'actionTypes';
import { IMAGE_WIDTH, IMAGE_HEIGHT } from 'constants';
import colors from 'constants/colors';

const initialImageData = (width, height) => {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let i = 0; i < data.length; i += 4) {
    data[i] = 255;
    data[i + 1] = 255;
    data[i + 2] = 255;
    data[i + 3] = 255;
  }

  return data;
}

const initialState = {
  data: initialImageData(IMAGE_WIDTH, IMAGE_HEIGHT),
  usernames: new Array(IMAGE_WIDTH * IMAGE_HEIGHT),
  color: 32,
  center: [50, 50],
}

const setUsernames = (grid) => {
  return grid.map(pixel => pixel.username);
}

const setGrid = (grid) => {
  const updatedData = new Uint8ClampedArray(grid.length * 4);

  for (let i = 0; i < grid.length; i++) {
    const startIdx = i * 4;
    const { color: pixelColor } = grid[i];
    updatedData[startIdx] = colors[pixelColor][0];
    updatedData[startIdx + 1] = colors[pixelColor][1];
    updatedData[startIdx + 2] = colors[pixelColor][2];
    updatedData[startIdx + 3] = 255;
  }

  return updatedData;
}

const updatePixel = (data, pos, color) => {
  const startPos = pos * 4;
  const updatedData = new Uint8ClampedArray(data.length);

  for (let i = 0; i < data.length; i += 4) {
    let r;
    let g;
    let b;
    if (i === startPos) {
      ([r, g, b] = colors[color]);
    } else {
      r = data[i];
      g = data[i + 1];
      b = data[i + 2];
    }

    updatedData[i] = r;
    updatedData[i + 1] = g;
    updatedData[i + 2] = b;
    updatedData[i + 3] = 255;
  }

  return updatedData;
};

const updateUsernames = (data, pos, username) => {
  return [
    ...data.slice(0, pos),
    username,
    ...data.slice(pos + 1),
  ];
}

export default function Grid(state = initialState, action) {
  switch (action.type) {
    case ActionTypes.COLOR_PICKED:
      return {
        ...state,
        color: action.color,
      };
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

    case ActionTypes.SET_CENTER:
      return {
        ...state,
        center: action.center,
      };

    default:
      return state;
  }
}

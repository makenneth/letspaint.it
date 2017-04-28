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
  data: initialImageData(100, 100),
  color: 32,
}

const setGrid = (grid) => {
  const updatedData = new Uint8ClampedArray(grid.length * 4);

  for (let i = 0; i < grid.length; i++) {
    const startIdx = i * 4;
    const pixelColor = grid[i];
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

export default function Grid(state = initialState, action) {
  switch (action.type) {
    case ActionTypes.COLOR_PICKED:
      return {
        ...state,
        color: action.color,
      };
    case ActionTypes.PAINT_INPUT_RECEIVED:
    case ActionTypes.PAINT_INPUT_MADE: {
      const { pos, color } = action.input;
      return {
        ...state,
        data: updatePixel(state.data, pos, color),
      };
    }
    case ActionTypes.INITIAL_STATE_UPDATE:
      return {
        ...state,
        data: setGrid(action.grid),
      };

    default:
      return state;
  }
}

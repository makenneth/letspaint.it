import ActionTypes from 'actionTypes';
import { IMAGE_WIDTH, IMAGE_HEIGHT } from 'constants';

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
}

const updatePixel = (data, pos, color) => {
  const startIdx = (pos.y * 4 * IMAGE_WIDTH) + (pos.x * 4);
  const updatedData = new Uint8ClampedArray(data.length);

  for (let i = 0; i < data.length; i += 4) {
    let r;
    let g;
    let b;
    if (i === startIdx) {
      ([r, g, b] = color);
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
    case ActionTypes.PAINT_INPUT_RECEIVED:
    case ActionTypes.PAINT_INPUT_MADE: {
      const { pos, color } = action.input;
      const currentImageState = updatePixel(state.data, pos, color)
      return {
        data: currentImageState,
      };
    }
    case ActionTypes.INITIAL_STATE_UPDATE:
      return {
        grid: action.state,
      };

    default:
      return state;
  }
}

import ActionTypes from 'actionTypes';

const initialImageData = (width, height) => {
  const data = new Uint8ClampedArray(width * height * 4);

  for (let i = 0; i < data.length; i += 4) {
    data[i] = 255;
    data[i + 1] = 255;
    data[i + 2] = 255;
    data[i + 3] = 255;
  }

  return new ImageData(data, width, height);
}

// const checkIndex = (startIdx, idx, width) => {
//   if (idx >= startIdx && idx <= startIdx + 20) {
//     return true
//   }

//   //
// }

const initialState = {
  data: initialImageData(500, 500),
}

const updatePixel = (imageData, pos, color) => {
  const startIdx = (pos.x * 4 * 500) + (pos.y * 4);
  const updatedData = new Uint8ClampedArray(imageData.data.length);
  const newImageData = new ImageData(imageData.width, imageData.height);

  for (let i = 0; i < imageData.data.length; i += 4) {
    let r;
    let g;
    let b;
    // if (checkIndex(startIdx, i)) {
      // ([r, g, b]) = color;
    // } else {
    r = imageData.data[i];
    g = imageData.data[i + 1];
    b = imageData.data[i + 2];
    // }
  }

  return new ImageData(updatedData, imageData.width, imageData.height);
};

export default function Grid(state = initialState, action) {
  switch (action.type) {
    case ActionTypes.PAINT_INPUT_RECEIVED:
    case ActionTypes.PAINT_INPUT_MADE: {
      const { pos, color } = action.input;
      const updatedImageData = updatePixel(state.data, pos, color)
      return {
        data: updatedImageData,
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

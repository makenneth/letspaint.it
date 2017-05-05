import colors from 'constants/colors';
import { IMAGE_HEIGHT, IMAGE_WIDTH } from 'constants';

const initialImageData = (width, height) => {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let i = 0; i < data.length; i += 4) {
    data[i] = 255;
    data[i + 1] = 255;
    data[i + 2] = 255;
    data[i + 3] = 255;
  }

  return data;
};

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
};

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

const setPartialGrid = (grid) => {
  const partialGrid = new Uint8ClampedArray(IMAGE_HEIGHT * IMAGE_WIDTH * 4);
  for (let i = 0; i < grid.length; i++) {
    const col = i % 100;
    const row = (i - col) / 100;
    const startIdx = (row * IMAGE_WIDTH * 4) + (col * 4);
    const pixelColor = grid[i];
    partialGrid[startIdx] = colors[pixelColor][0];
    partialGrid[startIdx + 1] = colors[pixelColor][1];
    partialGrid[startIdx + 2] = colors[pixelColor][2];
    partialGrid[startIdx + 3] = 255;
  }

  return partialGrid;
};

const setPartialUsernames = (usernames) => {
  const partialUsernames = new Uint8ClampedArray(IMAGE_HEIGHT * IMAGE_WIDTH);
  for (let i = 0; i < usernames.length; i++) {
    const col = i % 100;
    const idx = ((i - col) * (IMAGE_WIDTH / 100)) + col;
    partialUsernames[idx] = usernames[i];
  }

  return partialUsernames;
};

const updateUsernames = (data, pos, username) => {
  return [
    ...data.slice(0, pos),
    username,
    ...data.slice(pos + 1),
  ];
};

export {
  initialImageData,
  setPartialUsernames,
  setPartialGrid,
  setGrid,
  updatePixel,
  updateUsernames
};

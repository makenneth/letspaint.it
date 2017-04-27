import store from 'reduxHandler/store';
import { paintInputMade } from 'actions';
import { IMAGE_WIDTH, IMAGE_HEIGHT } from 'constants';

export default class Canvas {
  constructor(canvas, width, height) {
    this.canvas = canvas;
    this.width = width;
    this.height = height;
    this.context = canvas.getContext('2d');
    this.unsubscribe = store.subscribe(this.handleStoreChange);
    this.currentValue = this.select(store.getState());
    this.canvas.addEventListener('click', this.handleClick);
    this.draw();
  }

  select(state) {
    return state.grid.data;
  }

  handleStoreChange = () => {
    const previousValue = this.currentValue;
    this.currentValue = this.select(store.getState());

    if (this.currentValue !== previousValue) {
      this.draw();
    }
  }

  handleClick = (ev) => {
    const { layerX, layerY } = ev;
    const input = {
      color: [
        Math.floor(Math.random() * 256),
        Math.floor(Math.random() * 256),
        Math.floor(Math.random() * 256),
      ],
      pos: { x: layerX, y: layerY }
    };

    store.dispatch(paintInputMade(input));
  }

  getImageData() {
    const data = this.currentValue;
    const newImageData = new Uint8ClampedArray(IMAGE_WIDTH * IMAGE_HEIGHT * 25 * 4);
    const col = [0, 4, 8, 12, 16];

    for (let i = 0; i < data.length; i += 4) {
      for (let j = 0; j < 5; j++) {
        const k = 5 * 4 * IMAGE_WIDTH * j;
        col.forEach((col) => {
          newImageData[k + i + col] = data[i];
          newImageData[k + i + 1 + col] = data[i + 1];
          newImageData[k + i + 2 + col] = data[i + 2];
          newImageData[k + i + 3 + col] = data[i + 3];
        });
      }
    }
    return new ImageData(newImageData, IMAGE_WIDTH * 5, IMAGE_HEIGHT * 5);
  }

  draw() {
    this.context.clearRect(0, 0, this.width, this.height);
    this.context.putImageData(this.getImageData(), 0, 0);
  }
}

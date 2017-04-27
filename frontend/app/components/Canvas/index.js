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
    this.currentCoord = [];
    this.canvas.addEventListener('click', this.handleClick);
    this.draw();
  }

  unmount() {
    this.unsubscribe();
    this.canvas.removeListener('click', this.handleClick);
  }

  select(state) {
    return state.grid.data;
  }

  handleStoreChange = () => {
    const previousValue = this.currentValue;
    this.currentValue = this.select(store.getState());

    if (this.currentValue !== previousValue) {
      this.changed = true;
      this.draw();
    }
  }

  handleClick = (ev) => {
    const { layerX, layerY } = ev;
    const y = Math.floor((layerY) / 5);
    const x = Math.floor((layerX) / 5);
    const input = {
      color: [
        Math.floor(Math.random() * 256),
        Math.floor(Math.random() * 256),
        Math.floor(Math.random() * 256),
      ],
      pos: { x, y }
    };

    store.dispatch(paintInputMade(input));
  }

  getImageData() {
    const data = this.currentValue;
    const newImageData = new Uint8ClampedArray(IMAGE_WIDTH * IMAGE_HEIGHT * 25 * 4);
    const offsets = [0, 4, 8, 12, 16];
    let isHovering = false;
    for (let i = 0; i < data.length; i += 4) {
      const col = (i % IMAGE_WIDTH) * 5;
      const row = (i - (i % IMAGE_WIDTH)) * 25;

      for (let j = 0; j < 5; j++) {
        const k = row + (5 * 4 * IMAGE_WIDTH * j);

        offsets.forEach((offset) => {
          newImageData[k + col + offset] = data[i];
          newImageData[k + col + offset + 1] = data[i + 1];
          newImageData[k + col + offset + 2] = data[i + 2];
          newImageData[k + col + offset + 3] = data[i + 3];
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

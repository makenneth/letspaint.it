import store from 'reduxHandler/store';
import { paintInputMade } from 'actions';
import { CANVAS_WIDTH, CANVAS_HEIGHT, IMAGE_WIDTH, IMAGE_HEIGHT } from 'constants';

export default class Canvas {
  constructor(canvas, width, height) {
    this.canvas = canvas;
    this.width = width;
    this.height = height;
    this.context = canvas.getContext('2d');
    this.unsubscribe = store.subscribe(this.handleStoreChange);
    this.currentValue = this.select(store.getState());
    this.currentCoord = [];
    this.startMousePos = [];
    this.currentMousePos = [];
    this.center = [250, 250];
    this.changed = true;
    this.imageData = null;
    this.canvas.addEventListener('mousedown', this.handleClick);
    this.int = setInterval(() => this.draw(), 30);
  }

  unmount() {
    this.unsubscribe();
    clearInterval(this.int);
    this.canvas.removeListener('mousedown', this.handleClick);
    this.canvas.removeListener('mousemove', this.handleClick);
    this.canvas.removeListener('mouseup', this.handleClick);
  }

  select(state) {
    return state.grid.data;
  }

  selectColor(state) {
    return state.grid.color;
  }

  handleStoreChange = () => {
    const previousValue = this.currentValue;
    this.currentValue = this.select(store.getState());

    if (this.currentValue !== previousValue) {
      this.changed = true;
    }
  }

  handleMouseMove = (ev) => {
    const { layerX, layerY } = ev;
    const [prevX, prevY] = this.startMousePos;
    const diffX = layerX - prevX;
    const diffY = layerY - prevY;
    this.changed = true;
    this.center[0] = this.center[0] - diffX >= 250 ? (this.center[0] - diffX) : 250;
    this.center[1] = this.center[1] - diffX >= 250 ? (this.center[1] - diffX) : 250;

    this.currentMousePos = [layerX, layerY];
    setTimeout(() => this.draw(), 30);
  }

  handleMouseUp = () => {
    this.canvas.removeEventListener('mousemove', this.handleMouseMove);
    this.canvas.removeEventListener('mouseup', this.handleMouseUp);
    if (this.startMousePos === this.currentMousePos) {
      const y = Math.floor((this.startMousePos[1] + this.center[1] - 250) / 5);
      const x = Math.floor((this.startMousePos[0] + this.center[0] - 250) / 5);
      const input = {
        color: this.selectColor(store.getState()),
        pos: (y * IMAGE_WIDTH) + x,
      };
      store.dispatch(paintInputMade(input));
    }
    this.startMousePos = [];
    this.currentMousePos = [];
  }

  handleClick = (ev) => {
    this.canvas.addEventListener('mousemove', this.handleMouseMove);
    this.canvas.addEventListener('mouseup', this.handleMouseUp);
    const { layerX, layerY } = ev;
    this.startMousePos = [layerX, layerY];
    this.currentMousePos = this.startMousePos;
  }

  getImageData() {
    const data = this.currentValue;
    const newImageData = new Uint8ClampedArray(CANVAS_WIDTH * CANVAS_HEIGHT * 4);
    const arr = {};
    const existed = [];
    const offsets = [0, 4, 8, 12, 16];

    const start = (this.center[1] - 250) * IMAGE_WIDTH * 4 + (this.center[0] - 250) * 4;

    for (let row = 0; row < 100; row++) {
      const rowStartIdx = start + (row * IMAGE_WIDTH * 4);

      for (let col = 0; col < (IMAGE_WIDTH / 5) * 4; col += 4) {
        const current = rowStartIdx + col;
        const startCanvasIdx = (col * 5) + (row * 4 * 5 * CANVAS_WIDTH);

        for (let j = 0; j < 5; j++) {
          const k = startCanvasIdx + (CANVAS_WIDTH * 4 * j);

          offsets.forEach((offset) => {
            newImageData[k + offset] = data[current];
            newImageData[k + offset + 1] = data[current + 1];
            newImageData[k + offset + 2] = data[current + 2];
            newImageData[k + offset + 3] = data[current + 3];
          });
        }
      }
    }
    return new ImageData(newImageData, CANVAS_WIDTH, CANVAS_HEIGHT);
  }

  draw() {
    if (this.changed || !this.imageData) {
      this.imageData = this.getImageData();
    }
    this.changed = false;
    this.context.clearRect(0, 0, this.width, this.height);
    this.context.putImageData(this.imageData, 0, 0);
  }
}

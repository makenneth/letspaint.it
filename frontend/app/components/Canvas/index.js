import store from 'reduxHandler/store';
import { paintInputMade, setCenter, startCanvasLoading } from 'actions';
import { CANVAS_WIDTH, CANVAS_HEIGHT, IMAGE_WIDTH, IMAGE_HEIGHT } from 'constants';

export default class Canvas {
  constructor(canvas, width, height) {
    this.canvas = canvas;
    this.width = width;
    this.height = height;
    this.context = canvas.getContext('2d');
    this.currentCoord = [];
    this.startMousePos = [];
    this.currentMousePos = [];
    this.changed = true;
    this.imageData = null;
    this.currentValue = this.select(store.getState());
    this.rateInterval = null;
    this.canMakeInput = false;
    this.unsubscribe = store.subscribe(this.handleStoreChange);
    this.canvas.addEventListener('mousedown', this.handleClick);
    this.int = setInterval(() => this.draw(), 30);
  }

  unmount() {
    this.unsubscribe();
    clearInterval(this.int);
    try {
      this.canvas.removeListener('mousedown', this.handleClick);
      this.canvas.removeListener('mousemove', this.handleClick);
      this.canvas.removeListener('mouseup', this.handleClick);
    } catch (e) {
    }
  }

  select(state) {
    return state.grid.data;
  }

  selectColor(state) {
    return state.canvas.color;
  }

  selectCenter(state) {
    return state.canvas.center;
  }

  selectScale(state) {
    return state.canvas.scale;
  }

  selectIsFullStateFetched(state) {
    return state.grid.isFetched;
  }

  forceUpdate() {
    this.changed = true;
  }

  saveImage() {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = IMAGE_WIDTH;
    tempCanvas.height = IMAGE_HEIGHT;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.putImageData(this.getImageData(2), 0, 0);
    return tempCanvas.toDataURL('image/png').replace('image/png', 'image/octet-stream');
  }

  handleStoreChange = () => {
    const previousValue = this.currentValue;
    const scale = this.currentScale;
    this.currentValue = this.select(store.getState());
    const newRate = store.getState().grid.rateInterval;
    if (this.rateInterval !== newRate) {
      this.canMakeInput = true;
      this.rateInterval = newRate;
    }

    if (this.currentValue !== previousValue) {
      this.changed = true;
    }
  }

  updateCenter(mouseX, mouseY) {
    this.changed = true;
    const [prevX, prevY] = this.currentMousePos;
    const diffX = Math.ceil((mouseX - prevX) / 2);
    const diffY = Math.ceil((mouseY - prevY) / 2);

    const center = this.selectCenter(store.getState());
    const centerX = center[0] - diffX;
    const centerY = center[1] - diffY;

    const scale = this.selectScale(store.getState());
    const radius = (CANVAS_WIDTH / scale) / 2;

    let posX, posY;
    if (centerX < radius) {
      // this.canvas.style.cursor = 'not-allowed';
      posX = radius;
    } else if (centerX > CANVAS_WIDTH - radius) {
      // this.canvas.style.cursor = 'not-allowed';
      posX = CANVAS_WIDTH - radius;
    } else {
      posX = centerX;
    }

    if (centerY < radius) {
      // this.canvas.style.cursor = 'not-allowed';
      posY = radius;
    } else if (centerY > CANVAS_WIDTH - radius) {
      // this.canvas.style.cursor = 'not-allowed';
      posY = CANVAS_WIDTH - radius;
    } else {
      posY = centerY;
    }
    store.dispatch(setCenter([posX, posY]));
  }

  handleMouseMove = (ev) => {
    const { layerX, layerY } = ev;
    if (!this.selectIsFullStateFetched(store.getState())) {
      store.dispatch(startCanvasLoading());
      this.canvas.removeEventListener('mousemove', this.handleMouseMove);
      this.canvas.removeEventListener('mouseup', this.handleMouseUp);
      return;
    }
    this.updateCenter(layerX, layerY);
    this.currentMousePos = [layerX, layerY];
  }

  handleMouseUp = ({ layerX, layerY }) => {
    if (this.cursorTO) {
      clearTimeout(this.cursorTO);
    }
    this.canvas.style.cursor = 'default';
    this.canvas.removeEventListener('mousemove', this.handleMouseMove);
    this.canvas.removeEventListener('mouseup', this.handleMouseUp);
    if (this.startMousePos === this.currentMousePos) {
      if (this.canMakeInput) {
        const center = this.selectCenter(store.getState());
        const scale = this.selectScale(store.getState());
        const radius = (CANVAS_WIDTH / scale) / 2;
        const y = Math.floor((this.currentMousePos[1]) / scale) + (center[1] - radius);
        const x = Math.floor((this.currentMousePos[0]) / scale) + (center[0] - radius);
        const input = {
          color: this.selectColor(store.getState()),
          pos: (y * IMAGE_WIDTH) + x,
        };
        store.dispatch(paintInputMade(input));
        if (this.rateInterval) {
          this.canMakeInput = false;
          this.inputTimeout = setTimeout(() => {
            this.canMakeInput = true;
          }, this.rateInterval * 1000);
        }
      }
    } else {
      this.updateCenter(layerX, layerY);
      this.canvas.style.cursor = 'default';
    }

    this.startMousePos = [];
    this.currentMousePos = [];
  }

  handleClick = (ev) => {
    this.cursorTO = setTimeout(() => {
      this.canvas.style.cursor = 'move';
    }, 100);
    this.canvas.addEventListener('mousemove', this.handleMouseMove);
    this.canvas.addEventListener('mouseup', this.handleMouseUp);
    const { layerX, layerY } = ev;
    this.startMousePos = [layerX, layerY];
    this.currentMousePos = this.startMousePos;
  }

  getImageData(definedScale) {
    const data = this.currentValue;
    const newImageData = new Uint8ClampedArray(CANVAS_WIDTH * CANVAS_HEIGHT * 4);

    const scale = definedScale || this.selectScale(store.getState());
    const radius = (CANVAS_WIDTH / scale) / 2;
    const center = this.selectCenter(store.getState());

    const start = (center[1] - radius) * IMAGE_WIDTH * 4 + (center[0] - radius) * 4;

    for (let row = 0; row < (CANVAS_WIDTH / scale); row++) {
      const rowStartIdx = start + (row * IMAGE_WIDTH * 4);
      for (let col = 0; col < (IMAGE_WIDTH / scale) * 4; col += 4) {
        const current = rowStartIdx + col;
        const startCanvasIdx = (col * scale) + (row * 4 * scale * CANVAS_WIDTH);

        for (let j = 0; j < scale; j++) {
          const k = startCanvasIdx + (CANVAS_WIDTH * 4 * j);
          for (let n = 0, offset = 0; n < scale; n++, offset += 4) {
            newImageData[k + offset] = data[current];
            newImageData[k + offset + 1] = data[current + 1];
            newImageData[k + offset + 2] = data[current + 2];
            newImageData[k + offset + 3] = data[current + 3];
          }
        }
      }
    }
    return new ImageData(newImageData, CANVAS_WIDTH, CANVAS_HEIGHT);
  }

  saveImageData(scale, width, height) {
    const data = this.currentValue;
    // width 500px vs height 500px
    // width * height * 4  500px * 500px * 4
    //
    const newImageData = new Uint8ClampedArray(width * height * 4);
    const radius = (width / scale) / 2;

    for (let row = 0; row < canvasWidth; row++) {
      const rowStartIdx = row * IMAGE_WIDTH * 4 * scale;
      for (let col = 0; col < IMAGE_WIDTH * 4; col += 4) {
        const current = rowStartIdx + col;
        const startCanvasIdx = (col * scale) + (row * 4 * scale * canvasWidth);

        for (let j = 0; j < scale; j++) {
          const k = startCanvasIdx + (canvasWidth * 4 * j * scale);
          for (let n = 0, offset = 0; n < scale; n++, offset += 4) {
            newImageData[k + offset] = data[current];
            newImageData[k + offset + 1] = data[current + 1];
            newImageData[k + offset + 2] = data[current + 2];
            newImageData[k + offset + 3] = data[current + 3];
          }
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

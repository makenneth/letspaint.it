import store from 'reduxHandler/store';
import { paintInputMade } from 'actions';

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
      pos: { x: layerX - (layerX % 25), y: layerY - (layerY % 25 )}
    };

    store.dispatch(paintInputMade(input));
  }

  draw() {
    this.context.clearRect(0, 0, this.width, this.height);
    this.context.putImageData(this.currentValue, 0, 0);
  }
}

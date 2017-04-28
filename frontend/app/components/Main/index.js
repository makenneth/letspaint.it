import React, { Component } from 'react';
import Canvas from 'components/Canvas';
import ColorPicker from './ColorPicker';

class Main extends Component {
  state = {
    top: null,
    left: null,
  }

  componentDidMount() {
    this.canvasHandler = new Canvas(this.canvas, 500, 500);
    this.canvas.addEventListener('mousemove', this.handleMouseMove);
  }

  componentWillUnmount() {
    this.canvasHandler.unmount();
    this.canvas.removeEventListener('mousemove', this.handleMouseMove);
  }

  handleMouseMove = (ev) => {
    const { layerX, layerY } = ev;
    const top = layerY - (layerY % 5) + 2.1;
    const left = layerX - (layerX % 5) + 1;
    this.setState({ top, left });
  }

  render() {
    const { top, left } = this.state;
    return (
      <div className="main-container">
        <div className="canvas-container">
          <canvas
            ref={(node) => { this.canvas = node; }}
            width={500}
            height={500}
          />
          {top !== null && left !== null &&
            <div
              className="hover-effect"
              style={{ top: `${top}px`, left: `${left}px` }}
            />
          }
        </div>
        <ColorPicker />
      </div>
    );
  }
}

export default Main;

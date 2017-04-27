import React, { Component } from 'react';
import Canvas from 'components/Canvas';

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
    const top = layerY - (layerY % 5) + 1;
    const left = layerX - (layerX % 5) + 1;
    this.setState({ top, left });
  }

  render() {
    const { top, left } = this.state;
    return (
      <div className="main-container">
        <canvas
          ref={(node) => { this.canvas = node; }}
          width={500}
          height={500}
        />
        {top && left &&
          <div
            className="hover-effect"
            style={{ top: `${top}px`, left: `${left}px` }}
          />
        }
      </div>
    );
  }
}

export default Main;

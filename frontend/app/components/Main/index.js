import React from 'react';
import Canvas from 'components/Canvas';

class Main extends React.PureComponent {
  componentDidMount() {
    this.canvasHandler = new Canvas(this.canvas, 500, 500);
  }

  render() {
    return (
      <div>
        <canvas
          style={{ border: '1px solid black' }}
          ref={(node) => { this.canvas = node; }}
          width={500}
          height={500}
        />
      </div>
    );
  }
}

export default Main;

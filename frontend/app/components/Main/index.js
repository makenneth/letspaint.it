import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import Canvas from 'components/Canvas';
import { Loader } from '_common';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from 'constants';
import { adjustCanvasScale, pickColor } from 'actions';
import ColorPicker from './ColorPicker';
import './styles.scss';

const scales = [1, 2, 5, 10];

@connect(({ auth, grid, canvas }) => ({
  username: auth.username,
  usernames: grid.usernames,
  center: canvas.center,
  scale: canvas.scale,
  pickedColor: canvas.color,
  isLoading: grid.isLoading,
}), { adjustCanvasScale, pickColor })
export default class Main extends Component {
  static propTypes = {
    username: PropTypes.string,
    usernames: PropTypes.array,
  }

  state = {
    top: null,
    left: null,
    showDetail: true,
  }

  componentDidMount() {
    this.canvasHandler = new Canvas(this.canvas, 500, 500);
    this.canvas.addEventListener('mousemove', this.handleMouseMove);
    this.canvas.addEventListener('mouseover', this.handleMouseOver);
    this.canvas.addEventListener('mouseout', this.handleMouseOut);
  }

  componentWillUnmount() {
    this.canvasHandler.unmount();
    this.canvas.removeEventListener('mousemove', this.handleMouseMove);
  }

  handleMouseOver = () => {
    if (!this.state.showDetail) {
      this.setState({ showDetail: true });
    }
  }

  handleMouseOut = () => {
    if (this.state.showDetail) {
      this.setState({ showDetail: false });
    }
  }

  handleMouseMove = (ev) => {
    const { layerX, layerY } = ev;
    const { scale } = this.props;
    const top = layerY - (layerY % scale);
    const left = layerX - (layerX % scale);
    this.setState({ top, left });
  }

  increaseScale = () => {
    const scaleIndex = scales.findIndex(s => s === this.props.scale);
    if (scaleIndex < 3) {
      this.props.adjustCanvasScale(scales[scaleIndex + 1]);
      this.canvasHandler.forceUpdate();
    }
  }

  decreaseScale = () => {
    const scaleIndex = scales.findIndex(s => s === this.props.scale);
    if (scaleIndex > 0) {
      this.props.adjustCanvasScale(scales[scaleIndex - 1]);
      this.canvasHandler.forceUpdate();
    }
  }

  saveImage = () => {
    const link = document.createElement('a');
    link.href = this.canvasHandler.saveImage();
    link.download = 'abc.png';
    link.click();
  }

  render() {
    const { top, left, showDetail } = this.state;
    const { usernames, username, center, scale, pickedColor, isLoading } = this.props;
    const radius = (CANVAS_WIDTH / scale) / 2;
    const posX = (left / scale) + (center[0] - radius);
    const posY = (top / scale) + (center[1] - radius);
    const usernameAtPixel = usernames[(posY * 500) + posX];
    const occupiedBy = (!usernameAtPixel && 'None') || (usernameAtPixel === username && 'You') ||
      usernameAtPixel;

    return (
      <div className="main-container">
        <div className="canvas-container">
          <canvas
            ref={(node) => { this.canvas = node; }}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
          />
          {top !== null && left !== null && showDetail &&
            <div
              className="hover-effect"
              style={{
                top: `${top + 0.5}px`,
                left: `${left + 0.5}px`,
                width: `${scale}px`,
                height: `${scale}px`,
              }}
            >
              <div className="tooltip">
                <div className="coord">
                  ({posX + 1}, {posY + 1})
                </div>
                <div className="username">
                  By: {occupiedBy}
                </div>
              </div>
            </div>
          }
          <Loader isLoading={isLoading} />
        </div>
        <div className="user-controls">
          <ColorPicker
            pickColor={this.props.pickColor}
            pickedColor={pickedColor}
          />
          <div className="zoom-control">
            <i
              className="material-icons"
              onClick={this.increaseScale}
            >
              zoom_in
            </i>
            <i
              className="material-icons"
              onClick={this.decreaseScale}
            >
              zoom_out
            </i>
          </div>
        </div>
      </div>
    );
  }
}
// <i className="material-icons" onClick={this.saveImage}>save</i>

import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import Canvas from 'components/Canvas';
import ColorPicker from './ColorPicker';

import './styles.scss';

@connect(({ auth: { username }, grid: { usernames } }) => ({ username, usernames }))
export default class Main extends Component {
  static propTypes = {
    username: PropTypes.string,
    usernames: PropTypes.array,
  }

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
    const top = layerY - (layerY % 5);
    const left = layerX - (layerX % 5);
    this.setState({ top, left });
  }

  render() {
    const { top, left, colorPickerOpen } = this.state;
    const { usernames } = this.props;

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
            >
              <div className="tooltip">
                <div className="coord">
                  <span>X:<span>{left / 5}</span></span>
                  <span>Y:<span>{top / 5}</span></span>
                </div>
                <div className="username">
                  <span>Taken By:<span>{usernames[top * 100 + left / 5]}</span></span>
                </div>
              </div>
            </div>
          }
        </div>
        <div className="user-controls">
          <ColorPicker />
          <div className="zoom-control">
            <i className="material-icons">zoom_in</i>
            <i className="material-icons">zoom_out</i>
          </div>
        </div>
      </div>
    );
  }
}

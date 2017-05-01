import React, { Component } from 'react';
import colors from 'constants/colors';

export default class ColorPicker extends Component {
  static propTypes = {
    pickColor: React.PropTypes.func,
    pickedColor: React.PropTypes.number,
  };

  state = {
    colorPickerOpen: false,
  };

  componentWillReceiveProps(nextProps) {
    if (this.props.pickedColor !== nextProps.pickedColor) {
      this.setState({ colorPickerOpen: false });
    }
  }

  toggleColorPicker = () => {
    this.setState({ colorPickerOpen: !this.state.colorPickerOpen });
  }

  render() {
    const { colorPickerOpen } = this.state;
    const { pickedColor } = this.props;

    return (
      <div className="color-picker">
        <div className="color-input" onClick={this.toggleColorPicker}>
          <i className="material-icons">format_color_fill</i>
          <div
            className="picked-color"
            style={{
              backgroundColor: `rgb(${colors[pickedColor].join(', ')})`
            }}
          />
          {
            colorPickerOpen &&
              <div className="color-picker-popover" onClick={ev => ev.stopPropagation()}>
                {colors.map((color, i) => (
                  <div
                    key={i}
                    className="color"
                    style={{ backgroundColor: `rgb(${color.join(', ')})` }}
                    onClick={() => this.props.pickColor(i)}
                  />
                ))}
              </div>
          }
        </div>
      </div>
    );
  }
}

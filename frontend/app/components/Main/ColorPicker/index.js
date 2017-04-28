import React, { Component } from 'react';
import { connect } from 'react-redux';
import { pickColor } from 'actions';
import colors from 'constants/colors';

@connect(({ grid }) => ({ pickedColor: grid.color }), { pickColor })
export default class ColorPicker extends Component {
  state = {
    colorPickerOpen: false,
  };

  toggleColorPicker = () => {
    this.setState({ colorPickerOpen: !this.state.colorPickerOpen });
  }

  render() {
    const { colorPickerOpen } = this.state;
    const { pickedColor } = this.props;
    console.log(colors.length);
    console.log(pickedColor);
    console.log(colors[pickedColor])
    return (
      <div className="color-picker">
        <div className="color-input">
          <i className="material-icons" onClick={this.toggleColorPicker}>format_color_fill</i>
          <div
            className="picked-color"
            style={{
              backgroundColor: `rgb(${colors[pickedColor].join(', ')})`
            }}
          />
        </div>
        {
          colorPickerOpen &&
            <div className="color-picker-popover">
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
    );
  }
}

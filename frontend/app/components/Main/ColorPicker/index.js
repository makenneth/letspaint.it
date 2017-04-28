import React from 'react';
import colors from 'constants/colors';

const ColorPicker = ({ onClick }) => {
  return (
    <div className="color-picker">
      {
        colors.map((color, i) => (
          <div
            key={i}
            className="color"
            style={{ backgroundColor: `rgb(${color.join(', ')})` }}
            onClick={() => onClick(i, color)}
          />
        ))
      }
    </div>
  );
}

export default ColorPicker;

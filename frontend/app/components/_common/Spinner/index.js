import React from 'react';

const Spinner = ({ isLoading }) => {
  if (isLoading) {
    return (
      <div className="overlay">
        <div className="loader" />
      </div>
    );
  }

  return null;
};

export default Spinner;

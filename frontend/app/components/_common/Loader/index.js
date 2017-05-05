import React from 'react';

const Loader = ({ isLoading }) => {
  if (isLoading) {
    return (
      <div className="overlay">
        <div className="loader" />
      </div>
    );
  }

  return null;
};

export default Loader;

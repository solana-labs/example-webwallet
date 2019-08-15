import React from 'react';

const Button = props => {
  return (
    <div className="app-btn">
      <button {...props} />
    </div>
  );
};

export default Button;

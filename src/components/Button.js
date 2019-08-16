import React from 'react';
import PropTypes from 'prop-types';

const Button = props => {
  return (
    <div className={`app-btn ${props.disabled && 'disabled'}`}>
      <button {...props} />
    </div>
  );
};

Button.propTypes = {
  disabled: PropTypes.bool,
};

export default Button;

import React from 'react';
import './StarBorder.css';

const StarBorder = ({
  as: Component = 'button',
  className = '',
  color = '#ffffff, #333333, #ffffff', 
  speed = '6s',
  children,
  ...rest
}) => {
  return (
    <Component
      className={`star-border-container ${className}`}
      {...rest}
    >
      <div
        className="border-gradient-full"
        style={{
          /* Conic gradient creates the 'star trail' that hits all sides */
          background: `conic-gradient(from 0deg, transparent, ${color}, transparent)`,
          animationDuration: speed
        }}
      ></div>
      <div className="inner-content">{children}</div>
    </Component>
  );
};

export default StarBorder;

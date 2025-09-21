import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import './FloatingActionButton.css';

const FloatingActionButton = ({ 
  onClick, 
  variant = 'default', 
  icon = '+', 
  title = 'Add new item',
  ariaLabel = 'Add new item',
  disabled = false 
}) => {
  const buttonRef = useRef(null);

  useEffect(() => {
    // Ensure the button is positioned relative to the viewport
    if (buttonRef.current) {
      buttonRef.current.style.position = 'fixed';
      buttonRef.current.style.bottom = '24px';
      buttonRef.current.style.right = '24px';
      buttonRef.current.style.zIndex = '9999';
    }
  }, []);

  const handleClick = () => {
    if (!disabled && onClick) {
      onClick();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  const button = (
    <button
      ref={buttonRef}
      className={`fab ${variant}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      title={title}
      aria-label={ariaLabel}
      disabled={disabled}
      tabIndex={0}
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999
      }}
    >
      {icon}
    </button>
  );

  // Render the button using a portal to ensure it's attached to the document body
  return createPortal(button, document.body);
};

export default FloatingActionButton;

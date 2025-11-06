import React from 'react';
import { createPortal } from 'react-dom';

interface FloatingActionButtonProps {
  onClick: () => void;
  variant?: 'default' | 'entries' | 'tasks' | 'notes';
  icon?: string | React.ReactNode;
  title?: string;
  ariaLabel?: string;
  disabled?: boolean;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ 
  onClick, 
  variant = 'default', 
  icon = '+', 
  title = 'Add new item',
  ariaLabel = 'Add new item',
  disabled = false 
}) => {
  const handleClick = (): void => {
    if (!disabled && onClick) {
      onClick();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>): void => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  const variantClasses: Record<string, string> = {
    default: 'bg-gradient-to-r from-indigo-600 to-purple-600',
    entries: 'bg-gradient-to-r from-blue-600 to-cyan-600',
    tasks: 'bg-gradient-to-r from-green-600 to-emerald-600',
    notes: 'bg-gradient-to-r from-purple-600 to-pink-600'
  };

  const button = (
    <button
      className={`
        fixed bottom-6 right-6 w-16 h-16 rounded-full text-white text-2xl font-bold
        shadow-xl hover:shadow-2xl transition-all hover:scale-110 active:scale-95
        flex items-center justify-center z-50
        ${variantClasses[variant] || variantClasses.default}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      title={title}
      aria-label={ariaLabel}
      disabled={disabled}
      tabIndex={0}
    >
      {typeof icon === 'string' ? icon : icon}
    </button>
  );

  return createPortal(button, document.body);
};

export default FloatingActionButton;



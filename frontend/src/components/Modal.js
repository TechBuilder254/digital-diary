import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import './Modal.css';

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  showCloseButton = true 
}) => {
  useEffect(() => {
    if (isOpen) {
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
      
      // Handle escape key
      const handleEscape = (e) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      
      document.addEventListener('keydown', handleEscape);
      
      return () => {
        document.body.style.overflow = 'unset';
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const modal = (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content">
        {title && <h2 className="modal-title">{title}</h2>}
        {children}
      </div>
    </div>
  );

  // Render modal using portal to ensure it's always on top
  return createPortal(modal, document.body);
};

export default Modal;

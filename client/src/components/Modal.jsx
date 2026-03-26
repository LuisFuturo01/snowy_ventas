import React from 'react';
import './Modal.css';
import Icon from './Icon';

const Modal = ({ open, isOpen, title, message, type = 'confirm', onConfirm, onCancel, confirmText, cancelText }) => {
  if (!open && !isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'danger': return 'trash';
      case 'success': return 'check';
      case 'warning': return 'bell';
      default: return 'clipboard';
    }
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className={`modal-card modal-${type}`} onClick={e => e.stopPropagation()}>
        <div className="modal-icon">
          <Icon name={getIcon()} size={28} />
        </div>
        <h3 className="modal-title">{title}</h3>
        <p className="modal-message">{message}</p>
        <div className="modal-actions">
          {onCancel && (
            <button className="btn btn-secondary" onClick={onCancel}>
              {cancelText || 'Cancelar'}
            </button>
          )}
          <button className={`btn ${type === 'danger' ? 'btn-danger' : type === 'success' ? 'btn-success' : ''}`} onClick={onConfirm}>
            {confirmText || 'Aceptar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;

import React, { useEffect } from 'react';
import PropTypes from 'prop-types';

const PopupMessage = ({ message, type = 'info', duration = 3000, onClose }) => {
  useEffect(() => {
    if (duration && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      case 'warning':
        return 'bg-yellow-500';
      default:
        return 'bg-blue-500';
    }
  };

  return (
    <div className={`fixed top-4 right-4 p-4 rounded-md text-white shadow-lg ${getTypeStyles()}`}>
      <div className="flex items-center justify-between">
        <p className="mr-4">{message}</p>
        {onClose && (
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200"
            aria-label="Close"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
};

PopupMessage.propTypes = {
  message: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['info', 'success', 'error', 'warning']),
  duration: PropTypes.number,
  onClose: PropTypes.func
};

export default PopupMessage;

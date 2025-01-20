import React, { useEffect } from 'react';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

const PopupMessage = ({ visible, message, type, onClose }) => {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000); // Auto dismiss after 5 seconds
      return () => clearTimeout(timer);
    }
  }, [visible, onClose]);

  if (!visible) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-fade-in-down">
      <div className={`
        px-4 py-3 rounded-xl shadow-lg backdrop-blur-xl flex items-center gap-3
        ${type === 'error' 
          ? 'bg-red-500/10 text-red-600 border border-red-200/20' 
          : 'bg-emerald-500/10 text-emerald-600 border border-emerald-200/20'}
      `}>
        {type === 'error' ? (
          <XCircleIcon className="w-5 h-5 flex-shrink-0" />
        ) : (
          <CheckCircleIcon className="w-5 h-5 flex-shrink-0" />
        )}
        <p className="text-sm font-medium">{message}</p>
        <button
          onClick={onClose}
          className="ml-2 hover:opacity-70 transition-opacity"
        >
          <XCircleIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default PopupMessage;

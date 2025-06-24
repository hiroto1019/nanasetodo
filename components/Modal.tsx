import React from 'react';
import { XMarkIcon } from './icons';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 bg-slate-700 dark:bg-slate-900/80 bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50 p-4"
      onClick={onClose} // Close on backdrop click
    >
      <div 
        className="bg-slate-50 dark:bg-slate-800 rounded-lg shadow-xl p-6 w-full max-w-lg md:max-w-xl lg:max-w-2xl transform transition-all"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal content
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-slate-700 dark:text-slate-100">{title}</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
            aria-label="Close modal"
          >
            <XMarkIcon className="w-7 h-7" />
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
};

export default Modal;
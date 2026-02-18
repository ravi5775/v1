import React from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  children: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'primary';
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  children,
  confirmText,
  cancelText,
  variant = 'danger' // Default to danger for backward compatibility
}) => {
  const { t } = useLanguage();
  if (!isOpen) return null;

  const isDanger = variant === 'danger';
  
  const iconBgClass = isDanger ? 'bg-status-overdue/10' : 'bg-blue-100';
  const iconClass = isDanger ? 'text-status-overdue' : 'text-primary';
  const confirmBtnClass = isDanger 
    ? 'bg-status-overdue hover:opacity-90 focus:ring-red-500 text-white'
    : 'btn-primary';

  const confirmButtonText = confirmText || (isDanger ? t('Delete') : t('Confirm'));
  const cancelButtonText = cancelText || t('Cancel');

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 animate-fade-in-fast"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirmation-modal-title"
    >
      <div 
        className="bg-white rounded-lg shadow-xl w-full max-w-md m-4 p-6 transform transition-all animate-fade-in-up"
        onClick={e => e.stopPropagation()} // Prevent closing when clicking inside
      >
        <div className="flex items-start">
            <div className={`mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full ${iconBgClass} sm:mx-0 sm:h-10 sm:w-10`}>
                <AlertTriangle className={`h-6 w-6 ${iconClass}`} aria-hidden="true" />
            </div>
            <div className="ml-4 text-left flex-grow">
                <h2 id="confirmation-modal-title" className="text-xl font-bold text-gray-800">{title}</h2>
                <div className="text-gray-600 mt-2">
                  {children}
                </div>
            </div>
             <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="p-2 rounded-full hover:bg-gray-100 -mt-2 -mr-2">
              <X size={20} />
            </button>
        </div>
        <div className="flex justify-end gap-4 mt-6">
          <button 
            onClick={onClose}
            className="btn btn-secondary px-6 py-2"
          >
            {cancelButtonText}
          </button>
          <button 
            onClick={onConfirm}
            className={`btn ${confirmBtnClass} px-6 py-2`}
          >
            {confirmButtonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
import React from 'react';
import { AlertTriangle, Info } from 'lucide-react';

export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText = 'Delete', type = 'danger' }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm bg-white border border-gray-200 p-6 rounded-lg shadow-xl space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          {type === 'danger' ? (
            <AlertTriangle className="text-red-500" size={20} />
          ) : (
            <Info className="text-blue-500" size={20} />
          )}
          {title}
        </h2>
        <p className="text-gray-500 text-sm">{message}</p>
        
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors text-white shadow-sm ${
              type === 'danger' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

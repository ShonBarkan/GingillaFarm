import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            {/* Overlay */}
            <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={onClose}></div>
            
            {/* Modal */}
            <div className="relative bg-white rounded-[2.5rem] w-full max-w-sm p-8 shadow-2xl animate-in zoom-in-95 duration-200" dir="rtl">
                <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-6">
                        <AlertTriangle size={32} />
                    </div>
                    
                    <h3 className="text-xl font-black text-gray-900 mb-2">{title}</h3>
                    <p className="text-gray-500 font-medium mb-8 leading-relaxed">{message}</p>
                    
                    <div className="flex flex-col w-full gap-3">
                        <button 
                            onClick={() => { onConfirm(); onClose(); }}
                            className="w-full py-4 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-black transition-all active:scale-95"
                        >
                            מחיקה לצמיתות
                        </button>
                        <button 
                            onClick={onClose}
                            className="w-full py-4 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-2xl font-black transition-all"
                        >
                            ביטול
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
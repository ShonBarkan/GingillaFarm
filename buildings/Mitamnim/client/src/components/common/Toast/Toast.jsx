import React, { useEffect } from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose, duration = 3000 }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);
        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const styles = {
        success: {
            bg: 'bg-green-50',
            border: 'border-green-100',
            text: 'text-green-800',
            icon: <CheckCircle className="text-green-500" size={20} />
        },
        error: {
            bg: 'bg-red-50',
            border: 'border-red-100',
            text: 'text-red-800',
            icon: <XCircle className="text-red-500" size={20} />
        },
        info: {
            bg: 'bg-blue-50',
            border: 'border-blue-100',
            text: 'text-blue-800',
            icon: <Info className="text-blue-500" size={20} />
        }
    };

    const currentStyle = styles[type] || styles.success;

    return (
        <div className="fixed bottom-6 left-6 z-[100] animate-in slide-in-from-left-10 fade-in duration-300">
            <div className={`
                flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-xl
                ${currentStyle.bg} ${currentStyle.border} ${currentStyle.text}
            `} dir="rtl">
                <div className="flex-shrink-0">
                    {currentStyle.icon}
                </div>
                
                <p className="text-sm font-black whitespace-nowrap">
                    {message}
                </p>

                <button 
                    onClick={onClose}
                    className="mr-2 p-1 hover:bg-white/50 rounded-lg transition-colors"
                >
                    <X size={16} className="opacity-50" />
                </button>
            </div>
        </div>
    );
};

export default Toast;
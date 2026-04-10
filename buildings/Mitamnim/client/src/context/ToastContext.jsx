import React, { createContext, useContext, useState, useCallback } from 'react';
import Toast from '../components/common/Toast/Toast';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
    const [toast, setToast] = useState(null);

    // Function to show a toast. Type can be 'success', 'error', or 'info'
    const showToast = useCallback((message, type = 'success') => {
        setToast({ message, type });
    }, []);

    // Function to hide the current toast
    const hideToast = useCallback(() => {
        setToast(null);
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {toast && (
                <Toast 
                    message={toast.message} 
                    type={toast.type} 
                    onClose={hideToast} 
                />
            )}
        </ToastContext.Provider>
    );
};

// Custom hook for easy access to the toast system
export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};
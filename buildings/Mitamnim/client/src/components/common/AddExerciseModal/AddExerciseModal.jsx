import React from 'react';
import { X } from 'lucide-react';
import ExerciseManagement from '../../settings/ExerciseManagement';

const AddExerciseModal = ({ isOpen, onClose, parentId, onSuccess }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" dir="rtl">
            <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[3rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50 shrink-0">
                    <h3 className="font-black text-gray-900 mr-4">הוספת תת-אימון חדש</h3>
                    <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors">
                        <X size={20} className="text-gray-400" />
                    </button>
                </div>

                {/* Body - Scrollable */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    <ExerciseManagement 
                        initialParentId={parentId} 
                        onSuccess={() => {
                            if (onSuccess) onSuccess();
                            onClose();
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default AddExerciseModal;
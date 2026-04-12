import React, { useState } from 'react';
import { Clock, Trash2, Edit2, Check, X, RefreshCw } from 'lucide-react';
import ExerciseIcon from '../../common/ExerciseIcon';
import ConfirmModal from '../../ConfirmModal';

const LogEntry = ({ log, isEditing, onEdit, onSave, onDelete, onCancel, editData, setEditData, isSubmitting }) => {
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const renderMetrics = () => {
        const data = isEditing ? editData.performance_data : log.performance_data;
        const keys = Object.keys(data || {});
        
        return (
            <div className="flex flex-wrap gap-4 mt-2 sm:mt-0">
                {keys.map((key) => (
                    <div key={key} className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
                        <span className="text-[10px] font-black uppercase text-gray-400 tracking-tighter">{key}</span>
                        {isEditing ? (
                            <input 
                                type="text"
                                value={data[key] || ''}
                                onChange={(e) => setEditData({
                                    ...editData,
                                    performance_data: { ...editData.performance_data, [key]: e.target.value }
                                })}
                                className="w-12 bg-white border border-blue-200 rounded px-1 text-center text-xs font-black text-blue-600 outline-none"
                            />
                        ) : (
                            <span className="font-black text-gray-900 text-sm leading-none">{data[key]}</span>
                        )}
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className={`group relative flex items-start gap-4 p-4 transition-all border-r-2 ${isEditing ? 'border-blue-500 bg-blue-50/30' : 'border-gray-100 hover:border-blue-300 hover:bg-gray-50/50'}`}>
            
            {/* Time Marker */}
            <div className="hidden sm:flex flex-col items-center min-w-[60px] pt-1">
                <span className="text-xs font-black text-gray-400">{new Date(log.timestamp).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}</span>
                <div className="w-px h-full bg-gray-100 my-2 group-last:hidden" />
            </div>

            {/* Icon */}
            <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center shadow-sm ${isEditing ? 'bg-blue-600 text-white' : 'bg-white border border-gray-100 text-blue-600'}`}>
                <ExerciseIcon exerciseName={log.exercise_name} size={22} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="min-w-0">
                        <h4 className="font-black text-gray-900 truncate tracking-tight uppercase text-sm sm:text-base">
                            {log.exercise_name}
                        </h4>
                        {!isEditing && (
                            <span className="sm:hidden text-[10px] font-bold text-gray-400 flex items-center gap-1">
                                <Clock size={10} /> {new Date(log.timestamp).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        )}
                    </div>
                    {renderMetrics()}
                </div>

                {/* Edit Mode Timestamp */}
                {isEditing && (
                    <input 
                        type="datetime-local"
                        value={editData.timestamp}
                        onChange={(e) => setEditData({ ...editData, timestamp: e.target.value })}
                        className="mt-3 block text-[10px] font-bold text-blue-600 bg-white border border-blue-100 rounded-lg p-2 outline-none"
                    />
                )}
            </div>

            {/* Action Bar */}
            <div className={`flex items-center gap-1 self-center ${isEditing ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
                {isEditing ? (
                    <>
                        <button onClick={onSave} disabled={isSubmitting} className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors">
                            {isSubmitting ? <RefreshCw size={16} className="animate-spin" /> : <Check size={18} />}
                        </button>
                        <button onClick={onCancel} className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors">
                            <X size={18} />
                        </button>
                    </>
                ) : (
                    <>
                        <button onClick={onEdit} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-white rounded-lg shadow-sm border border-gray-100 transition-all"><Edit2 size={14} /></button>
                        <button onClick={() => setIsDeleteModalOpen(true)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-white rounded-lg shadow-sm border border-gray-100 transition-all"><Trash2 size={14} /></button>
                    </>
                )}
            </div>

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={() => { onDelete(); setIsDeleteModalOpen(false); }}
                title="מחיקה מהיומן"
                message={`למחוק את "${log.exercise_name}"?`}
            />
        </div>
    );
};

export default LogEntry;
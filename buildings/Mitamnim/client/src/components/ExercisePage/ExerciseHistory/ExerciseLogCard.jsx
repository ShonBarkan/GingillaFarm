import React, { useState, useEffect } from 'react';
import { Clock, Calendar, Trash2, Edit2, Check, X, RefreshCw } from 'lucide-react';
import { mitamnimService } from '../../../services/mitamnimService';
import { useToast } from '../../../context/ToastContext';
import ExerciseIcon from '../../common/ExerciseIcon';
import ConfirmModal from '../../ConfirmModal';

const ExerciseLogCard = ({ log, onRefresh, showExerciseName = true }) => {
    const { showToast } = useToast();
    const [isEditing, setIsEditing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    
    const [editData, setEditData] = useState({ 
        performance_data: { ...log.performance_data },
        timestamp: log.timestamp ? log.timestamp.replace(' ', 'T').slice(0, 16) : ''
    });

    useEffect(() => {
        setEditData({
            performance_data: { ...log.performance_data },
            timestamp: log.timestamp ? log.timestamp.replace(' ', 'T').slice(0, 16) : ''
        });
    }, [log]);

    const handleSave = async () => {
        setIsSubmitting(true);
        try {
            await mitamnimService.updateActivityLog(log.id, {
                performance_data: editData.performance_data,
                exercise_id: log.exercise_id,
                timestamp: editData.timestamp.replace('T', ' ')
            });
            setIsEditing(false);
            showToast("Log updated");
            if (onRefresh) await onRefresh();
        } catch (e) {
            showToast("Update failed", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const performDelete = async () => {
        try {
            await mitamnimService.deleteBulk('activity_logs', [log.id]);
            showToast("Log deleted");
            if (onRefresh) await onRefresh();
        } catch (e) {
            showToast("Delete failed", "error");
        }
    };

    const renderMetrics = () => {
        const data = isEditing ? editData.performance_data : log.performance_data;
        const keys = Object.keys(data || {});
        
        return (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full">
                {keys.map((key) => (
                    <div key={key} className="bg-gray-50/80 p-2 rounded-xl border border-gray-100 flex flex-col items-center">
                        <span className="text-[9px] font-black uppercase text-gray-400 tracking-tighter leading-none mb-1">{key}</span>
                        {isEditing ? (
                            <input 
                                type="text"
                                value={data[key] || ''}
                                onChange={(e) => setEditData({
                                    ...editData,
                                    performance_data: { ...editData.performance_data, [key]: e.target.value }
                                })}
                                className="w-full bg-white border border-blue-200 rounded-lg py-0.5 text-center text-xs font-black text-blue-600 outline-none"
                            />
                        ) : (
                            <span className="font-black text-gray-900 text-lg leading-none">{data[key]}</span>
                        )}
                    </div>
                ))}
            </div>
        );
    };

    return (
        <>
            <div className={`relative bg-white rounded-[2rem] p-4 border transition-all group ${isEditing ? 'border-blue-500 shadow-xl' : 'border-gray-100 hover:border-blue-200 shadow-sm'}`}>
                
                {/* Minimal Action Bar */}
                {!isEditing && (
                    <div className="absolute top-3 left-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur rounded-lg shadow-sm border p-1 z-10">
                        <button onClick={() => setIsEditing(true)} className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors"><Edit2 size={14} /></button>
                        <button onClick={() => setIsDeleteModalOpen(true)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                    </div>
                )}

                <div className="flex flex-col gap-4">
                    {/* Header: Icon + Info */}
                    <div className="flex items-center gap-3 flex-row-reverse text-right">
                        <div className={`w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center transition-colors ${isEditing ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600'}`}>
                            <ExerciseIcon exerciseName={log.exercise_name} size={28} />
                        </div>
                        
                        <div className="min-w-0 flex-1 overflow-hidden">
                            {showExerciseName && (
                                <h3 className="font-black text-base text-gray-900 leading-tight truncate">
                                    {log.exercise_name || "Unknown"}
                                </h3>
                            )}
                            
                            {isEditing ? (
                                <input 
                                    type="datetime-local"
                                    value={editData.timestamp}
                                    onChange={(e) => setEditData({ ...editData, timestamp: e.target.value })}
                                    className="mt-1 text-[10px] font-bold text-blue-600 bg-blue-50 rounded-md p-1 outline-none"
                                />
                            ) : (
                                <div className="flex items-center gap-2 mt-1 justify-end text-[10px] font-bold text-gray-400">
                                    <span className="flex items-center gap-1"><Clock size={10} /> {new Date(log.timestamp).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}</span>
                                    <span className="flex items-center gap-1"><Calendar size={10} /> {new Date(log.timestamp).toLocaleDateString('he-IL')}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Content: Metrics Grid */}
                    {renderMetrics()}

                    {/* Edit Actions */}
                    {isEditing && (
                        <div className="flex gap-2 pt-3 border-t border-gray-50">
                            <button 
                                onClick={handleSave} 
                                disabled={isSubmitting} 
                                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white font-black py-2 rounded-xl hover:bg-blue-700 transition-all text-sm disabled:opacity-50"
                            >
                                {isSubmitting ? <RefreshCw className="animate-spin" size={14} /> : <Check size={14} />} שמור
                            </button>
                            <button 
                                onClick={() => setIsEditing(false)} 
                                className="px-3 flex items-center justify-center bg-gray-100 text-gray-500 rounded-xl hover:bg-gray-200 transition-all"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={performDelete}
                title="מחיקה"
                message={`למחוק את "${log.exercise_name}"?`}
            />
        </>
    );
};

export default ExerciseLogCard;
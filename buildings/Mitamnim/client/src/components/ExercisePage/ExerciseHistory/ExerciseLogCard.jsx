import React, { useState, useEffect } from 'react';
import { 
    Clock, 
    Calendar, 
    Trash2, 
    Edit2, 
    Check, 
    X, 
    RefreshCw 
} from 'lucide-react';
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
            showToast("Log updated successfully!");
            if (onRefresh) await onRefresh();
        } catch (e) {
            showToast("Failed to update log", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const performDelete = async () => {
        try {
            await mitamnimService.deleteBulk('activity_logs', [log.id]);
            showToast("Log deleted successfully");
            if (onRefresh) await onRefresh();
        } catch (e) {
            showToast("Failed to delete log", "error");
        }
    };

    const renderPerformanceMetrics = () => {
        const data = isEditing ? editData.performance_data : log.performance_data;
        const keys = Object.keys(data || {});

        if (keys.length === 0) return null;

        return keys.map((key) => (
            <div key={key} className="flex flex-col min-w-[80px] flex-1 bg-gray-50/50 p-3 rounded-2xl border border-gray-100/50">
                <span className="text-[10px] font-black uppercase text-gray-400 mb-1 tracking-wider text-right">{key}</span>
                {isEditing ? (
                    <input 
                        type="text"
                        value={data[key] || ''}
                        onChange={(e) => setEditData({
                            ...editData,
                            performance_data: { ...editData.performance_data, [key]: e.target.value }
                        })}
                        className="w-full bg-white border border-blue-200 rounded-xl p-1.5 text-sm font-black text-blue-600 outline-none focus:ring-2 ring-blue-100 text-center"
                    />
                ) : (
                    <div className="flex justify-center items-baseline gap-1">
                        <span className="font-black text-gray-900 text-2xl tracking-tight">{data[key]}</span>
                    </div>
                )}
            </div>
        ));
    };

    return (
        <>
            <div className={`relative bg-white rounded-[2.5rem] p-6 border-2 transition-all flex flex-col group ${isEditing ? 'border-blue-500 shadow-2xl scale-[1.02]' : 'border-gray-50 shadow-sm hover:shadow-xl hover:border-blue-100'}`}>
                
                {/* Action Buttons - Fixed positioning inside the card */}
                {!isEditing && (
                    <div className="absolute top-4 left-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 bg-white/80 backdrop-blur-md p-1.5 rounded-2xl shadow-lg border border-gray-100 z-10">
                        <button onClick={() => setIsEditing(true)} className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all" title="ערוך"><Edit2 size={16} /></button>
                        <button onClick={() => setIsDeleteModalOpen(true)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all" title="מחק"><Trash2 size={16} /></button>
                    </div>
                )}

                <div className="space-y-6">
                    <div className="flex items-start justify-between">
                        {/* Empty space for the floating buttons on the left */}
                        <div className="w-20" /> 

                        {/* Exercise Info - Right Aligned */}
                        <div className="flex items-center gap-4 text-right">
                            <div className="min-w-0">
                                {showExerciseName && (
                                    <h3 className="font-black text-xl text-gray-900 leading-tight truncate">
                                        {log.exercise_name || "תרגיל לא ידוע"}
                                    </h3>
                                )}
                                
                                {isEditing ? (
                                    <input 
                                        type="datetime-local"
                                        value={editData.timestamp}
                                        onChange={(e) => setEditData({ ...editData, timestamp: e.target.value })}
                                        className="mt-2 block text-xs font-bold text-blue-600 bg-blue-50 border-none rounded-lg p-2 outline-none"
                                    />
                                ) : (
                                    <div className="flex items-center gap-2 mt-2 justify-end">
                                        <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-lg text-[11px] font-bold text-gray-500">
                                            <Calendar size={12} className="text-gray-400" />
                                            {new Date(log.timestamp).toLocaleDateString('he-IL')}
                                        </div>
                                        <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-lg text-[11px] font-bold text-gray-500">
                                            <Clock size={12} className="text-gray-400" />
                                            {new Date(log.timestamp).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            <div className={`w-16 h-16 flex-shrink-0 rounded-[1.25rem] flex items-center justify-center shadow-inner transition-all ${isEditing ? 'bg-blue-600 text-white shadow-blue-200' : 'bg-gray-50 text-blue-600 group-hover:bg-white border border-transparent group-hover:border-blue-50'}`}>
                                <ExerciseIcon exerciseName={log.exercise_name} size={36} />
                            </div>
                        </div>
                    </div>

                    {/* Metrics Grid */}
                    <div className="flex flex-row-reverse flex-wrap gap-3">
                        {renderPerformanceMetrics()}
                    </div>
                </div>

                {isEditing && (
                    <div className="flex gap-3 mt-6 pt-6 border-t border-gray-100">
                        <button 
                            onClick={handleSave} 
                            disabled={isSubmitting} 
                            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white font-black py-3 rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 disabled:opacity-50"
                        >
                            {isSubmitting ? <RefreshCw className="animate-spin" size={20} /> : <Check size={20} />} שמור
                        </button>
                        <button 
                            onClick={() => setIsEditing(false)} 
                            className="px-6 flex items-center justify-center bg-gray-100 text-gray-500 font-black py-3 rounded-2xl hover:bg-gray-200 transition-all"
                        >
                            <X size={20} />
                        </button>
                    </div>
                )}
            </div>

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={performDelete}
                title="מחיקת פעילות"
                message={`האם אתה בטוח שברצונך למחוק את הרישום עבור "${log.exercise_name}"? פעולה זו אינה ניתנת לביטול.`}
            />
        </>
    );
};

export default ExerciseLogCard;
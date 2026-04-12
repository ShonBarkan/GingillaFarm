import React, { useState, useMemo } from 'react';
import { History, RefreshCw, Calendar as CalendarIcon, Package } from 'lucide-react';
import { useExercise } from '../../../context/ExerciseContext';
import { mitamnimService } from '../../../services/mitamnimService';
import { useToast } from '../../../context/ToastContext';
import LogEntry from './LogEntry';

const ExerciseHistory = ({ timeRange = 'all' }) => {
    const { logs, loading, refreshAll } = useExercise();
    const { showToast } = useToast();
    
    const [editingId, setEditingId] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editData, setEditData] = useState(null);

    const filteredLogs = useMemo(() => {
        if (!logs) return [];
        if (timeRange === 'all') return logs;

        const startOfPeriod = new Date();
        startOfPeriod.setHours(0, 0, 0, 0);

        if (timeRange === 'week') {
            const day = startOfPeriod.getDay();
            startOfPeriod.setDate(startOfPeriod.getDate() - day);
        } else if (timeRange === 'month') {
            startOfPeriod.setDate(1);
        }

        return logs.filter(log => new Date(log.timestamp) >= startOfPeriod);
    }, [logs, timeRange]);

    const groupedLogs = useMemo(() => {
        const sorted = [...filteredLogs].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        const dateGroups = {};
        
        sorted.forEach(log => {
            const dateKey = new Date(log.timestamp).toLocaleDateString('he-IL', { 
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
            });
            
            if (!dateGroups[dateKey]) dateGroups[dateKey] = [];
            
            const currentDayLogs = dateGroups[dateKey];
            const lastGroup = currentDayLogs[currentDayLogs.length - 1];

            if (lastGroup && log.workout_session_id && lastGroup.session_id === log.workout_session_id) {
                lastGroup.items.push(log);
            } else {
                currentDayLogs.push({
                    session_id: log.workout_session_id,
                    items: [log]
                });
            }
        });
        
        return dateGroups;
    }, [filteredLogs]);

    const handleSave = async (id) => {
        if (!editData) return;
        
        setIsSubmitting(true);
        try {
            const payload = {
                performance_data: editData.performance_data,
                timestamp: editData.timestamp.replace('T', ' '),
                exercise_id: logs.find(l => l.id === id)?.exercise_id 
            };

            await mitamnimService.updateActivityLog(id, payload);
            
            showToast("הפעילות עודכנה בהצלחה", "success");
            setEditingId(null);
            setEditData(null);
            
            if (refreshAll) await refreshAll();
        } catch (error) {
            console.error("Failed to update log:", error);
            showToast("שגיאה בעדכון הפעילות", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading && filteredLogs.length === 0) {
        return (
            <div className="space-y-4 animate-pulse p-8">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-24 bg-gray-100 rounded-[2rem]" />
                ))}
            </div>
        );
    }

    if (filteredLogs.length === 0) {
        return (
            <div className="text-center py-20 bg-white/50 rounded-[3.5rem] border border-dashed border-gray-200 mx-4">
                <History size={48} className="mx-auto text-gray-200 mb-4" />
                <p className="text-gray-400 font-bold">לא נמצאו ביצועים לטווח הזמן הנבחר</p>
            </div>
        );
    }

    return (
        <div className="bg-white/80 backdrop-blur-md rounded-[3.5rem] border border-gray-100 shadow-sm overflow-hidden" dir="rtl">
            
            <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <History size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 tracking-tighter leading-none">יומן ביצועים</h2>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Gingilla Journal System</p>
                    </div>
                </div>
                <button 
                    onClick={refreshAll} 
                    disabled={loading}
                    className="p-3 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all disabled:opacity-50"
                >
                    <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                </button>
            </div>

            <div className="divide-y divide-gray-50">
                {Object.entries(groupedLogs).map(([date, groups]) => (
                    <div key={date} className="animate-in fade-in duration-500">
                        
                        <div className="px-8 py-4 bg-gray-50/50 flex items-center gap-2 border-b border-gray-50">
                            <CalendarIcon size={14} className="text-blue-500" />
                            <span className="text-xs font-black text-gray-500 uppercase tracking-tighter">{date}</span>
                        </div>

                        <div className="flex flex-col">
                            {groups.map((group, gIdx) => {
                                const isSession = group.session_id !== null;
                                
                                return (
                                    <div 
                                        key={gIdx} 
                                        className={`relative ${isSession ? 'my-3 mx-4 rounded-[2rem] bg-blue-50/20 border border-blue-100/50 pb-2 shadow-sm' : ''}`}
                                    >
                                        {isSession && (
                                            <div className="flex items-center gap-2 px-6 pt-4 mb-1">
                                                <div className="w-5 h-5 bg-blue-100 rounded-lg flex items-center justify-center">
                                                    <Package size={10} className="text-blue-600" />
                                                </div>
                                                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">מקבץ אימון #{group.session_id}</span>
                                            </div>
                                        )}

                                        {group.items.map(log => (
                                            <LogEntry 
                                                key={log.id}
                                                log={log}
                                                isEditing={editingId === log.id}
                                                editData={editingId === log.id ? editData : null}
                                                setEditData={setEditData}
                                                isSubmitting={isSubmitting && editingId === log.id}
                                                onEdit={() => {
                                                    setEditingId(log.id);
                                                    setEditData({
                                                        performance_data: { ...log.performance_data },
                                                        timestamp: log.timestamp ? log.timestamp.replace(' ', 'T').slice(0, 16) : ''
                                                    });
                                                }}
                                                onSave={() => handleSave(log.id)}
                                                onCancel={() => {
                                                    setEditingId(null);
                                                    setEditData(null);
                                                }}
                                                onDelete={async () => {
                                                    try {
                                                        await mitamnimService.deleteBulk('activity_logs', [log.id]);
                                                        showToast("הפעילות נמחקה");
                                                        refreshAll?.();
                                                    } catch (e) {
                                                        showToast("מחיקה נכשלה", "error");
                                                    }
                                                }}
                                            />
                                        ))}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ExerciseHistory;
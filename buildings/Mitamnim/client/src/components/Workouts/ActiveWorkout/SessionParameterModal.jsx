import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, MessageSquare, Clock, Trophy, Activity } from 'lucide-react';

const SessionParameterModal = ({ isOpen, onClose, onConfirm, elapsedTime, sessionParams = [] }) => {
    const [notes, setNotes] = useState("");
    const [summaryData, setSummaryData] = useState({});
    
    // Time selection state
    const [entryType, setEntryType] = useState('now');
    const [retroDate, setRetroDate] = useState("");
    const [retroDuration, setRetroDuration] = useState("");

    // Reset flow only when modal opens
    useEffect(() => {
        if (isOpen) {
            setNotes("");
            setEntryType('now');
            
            const now = new Date();
            now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
            setRetroDate(now.toISOString().slice(0, 16));
            setRetroDuration(Math.floor(elapsedTime / 60).toString());
            
            if (sessionParams.length > 0) {
                const initialData = {};
                sessionParams.forEach(param => {
                    const key = param.parameter_name || param.name;
                    initialData[key] = param.default_value || "";
                });
                setSummaryData(initialData);
            } else {
                setSummaryData({});
            }
        }
    }, [isOpen]); 

    if (!isOpen) return null;

    const handleParamChange = (name, value) => {
        setSummaryData(prev => ({ ...prev, [name]: value }));
    };

    const handleConfirm = () => {
        onConfirm({
            summary_data: summaryData,
            notes: notes,
            entry_type: entryType,
            retro_date: entryType === 'retro' ? new Date(retroDate).toISOString() : new Date().toISOString(),
            retro_duration_minutes: entryType === 'retro' ? parseInt(retroDuration) || 0 : Math.floor(elapsedTime / 60)
        });
    };

    const formatTime = (totalSeconds) => {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${String(seconds).padStart(2, '0')}`;
    };

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" dir="rtl">
            <div className="relative bg-white w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 max-h-[90vh] flex flex-col">
                
                <div className="p-8 pb-4 flex justify-between items-center">
                    <div>
                        <h2 className="text-3xl font-black text-gray-900 tracking-tighter">
                            אימון <span className="text-blue-600">הושלם!</span>
                        </h2>
                    </div>
                    <button onClick={onClose} className="text-gray-300 hover:text-gray-600 transition-colors p-2">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 pt-0 custom-scrollbar space-y-8">
                    <div className="grid grid-cols-2 gap-3">
                        <button 
                            type="button"
                            onClick={() => setEntryType('now')}
                            className={`p-4 rounded-2xl font-black text-sm transition-all ${entryType === 'now' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'}`}
                        >
                            אימון עכשיו
                        </button>
                        <button 
                            type="button"
                            onClick={() => setEntryType('retro')}
                            className={`p-4 rounded-2xl font-black text-sm transition-all ${entryType === 'retro' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'}`}
                        >
                            עדכון רטרו
                        </button>
                    </div>

                    {entryType === 'retro' && (
                        <div className="space-y-4 bg-gray-50 p-6 rounded-[2rem]">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-gray-400">תאריך ושעה</label>
                                <input type="datetime-local" value={retroDate} onChange={(e) => setRetroDate(e.target.value)} className="w-full p-4 rounded-xl border border-gray-200 font-bold" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-gray-400">משך אימון (בדקות)</label>
                                <input type="number" value={retroDuration} onChange={(e) => setRetroDuration(e.target.value)} placeholder="0" className="w-full p-4 rounded-xl border border-gray-200 font-bold" />
                            </div>
                        </div>
                    )}

                    <div className="bg-blue-50 rounded-[2rem] p-6 flex items-center justify-around shadow-inner shadow-blue-100/50">
                        <div className="text-center">
                            <Clock className="text-blue-600 mx-auto mb-2" size={20} />
                            <p className="text-[10px] font-black uppercase text-blue-400">זמן כולל</p>
                            <p className="text-xl font-black text-blue-900">{entryType === 'now' ? formatTime(elapsedTime) : `${retroDuration}:00`}</p>
                        </div>
                        <div className="h-10 w-px bg-blue-100"></div>
                        <div className="text-center">
                            <Trophy className="text-blue-600 mx-auto mb-2" size={20} />
                            <p className="text-[10px] font-black uppercase text-blue-400">סטטוס</p>
                            <p className="text-xl font-black text-blue-900">בוצע</p>
                        </div>
                    </div>

                    {sessionParams.length > 0 && (
                        <div className="space-y-4">
                            <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-400 px-2">
                                <Activity size={14} /> מדדי אימון
                            </label>
                            <div className="grid grid-cols-1 gap-3">
                                {sessionParams.map((param) => {
                                    const paramName = param.parameter_name || param.name;
                                    return (
                                        <div key={param.id || param.parameter_id} className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex items-center justify-between">
                                            <span className="font-black text-gray-700 text-sm">{paramName}</span>
                                            <div className="flex items-center gap-2">
                                                <input type="number" value={summaryData[paramName] || ""} onChange={(e) => handleParamChange(paramName, e.target.value)} placeholder="0" className="w-20 bg-white border-none rounded-xl py-2 px-3 text-center font-black text-blue-600 shadow-sm outline-none" />
                                                <span className="text-[10px] font-bold text-gray-400 w-8">{param.unit}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    <div className="space-y-3">
                        <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-400 px-2">
                            <MessageSquare size={14} /> הערות
                        </label>
                        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="איך הרגשת?" className="w-full bg-gray-50 border-none rounded-[1.5rem] p-4 font-bold text-gray-900 min-h-[100px] transition-all resize-none" />
                    </div>
                </div>

                <div className="p-8 pt-4 bg-white border-t border-gray-50">
                    <button onClick={handleConfirm} className="w-full bg-blue-600 text-white py-5 rounded-[1.8rem] font-black text-lg shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all flex items-center justify-center gap-3">
                        שמור וסגור אימון <CheckCircle2 size={24} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SessionParameterModal;
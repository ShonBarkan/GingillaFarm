import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, MessageSquare, Clock, Trophy, Activity } from 'lucide-react';

const SessionParameterModal = ({ isOpen, onClose, onConfirm, elapsedTime, sessionParams = [] }) => {
    const [notes, setNotes] = useState("");
    const [summaryData, setSummaryData] = useState({});

    useEffect(() => {
        if (isOpen) {
            // Reset form on open
            setNotes("");
            
            if (sessionParams.length > 0) {
                const initialData = {};
                sessionParams.forEach(param => {
                    // Supporting both 'name' and 'parameter_name' for consistency
                    const key = param.parameter_name || param.name;
                    initialData[key] = param.default_value || "";
                });
                setSummaryData(initialData);
            } else {
                setSummaryData({});
            }
        }
    }, [isOpen, sessionParams]);

    if (!isOpen) return null;

    const handleParamChange = (name, value) => {
        setSummaryData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleConfirm = () => {
        onConfirm({
            summary_data: summaryData,
            notes: notes
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
                
                {/* Header */}
                <div className="p-8 pb-4 flex justify-between items-center">
                    <div>
                        <h2 className="text-3xl font-black text-gray-900 tracking-tighter">
                            אימון <span className="text-blue-600">הושלם!</span>
                        </h2>
                        <p className="text-gray-400 font-bold mt-1">סיכום קצר וסיימנו</p>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="text-gray-300 hover:text-gray-600 transition-colors p-2"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 pt-0 custom-scrollbar space-y-8">
                    {/* Stats Summary Area */}
                    <div className="bg-blue-50 rounded-[2rem] p-6 flex items-center justify-around shadow-inner shadow-blue-100/50">
                        <div className="text-center">
                            <Clock className="text-blue-600 mx-auto mb-2" size={20} />
                            <p className="text-[10px] font-black uppercase text-blue-400">זמן כולל</p>
                            <p className="text-xl font-black text-blue-900">{formatTime(elapsedTime)}</p>
                        </div>
                        <div className="h-10 w-px bg-blue-100"></div>
                        <div className="text-center">
                            <Trophy className="text-blue-600 mx-auto mb-2" size={20} />
                            <p className="text-[10px] font-black uppercase text-blue-400">סטטוס</p>
                            <p className="text-xl font-black text-blue-900">בוצע</p>
                        </div>
                    </div>

                    {/* Dynamic Session Parameters Section */}
                    {sessionParams.length > 0 && (
                        <div className="space-y-4">
                            <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-400 px-2">
                                <Activity size={14} />
                                מדדי אימון כלליים
                            </label>
                            <div className="grid grid-cols-1 gap-3">
                                {sessionParams.map((param) => {
                                    const paramName = param.parameter_name || param.name;
                                    return (
                                        <div 
                                            key={param.id || param.parameter_id} 
                                            className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex items-center justify-between"
                                        >
                                            <span className="font-black text-gray-700 text-sm">
                                                {paramName}
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <input 
                                                    type="number"
                                                    value={summaryData[paramName] || ""}
                                                    onChange={(e) => handleParamChange(paramName, e.target.value)}
                                                    placeholder="0"
                                                    className="w-20 bg-white border-none rounded-xl py-2 px-3 text-center font-black text-blue-600 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                                />
                                                <span className="text-[10px] font-bold text-gray-400 w-8">
                                                    {param.unit}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Notes Area */}
                    <div className="space-y-3">
                        <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-400 px-2">
                            <MessageSquare size={14} />
                            הערות חופשיות
                        </label>
                        <textarea 
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="איך הרגשת? משהו מיוחד שקרה?"
                            className="w-full bg-gray-50 border-none rounded-[1.5rem] p-4 font-bold text-gray-900 focus:ring-2 focus:ring-blue-500 min-h-[100px] transition-all resize-none"
                        />
                    </div>
                </div>

                {/* Footer Action Button */}
                <div className="p-8 pt-4 bg-white border-t border-gray-50">
                    <button 
                        onClick={handleConfirm}
                        className="w-full bg-blue-600 text-white py-5 rounded-[1.8rem] font-black text-lg shadow-lg shadow-blue-100 hover:bg-blue-700 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                    >
                        שמור וסגור אימון
                        <CheckCircle2 size={24} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SessionParameterModal;
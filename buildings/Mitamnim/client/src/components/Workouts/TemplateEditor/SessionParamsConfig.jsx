import React, { useState } from 'react';
import { Settings, Search, CheckCircle2, Circle } from 'lucide-react';

const SessionParamsConfig = ({ sessionParams, allSystemParams, onAdd, onRemove }) => {
    const [searchTerm, setSearchTerm] = useState("");

    const filteredParams = allSystemParams.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (p.unit && p.unit.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleToggle = (param) => {
        const isSelected = sessionParams.some(sp => sp.parameter_id === param.id);
        if (isSelected) {
            onRemove(param.id);
        } else {
            onAdd(param);
        }
    };

    return (
        <div className="bg-white/80 backdrop-blur-md p-8 rounded-[3.5rem] border border-gray-100/50 shadow-sm flex flex-col gap-6 animate-in fade-in duration-700 h-full overflow-hidden" dir="rtl">
            
            {/* 1. Header Section */}
            <div className="flex items-center justify-between pb-6 border-b border-gray-100/50 shrink-0">
                <div className="flex flex-col text-right">
                    <h3 className="text-2xl font-black text-gray-900 tracking-tighter leading-none">פרמטרים לאימון</h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-2">מדדים כלליים לסיכום האימון</p>
                </div>
                
                <div className="flex items-center gap-3">
                    {sessionParams.length > 0 && (
                        <div className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg shadow-blue-500/20">
                            <span className="text-[10px] font-black uppercase tracking-widest">
                                {sessionParams.length} נבחרו
                            </span>
                        </div>
                    )}
                    <div className="w-12 h-12 bg-gray-100/50 rounded-2xl flex items-center justify-center text-blue-600 shadow-inner">
                        <Settings size={22} />
                    </div>
                </div>
            </div>

            {/* 2. Search Field */}
            <div className="shrink-0">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-2 mb-3 block">חיפוש מהיר</label>
                <div className="relative group">
                    <Search className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-500 transition-colors" size={18} />
                    <input 
                        type="text"
                        placeholder="חפש פרמטר..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-gray-100/50 border-2 border-transparent focus:border-blue-200 focus:bg-white rounded-[1.5rem] py-4 pr-14 pl-6 font-black text-gray-900 outline-none transition-all placeholder:text-gray-300 shadow-inner"
                    />
                </div>
            </div>

            {/* 3. Parameters Grid */}
            <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-2 mb-4 block">בחר מדדים</label>
                
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 overflow-y-auto p-1 custom-scrollbar">
                    {filteredParams.length > 0 ? (
                        filteredParams.map((param) => {
                            const isSelected = sessionParams.some(sp => sp.parameter_id === param.id);
                            return (
                                <button
                                    key={param.id}
                                    type="button"
                                    onClick={() => handleToggle(param)}
                                    className={`flex flex-col items-center justify-center p-5 rounded-[2rem] border-2 transition-all text-center gap-3 group relative ${
                                        isSelected 
                                        ? 'border-blue-600 bg-blue-50/50 shadow-lg shadow-blue-500/10 scale-[0.98]' 
                                        : 'border-transparent bg-gray-100/30 hover:bg-white hover:border-blue-100 hover:shadow-md'
                                    }`}
                                >
                                    <div className={`transition-all duration-300 ${isSelected ? 'text-blue-600 scale-110' : 'text-gray-300 group-hover:text-blue-400'}`}>
                                        {isSelected ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                                    </div>
                                    
                                    <div className="space-y-1">
                                        <p className={`text-xs font-black leading-tight ${isSelected ? 'text-blue-900' : 'text-gray-700'}`}>
                                            {param.name}
                                        </p>
                                        <p className="text-[9px] font-bold text-blue-500/60 uppercase tracking-tighter">
                                            {param.unit}
                                        </p>
                                    </div>

                                    {isSelected && (
                                        <div className="absolute top-0 right-0 w-8 h-8 bg-blue-600 rounded-bl-[1.5rem] flex items-center justify-center text-white pl-1 pb-1">
                                            <div className="w-1 h-1 bg-white rounded-full animate-pulse" />
                                        </div>
                                    )}
                                </button>
                            );
                        })
                    ) : (
                        <div className="col-span-full py-16 text-center bg-gray-100/20 rounded-[2.5rem] border-2 border-dashed border-gray-100">
                            <p className="text-gray-400 font-black uppercase tracking-widest text-[10px]">אין תוצאות לחיפוש</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SessionParamsConfig;
import React, { useState } from 'react';
import { Settings, Search, CheckCircle2, Circle } from 'lucide-react';

const SessionParamsConfig = ({ sessionParams, allSystemParams, onAdd, onRemove }) => {
    const [searchTerm, setSearchTerm] = useState("");

    /**
     * Filter parameters based on search input
     */
    const filteredParams = allSystemParams.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.unit.toLowerCase().includes(searchTerm.toLowerCase())
    );

    /**
     * Toggle parameter selection
     */
    const handleToggle = (param) => {
        const isSelected = sessionParams.some(sp => sp.parameter_id === param.id);
        if (isSelected) {
            onRemove(param.id);
        } else {
            onAdd(param);
        }
    };

    return (
        <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col" dir="rtl">
            
            {/* 1. Header Section */}
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-100 shrink-0">
                    <Settings size={24} />
                </div>
                <div className="space-y-0.5">
                    <h3 className="text-xl font-black text-gray-900 leading-none">פרמטרים לאימון</h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest text-right">מדדים כלליים לסיכום האימון</p>
                </div>
            </div>

            {/* 2. Search Field - Simplified for Sidebar-like feel */}
            <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-2">חיפוש מהיר</label>
                <div className="relative group">
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-500 transition-colors" size={18} />
                    <input 
                        type="text"
                        placeholder="חפש פרמטר..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-100 focus:bg-white rounded-2xl py-3 pr-12 pl-4 font-bold text-gray-900 outline-none transition-all placeholder:text-gray-300"
                    />
                </div>
            </div>

            {/* 3. Parameters Grid - Optimized for side-by-side view */}
            <div className="flex-1 space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-2">בחר מדדים</label>
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-2 max-h-[350px] overflow-y-auto p-1 custom-scrollbar">
                    {filteredParams.length > 0 ? (
                        filteredParams.map((param) => {
                            const isSelected = sessionParams.some(sp => sp.parameter_id === param.id);
                            return (
                                <button
                                    key={param.id}
                                    type="button"
                                    onClick={() => handleToggle(param)}
                                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all text-center gap-1.5 group ${
                                        isSelected 
                                        ? 'border-blue-600 bg-blue-50/50 shadow-md shadow-blue-100 scale-[0.98]' 
                                        : 'border-gray-50 bg-gray-50/30 hover:border-blue-200'
                                    }`}
                                >
                                    <div className={`transition-colors ${isSelected ? 'text-blue-600' : 'text-gray-200 group-hover:text-blue-300'}`}>
                                        {isSelected ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                                    </div>
                                    <div className="space-y-0">
                                        <p className={`text-[11px] font-black leading-tight ${isSelected ? 'text-blue-900' : 'text-gray-600'}`}>
                                            {param.name}
                                        </p>
                                        <p className="text-[9px] font-bold text-gray-400 uppercase">
                                            {param.unit}
                                        </p>
                                    </div>
                                </button>
                            );
                        })
                    ) : (
                        <div className="col-span-full py-8 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100">
                            <p className="text-gray-400 font-bold italic text-xs">אין תוצאות</p>
                        </div>
                    )}
                </div>
            </div>

            {/* 4. Selected Count Footer */}
            <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                <p className="text-[10px] text-gray-400 font-medium italic">
                    פרמטרים אלו יופיעו בתחילת ובסיום כל אימון בשבלונה.
                </p>
                {sessionParams.length > 0 && (
                    <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg shadow-blue-100 shrink-0">
                        {sessionParams.length} נבחרו
                    </span>
                )}
            </div>
        </div>
    );
};

export default SessionParamsConfig;
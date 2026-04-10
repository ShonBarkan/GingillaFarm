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
    <div className="w-full bg-gray-50/30 backdrop-blur-sm border border-gray-100/50 p-3 md:p-5 rounded-[3.5rem] shadow-sm animate-in fade-in duration-700 h-full flex flex-col" dir="rtl">
        <div className="bg-white border border-gray-100/50 rounded-[2.5rem] shadow-inner flex-1 flex flex-col overflow-hidden">
            
            {/* 1. Header Section - כעת חלק אינטגרלי מהקופסה הלבנה */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-gray-50 shrink-0 bg-white">
                <div className="flex flex-col text-right">
                    <h3 className="text-xl font-black text-gray-900 tracking-tighter leading-tight p-0 m-0">פרמטרים לאימון</h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest p-0 m-0">מדדים כלליים לסיכום האימון</p>
                </div>
                
                <div className="flex items-center gap-2">
                    {sessionParams.length > 0 && (
                        <div className="flex items-center gap-2 bg-blue-600 text-white px-4 py-1.5 rounded-full shadow-lg shadow-blue-100">
                            <span className="text-[10px] font-black uppercase tracking-widest">
                                {sessionParams.length} נבחרו
                            </span>
                        </div>
                    )}
                    {/* כאן תוכל להוסיף את אייקון ה-Settings כפי שהיה קודם אם תרצה */}
                    <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-blue-600 shadow-inner">
                        <Settings size={20} />
                    </div>
                </div>
            </div>

            {/* 2. Search Field - יושב ישר מתחת לכותרת הלבנה */}
            <div className="p-6 pb-2 shrink-0 bg-white">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-2 mb-2 block">חיפוש מהיר</label>
                <div className="relative group">
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-500 transition-colors" size={18} />
                    <input 
                        type="text"
                        placeholder="חפש פרמטר..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-100 focus:bg-white rounded-2xl py-3 pr-12 pl-4 font-bold text-gray-900 outline-none transition-all placeholder:text-gray-300 shadow-sm"
                    />
                </div>
            </div>

            {/* 3. Parameters Grid - מתחיל מיד מתחת לחיפוש עם גלילה פנימית */}
            <div className="flex-1 min-h-0 p-6 pt-2 flex flex-col bg-white">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-2 mb-3 block">בחר מדדים</label>
                
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-3 overflow-y-auto p-1 custom-scrollbar">
                    {filteredParams.length > 0 ? (
                        filteredParams.map((param) => {
                            const isSelected = sessionParams.some(sp => sp.parameter_id === param.id);
                            return (
                                <button
                                    key={param.id}
                                    type="button"
                                    onClick={() => handleToggle(param)}
                                    className={`flex flex-col items-center justify-center p-4 rounded-[2rem] border-2 transition-all text-center gap-2 group relative overflow-hidden ${
                                        isSelected 
                                        ? 'border-blue-600 bg-blue-50/50 shadow-md shadow-blue-100 scale-[0.98]' 
                                        : 'border-gray-50 bg-gray-50/30 hover:border-blue-200 hover:bg-white'
                                    }`}
                                >
                                    <div className={`transition-all duration-300 ${isSelected ? 'text-blue-600 scale-110' : 'text-gray-200 group-hover:text-blue-300'}`}>
                                        {isSelected ? <CheckCircle2 size={22} /> : <Circle size={22} />}
                                    </div>
                                    
                                    <div className="space-y-0.5">
                                        <p className={`text-[12px] font-black leading-tight ${isSelected ? 'text-blue-900' : 'text-gray-600'}`}>
                                            {param.name}
                                        </p>
                                        <p className="text-[9px] font-bold text-blue-400/80 uppercase tracking-tighter">
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
                        <div className="col-span-full py-12 text-center bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-100/50">
                            <p className="text-gray-400 font-black uppercase tracking-widest text-[10px]">אין תוצאות לחיפוש</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    </div>
    );
};

export default SessionParamsConfig;
import React from 'react';
import { Clock, CalendarDays } from 'lucide-react';

const TemplateScheduleConfig = ({ expectedTime, setExpectedTime, scheduledDays, onToggleDay }) => {
    const days = [
        { label: 'א', value: 0 },
        { label: 'ב', value: 1 },
        { label: 'ג', value: 2 },
        { label: 'ד', value: 3 },
        { label: 'ה', value: 4 },
        { label: 'ו', value: 5 },
        { label: 'ש', value: 6 },
    ];

    return (
        <div className="w-full bg-gray-50/30 backdrop-blur-sm border border-gray-100/50 p-3 md:p-5 rounded-[3.5rem] shadow-sm animate-in fade-in duration-700 h-full flex flex-col" dir="rtl">
            
            {/* המעטפת הלבנה הפנימית המאוחדת */}
            <div className="bg-white border border-gray-100/50 rounded-[2.5rem] shadow-inner flex-1 flex flex-col overflow-hidden">
                
                {/* 1. Header Section - כותרת לבנה כחלק מהקופסה */}
                <div className="flex items-center justify-between px-8 py-6 border-b border-gray-50 shrink-0 bg-white">
                    <div className="flex flex-col text-right">
                        <h3 className="text-xl font-black text-gray-900 tracking-tighter leading-tight">תזמון אימון</h3>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">מתי האימון אמור לקרות?</p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-100 shrink-0">
                            <CalendarDays size={22} />
                        </div>
                    </div>
                </div>

                {/* 2. תוכן הקומפוננטה - בחירת ימים ושעה */}
                <div className="p-8 space-y-10 flex-1 overflow-y-auto bg-white">
                    
                    {/* 1. Days Selection */}
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-2 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                            באילו ימים?
                        </label>
                        <div className="flex gap-2 w-full overflow-x-auto no-scrollbar pb-2">
                            {days.map((day) => {
                                const isSelected = scheduledDays.includes(day.value);
                                return (
                                    <button
                                        key={day.value}
                                        type="button"
                                        onClick={() => onToggleDay(day.value)}
                                        className={`
                                            flex-1 h-12 min-w-[45px] rounded-xl font-black text-xs transition-all border-2 
                                            ${isSelected 
                                                ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-100 scale-105' 
                                                : 'bg-gray-50 border-transparent text-gray-400 hover:bg-gray-100 hover:text-blue-500'
                                            }
                                        `}
                                    >
                                        {day.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* 2. Time Input */}
                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-2 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                            באיזו שעה?
                        </label>
                        <div className="relative group max-w-[200px]">
                            <div className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-500 transition-colors pointer-events-none">
                                <Clock size={20} />
                            </div>
                            <input 
                                type="time"
                                value={expectedTime}
                                onChange={(e) => setExpectedTime(e.target.value)}
                                className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-100 focus:bg-white rounded-2xl pr-14 pl-6 py-4 font-black text-gray-700 outline-none transition-all [color-scheme:light] shadow-sm"
                            />
                        </div>
                    </div>
                </div>

                {/* 3. Footer Hint - סגירת הקופסה הלבנה */}
                <div className="p-6 bg-gray-50/50 border-t border-gray-50 shrink-0">
                    <div className="flex items-start gap-3 text-gray-400 px-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-200 mt-1.5 shrink-0" />
                        <p className="text-[11px] font-bold leading-relaxed italic opacity-80">
                            המערכת תשתמש בשעה ובימים אלו כדי להקפיץ לך את האימון בראש דף הבית בזמן הנכון.
                        </p>
                    </div>
                </div>
            </div>
        </div>
);
};

export default TemplateScheduleConfig;
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
        <div className="bg-white/80 backdrop-blur-md p-8 rounded-[3.5rem] border border-gray-100/50 shadow-sm flex flex-col gap-8 animate-in fade-in duration-700 h-full" dir="rtl">
            
            {/* 1. Header Section */}
            <div className="flex items-center justify-between pb-6 border-b border-gray-100/50 shrink-0">
                <div className="flex flex-col text-right">
                    <h3 className="text-2xl font-black text-gray-900 tracking-tighter leading-none">תזמון אימון</h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-2">מתי האימון אמור לקרות?</p>
                </div>
                
                <div className="w-14 h-14 bg-blue-600 text-white rounded-[1.5rem] flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
                    <CalendarDays size={26} />
                </div>
            </div>

            {/* 2. Selection Content */}
            <div className="space-y-10 flex-1">
                
                {/* Days Selection */}
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
                                        flex-1 h-12 min-w-[45px] rounded-2xl font-black text-sm transition-all border-2 
                                        ${isSelected 
                                            ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20 scale-105' 
                                            : 'bg-gray-100/50 border-transparent text-gray-400 hover:bg-white hover:border-blue-100 hover:text-blue-600'
                                        }
                                    `}
                                >
                                    {day.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Time Input */}
                <div className="space-y-4">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-2 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        באיזו שעה?
                    </label>
                    <div className="relative group max-w-[220px]">
                        <div className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-500 transition-colors pointer-events-none">
                            <Clock size={20} />
                        </div>
                        <input 
                            type="time"
                            value={expectedTime}
                            onChange={(e) => setExpectedTime(e.target.value)}
                            className="w-full bg-gray-100/50 border-2 border-transparent focus:border-blue-200 focus:bg-white rounded-[1.5rem] pr-14 pl-6 py-4 font-black text-xl text-gray-700 outline-none transition-all [color-scheme:light] shadow-inner"
                        />
                    </div>
                </div>
            </div>

            {/* 3. Footer Hint */}
            <div className="pt-6 border-t border-gray-100/50 shrink-0">
                <div className="flex items-start gap-3 text-gray-400 px-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-300 mt-1.5 shrink-0" />
                    <p className="text-[11px] font-bold leading-relaxed italic opacity-80">
                        המערכת תשתמש בשעה ובימים אלו כדי להקפיץ לך את האימון בראש דף הבית בזמן הנכון.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default TemplateScheduleConfig;
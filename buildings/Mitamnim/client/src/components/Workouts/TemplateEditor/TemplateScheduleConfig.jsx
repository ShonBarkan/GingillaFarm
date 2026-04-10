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
        <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full">
            {/* Section Header */}
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100 shrink-0">
                    <CalendarDays size={24} />
                </div>
                <div className="space-y-0.5">
                    <h3 className="text-xl font-black text-gray-900 leading-none">תזמון אימון</h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">מתי האימון אמור לקרות?</p>
                </div>
            </div>

            <div className="space-y-8">
                {/* 1. Days of the Week Selection */}
                <div className="space-y-4">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-2 flex items-center gap-2">
                        באילו ימים?
                    </label>
                    <div className="flex gap-2 w-full">
                        {days.map((day) => {
                            const isSelected = scheduledDays.includes(day.value);
                            return (
                                <button
                                    key={day.value}
                                    type="button"
                                    onClick={() => onToggleDay(day.value)}
                                    className={`
                                        flex-1 h-12 rounded-xl font-black text-sm transition-all border-2 
                                        ${isSelected 
                                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-100 scale-105' 
                                            : 'bg-gray-50 border-transparent text-gray-400 hover:bg-gray-100 hover:text-indigo-400'
                                        }
                                    `}
                                >
                                    {day.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* 2. Target Time Input - Changed to Time Picker */}
                <div className="space-y-4">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-2">
                        באיזו שעה?
                    </label>
                    <div className="relative group max-w-[200px]">
                        <div className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-indigo-500 transition-colors pointer-events-none">
                            <Clock size={20} />
                        </div>
                        <input 
                            type="time"
                            value={expectedTime}
                            onChange={(e) => setExpectedTime(e.target.value)}
                            className="w-full bg-gray-50 border-2 border-transparent focus:border-indigo-100 focus:bg-white rounded-2xl pr-14 pl-6 py-4 font-black text-gray-700 outline-none transition-all [color-scheme:light]"
                        />
                    </div>
                </div>
            </div>

            {/* Hint Note */}
            <div className="pt-6 border-t border-gray-50 flex items-start gap-3 text-gray-400">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-200 mt-1.5 shrink-0" />
                <p className="text-[11px] font-medium leading-relaxed">
                    המערכת תשתמש בשעה ובימים אלו כדי להקפיץ לך את האימון בראש דף הבית בזמן הנכון.
                </p>
            </div>
        </div>
    );
};

export default TemplateScheduleConfig;
import React from 'react';
import { Award, Clock } from 'lucide-react';

const StatCard = ({ item }) => {
    if (!item) return null;

    const total = item.total_value ?? 0;
    const avg = item.avg_value ?? 0;
    const max = item.max_value ?? 0;
    const unit = item.unit || '';

    const formatNum = (num) => {
        const n = Number(num);
        if (isNaN(n)) return "0";
        return n % 1 === 0 ? n : n.toFixed(1);
    };

    return (
        <div className="bg-white border border-gray-100 p-4 md:p-6 rounded-[2rem] shadow-sm hover:border-blue-200 hover:shadow-xl hover:shadow-blue-50/50 transition-all flex flex-col items-center text-center group min-w-0 h-full justify-between" dir="rtl">
            
            {/* שם הפרמטר */}
            <h3 className="text-[10px] md:text-xs font-black text-gray-400 uppercase tracking-widest mb-4 truncate w-full">
                {item.name || "פרמטר"}
            </h3>

            {/* תצוגה מרכזית - רספונסיבית יותר */}
            <div className="flex flex-col items-center justify-center flex-1 w-full min-h-0 py-2">
                <span className="text-[10px] font-black text-blue-500 uppercase tracking-tighter mb-1 shrink-0">
                    סה"כ
                </span>
                
                {/* הקטנו את הערך מ-8xl ל-6xl במקסימום.
                    הוספנו break-words ו-max-w-full כדי שלא יצא מהכרטיס לעולם.
                */}
                <span className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 leading-none group-hover:scale-105 transition-transform duration-500 break-words max-w-full inline-block">
                    {formatNum(total)}
                </span>
                
                <span className="text-xs md:text-base font-bold text-gray-400 mt-2 truncate w-full">
                    {unit}
                </span>
            </div>

            {/* פוטר נתונים משניים - מותאם למובייל */}
            <div className="w-full grid grid-cols-2 gap-2 pt-4 mt-2 border-t border-gray-50 shrink-0">
                
                <div className="flex flex-col items-center gap-0.5 border-l border-gray-50">
                    <div className="flex items-center gap-1 text-gray-300">
                        <Clock size={10} className="shrink-0" />
                        <span className="text-[8px] md:text-[9px] font-black uppercase tracking-wider">ממוצע</span>
                    </div>
                    <span className="text-xs md:text-lg font-black text-gray-700 leading-none truncate w-full">
                        {formatNum(avg)}
                    </span>
                </div>

                <div className="flex flex-col items-center gap-0.5">
                    <div className="flex items-center gap-1 text-blue-400">
                        <Award size={10} className="shrink-0" />
                        <span className="text-[8px] md:text-[9px] font-black uppercase tracking-wider">שיא</span>
                    </div>
                    <span className="text-xs md:text-lg font-black text-blue-600 leading-none truncate w-full">
                        {formatNum(max)}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default StatCard;
import React, { useState, useEffect } from 'react';
import { Award, Clock } from 'lucide-react';

const useCountAnimation = (endValue, duration = 1500) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let startTime = null;
        const startValue = count;

        const step = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            const easeOutCubic = 1 - Math.pow(1 - progress, 3);
            const currentCount = startValue + (endValue - startValue) * easeOutCubic;
            
            setCount(currentCount);

            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };

        window.requestAnimationFrame(step);
    }, [endValue, duration]);

    return count;
};

const AnimatedNumber = ({ value }) => {
    const animatedValue = useCountAnimation(value);
    const isInt = value % 1 === 0;
    
    return (
        <span className="whitespace-nowrap">
            {isInt ? Math.round(animatedValue).toLocaleString() : animatedValue.toFixed(1)}
        </span>
    );
};

const StatCard = ({ item }) => {
    if (!item) return null;

    const total = Number(item.total_value ?? 0);
    const avg = Number(item.avg_value ?? 0);
    const max = Number(item.max_value ?? 0);
    const unit = item.unit || '';

    return (
        <div className="bg-white/80 backdrop-blur-md p-6 rounded-[3.5rem] border border-gray-100/50 shadow-sm hover:border-blue-200 hover:shadow-xl hover:shadow-blue-50/50 transition-all flex flex-col items-center text-center group min-w-0 h-full justify-between" dir="rtl">
            
            {/* 1. Parameter Name - Allowing full visibility */}
            <div className="w-full flex items-start justify-center mb-6">
                <h3 className="text-xs md:text-sm font-black text-gray-400 uppercase tracking-widest leading-tight">
                    {item.name || "פרמטר"}
                </h3>
            </div>

            {/* 2. Central Display - Safe space for large numbers */}
            <div className="flex flex-col items-center justify-center flex-1 w-full py-6">
                <span className="text-[11px] font-black text-blue-500 uppercase tracking-tighter mb-2">
                    סה"כ
                </span>
                
                <div className="w-full flex justify-center items-center">
                    <div className="text-5xl md:text-6xl font-black text-gray-900 leading-none group-hover:scale-105 transition-transform duration-500 tabular-nums whitespace-nowrap">
                        <AnimatedNumber value={total} />
                    </div>
                </div>
                
                <span className="text-xs md:text-sm font-bold text-gray-400 mt-4">
                    {unit}
                </span>
            </div>

            {/* 3. Secondary Stats Footer - Responsive text sizing */}
            <div className="w-full border-t border-gray-50 pt-6 mt-6">
                <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col items-center gap-1 border-l border-gray-50 px-2">
                        <div className="flex items-center gap-1.5 text-gray-300">
                            <Clock size={12} className="shrink-0" />
                            <span className="text-[10px] font-black uppercase tracking-wider">ממוצע</span>
                        </div>
                        <div className="text-sm md:text-lg font-black text-gray-700 leading-none tabular-nums truncate max-w-full">
                            <AnimatedNumber value={avg} />
                        </div>
                    </div>

                    <div className="flex flex-col items-center gap-1 px-2">
                        <div className="flex items-center gap-1.5 text-blue-400">
                            <Award size={12} className="shrink-0" />
                            <span className="text-[10px] font-black uppercase tracking-wider">שיא</span>
                        </div>
                        <div className="text-sm md:text-lg font-black text-blue-600 leading-none tabular-nums truncate max-w-full">
                            <AnimatedNumber value={max} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StatCard;
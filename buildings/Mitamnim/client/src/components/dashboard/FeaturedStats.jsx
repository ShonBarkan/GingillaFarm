import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Star, Award, Clock as ClockIcon, ChevronLeft, TrendingUp, 
    Dumbbell, Bike, Waves, Zap, Activity, Trophy, Heart, Target, Flame 
} from 'lucide-react';
import ExerciseIcon from '../common/ExerciseIcon';


/**
 * Numerical animation hook for smooth data transitions
 */
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
        <span className="whitespace-nowrap tabular-nums">
            {isInt ? Math.round(animatedValue).toLocaleString() : animatedValue.toFixed(1)}
        </span>
    );
};

/**
 * Individual Stat Card - Optimized for grid layout
 */
const StatCard = ({ item, exerciseId }) => {
    const navigate = useNavigate();
    if (!item) return null;

    const total = Number(item.total_value ?? 0);
    const avg = Number(item.avg_value ?? 0);
    const max = Number(item.max_value ?? 0);
    const unit = item.unit || '';

    return (
        <div 
            onClick={() => navigate(`/exercise/${exerciseId}`)}
            className="bg-white/90 backdrop-blur-md p-5 rounded-[2.5rem] border border-gray-100/50 shadow-sm hover:border-blue-300 hover:shadow-xl hover:shadow-blue-50/30 transition-all flex flex-col group cursor-pointer active:scale-[0.98] min-h-[220px]" 
            dir="rtl"
        >
            <div className="flex items-center justify-between mb-4">
                <div className="flex flex-col text-right">
                    <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest mb-0.5">מדד</span>
                    <h3 className="text-xs font-black text-gray-900 truncate max-w-[140px]">
                        {item.name}
                    </h3>
                </div>
                <div className="w-8 h-8 bg-gray-50 rounded-xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                    <ChevronLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
                </div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center">
                <div className="text-4xl font-black text-gray-900 tracking-tighter leading-none group-hover:scale-105 transition-transform duration-500">
                    <AnimatedNumber value={total} />
                </div>
                <div className="flex items-center gap-1.5 mt-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{unit} סה"כ</span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-gray-50">
                <div className="flex flex-col items-center border-l border-gray-50">
                    <div className="flex items-center gap-1 text-gray-300 mb-0.5">
                        <ClockIcon size={10} />
                        <span className="text-[8px] font-black uppercase">ממוצע</span>
                    </div>
                    <div className="text-sm font-black text-gray-700">
                        <AnimatedNumber value={avg} />
                    </div>
                </div>

                <div className="flex flex-col items-center">
                    <div className="flex items-center gap-1 text-blue-400 mb-0.5">
                        <Award size={10} />
                        <span className="text-[8px] font-black uppercase">שיא</span>
                    </div>
                    <div className="text-sm font-black text-blue-600">
                        <AnimatedNumber value={max} />
                    </div>
                </div>
            </div>
        </div>
    );
};

/**
 * Main Section Container
 */
const FeaturedStats = ({ stats, loading }) => {
    // Filter: Only show exercises that actually have statistical data
    const activeStats = useMemo(() => {
        return stats?.filter(feature => feature.stats && feature.stats.length > 0) || [];
    }, [stats]);

    return (
        <div className="space-y-8">
            {/* Header Area */}
            <div className="flex items-center gap-4 px-2">
                <div className="w-10 h-10 bg-yellow-400 text-white rounded-xl flex items-center justify-center shadow-lg shadow-yellow-200">
                    <Star size={20} fill="currentColor" />
                </div>
                <div>
                    <h2 className="text-xl font-black text-gray-900 tracking-tighter leading-none">מדדים מובחרים</h2>
                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-1">Performance Overview</p>
                </div>
            </div>

            <div className="space-y-12">
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-56 bg-gray-50 rounded-[2.5rem] animate-pulse" />
                        ))}
                    </div>
                ) : activeStats.length > 0 ? (
                    activeStats.map(feature => (
                        <div key={feature.exercise_id} className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            
                            <div className="flex items-center justify-between px-2">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-50 text-blue-600 rounded-xl shadow-sm">
                                        <ExerciseIcon exerciseName={feature.exercise_name} size={50} />
                                    </div>
                                    <h3 className="font-black text-gray-900 tracking-tighter text-lg">
                                        {feature.exercise_name}
                                    </h3>
                                </div>
                                {feature.last_activity && (
                                    <div className="flex items-center gap-1.5 text-gray-400 bg-gray-50/50 px-3 py-1 rounded-full border border-gray-100">
                                        <TrendingUp size={12} />
                                        <span className="text-[9px] font-black uppercase">
                                             אימון אחרון ב- {new Date(feature.last_activity).toLocaleDateString('he-IL')}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Internal Grid - Maximize cards per row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                                {feature.stats.map((param, idx) => (
                                    <StatCard 
                                        key={idx} 
                                        item={param} 
                                        exerciseId={feature.exercise_id} 
                                    />
                                ))}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="py-16 text-center bg-gray-50/50 rounded-[3rem] border border-dashed border-gray-200 mx-2">
                        <TrendingUp size={40} className="mx-auto text-gray-200 mb-3" />
                        <p className="text-gray-400 font-bold text-xs italic tracking-wide">לא נמצאו נתונים להצגה</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FeaturedStats;
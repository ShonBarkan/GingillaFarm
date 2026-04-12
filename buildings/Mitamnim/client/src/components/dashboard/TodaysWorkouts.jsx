import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Play, Clock, Calendar } from 'lucide-react';
import ExerciseIcon from '../common/ExerciseIcon';

const HOUR_HEIGHT = 120; 
const START_DAY_HOUR = 6;
const END_DAY_HOUR = 23;

const TodaysWorkouts = ({ workouts, loading }) => {
    const [now, setNow] = useState(new Date());
    const scrollRef = useRef(null);
    const daysInHebrew = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (!loading && scrollRef.current) {
            const currentHour = now.getHours();
            if (currentHour >= START_DAY_HOUR && currentHour <= END_DAY_HOUR) {
                const scrollTarget = (currentHour - START_DAY_HOUR) * HOUR_HEIGHT;
                scrollRef.current.scrollTo({
                    top: scrollTarget - 20, 
                    behavior: 'smooth'
                });
            }
        }
    }, [loading]);

    const hoursRange = useMemo(() => {
        return Array.from({ length: END_DAY_HOUR - START_DAY_HOUR + 1 }, (_, i) => START_DAY_HOUR + i);
    }, []);

    const nowPosition = useMemo(() => {
        const h = now.getHours();
        const m = now.getMinutes();
        if (h < START_DAY_HOUR || h > END_DAY_HOUR) return null;
        return ((h - START_DAY_HOUR) * HOUR_HEIGHT) + (m / 60) * HOUR_HEIGHT;
    }, [now]);

    const getWorkoutTop = (timeStr) => {
        if (!timeStr) return null;
        const [h, m] = timeStr.split(':').map(Number);
        return (h - START_DAY_HOUR) * HOUR_HEIGHT + (m / 60) * HOUR_HEIGHT;
    };

    if (loading) {
        return (
            <div className="space-y-6 animate-pulse p-4">
                <div className="h-12 w-48 bg-black/10 rounded-2xl mb-10" />
                <div className="h-[360px] bg-black/5 rounded-[2.5rem]" />
            </div>
        );
    }

    const workoutCount = workouts?.length || 0;

    return (
        <div className="flex flex-col w-full h-full text-black" dir="rtl">
            
            {/* Header */}
            <div className="flex items-center gap-4 mb-10 px-2 shrink-0">
                <div className="w-14 h-14 bg-black text-white rounded-[1.5rem] flex items-center justify-center shadow-xl">
                    <Calendar size={28} />
                </div>
                <div>
                    <h2 className="text-3xl font-black text-black tracking-tighter leading-none">
                        הלו"ז ליום {daysInHebrew[now.getDay()]}
                    </h2>
                    <p className="text-[11px] text-black font-black uppercase tracking-widest mt-2">
                         {workoutCount === 0 ? "אין אימונים היום" : 
                          workoutCount === 1 ? "אימון אחד מתוכנן להיום" : 
                          `${workoutCount} אימונים מתוכננים להיום`}
                    </p>
                </div>
            </div>

            {/* Scrollable Journal Body */}
            <div 
                ref={scrollRef}
                className="relative overflow-y-auto custom-scrollbar rounded-[2.5rem] bg-transparent"
                style={{ height: `${3 * HOUR_HEIGHT}px` }} // מציג "חלון" של 3 שעות בכל רגע נתון, אבל ניתן לגלילה
            >
                <div className="relative" style={{ height: `${hoursRange.length * HOUR_HEIGHT}px` }}>
                    
                    {/* 1. Grid Lines - All Hours Rendered */}
                    {hoursRange.map((hour) => (
                        <div 
                            key={hour} 
                            className="absolute w-full flex items-start border-t border-black/10"
                            style={{ top: `${(hour - START_DAY_HOUR) * HOUR_HEIGHT}px`, height: `${HOUR_HEIGHT}px` }}
                        >
                            <span className="text-[12px] font-black text-black/40 tabular-nums -mt-3 pr-2">
                                {String(hour).padStart(2, '0')}:00
                            </span>
                        </div>
                    ))}

                    {/* 2. Now Indicator Bar */}
                    {nowPosition !== null && (
                        <div 
                            className="absolute left-0 right-0 z-30 flex items-center gap-3 pointer-events-none"
                            style={{ top: `${nowPosition}px` }}
                        >
                            <div className="w-3.5 h-3.5 bg-red-600 rounded-full shadow-[0_0_15px_rgba(220,38,38,0.6)] border-2 border-white" />
                            <div className="flex-1 h-0.5 bg-red-600/60" />
                            <div className="bg-red-600 text-white text-[10px] font-black px-2.5 py-1 rounded-lg shadow-lg uppercase tracking-tighter">
                                עכשיו
                            </div>
                        </div>
                    )}

                    {/* 3. All Workouts */}
                    {workouts?.map((workout) => {
                        const top = getWorkoutTop(workout.expected_time);
                        if (top === null) return null;

                        return (
                            <div 
                                key={workout.id}
                                className="absolute right-14 left-0 z-20 group"
                                style={{ top: `${top}px` }}
                            >
                                <div className="flex items-center justify-between p-4 rounded-[2rem] transition-all bg-white border-2 border-black/5 shadow-[0_10px_30px_rgba(0,0,0,0.08)] hover:border-black hover:shadow-2xl">
                                    <div className="flex items-center gap-4 min-w-0">
                                        <div className="shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg">
                                            <ExerciseIcon exerciseName={workout.parent_exercise_name || workout.name} size={22} />
                                        </div>
                                        <div className="flex flex-col min-w-0 text-right">
                                            <h3 className="text-sm font-black truncate tracking-tight text-black">
                                                {workout.name}
                                            </h3>
                                            <div className="flex items-center gap-1 mt-0.5">
                                                <Clock size={11} className="text-black" />
                                                <span className="text-[11px] font-black tabular-nums text-black">
                                                    {workout.expected_time}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <button 
                                        onClick={() => window.location.href = `/workouts/active?templateId=${workout.id}`}
                                        className="w-11 h-11 bg-black text-white rounded-[1.2rem] flex items-center justify-center hover:bg-blue-600 transition-all active:scale-95 shadow-lg"
                                    >
                                        <Play size={18} className="ml-1" fill="currentColor" />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
            
            {/* Scroll Hint */}
            <div className="mt-4 px-2 flex justify-between items-center opacity-20">
                 <span className="text-[9px] font-black uppercase tracking-widest">ניתן לגלול ללו"ז המלא</span>
                 <div className="flex gap-1">
                    <div className="w-1 h-1 bg-black rounded-full" />
                    <div className="w-1 h-1 bg-black rounded-full" />
                    <div className="w-1 h-1 bg-black rounded-full" />
                 </div>
            </div>
        </div>
    );
};

export default TodaysWorkouts;
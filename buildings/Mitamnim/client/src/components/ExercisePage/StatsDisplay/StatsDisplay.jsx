import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import { mitamnimService } from '../../../services/mitamnimService';
import { useExercise } from '../../../context/ExerciseContext';
import StatCard from './StatCard';
import TrendChart from './TrendChart';

const StatsDisplay = ({ exerciseId, timeRange, rangeDates }) => {
    const { exercise, stats, loading: contextLoading, refreshTrigger } = useExercise();
    const [trendLogs, setTrendLogs] = useState([]);
    const [loadingTrend, setLoadingTrend] = useState(false);

    const fetchTrend = useCallback(async () => {
        if (!exerciseId) return;
        setLoadingTrend(true);
        const { start, end } = rangeDates || {};
        try {
            const data = await mitamnimService.getTrendData(exerciseId, start, end);
            setTrendLogs(data || []);
        } catch (e) {
            console.error("Trend fetch failed:", e);
        } finally {
            setLoadingTrend(false);
        }
    }, [exerciseId, rangeDates]);

    useEffect(() => {
        fetchTrend();
    }, [fetchTrend, refreshTrigger]);

    const displayStats = useMemo(() => {
        if (!stats?.parameters) return [];
        return stats.parameters.filter(p => p.name && p.name.trim() !== "");
    }, [stats]);

    const hasAnyData = displayStats.length > 0 || trendLogs.length > 0;
    if (!hasAnyData && !loadingTrend && !contextLoading) return null;

    return (
        <div className="space-y-8 animate-in fade-in duration-700" dir="rtl">
            
            {displayStats.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-auto-fit gap-6 px-2" 
                     style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
                    {displayStats.map((item) => (
                        <StatCard 
                            key={`${item.name}-${item.parameter_id}`} 
                            item={item} 
                        />
                    ))}
                </div>
            )}

            {(trendLogs.length > 0 || loadingTrend) && (
                <div className="bg-white/80 backdrop-blur-md p-6 rounded-[3.5rem] border border-gray-100/50 shadow-sm min-h-[450px] relative overflow-hidden transition-all duration-500">
                    {(loadingTrend || contextLoading) && (
                        <div className="absolute inset-0 bg-white/60 backdrop-blur-md z-30 flex flex-col items-center justify-center rounded-[3.5rem]">
                            <div className="p-4 bg-white rounded-2xl shadow-xl mb-3">
                                <Loader2 className="animate-spin text-blue-600" size={32} />
                            </div>
                            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">מעבד נתונים...</p>
                        </div>
                    )}
                    
                    {trendLogs.length > 0 && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
                            <div className="mb-6 px-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                                    <h4 className="text-lg font-black text-gray-900 tracking-tighter">מגמת שיפור</h4>
                                </div>
                                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                                    ויזואליזציה עבור {exercise?.name || 'התרגיל'}
                                </p>
                            </div>
                            
                            <div className="w-full h-[350px]">
                                <TrendChart 
                                    logs={trendLogs} 
                                    timeRange={timeRange}
                                    parameters={exercise?.active_params || []} 
                                />
                            </div>

                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default StatsDisplay;
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { BarChart3, Loader2 } from 'lucide-react';
import { mitamnimService } from '../../../services/mitamnimService';
import { useExercise } from '../../../context/ExerciseContext';
import TimeRangePicker from './TimeRangePicker';
import StatCard from './StatCard';
import TrendChart from './TrendChart';

const StatsDisplay = ({ exerciseId }) => {
    const { exercise, stats, loading: contextLoading, refreshTrigger } = useExercise();
    
    const [trendLogs, setTrendLogs] = useState([]);
    const [loadingTrend, setLoadingTrend] = useState(false);
    const [timeRange, setTimeRange] = useState('all');

    const getRangeDates = useCallback(() => {
        const start = new Date();
        const end = new Date();
        end.setHours(23, 59, 59, 999);

        if (timeRange === 'day') start.setHours(0, 0, 0, 0);
        else if (timeRange === 'week') start.setDate(start.getDate() - 7);
        else if (timeRange === 'month') start.setMonth(start.getMonth() - 1);
        else if (timeRange === 'all') return { start: null, end: null };

        return {
            start: start.toISOString().split('T')[0],
            end: end.toISOString().split('T')[0]
        };
    }, [timeRange]);

    const fetchTrend = useCallback(async () => {
        if (!exerciseId) return;
        setLoadingTrend(true);
        const { start, end } = getRangeDates();
        try {
            const data = await mitamnimService.getTrendData(exerciseId, start, end);
            setTrendLogs(data || []);
        } catch (e) {
            console.error("Trend fetch failed:", e);
        } finally {
            setLoadingTrend(false);
        }
    }, [exerciseId, getRangeDates]);

    useEffect(() => {
        fetchTrend();
    }, [fetchTrend, refreshTrigger]);

    const displayStats = useMemo(() => {
        if (!stats?.parameters) return [];
        return stats.parameters.filter(p => p.name && p.name.trim() !== "");
    }, [stats]);

    if (contextLoading && !stats) {
        return (
            <div className="space-y-8 animate-pulse">
                <div className="h-10 w-full flex justify-between items-center px-2">
                    <div className="h-8 w-48 bg-gray-100 rounded-xl" />
                    <div className="h-4 w-32 bg-gray-50 rounded-full" />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-32 bg-gray-50 rounded-[2rem]" />
                    ))}
                </div>
                <div className="h-[400px] bg-gray-50 rounded-[3rem]" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500" dir="rtl">
            <div className="h-12 flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
                <TimeRangePicker currentRange={timeRange} onRangeChange={setTimeRange} />
                
                <div className="flex items-center gap-2 text-gray-400">
                    {loadingTrend ? <Loader2 size={14} className="animate-spin" /> : <BarChart3 size={14} />}
                    <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
                        {exercise?.name} • Data Analysis
                    </span>
                </div>
            </div>

            <div className="min-h-[128px]">
                {displayStats.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {displayStats.map((item) => (
                            <StatCard 
                                key={`${item.name}-${item.parameter_id}`} 
                                item={item} 
                            />
                        ))}
                    </div>
                ) : !contextLoading && (
                    <div className="h-32 flex items-center justify-center bg-gray-50 rounded-[2.5rem] border border-dashed border-gray-200">
                        <p className="text-gray-400 font-bold text-xs uppercase tracking-tighter">No stats available yet</p>
                    </div>
                )}
            </div>

            <div className="bg-white p-6 rounded-[3rem] border border-gray-100 shadow-sm min-h-[450px] relative">
                {loadingTrend && (
                    <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] z-10 flex items-center justify-center rounded-[3rem]">
                        <Loader2 className="animate-spin text-blue-600" size={32} />
                    </div>
                )}
                
                {trendLogs.length > 0 ? (
                    <TrendChart 
                        logs={trendLogs} 
                        timeRange={timeRange}
                        parameters={exercise?.active_params || []} 
                    />
                ) : !loadingTrend && (
                    <div className="h-[350px] flex flex-col items-center justify-center text-center">
                        <BarChart3 size={48} className="text-gray-100 mb-4" />
                        <p className="text-gray-400 font-bold">Not enough data to display trend</p>
                        <p className="text-gray-300 text-[10px] font-black uppercase tracking-widest mt-1">Gingilla Farm • Data Engine</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StatsDisplay;
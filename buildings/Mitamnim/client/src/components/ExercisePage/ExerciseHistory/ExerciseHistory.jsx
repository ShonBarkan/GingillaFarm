import React, { useMemo } from 'react';
import { History, RefreshCw, Activity } from 'lucide-react';
import { useExercise } from '../../../context/ExerciseContext';
import ExerciseLogCard from './ExerciseLogCard';

const ExerciseHistory = ({ exerciseId, onDuplicate }) => {
    const { logs, loading, refreshAll } = useExercise();

    const sortedLogs = useMemo(() => {
        return [...logs].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }, [logs]);

    return (
        <div className="mt-12 space-y-8" dir="rtl">
            
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-blue-600 rounded-[1.2rem] flex items-center justify-center text-white shadow-xl shadow-blue-100">
                        <History size={28} />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-gray-900 leading-tight">היסטוריית ביצועים</h2>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            <p className="text-xs font-extrabold text-gray-400 uppercase tracking-widest">
                                {logs.length} תיעודים נמצאו
                            </p>
                        </div>
                    </div>
                </div>
                
                <button 
                    onClick={refreshAll}
                    disabled={loading}
                    className="group p-3.5 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all shadow-sm disabled:opacity-50"
                >
                    <RefreshCw size={22} className={`${loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
                </button>
            </div>

            <div className="relative">
                {sortedLogs.length > 0 && (
                    <div className="absolute right-[2.45rem] top-0 bottom-0 w-1 bg-gradient-to-b from-blue-50 via-gray-50 to-transparent -z-10 hidden lg:block" />
                )}

                {loading && sortedLogs.length === 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-44 bg-gray-50 animate-pulse rounded-[2.5rem] border border-gray-100" />
                        ))}
                    </div>
                ) : sortedLogs.length === 0 ? (
                    <div className="bg-gray-50/50 border-4 border-dashed border-gray-100 rounded-[3.5rem] p-20 text-center">
                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                            <Activity className="text-gray-200" size={40} />
                        </div>
                        <p className="text-2xl font-black text-gray-400">טרם בוצעו אימונים</p>
                        <p className="text-gray-300 font-bold mt-2">הביצועים שלך יופיעו כאן ברגע שתתחיל לתעד</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {sortedLogs.map((log) => (
                            <ExerciseLogCard 
                                key={log.id} 
                                log={log} 
                                showExerciseName={true} 
                                onRefresh={refreshAll}
                                onDuplicate={onDuplicate}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExerciseHistory;
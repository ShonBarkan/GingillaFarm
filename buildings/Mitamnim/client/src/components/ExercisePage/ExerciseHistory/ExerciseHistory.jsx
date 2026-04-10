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
        <div className="mt-12 p-8 bg-white/40 backdrop-blur-2xl border border-white/20 rounded-[3.5rem] shadow-2xl animate-in fade-in duration-700" dir="rtl">
            
            {/* Header Section - נקי ללא רקע משלו */}
            <div className="flex items-center justify-between mb-10 pb-8 border-b border-white/10">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-blue-600 text-white rounded-[1.2rem] flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <History size={28} />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-gray-900 leading-tight">היסטוריית ביצועים</h2>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest bg-white/40 px-3 py-1 rounded-full backdrop-blur-sm">
                                {logs.length} תיעודים נמצאו
                            </p>
                        </div>
                    </div>
                </div>
                
                <button 
                    onClick={refreshAll}
                    disabled={loading}
                    className="group p-3.5 bg-white/40 hover:bg-white/80 border border-white/20 rounded-2xl text-gray-500 hover:text-blue-600 transition-all shadow-sm backdrop-blur-md disabled:opacity-50"
                >
                    <RefreshCw size={22} className={`${loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
                </button>
            </div>

            <div className="relative">
                {/* Timeline Vertical Line - פס זכוכית עדין שרץ לאורך הכרטיסים */}
                {sortedLogs.length > 0 && (
                    <div className="absolute right-[2.45rem] top-0 bottom-0 w-1 bg-white/10 backdrop-blur-sm -z-10 hidden lg:block rounded-full" />
                )}

                {loading && sortedLogs.length === 0 ? (
                    /* Skeleton Loading - שכבות חלביות */
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-44 bg-white/20 backdrop-blur-md animate-pulse rounded-[2.5rem] border border-white/10" />
                        ))}
                    </div>
                ) : sortedLogs.length === 0 ? (
                    /* Empty State - תיבת זכוכית פנימית עדינה */
                    <div className="bg-white/20 backdrop-blur-md border-4 border-dashed border-white/10 rounded-[3.5rem] p-20 text-center shadow-inner">
                        <div className="w-20 h-20 bg-white/40 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-white/10">
                            <Activity className="text-gray-400" size={40} />
                        </div>
                        <p className="text-2xl font-black text-gray-900/60">טרם בוצעו אימונים</p>
                        <p className="text-gray-500/80 font-bold mt-2">הביצועים שלך יופיעו כאן ברגע שתתחיל לתעד</p>
                    </div>
                ) : (
                    /* Cards Grid */
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
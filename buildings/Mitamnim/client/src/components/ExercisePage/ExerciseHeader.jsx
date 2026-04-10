import React from 'react';
import { PlusCircle } from 'lucide-react';
import ExerciseIcon from '../common/ExerciseIcon';

const ExerciseHeader = ({ exercise, onOpenModal }) => {
    return (
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 p-8 rounded-[3.5rem] bg-white/30 backdrop-blur-xl border border-white/20 shadow-2xl animate-in fade-in duration-700" dir="rtl">
            <div className="flex items-center gap-6">
                <div className="shrink-0">
                    {/* האייקון מקבל הילה של זכוכית חלבית */}
                    <ExerciseIcon
                        exerciseName={exercise.name} 
                        size={120} 
                        className="rounded-[2.5rem] shadow-2xl shadow-blue-900/10 border-4 border-white/80 bg-white/50 backdrop-blur-md"
                    />
                </div>
                
                <div className="space-y-3">
                    <h1 className="text-5xl font-black text-gray-900 tracking-tighter leading-none drop-shadow-sm">
                        {exercise.name}
                    </h1>
                    {/* פס דקורטיבי כחול בולט */}
                    <div className="h-2 w-24 bg-blue-600 rounded-full shadow-lg shadow-blue-500/30"></div>
                </div>
            </div>

            <button 
                onClick={onOpenModal} 
                className="flex items-center justify-center gap-3 px-10 py-5 bg-blue-600/90 hover:bg-blue-600 text-white rounded-[2rem] font-black shadow-2xl shadow-blue-500/20 backdrop-blur-md transform hover:scale-[1.05] active:scale-[0.95] transition-all border border-white/10"
            >
                <PlusCircle size={22} />
                <span className="text-lg">תיעוד ביצוע</span>
            </button>
        </div>
    );
};

export default ExerciseHeader;
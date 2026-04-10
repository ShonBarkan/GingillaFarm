import React from 'react';
import { PlusCircle } from 'lucide-react';
import ExerciseIcon from '../common/ExerciseIcon';

const ExerciseHeader = ({ exercise, onOpenModal }) => {
    return (
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 animate-in fade-in duration-700">
            <div className="flex items-center gap-6">
                <div className="shrink-0">
                    <ExerciseIcon
                        exerciseName={exercise.name} 
                        size={120} 
                        className="rounded-[2.5rem] shadow-2xl shadow-blue-100/50 border-4 border-white"
                    />
                </div>
                
                <div className="space-y-2">
                    <h1 className="text-5xl font-black text-gray-900 tracking-tight leading-none">
                        {exercise.name}
                    </h1>
                    <div className="h-2 w-24 bg-blue-600 rounded-full shadow-sm shadow-blue-200"></div>
                </div>
            </div>

            <button 
                onClick={onOpenModal} 
                className="flex items-center justify-center gap-3 px-10 py-5 bg-blue-600 text-white rounded-[2rem] font-black shadow-2xl shadow-blue-200 transform hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
                <PlusCircle size={22} />
                <span>תיעוד ביצוע</span>
            </button>
        </div>
    );
};

export default ExerciseHeader;
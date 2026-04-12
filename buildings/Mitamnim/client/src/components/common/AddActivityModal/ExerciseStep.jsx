import React from 'react';
import { ChevronLeft } from 'lucide-react';
import ExerciseIcon from '../../common/ExerciseIcon';

const ExerciseStep = ({ children, onSelect }) => (
    <div className="grid grid-cols-1 gap-4 animate-in slide-in-from-bottom-4 w-full">
        {children.map(child => (
            <button 
                key={child.id}
                onClick={() => onSelect(child)}
                className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-[2rem] hover:border-blue-200 transition-all group text-right shadow-sm active:scale-[0.98]"
            >
                <div className="flex items-center gap-4">
                    {/* אייקון התרגיל מתוך שירות האיקונים */}
                    <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:bg-blue-50 transition-colors shrink-0 overflow-hidden p-2">
                        <ExerciseIcon 
                            exerciseName={child.name} 
                            size={32} 
                        />
                    </div>
                    
                    <div className="flex flex-col">
                        <span className="text-lg font-black text-gray-800 group-hover:text-blue-600 transition-colors leading-tight">
                            {child.name}
                        </span>
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">
                            לחץ לבחירה
                        </span>
                    </div>
                </div>

                <ChevronLeft className="text-gray-300 group-hover:text-blue-500 transition-colors shrink-0" />
            </button>
        ))}
    </div>
);

export default ExerciseStep;
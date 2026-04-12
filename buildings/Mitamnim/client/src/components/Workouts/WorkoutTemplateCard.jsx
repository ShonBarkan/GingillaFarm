import React, { useMemo } from 'react';
import { Play, Edit2, ChevronLeft } from 'lucide-react';
import ExerciseIcon from '../common/ExerciseIcon';
import { useExercise } from '../../context/ExerciseContext';

const WorkoutTemplateCard = ({ template, onStart, onEdit }) => {
    const { allExercises } = useExercise();
    const exercisesPreview = template.exercises_config || [];
    const exerciseCount = exercisesPreview.length;

    // Fetch the parent exercise name to get the correct category icon
    const parentName = useMemo(() => {
        if (!template.parent_exercise_id) return null;
        const parent = allExercises.find(ex => ex.id === template.parent_exercise_id);
        return parent ? parent.name : null;
    }, [template.parent_exercise_id, allExercises]);

    return (
        <div className="relative bg-white border border-gray-100 p-5 md:p-6 rounded-[2.5rem] shadow-sm hover:shadow-xl hover:border-blue-100 transition-all group flex flex-col gap-4">
            
            {/* Top Row: Dynamic Category Icon & Actions */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-900  p-2.5">
                        <ExerciseIcon 
                            exerciseName={parentName || template.name} 
                            size={28} 
                        />
                    </div>
                    <div className="flex flex-col">
                        <h3 className="text-lg font-black text-gray-900 leading-tight truncate max-w-[150px] sm:max-w-[200px]">
                            {template.name}
                        </h3>
                        {parentName && (
                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                                {parentName}
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex gap-2">
                    <button 
                        onClick={(e) => { e.stopPropagation(); onEdit(); }}
                        className="p-2.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all active:scale-90"
                    >
                        <Edit2 size={18} />
                    </button>
                </div>
            </div>

            {/* Middle Section: Description & Preview */}
            <div className="space-y-3">
                {template.description && (
                    <p className="text-gray-400 font-bold text-xs line-clamp-1 italic">
                        {template.description}
                    </p>
                )}

                <div className="flex flex-wrap gap-1.5">
                    {exercisesPreview.slice(0, 3).map((ex, idx) => (
                        <div key={idx} className="bg-gray-50 px-2.5 py-1 rounded-lg text-[9px] font-black text-gray-500 border border-transparent group-hover:border-blue-50 transition-colors">
                            {ex.exercise_name || "תרגיל"}
                        </div>
                    ))}
                    {exerciseCount > 3 && (
                        <div className="bg-blue-50/50 px-2.5 py-1 rounded-lg text-[9px] font-black text-blue-400">
                            +{exerciseCount - 3} נוספים
                        </div>
                    )}
                </div>
            </div>

            {/* Primary Action Button */}
            <button 
                onClick={onStart}
                className="w-full flex items-center justify-center gap-2 py-3 bg-gray-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-blue-600 transition-all active:scale-[0.98] shadow-lg shadow-gray-200 mt-auto"
            >
                התחל אימון <ChevronLeft size={14} />
            </button>
        </div>
    );
};

export default WorkoutTemplateCard;
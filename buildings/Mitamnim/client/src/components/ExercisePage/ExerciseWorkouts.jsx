import React, { useState, useEffect } from 'react';
import { Play, Dumbbell, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { mitamnimService } from '../../services/mitamnimService';
import { useExercise } from '../../context/ExerciseContext';

const ExerciseWorkouts = ({ exerciseId }) => {
    const navigate = useNavigate();
    const { allExercises } = useExercise();
    const [templates, setTemplates] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadWorkouts = async () => {
            if (!exerciseId || !allExercises.length) return;
            
            setIsLoading(true);
            try {
                const relevantIds = mitamnimService.getRecursiveExerciseIds(exerciseId, allExercises);
                const data = await mitamnimService.getWorkoutTemplates({ 
                    parent_exercise_id: relevantIds 
                });
                setTemplates(data);
            } catch (error) {
                console.error("Failed to load workout templates:", error);
            } finally {
                setIsLoading(false);
            }
        };

        loadWorkouts();
    }, [exerciseId, allExercises]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-6 bg-white/50 rounded-[2rem] border border-gray-100">
                <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
            </div>
        );
    }

    if (templates.length === 0) return null;

    return (
        <div className="flex flex-col gap-4 animate-in fade-in duration-700 w-full" dir="rtl">
            {/* Header Area */}
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                    <Dumbbell size={16} className="text-blue-500" />
                    <h3 className="font-black text-gray-400 text-[10px] uppercase tracking-widest">
                        תוכניות זמינות
                    </h3>
                </div>
                <span className="text-[9px] font-black bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                    {templates.length}
                </span>
            </div>

            {/* Scrollable Container for Workouts */}
            <div className="flex flex-col gap-3 max-h-[350px] overflow-y-auto pr-1 custom-scrollbar">
                {templates.map((template) => (
                    <div 
                        key={template.id}
                        className="bg-white border border-gray-100 rounded-[2rem] p-5 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-50/50 transition-all group flex flex-col gap-3 shrink-0"
                    >
                        <div className="flex justify-between items-start gap-2">
                            <div className="flex flex-col gap-1 min-w-0">
                                <h4 className="font-black text-sm text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                                    {template.name}
                                </h4>
                                {template.parent_exercise_id !== exerciseId && (
                                    <span className="text-[8px] font-bold text-gray-400">
                                        מרכיב בן
                                    </span>
                                )}
                            </div>
                            <span className="text-[8px] font-black text-blue-500 bg-blue-50 px-2 py-1 rounded-lg uppercase shrink-0">
                                {template.type || 'אימון'}
                            </span>
                        </div>

                        {template.description && (
                            <p className="text-gray-400 text-[10px] font-medium leading-relaxed line-clamp-2">
                                {template.description}
                            </p>
                        )}

                        <button
                            onClick={() => navigate('/active-workout', { state: { template } })}
                            className="w-full flex items-center justify-center gap-2 py-2.5 bg-gray-900 text-white rounded-xl font-black text-[11px] hover:bg-blue-600 hover:shadow-md active:scale-95 transition-all mt-1"
                        >
                            <Play size={12} fill="currentColor" />
                            <span>התחל אימון</span>
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ExerciseWorkouts;
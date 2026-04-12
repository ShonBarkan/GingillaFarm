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
            <div className="bg-white/80 backdrop-blur-md p-6 rounded-[3.5rem] border border-gray-100/50 shadow-sm flex items-center justify-center min-h-[100px]">
                <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
            </div>
        );
    }

    if (templates.length === 0) return null;

    return (
        <div className="bg-white/80 backdrop-blur-md p-6 rounded-[3.5rem] border border-gray-100/50 shadow-sm flex flex-col gap-5 animate-in fade-in duration-700 w-full" dir="rtl">
            
            {/* Header Area */}
            <div className="flex items-center justify-between px-2 border-b border-gray-100/50 pb-4">
                <div className="flex items-center gap-2">
                    <Dumbbell size={18} className="text-blue-600" />
                    <h3 className="font-black text-gray-900 text-xs uppercase tracking-widest">
                        תוכניות זמינות
                    </h3>
                </div>
                <span className="text-[10px] font-black bg-blue-50 text-blue-600 px-3 py-1 rounded-full border border-blue-100/30">
                    {templates.length}
                </span>
            </div>

            {/* List Area - Simplified Rows */}
            <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
                {templates.map((template) => (
                    <div 
                        key={template.id}
                        className="flex items-center justify-between p-3 bg-gray-50/50 hover:bg-white border border-transparent hover:border-blue-100 rounded-2xl transition-all group"
                    >
                        <div className="flex flex-col min-w-0 flex-1 px-2">
                            {/* Increased text size to text-base and added font-black for more presence */}
                            <span className="font-black text-base text-gray-800 truncate group-hover:text-blue-600 transition-colors">
                                {template.name}
                            </span>
                            
                            {template.parent_exercise_id !== exerciseId && (
                                <span className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter">
                                    מרכיב בן
                                </span>
                            )}
                        </div>

                        {/* Slightly smaller button (w-8 h-8) for a more refined look */}
                        <button
                            onClick={() => navigate(`/workouts/active?templateId=${template.id}&name=${encodeURIComponent(template.name)}`)}
                            className="flex items-center justify-center w-8 h-8 bg-gray-900 text-white rounded-lg hover:bg-blue-600 hover:scale-110 active:scale-90 transition-all shadow-sm shrink-0"
                            title="התחל אימון"
                        >
                            <Play size={12} fill="currentColor" className="mr-0.5" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ExerciseWorkouts;
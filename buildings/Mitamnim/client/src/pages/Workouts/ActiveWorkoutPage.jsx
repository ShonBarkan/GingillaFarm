import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Reorder, AnimatePresence, motion } from 'framer-motion';
import { useWorkout } from '../../context/WorkoutContext';
import { mitamnimService } from '../../services/mitamnimService';
import WorkoutTimer from '../../components/Workouts/ActiveWorkout/WorkoutTimer';
import ActiveExerciseCard from '../../components/Workouts/ActiveWorkout/ActiveExerciseCard';
import SessionParameterModal from '../../components/Workouts/ActiveWorkout/SessionParameterModal';
import { Save, XCircle, Plus, Info, Search, X, Loader2 } from 'lucide-react';

/**
 * Fallback UUID generator for insecure contexts
 */
const generateSafeId = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
};

const ActiveWorkoutPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { startWorkout, finishWorkout, cancelWorkout, elapsedTime } = useWorkout();
    
    const [workoutData, setWorkoutData] = useState(null);
    const [templateInfo, setTemplateInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isFinishModalOpen, setIsFinishModalOpen] = useState(false);
    
    const [isAddExerciseOpen, setIsAddExerciseOpen] = useState(false);
    const [availableExercises, setAvailableExercises] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");

    /**
     * Initial Load & State Recovery
     */
    useEffect(() => {
        const initWorkout = async () => {
            const savedWorkout = localStorage.getItem('active_workout_state');
            const templateId = searchParams.get('templateId');

            try {
                let tInfo = null;
                if (templateId) {
                    tInfo = await mitamnimService.getWorkoutTemplateById(templateId);
                    setTemplateInfo(tInfo);
                    
                    if (tInfo.parent_exercise_id) {
                        const siblings = await mitamnimService.getExerciseTree(tInfo.parent_exercise_id);
                        setAvailableExercises(siblings);
                    }
                }

                if (savedWorkout) {
                    setWorkoutData(JSON.parse(savedWorkout));
                } else {
                    const sessionId = await startWorkout(templateId);
                    let initialExercises = [];

                    if (tInfo && tInfo.exercises_config) {
                        initialExercises = tInfo.exercises_config.map(exConfig => ({
                            ...exConfig,
                            instanceId: generateSafeId(),
                            sets: Array.from({ length: exConfig.sets || 1 }).map(() => ({
                                id: generateSafeId(),
                                completed: false,
                                performance: (exConfig.parameters || []).reduce((acc, p) => ({
                                    ...acc,
                                    [p.parameter_name || p.name]: p.default_value || ""
                                }), {})
                            }))
                        }));
                    }

                    const newState = { sessionId, exercises: initialExercises };
                    setWorkoutData(newState);
                    localStorage.setItem('active_workout_state', JSON.stringify(newState));
                }
            } catch (err) {
                console.error("Workout initialization failed:", err);
            } finally {
                setLoading(false);
            }
        };
        initWorkout();
    }, [searchParams, startWorkout]);

    useEffect(() => {
        if (workoutData) {
            localStorage.setItem('active_workout_state', JSON.stringify(workoutData));
        }
    }, [workoutData]);

    /**
     * Actions
     */
    const handleAddManualExercise = async (exercise) => {
        try {
            const fullEx = await mitamnimService.getExerciseById(exercise.id);
            const sourceParams = fullEx.active_params || [];

            const newExEntry = {
                exercise_id: fullEx.id,
                exercise_name: fullEx.name,
                instanceId: generateSafeId(),
                sets: [{
                    id: generateSafeId(),
                    completed: false,
                    performance: sourceParams.reduce((acc, p) => ({
                        ...acc,
                        [p.name]: ""
                    }), {})
                }]
            };
            
            setWorkoutData(prev => ({
                ...prev,
                exercises: [...prev.exercises, newExEntry]
            }));
            setIsAddExerciseOpen(false);
            setSearchQuery("");
        } catch (e) {
            console.error("Failed to add exercise", e);
        }
    };
    
    const handleUpdateExercise = useCallback((exerciseIdx, updatedExercise) => {
        setWorkoutData(prev => {
            const newExercises = [...prev.exercises];
            newExercises[exerciseIdx] = updatedExercise;
            return { ...prev, exercises: newExercises };
        });
    }, []);

    const handleReorderExercises = (newOrder) => {
        setWorkoutData(prev => ({ ...prev, exercises: newOrder }));
    };

    const handleRemoveExercise = (index) => {
        if (window.confirm("Remove this exercise from the workout?")) {
            setWorkoutData(prev => ({
                ...prev,
                exercises: prev.exercises.filter((_, i) => i !== index)
            }));
        }
    };

    const handleCancel = () => {
        if (window.confirm("Cancel workout? All unsaved data will be lost.")) {
            cancelWorkout();
            localStorage.removeItem('active_workout_state');
            navigate('/workouts');
        }
    };

    const onFinishConfirm = async (modalData) => {
        if (!workoutData) return;
        try {
            const allLogs = [];
            workoutData.exercises.forEach(ex => {
                ex.sets.forEach(set => {
                    if (set.completed) {
                        allLogs.push({
                            exercise_id: ex.exercise_id,
                            performance_data: set.performance,
                            is_manual: false
                        });
                    }
                });
            });
            await finishWorkout(modalData, allLogs);
            localStorage.removeItem('active_workout_state');
            setIsFinishModalOpen(false);
            navigate('/workouts');
        } catch (err) {
            console.error("Failed to finish workout:", err);
            alert("Error saving workout. Please try again.");
        }
    };

    if (loading || !workoutData) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-4">
                <Loader2 className="animate-spin text-blue-600" size={40} />
                <p className="font-black text-gray-400 uppercase tracking-widest text-xs">Loading Arena...</p>
            </div>
        );
    }

    const filteredAvailable = availableExercises.filter(ex => 
        ex.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8 pb-40" dir="rtl">
            
            <div className="sticky top-4 z-50 mb-10 px-2 md:px-4">
                <div className="bg-white/95 backdrop-blur-xl p-3 md:p-4 rounded-[3rem] shadow-2xl border border-gray-100 flex items-center justify-between gap-4 transition-all duration-300">
                    
                    <div className="flex items-center gap-3 md:gap-5 border-l border-gray-100 pl-4 shrink-0">
                        <button 
                            onClick={handleCancel} 
                            className="p-2.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all active:scale-90"
                            title="Cancel Workout"
                        >
                            <XCircle size={22} />
                        </button>
                        
                        <div className="flex flex-col text-right min-w-0">
                            <h1 className="text-xl md:text-lg font-black text-gray-900 tracking-tighter truncate max-w-[120px] md:max-w-[200px] leading-tight">
                                {templateInfo?.name || "Personal Workout"}
                            </h1>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-[8px] font-black text-blue-500 uppercase tracking-widest">Time:</span>
                                <div className="text-xs md:text-sm font-black text-gray-700 tabular-nums">
                                    <WorkoutTimer />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => setIsAddExerciseOpen(true)}
                            className="flex items-center gap-2 bg-gray-50 text-gray-700 px-3 md:px-4 py-2.5 rounded-2xl font-black border border-gray-100 hover:border-blue-200 hover:bg-white transition-all group active:scale-95 shadow-sm"
                        >
                            <Plus size={16} className="text-blue-600 group-hover:rotate-90 transition-transform" />
                            <span className="hidden sm:inline text-[11px]">Add Exercise</span>
                        </button>

                        <button 
                            onClick={() => setIsFinishModalOpen(true)}
                            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 md:px-6 md:py-3.5 rounded-2xl font-black shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95 shrink-0"
                        >
                            <Save size={16} />
                            <span className="text-[11px] md:text-sm">Finish Workout</span>
                        </button>
                    </div>
                </div>
            </div>

            <Reorder.Group 
                axis="y" 
                values={workoutData.exercises} 
                onReorder={handleReorderExercises} 
                className="space-y-6"
            >
                <AnimatePresence initial={false} mode="popLayout">
                    {workoutData.exercises.map((exercise, idx) => (
                        <Reorder.Item 
                            key={exercise.instanceId} 
                            value={exercise}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            whileDrag={{ 
                                scale: 1.02, 
                                boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)",
                                zIndex: 50 
                            }}
                            className="relative"
                        >
                            <ActiveExerciseCard 
                                exercise={exercise}
                                index={idx}
                                onUpdateExercise={handleUpdateExercise}
                                onRemoveExercise={handleRemoveExercise}
                            />
                        </Reorder.Item>
                    ))}
                </AnimatePresence>
            </Reorder.Group>

            <AnimatePresence>
                {isAddExerciseOpen && (
                    <motion.div 
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed inset-0 z-[200] bg-white flex flex-col"
                    >
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0">
                            <h3 className="text-2xl font-black text-gray-900 tracking-tighter">Add Exercise</h3>
                            <button 
                                onClick={() => setIsAddExerciseOpen(false)} 
                                className="p-3 bg-gray-100 rounded-2xl text-gray-500 hover:bg-gray-200 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        
                        <div className="p-6 bg-gray-50/50">
                            <div className="relative group">
                                <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                                <input 
                                    type="text"
                                    placeholder="Search exercise..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-white border-2 border-transparent focus:border-blue-100 rounded-2xl py-4 pr-12 pl-4 font-bold text-gray-900 shadow-sm outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar">
                            {filteredAvailable.map(ex => (
                                <button
                                    key={ex.id}
                                    onClick={() => handleAddManualExercise(ex)}
                                    className="w-full p-5 bg-white border border-gray-100 rounded-[1.5rem] flex items-center justify-between hover:border-blue-500 hover:bg-blue-50/30 transition-all text-right group shadow-sm active:scale-[0.98]"
                                >
                                    <div className="flex flex-col">
                                        <p className="font-black text-gray-900 group-hover:text-blue-600 transition-colors">{ex.name}</p>
                                        <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest mt-0.5">Click for quick add</p>
                                    </div>
                                    <div className="p-2 bg-gray-50 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-all">
                                        <Plus size={18} />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <SessionParameterModal 
                isOpen={isFinishModalOpen}
                onClose={() => setIsFinishModalOpen(false)}
                onConfirm={onFinishConfirm}
                elapsedTime={elapsedTime}
                sessionParams={templateInfo?.session_required_params || []}
            />
        </div>
    );
};

export default ActiveWorkoutPage;
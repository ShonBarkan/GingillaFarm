import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Reorder, AnimatePresence, motion } from 'framer-motion';
import { useWorkout } from '../../context/WorkoutContext';
import { mitamnimService } from '../../services/mitamnimService';
import WorkoutTimer from '../../components/Workouts/ActiveWorkout/WorkoutTimer';
import ActiveExerciseCard from '../../components/Workouts/ActiveWorkout/ActiveExerciseCard';
import SessionParameterModal from '../../components/Workouts/ActiveWorkout/SessionParameterModal';
import { Save, XCircle, Plus, Info, Search, X, Loader2 } from 'lucide-react';

const ActiveWorkoutPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { activeSession, startWorkout, finishWorkout, cancelWorkout, elapsedTime } = useWorkout();
    
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
                            instanceId: crypto.randomUUID(),
                            sets: Array.from({ length: exConfig.sets || 1 }).map(() => ({
                                id: crypto.randomUUID(),
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
                instanceId: crypto.randomUUID(),
                sets: [{
                    id: crypto.randomUUID(),
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
        if (window.confirm("Remove exercise from workout?")) {
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

    /**
     * Atomic Finish Handler
     * Logic: Save to DB first, then cleanup local state.
     */
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

            // The finishWorkout call now includes modalData (summary_data + notes)
            // It will handle the single PATCH request to the server
            await finishWorkout(modalData, allLogs);
            
            // Cleanup UI only after successful server response
            setIsFinishModalOpen(false);
            navigate('/workouts');
        } catch (err) {
            console.error("Failed to finish workout:", err);
            alert("Error saving workout to database. Please try again.");
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
            
            <div className="mb-10 px-4">
                <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter mb-2">
                    {templateInfo?.name || "Personal Workout"}
                </h1>
                {templateInfo?.description && (
                    <div className="flex items-center gap-2 text-gray-400 font-bold">
                        <Info size={16} />
                        <p className="text-sm md:text-lg">{templateInfo.description}</p>
                    </div>
                )}
            </div>

            <div className="flex items-center justify-between mb-8 bg-white/90 backdrop-blur-md p-5 md:p-6 rounded-[2.5rem] shadow-sm border border-gray-100 sticky top-4 z-30">
                <div className="flex items-center gap-4">
                    <button onClick={handleCancel} className="text-gray-300 hover:text-red-500 transition-colors">
                        <XCircle size={28} />
                    </button>
                    <div>
                        <h2 className="text-[9px] md:text-[10px] font-black text-blue-500 uppercase tracking-widest leading-none mb-1">Active Time</h2>
                        <WorkoutTimer />
                    </div>
                </div>
                <div className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl text-xs font-black">
                    {workoutData?.exercises?.length || 0} Exercises
                </div>
            </div>

            <Reorder.Group axis="y" values={workoutData.exercises} onReorder={handleReorderExercises} className="space-y-4 md:y-6">
                <AnimatePresence initial={false}>
                    {workoutData.exercises.map((exercise, idx) => (
                        <Reorder.Item 
                            key={exercise.instanceId} 
                            value={exercise}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
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

            <div className="fixed bottom-8 left-6 md:left-12 flex flex-col gap-4 z-[100] items-start">
                <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsAddExerciseOpen(true)}
                    className="flex items-center gap-3 bg-white text-gray-700 px-5 py-4 rounded-[2rem] font-black shadow-2xl border border-gray-100 hover:border-blue-200 transition-all group"
                >
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <Plus size={20} />
                    </div>
                    <span className="text-sm">Add Exercise</span>
                </motion.button>

                <motion.button 
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsFinishModalOpen(true)}
                    className="flex items-center gap-4 bg-blue-600 text-white px-6 py-5 md:px-8 md:py-6 rounded-[2.2rem] font-black shadow-2xl shadow-blue-200 hover:bg-blue-700 transition-all"
                >
                    <Save size={24} />
                    <span className="text-lg">Finish Workout</span>
                </motion.button>
            </div>

            <AnimatePresence>
                {isAddExerciseOpen && (
                    <motion.div 
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        className="fixed inset-0 z-[200] bg-white flex flex-col"
                    >
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="text-2xl font-black text-gray-900 tracking-tighter">Add Exercise</h3>
                            <button onClick={() => setIsAddExerciseOpen(false)} className="p-3 bg-gray-100 rounded-2xl text-gray-500">
                                <X size={20} />
                            </button>
                        </div>
                        
                        <div className="p-6">
                            <div className="relative">
                                <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input 
                                    type="text"
                                    placeholder="Search exercise..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-gray-50 border-none rounded-2xl py-4 pr-12 pl-4 font-bold text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar">
                            {filteredAvailable.map(ex => (
                                <button
                                    key={ex.id}
                                    onClick={() => handleAddManualExercise(ex)}
                                    className="w-full p-5 bg-white border border-gray-100 rounded-[1.5rem] flex items-center justify-between hover:border-blue-500 hover:bg-blue-50/30 transition-all text-right group"
                                >
                                    <div>
                                        <p className="font-black text-gray-900 group-hover:text-blue-600 transition-colors">{ex.name}</p>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Click to Add</p>
                                    </div>
                                    <Plus size={18} className="text-gray-300 group-hover:text-blue-500" />
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
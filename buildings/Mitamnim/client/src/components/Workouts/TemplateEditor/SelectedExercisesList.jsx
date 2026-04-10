import React from 'react';
import { Reorder, AnimatePresence } from 'framer-motion';
import ExerciseConfigCard from './ExerciseConfigCard';

const SelectedExercisesList = ({ exercises, setExercises }) => {
    
    /**
     * Updates a specific parameter value for a specific exercise instance.
     * We use instanceId to ensure we target the correct row in the list.
     */
    const updateParamValue = (instanceId, paramId, value) => {
        setExercises(prev => prev.map(ex => {
            if (ex.instanceId !== instanceId) return ex;
            
            const newParams = ex.parameters.map(p => 
                p.parameter_id === paramId ? { ...p, default_value: value } : p
            );
            
            return { ...ex, parameters: newParams };
        }));
    };

    /**
     * Updates the number of sets for a specific exercise instance.
     */
    const updateSets = (instanceId, value) => {
        setExercises(prev => prev.map(ex => 
            ex.instanceId === instanceId ? { ...ex, sets: value } : ex
        ));
    };

    /**
     * Removes an exercise instance from the selected list.
     */
    const removeExercise = (id) => {
        setExercises(prev => prev.filter(ex => ex.instanceId !== id));
    };

    if (exercises.length === 0) return null;

    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            {/* Header with Counter */}
            <div className="flex items-center justify-between px-4">
                <div className="flex flex-col text-right">
                    <h3 className="text-xl font-black text-gray-900 tracking-tighter">מבנה האימון</h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">גרור תרגילים כדי לשנות את סדר הביצוע</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="bg-blue-600 text-white text-[10px] font-black px-4 py-1.5 rounded-full shadow-lg shadow-blue-100 uppercase tracking-widest">
                        {exercises.length} תרגילים נבחרו
                    </span>
                </div>
            </div>
            
            {/* Draggable List using Framer Motion */}
            <Reorder.Group 
                axis="y" 
                values={exercises} 
                onReorder={setExercises} 
                className="space-y-3"
            >
                <AnimatePresence mode="popLayout" initial={false}>
                    {exercises.map((ex) => (
                        <Reorder.Item 
                            key={ex.instanceId} 
                            value={ex} 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                            layout
                            className="relative z-0 hover:z-10" // Ensures dragged item stays on top
                        >
                            <ExerciseConfigCard 
                                exercise={ex}
                                onRemove={() => removeExercise(ex.instanceId)}
                                onUpdateSets={(instanceId, val) => updateSets(instanceId, val)}
                                onUpdateParam={(instanceId, paramId, val) => updateParamValue(instanceId, paramId, val)}
                            />
                        </Reorder.Item>
                    ))}
                </AnimatePresence>
            </Reorder.Group>

            {/* Empty State Hint */}
            <div className="flex justify-center py-4">
                <p className="text-[10px] text-gray-300 font-bold uppercase tracking-[0.2em] italic">
                    Gingilla Farm • Workout Engine
                </p>
            </div>
        </div>
    );
};

export default SelectedExercisesList;
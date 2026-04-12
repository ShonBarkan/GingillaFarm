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
        <div className="bg-white/80 backdrop-blur-md p-8 rounded-[3.5rem] border border-gray-100/50 shadow-sm flex flex-col gap-8 animate-in fade-in duration-700 w-full" dir="rtl">
            
            {/* Header with Counter - Simplified according to project standard */}
            <div className="flex items-center justify-between pb-6 border-b border-gray-100/50">
                <div className="flex flex-col text-right">
                    <h3 className="text-2xl font-black text-gray-900 tracking-tighter leading-none">מבנה האימון</h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-2">גרור תרגילים כדי לשנות את סדר הביצוע</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="bg-blue-600 text-white text-[10px] font-black px-5 py-2 rounded-full shadow-lg shadow-blue-500/20 uppercase tracking-widest">
                        {exercises.length} תרגילים נבחרו
                    </div>
                </div>
            </div>
            
            {/* Draggable List using Framer Motion */}
            <Reorder.Group 
                axis="y" 
                values={exercises} 
                onReorder={setExercises} 
                className="space-y-4"
            >
                <AnimatePresence mode="popLayout" initial={false}>
                    {exercises.map((ex) => (
                        <Reorder.Item 
                            key={ex.instanceId} 
                            value={ex} 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                            whileDrag={{ 
                                scale: 1.02,
                                transition: { duration: 0.1 }
                            }}
                            layout
                            className="relative z-0 hover:z-10 active:cursor-grabbing cursor-grab"
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
        </div>
    );
};

export default SelectedExercisesList;
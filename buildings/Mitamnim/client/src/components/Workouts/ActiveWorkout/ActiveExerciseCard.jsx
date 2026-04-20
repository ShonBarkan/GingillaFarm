import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Reorder, AnimatePresence } from 'framer-motion';
import SetRow from './SetRow';
import ExerciseIcon from '../../common/ExerciseIcon';

/**
 * Fallback UUID generator for insecure contexts
 */
const generateSafeId = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
};

const ActiveExerciseCard = ({ exercise, index, onUpdateExercise, onRemoveExercise }) => {
    
    // Add Set with default parameters from the first set or template
    const addSet = () => {
        const newSet = {
            id: generateSafeId(),
            completed: false,
            performance: exercise.sets[0] ? { ...exercise.sets[0].performance } : {}
        };
        onUpdateExercise(index, { ...exercise, sets: [...exercise.sets, newSet] });
    };

    const updateSet = (setIdx, setData) => {
        const newSets = [...exercise.sets];
        newSets[setIdx] = { ...newSets[setIdx], ...setData };
        onUpdateExercise(index, { ...exercise, sets: newSets });
    };

    const removeSet = (setIdx) => {
        if (exercise.sets.length <= 1) return;
        const newSets = exercise.sets.filter((_, i) => i !== setIdx);
        onUpdateExercise(index, { ...exercise, sets: newSets });
    };

    const handleReorderSets = (newOrder) => {
        onUpdateExercise(index, { ...exercise, sets: newOrder });
    };

    return (
        <div className="bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden shadow-sm">
            {/* Header */}
            <div className="p-6 bg-gray-50/50 flex items-center justify-between border-b border-gray-50">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-blue-600">
                        <ExerciseIcon exerciseName={exercise.exercise_name} size={24} />
                    </div>
                    <div>
                        <h3 className="font-black text-gray-900 leading-none text-lg">{exercise.exercise_name}</h3>
                        <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">
                            {exercise.sets.filter(s => s.completed).length} / {exercise.sets.length} סטים בוצעו
                        </p>
                    </div>
                </div>
                <button onClick={() => onRemoveExercise(index)} className="text-gray-300 hover:text-red-500 p-2">
                    <Trash2 size={18} />
                </button>
            </div>

            {/* Sets Group with Reorder */}
            <div className="p-4 bg-white">
                <Reorder.Group axis="y" values={exercise.sets} onReorder={handleReorderSets} className="space-y-2">
                    <AnimatePresence initial={false}>
                        {exercise.sets.map((set, sIdx) => (
                            <Reorder.Item key={set.id} value={set}>
                                <SetRow 
                                    index={sIdx + 1}
                                    set={set}
                                    onUpdate={(data) => updateSet(sIdx, data)}
                                    onRemove={() => removeSet(sIdx)}
                                />
                            </Reorder.Item>
                        ))}
                    </AnimatePresence>
                </Reorder.Group>
            </div>

            <div className="p-4 bg-gray-50/30 border-t border-gray-50 flex justify-center">
                <button onClick={addSet} className="flex items-center gap-2 text-blue-600 font-black text-xs bg-white px-8 py-2.5 rounded-2xl shadow-sm hover:bg-blue-600 hover:text-white transition-all">
                    <Plus size={16} /> הוסף סט
                </button>
            </div>
        </div>
    );
};

export default ActiveExerciseCard;
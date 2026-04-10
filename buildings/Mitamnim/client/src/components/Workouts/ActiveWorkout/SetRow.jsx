import React from 'react';
import { Check, GripVertical } from 'lucide-react';

const SetRow = ({ index, set, onUpdate }) => {
    
    // Safety check: ensure performance object exists to prevent "Object.keys" crash
    const performance = set?.performance || {};
    const paramKeys = Object.keys(performance);

    /**
     * Updates a specific parameter value (e.g., Reps, Weight) within the performance object.
     */
    const handleParamChange = (paramName, value) => {
        const newPerformance = { ...performance, [paramName]: value };
        onUpdate({ performance: newPerformance });
    };

    /**
     * Toggles the completion status of the set.
     */
    const toggleComplete = () => {
        onUpdate({ completed: !set.completed });
    };

    // Dynamic grid: adapts columns based on the number of parameters.
    // Alignment is set to 'end' to align inputs with labels.
    const gridStyle = {
        display: 'grid',
        alignItems: 'end', 
        gap: '1rem',
        padding: '0.75rem',
        borderRadius: '1.5rem',
        transition: 'all 0.2s',
        gridTemplateColumns: `40px 30px ${'1fr '.repeat(paramKeys.length)} 50px`
    };

    return (
        <div 
            style={gridStyle}
            className={`group transition-all ${set.completed ? 'bg-green-50/50' : 'bg-gray-50/40 hover:bg-gray-50/60'}`}
        >
            {/* 1. Set Index */}
            <div className="text-center font-black text-gray-300 text-sm mb-3">
                {index}
            </div>

            {/* 2. Drag Handle (for Reorder) */}
            <div className="cursor-grab text-gray-200 hover:text-blue-500 flex justify-center mb-3">
                <GripVertical size={18} />
            </div>

            {/* 3. Dynamic Parameter Inputs with Labels */}
            {paramKeys.map(key => (
                <div key={key} className="flex flex-col gap-1.5">
                    {/* Requirement 1: Label showing the parameter name */}
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-1">
                        {key}
                    </label>
                    <input
                        type="number"
                        value={performance[key] ?? ""}
                        onChange={(e) => handleParamChange(key, e.target.value)}
                        placeholder="0"
                        className="w-full bg-white border-none rounded-xl py-3 px-2 text-center font-black text-gray-900 focus:ring-2 focus:ring-blue-500 shadow-sm text-sm outline-none transition-all"
                    />
                </div>
            ))}

            {/* 4. Completion Toggle */}
            <div className="flex justify-center mb-1">
                <button
                    onClick={toggleComplete}
                    className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
                        set.completed 
                        ? 'bg-green-500 text-white shadow-lg shadow-green-100' 
                        : 'bg-white text-gray-200 border border-gray-100 hover:border-blue-200 shadow-sm'
                    }`}
                >
                    <Check size={22} strokeWidth={3} />
                </button>
            </div>
        </div>
    );
};

export default SetRow;
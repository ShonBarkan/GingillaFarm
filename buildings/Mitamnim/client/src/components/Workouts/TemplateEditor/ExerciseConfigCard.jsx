import React, { useEffect } from 'react';
import { Trash2, Settings2, GripVertical, AlertCircle } from 'lucide-react';

const ExerciseConfigCard = ({ exercise, onRemove, onUpdateParam, onUpdateSets }) => {
    // דיבאג: בודק מה התרגיל קיבל בפועל
    useEffect(() => {
        console.log(`🔍 ConfigCard [${exercise.exercise_name}]:`, {
            params: exercise.parameters,
            active_params: exercise.active_params,
            full_object: exercise
        });
    }, [exercise]);

    // ניסיון לשלוף פרמטרים מכמה מקורות אפשריים (Fallback)
    const parameters = exercise.parameters || exercise.active_params || [];

    const handleParamChange = (paramId, value) => {
        const processedValue = value === "" ? "" : Number(value);
        onUpdateParam(exercise.instanceId, paramId, processedValue);
    };

    return (
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden flex items-center group mb-3 hover:border-blue-200 hover:shadow-md transition-all">
            
            {/* 1. Drag Handle Area */}
            <div className="bg-gray-50/50 self-stretch flex items-center justify-center px-4 cursor-grab active:cursor-grabbing text-gray-300 group-hover:text-blue-500 transition-colors border-l border-gray-100">
                <GripVertical size={20} />
            </div>

            {/* 2. Main Content Row */}
            <div className="flex-1 flex flex-col md:flex-row md:items-center gap-4 py-4 px-6">
                
                {/* Exercise Identity */}
                <div className="min-w-[160px] flex flex-col text-right">
                    <span className="font-black text-gray-900 text-lg tracking-tight leading-tight">
                        {exercise.exercise_name}
                    </span>
                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">
                        הגדרות ביצוע
                    </span>
                </div>

                {/* Dynamic Parameters Section */}
                <div className="flex-1 flex flex-wrap items-center gap-3">
                    {parameters.length > 0 ? (
                        parameters.map((param) => {
                            // וידוא מפתח ה-ID (יכול להיות parameter_id או פשוט id)
                            const pId = param.parameter_id || param.id;
                            const pName = param.parameter_name || param.name || "פרמטר";

                            return (
                                <div 
                                    key={pId} 
                                    className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-2xl border-2 border-transparent focus-within:border-blue-100 focus-within:bg-white transition-all"
                                >
                                    <div className="flex flex-col text-right">
                                        <span className="text-[9px] font-black text-gray-400 uppercase leading-none mb-1">
                                            {pName}
                                        </span>
                                        <span className="text-[8px] font-bold text-blue-400 leading-none">
                                            {param.unit || ""}
                                        </span>
                                    </div>
                                    <input 
                                        type="number"
                                        value={param.default_value ?? ""}
                                        onChange={(e) => handleParamChange(pId, e.target.value)}
                                        placeholder="0"
                                        className="w-14 bg-transparent border-none p-0 text-base font-black text-gray-900 focus:ring-0 text-center outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    />
                                </div>
                            );
                        })
                    ) : (
                        <div className="flex items-center gap-2 text-orange-400 text-xs font-bold italic py-2 bg-orange-50/50 px-4 rounded-xl">
                            <AlertCircle size={14} />
                            <span>לא נמצאו פרמטרים (בדוק הגדרות תרגיל)</span>
                        </div>
                    )}
                </div>

                {/* Sets Counter Section */}
                <div className="flex items-center gap-3 bg-blue-50/50 px-4 py-2 rounded-2xl border border-blue-100 shrink-0">
                    <div className="flex flex-col items-end">
                        <span className="text-[9px] font-black text-blue-400 uppercase leading-none mb-1">Sets</span>
                        <span className="text-[8px] font-bold text-blue-300 leading-none">כמות סטים</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <input 
                            type="number"
                            min="1"
                            value={exercise.sets || 1}
                            onChange={(e) => onUpdateSets(exercise.instanceId, Math.max(1, parseInt(e.target.value) || 1))}
                            className="w-10 bg-white border-none rounded-xl py-1 text-center font-black text-lg text-blue-600 shadow-sm focus:ring-2 focus:ring-blue-400 outline-none"
                        />
                    </div>
                </div>
            </div>

            {/* 3. Remove Action */}
            <button 
                type="button"
                onClick={onRemove} 
                className="self-stretch bg-red-50/10 hover:bg-red-50 text-gray-300 hover:text-red-500 px-6 transition-all flex items-center justify-center border-r border-gray-50 group/trash"
            >
                <Trash2 size={18} className="group-hover/trash:scale-110 transition-transform" />
            </button>
        </div>
    );
};

export default ExerciseConfigCard;
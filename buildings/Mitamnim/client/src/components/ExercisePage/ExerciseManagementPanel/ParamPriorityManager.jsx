import React, { useState, useEffect, useMemo } from 'react';
import { Reorder } from 'framer-motion';
import { GripVertical, Plus, Loader2, X } from 'lucide-react';
import { mitamnimService } from '../../../services/mitamnimService';
import { useToast } from '../../../context/ToastContext';

const ParamPriorityManager = ({ exercise, refreshAll, hideListIfEmpty = false }) => {
    const { showToast } = useToast();
    const [items, setItems] = useState([]);
    const [allAvailableParams, setAllAvailableParams] = useState([]);
    const [isLoadingParams, setIsLoadingParams] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        const loadParams = async () => {
            setIsLoadingParams(true);
            try {
                const data = await mitamnimService.getParameters(); 
                setAllAvailableParams(data || []);
            } catch (e) {
                console.error("Failed to load parameters:", e);
            } finally {
                setIsLoadingParams(false);
            }
        };
        loadParams();
    }, []);

    useEffect(() => {
        if (exercise?.active_params && allAvailableParams.length > 0) {
            const enriched = exercise.active_params.map(ap => {
                const definition = allAvailableParams.find(p => p.id === ap.parameter_id);
                return {
                    ...ap,
                    name: ap.name || definition?.name,
                    unit: ap.unit || definition?.unit
                };
            });
            setItems(enriched);
        } else if (exercise?.active_params) {
            setItems(exercise.active_params);
        }
    }, [exercise, allAvailableParams]);

    const availableOptions = useMemo(() => {
        const activeIds = new Set(items.map(item => item.parameter_id || item.id));
        return allAvailableParams.filter(p => !activeIds.has(p.id));
    }, [allAvailableParams, items]);

    const syncWithServer = async (updatedList) => {
        if (!exercise?.id) return;
        setIsUpdating(true);
        try {
            const payload = updatedList.map((item, idx) => ({
                parameter_id: item.parameter_id || item.id,
                priority_index: idx
            }));
            await mitamnimService.updateExerciseParams(exercise.id, payload);
            refreshAll();
            return true;
        } catch (error) {
            showToast("Failed to sync parameters with server", "error");
            return false;
        } finally {
            setIsUpdating(false);
        }
    };

    const handleReorder = async (newOrder) => {
        setItems(newOrder);
        await syncWithServer(newOrder);
    };

    const addParamToExercise = async (e) => {
        const paramId = parseInt(e.target.value);
        if (!paramId) return;
        const selectedParam = allAvailableParams.find(p => p.id === paramId);
        if (!selectedParam) return;

        const newItem = { 
            ...selectedParam, 
            parameter_id: paramId,
            name: selectedParam.name,
            unit: selectedParam.unit
        };
        const newList = [...items, newItem];
        setItems(newList);
        const success = await syncWithServer(newList);
        if (success) showToast(`Added: ${selectedParam.name}`);
        e.target.value = "";
    };

    const removeParam = async (targetId) => {
        const newList = items.filter(item => (item.parameter_id || item.id) !== targetId);
        setItems(newList);
        const success = await syncWithServer(newList);
        if (success) showToast("Parameter removed");
    };

    const isProminent = items.length === 0;

    return (
        <div className="flex flex-col gap-4 animate-in fade-in duration-500" dir="rtl">
            
            {/* Vertical Reorderable List */}
            {!hideListIfEmpty && items.length > 0 && (
                <Reorder.Group 
                    axis="y" 
                    values={items} 
                    onReorder={handleReorder} 
                    className="flex flex-col gap-2"
                >
                    {items.map((item) => {
                        const id = item.parameter_id || item.id;
                        return (
                            <Reorder.Item
                                key={id}
                                value={item}
                                className="flex items-center justify-between bg-white border border-gray-100 pl-2 pr-4 py-2.5 rounded-2xl shadow-sm cursor-grab active:cursor-grabbing hover:border-purple-200 transition-all group"
                            >
                                <div className="flex items-center gap-3">
                                    <GripVertical size={14} className="text-gray-300 group-hover:text-purple-400 shrink-0" />
                                    <div className="flex flex-col">
                                        <span className="font-black text-xs text-gray-900 leading-none mb-1">{item.name}</span>
                                        <span className="text-[9px] font-bold text-blue-500 uppercase tracking-tighter">{item.unit || "no unit"}</span>
                                    </div>
                                </div>
                                
                                <button 
                                    onClick={() => removeParam(id)}
                                    className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                >
                                    <X size={14} />
                                </button>
                            </Reorder.Item>
                        );
                    })}
                </Reorder.Group>
            )}

            {/* Add Parameter Dropdown */}
            <div className={`relative group transition-all duration-300 w-full`}>
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none z-10">
                    {isUpdating || isLoadingParams ? (
                        <Loader2 size={16} className={`${isProminent ? 'text-white' : 'text-purple-600'} animate-spin`} />
                    ) : (
                        <Plus size={16} className={isProminent ? 'text-white' : 'text-purple-600'} />
                    )}
                </div>
                
                <select 
                    onChange={addParamToExercise}
                    disabled={isLoadingParams || isUpdating}
                    value=""
                    className={`
                        w-full appearance-none outline-none transition-all duration-300
                        pr-11 pl-4 py-3 text-xs font-black cursor-pointer rounded-2xl
                        ${isProminent 
                            ? 'bg-purple-600 text-white shadow-lg shadow-purple-100 hover:bg-purple-700 hover:shadow-purple-200 border-none' 
                            : 'bg-gray-50/80 text-gray-700 border border-transparent hover:border-purple-200 focus:bg-white focus:border-purple-300'
                        }
                        disabled:opacity-50
                    `}
                >
                    <option value="" disabled>
                        {isLoadingParams ? "Loading..." : "Add Metric"}
                    </option>
                    {availableOptions.map(p => (
                        <option key={p.id} value={p.id} className="text-gray-900 bg-white">
                            {p.name} {p.unit ? `(${p.unit})` : ''}
                        </option>
                    ))}
                </select>

                {!isProminent && (
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-300 group-hover:text-purple-400">
                        <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
                            <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ParamPriorityManager;
import React, { useState, useMemo } from 'react';
import { Search, Plus, Target, Loader2 } from 'lucide-react';
import { useExercise } from '../../../context/ExerciseContext';
import ExerciseIcon from '../../common/ExerciseIcon';

const ExerciseSelector = ({ onSelect, parentId, isFetchingExercise }) => {
    const { allExercises, listLoading } = useExercise();
    const [searchQuery, setSearchQuery] = useState("");

    /**
     * Recursive logic to find selectable descendants
     */
    const availableExercises = useMemo(() => {
        if (!parentId || allExercises.length === 0) return [];

        const descendants = [];
        const queue = [parseInt(parentId)];
        const visited = new Set();

        while (queue.length > 0) {
            const currentId = queue.shift();
            if (visited.has(currentId)) continue;
            visited.add(currentId);

            const children = allExercises.filter(ex => ex.parent_id === currentId);
            
            children.forEach(child => {
                const hasChildren = allExercises.some(ex => ex.parent_id === child.id);
                if (!hasChildren) {
                    descendants.push(child);
                }
                queue.push(child.id);
            });
        }

        return descendants;
    }, [parentId, allExercises]);

    const filteredExercises = useMemo(() => {
        return availableExercises.filter(ex => 
            ex.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [availableExercises, searchQuery]);

    return (
        <div className="bg-white/80 backdrop-blur-md rounded-[3.5rem] border border-gray-100/50 shadow-sm overflow-hidden flex flex-col animate-in fade-in slide-in-from-top-4 duration-500" dir="rtl">

            {isFetchingExercise && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-md z-20 flex flex-col items-center justify-center rounded-[3.5rem] transition-all">
                    <div className="p-4 bg-white rounded-2xl shadow-xl shadow-blue-100/50 mb-3">
                        <Loader2 className="animate-spin text-blue-600" size={32} />
                    </div>
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">טוען נתונים...</p>
                </div>
            )}

            {/* 1. Search Header */}
            <div className="p-8 border-b border-gray-100/50">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex flex-col text-right">
                        <h3 className="text-xl font-black text-gray-900 leading-none tracking-tighter">בחירת תרגילים</h3>
                        <p className="text-[10px] text-gray-400 font-bold mt-2 uppercase tracking-widest">
                            הוסף תרגילים מהקטגוריה הנבחרת
                        </p>
                    </div>
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-4 py-1.5 rounded-full border border-blue-100/30">
                        {availableExercises.length} זמינים
                    </span>
                </div>
                
                <div className="relative group">
                    <Search className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-500 transition-colors" size={18} />
                    <input 
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="חפש תרגיל..."
                        className="w-full bg-gray-100/50 border-2 border-transparent focus:border-blue-200 focus:bg-white rounded-[1.5rem] py-4 pr-14 pl-6 font-black text-gray-900 shadow-inner outline-none transition-all placeholder:text-gray-300"
                    />
                </div>
            </div>

            {/* 2. List Container */}
            <div className="flex-1 max-h-[400px] overflow-y-auto p-6 custom-scrollbar">
                {listLoading ? (
                    <div className="flex flex-col items-center justify-center py-16 text-blue-500">
                        <Loader2 className="animate-spin mb-4" size={32} />
                        <p className="text-[10px] font-black uppercase tracking-widest">טוען נתונים מהחווה...</p>
                    </div>
                ) : filteredExercises.length === 0 ? (
                    <div className="text-center py-16">
                        <Target className="mx-auto text-gray-200 mb-4" size={48} />
                        <p className="text-gray-400 font-bold text-sm">לא נמצאו תרגילים מתאימים</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredExercises.map(ex => (
                            <button
                                key={ex.id}
                                onClick={() => onSelect(ex)}
                                className="flex items-center justify-between p-4 rounded-[2rem] border-2 border-transparent bg-gray-50/50 hover:bg-white hover:border-blue-100 transition-all group text-right shadow-sm"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm border border-gray-100/50 group-hover:scale-110 transition-transform">
                                        <ExerciseIcon exerciseName={ex.name} size={24} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-black text-gray-900 text-base leading-tight tracking-tight">{ex.name}</span>
                                        <span className="text-[9px] text-gray-400 font-black uppercase tracking-tighter mt-1">
                                            לחץ להוספה
                                        </span>
                                    </div>
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all transform group-active:scale-90 shadow-sm">
                                    <Plus size={18} strokeWidth={3} />
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* 3. Footer Decor */}
            <div className="p-4 bg-gray-50/30 border-t border-gray-100/50 text-center">
                <p className="text-[9px] text-gray-300 font-black uppercase tracking-[0.3em] italic opacity-70">
                    Gingilla Farm • Exercise Catalog
                </p>
            </div>
        </div>
    );
};

export default ExerciseSelector;
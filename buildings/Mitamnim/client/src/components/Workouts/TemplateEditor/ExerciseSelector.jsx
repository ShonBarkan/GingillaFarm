import React, { useState, useMemo } from 'react';
import { Search, Plus, Target, Loader2 } from 'lucide-react';
import { useExercise } from '../../../context/ExerciseContext';
import ExerciseIcon from '../../common/ExerciseIcon';

const ExerciseSelector = ({ onSelect, parentId }) => {
    const { allExercises, listLoading } = useExercise();
    const [searchQuery, setSearchQuery] = useState("");

    /**
     * Logic: Find all descendant exercises of the selected parent category.
     * We filter the global flat list to find items that belong to the chosen branch.
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

            // Find children of the current node
            const children = allExercises.filter(ex => ex.parent_id === currentId);
            
            children.forEach(child => {
                // If it's a leaf (no more children in the tree) or has params, it's selectable
                const hasChildren = allExercises.some(ex => ex.parent_id === child.id);
                if (!hasChildren) {
                    descendants.push(child);
                }
                queue.push(child.id);
            });
        }

        return descendants;
    }, [parentId, allExercises]);

    /**
     * Filter the results based on user search query
     */
    const filteredExercises = useMemo(() => {
        return availableExercises.filter(ex => 
            ex.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [availableExercises, searchQuery]);

    return (
        <div className="bg-white rounded-[3rem] border border-blue-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500">
            {/* Search Header */}
            <div className="p-6 border-b border-gray-50 bg-blue-50/30">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex flex-col">
                        <h3 className="text-lg font-black text-gray-900 leading-none">בחירת תרגילים</h3>
                        <p className="text-[10px] text-blue-400 font-bold mt-1 uppercase tracking-widest text-right">
                            הוסף תרגילים מהקטגוריה הנבחרת
                        </p>
                    </div>
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-white px-3 py-1 rounded-full shadow-sm border border-blue-50">
                        {availableExercises.length} זמינים
                    </span>
                </div>
                <div className="relative group">
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                    <input 
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="חפש תרגיל..."
                        className="w-full bg-white border-2 border-transparent focus:border-blue-100 rounded-2xl py-3 pr-12 pl-4 font-bold text-gray-900 shadow-sm outline-none transition-all placeholder:text-gray-300"
                    />
                </div>
            </div>

            {/* List Container */}
            <div className="max-h-[350px] overflow-y-auto p-4 custom-scrollbar bg-gray-50/30">
                {listLoading ? (
                    <div className="flex flex-col items-center justify-center py-12 text-blue-400">
                        <Loader2 className="animate-spin mb-2" size={32} />
                        <p className="text-[10px] font-black uppercase tracking-widest text-center">טוען תרגילים מהשרת...</p>
                    </div>
                ) : filteredExercises.length === 0 ? (
                    <div className="text-center py-12">
                        <Target className="mx-auto text-gray-200 mb-2" size={32} />
                        <p className="text-gray-400 font-bold text-sm">לא נמצאו תרגילים מתאימים</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {filteredExercises.map(ex => (
                            <button
                                key={ex.id}
                                onClick={() => onSelect(ex)}
                                className="flex items-center justify-between p-3 rounded-2xl border-2 border-transparent bg-white hover:border-blue-200 hover:bg-blue-50 transition-all group text-right shadow-sm"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-blue-600 group-hover:bg-white transition-colors">
                                        <ExerciseIcon exerciseName={ex.name} size={20} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-bold text-gray-900 text-sm leading-tight">{ex.name}</span>
                                        <span className="text-[9px] text-gray-400 font-black uppercase tracking-tighter mt-0.5">
                                            לחץ להוספה
                                        </span>
                                    </div>
                                </div>
                                <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all transform group-active:scale-90">
                                    <Plus size={18} strokeWidth={3} />
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExerciseSelector;
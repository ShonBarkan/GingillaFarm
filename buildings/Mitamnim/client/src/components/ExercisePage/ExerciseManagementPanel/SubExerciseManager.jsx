import React, { useState, useMemo } from 'react';
import { Plus, ChevronLeft, Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ExerciseIcon from '../../common/ExerciseIcon';

const SubExerciseManager = ({ subExercises, onAdd }) => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');

    // 1. Logic for search filtering
    const filteredExercises = useMemo(() => {
        return subExercises.filter(ex => 
            ex.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [subExercises, searchTerm]);

    return (
        <div className="w-full flex flex-col h-full overflow-hidden gap-4">
            
            {/* 1. Action Area: Add & Search */}
            <div className="flex flex-col gap-3 shrink-0">
                {/* Add Button */}
                <button
                    onClick={onAdd}
                    className="flex items-center gap-3 p-4 border-2 border-dashed border-gray-100 rounded-[1.5rem] text-gray-400 hover:border-blue-200 hover:text-blue-500 hover:bg-blue-50/30 transition-all group"
                >
                    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center border border-transparent group-hover:border-blue-100 group-hover:bg-white transition-all">
                        <Plus size={20} />
                    </div>
                    <span className="font-black text-[11px] uppercase tracking-widest text-right">הוסף תת-רכיב</span>
                </button>

                {/* Search Input */}
                <div className="relative group">
                    <Search size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    <input 
                        type="text"
                        placeholder="חיפוש מהיר..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-gray-50/50 border border-gray-100 rounded-xl py-2.5 pr-10 pl-10 text-xs font-bold text-gray-700 outline-none focus:bg-white focus:border-blue-200 focus:ring-4 ring-blue-50/50 transition-all"
                    />
                    {searchTerm && (
                        <button 
                            onClick={() => setSearchTerm('')}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-red-500 transition-colors"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>
            </div>

            {/* 2. Scrollable Container 
               Height logic: 3 items * ~100px per item + gaps = ~320px max height before scroll
            */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 min-h-0 max-h-[320px] lg:max-h-none">
                <div className="grid grid-cols-2 lg:grid-cols-1 gap-3 pb-4">
                    {filteredExercises.length > 0 ? (
                        filteredExercises.map(child => (
                            <button
                                key={child.id}
                                onClick={() => navigate(`/exercise/${child.id}`)}
                                className="flex flex-col items-center justify-center gap-3 p-4 bg-gray-50/50 border border-gray-100 rounded-[1.8rem] hover:border-blue-200 hover:bg-white hover:shadow-md transition-all group relative overflow-hidden text-center shrink-0"
                            >
                                <div className="relative">
                                    <div className="w-12 h-12 lg:w-16 lg:h-16 bg-white border border-gray-100 rounded-2xl flex items-center justify-center shadow-sm group-hover:border-blue-100 group-hover:scale-110 transition-all duration-300">
                                        <ExerciseIcon exerciseName={child.name} size={24} />
                                    </div>
                                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full scale-0 group-hover:scale-100 transition-transform duration-300 border-2 border-white" />
                                </div>

                                <div className="w-full overflow-hidden">
                                    <h4 className="font-black text-[11px] lg:text-[13px] text-gray-800 truncate group-hover:text-blue-600 transition-colors">
                                        {child.name}
                                    </h4>
                                    <div className="hidden lg:flex items-center justify-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <span className="text-[8px] font-black text-blue-500 uppercase tracking-tighter">צפה</span>
                                        <ChevronLeft size={8} className="text-blue-500" />
                                    </div>
                                </div>
                            </button>
                        ))
                    ) : (
                        <div className="col-span-full py-8 text-center">
                            <p className="text-xs font-bold text-gray-400">לא נמצאו תוצאות לחיפוש</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Shadow overlay for scroll hint */}
            <div className="h-4 bg-gradient-to-t from-white to-transparent pointer-events-none -mt-8 z-10 shrink-0" />
        </div>
    );
};

export default SubExerciseManager;
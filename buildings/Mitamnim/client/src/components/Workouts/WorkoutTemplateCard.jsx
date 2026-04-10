import React from 'react';
import { Play, Clock, ChevronLeft, Dumbbell } from 'lucide-react';

const WorkoutTemplateCard = ({ template, onStart }) => {
    // Extracting exercise names for the preview list
    const exercisesPreview = template.exercises_config || [];

    return (
        <div className="bg-white border border-gray-100 p-8 rounded-[3rem] shadow-sm hover:shadow-xl hover:border-blue-100 transition-all group flex flex-col h-full">
            {/* Header: Icon & Title */}
            <div className="flex items-start justify-between mb-6">
                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-900 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-500">
                    <Dumbbell size={32} />
                </div>
                <button 
                    onClick={onStart}
                    className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all transform group-hover:scale-110"
                >
                    <Play size={20} fill="currentColor" />
                </button>
            </div>

            {/* Content */}
            <div className="flex-1">
                <h3 className="text-2xl font-black text-gray-900 mb-2 truncate">
                    {template.name}
                </h3>
                <p className="text-gray-400 font-bold text-sm line-clamp-2 mb-6">
                    {template.description || "אין תיאור זמין עבור שבלונה זו"}
                </p>

                {/* Exercises Preview List */}
                <div className="space-y-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-300">תרגילים כלולים</p>
                    <div className="flex flex-wrap gap-2">
                        {exercisesPreview.slice(0, 4).map((ex, idx) => (
                            <div 
                                key={idx}
                                className="bg-gray-50 px-3 py-1.5 rounded-xl text-[11px] font-black text-gray-600 border border-transparent group-hover:border-blue-50 transition-colors"
                            >
                                {ex.exercise_name || `תרגיל ${ex.exercise_id}`}
                            </div>
                        ))}
                        {exercisesPreview.length > 4 && (
                            <div className="bg-gray-50 px-3 py-1.5 rounded-xl text-[11px] font-black text-gray-400">
                                +{exercisesPreview.length - 4} נוספים
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-400">
                    <Clock size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest">
                        ~{exercisesPreview.length * 10} דקות
                    </span>
                </div>
                <button 
                    onClick={onStart}
                    className="flex items-center gap-1 text-blue-600 text-[10px] font-black uppercase tracking-widest hover:gap-2 transition-all"
                >
                    התחל אימון <ChevronLeft size={14} />
                </button>
            </div>
        </div>
    );
};

export default WorkoutTemplateCard;
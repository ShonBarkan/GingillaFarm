import React from 'react';
import { Layers, Hash, Plus, ArrowUpDown } from 'lucide-react';
import ParamPriorityManager from './ParamPriorityManager';

const EmptyExerciseState = ({ exercise, refreshAll, onAddSubExercise }) => {
    return (
        <div className="w-full h-full animate-in fade-in slide-in-from-top-4 duration-500 flex flex-col" dir="rtl">
            <div className="flex flex-col items-stretch gap-6 flex-1">
                
                {/* 1. Category Option - Stacked Top */}
                <div className="flex flex-col gap-4 bg-blue-50/20 border border-blue-100/50 rounded-[2rem] p-5 hover:bg-blue-50/40 transition-all group">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-100 shrink-0 group-hover:scale-105 transition-transform">
                            <Layers size={22} />
                        </div>
                        <div>
                            <h4 className="font-black text-sm text-gray-900 leading-none mb-1">הפוך לקטגוריה</h4>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">ניהול היררכיה ותתי-תרגילים</p>
                        </div>
                    </div>

                    <button 
                        onClick={onAddSubExercise}
                        className="
                            w-full h-[44px] appearance-none outline-none transition-all duration-300
                            px-4 py-2.5 bg-blue-600 text-white rounded-xl
                            font-black text-[11px] flex items-center justify-center gap-2 
                            hover:bg-blue-700 hover:shadow-blue-200 active:scale-95 
                            shadow-lg shadow-blue-100 whitespace-nowrap border-none
                        "
                    >
                        <Plus size={14} /> 
                        <span>הוסף תת-תרגיל</span>
                    </button>
                </div>

                {/* 2. Visual Divider */}
                <div className="flex items-center justify-center relative py-2">
                    <div className="absolute inset-0 flex items-center px-8">
                        <div className="w-full border-t border-gray-100"></div>
                    </div>
                    <div className="bg-white px-3 py-1.5 rounded-full border border-gray-100 text-gray-300 shadow-sm z-10">
                        <ArrowUpDown size={14} />
                    </div>
                </div>

                {/* 3. Exercise Option - Stacked Bottom */}
                <div className="flex flex-col gap-4 bg-purple-50/20 border border-purple-100/50 rounded-[2rem] p-5 hover:bg-purple-50/40 transition-all group">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-purple-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-purple-100 shrink-0 group-hover:scale-105 transition-transform">
                            <Hash size={22} />
                        </div>
                        <div>
                            <h4 className="font-black text-sm text-gray-900 leading-none mb-1">הגדר כתרגיל קצה</h4>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">הוספת מדדי ביצוע (חזרות, משקל וכו')</p>
                        </div>
                    </div>

                    <div className="mt-2">
                        <ParamPriorityManager 
                            exercise={exercise} 
                            refreshAll={refreshAll} 
                            hideListIfEmpty={true} 
                        />
                    </div>
                </div>

            </div>
        </div>
    );
};

export default EmptyExerciseState;
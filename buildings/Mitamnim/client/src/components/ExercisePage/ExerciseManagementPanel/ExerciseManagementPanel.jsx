import React, { useState } from 'react';
import { Activity, Settings2 } from 'lucide-react';
import SubExerciseManager from './SubExerciseManager';
import ParamPriorityManager from './ParamPriorityManager';
import EmptyExerciseState from './EmptyExerciseState';
import AddExerciseModal from '../../common/AddExerciseModal/AddExerciseModal';

const ExerciseManagementPanel = ({ exercise, subExercises, hasChildren, hasParams, refreshAll }) => {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    
    return (
        <>
            {/* Main Wrapper with Glassmorphism */}
            <div className="flex flex-col h-full w-full bg-white/40 backdrop-blur-xl border border-white/20 rounded-[3rem] shadow-2xl overflow-hidden animate-in fade-in duration-500" dir="rtl">
                
                {/* Header Area - integrated into the top of the glass panel */}
                <div className="flex items-center justify-between px-8 py-5 border-b border-white/10 shrink-0">
                    <div className="flex items-center gap-2">
                        <Activity size={16} className="text-blue-600" />
                        <h3 className="font-black text-gray-900/60 text-[10px] uppercase tracking-widest">
                            ניהול רכיב
                        </h3>
                    </div>
                    <span className="text-[10px] font-black text-blue-600 bg-white/60 px-4 py-1.5 rounded-full border border-white/40 backdrop-blur-sm shadow-sm">
                        {exercise?.name}
                    </span>
                </div>

                {/* Content Area - Deeper glass effect for the inner content */}
                <div className="p-6 flex-1 flex flex-col overflow-hidden">
                    <div className="bg-white/50 backdrop-blur-md rounded-[2rem] border border-white/30 flex-1 flex flex-col overflow-hidden p-4 shadow-inner">
                        
                        {hasChildren && (
                            <SubExerciseManager 
                                subExercises={subExercises} 
                                onAdd={() => setIsAddModalOpen(true)} 
                            />
                        )}

                        {!hasChildren && hasParams && (
                            <div className="flex flex-col gap-6 overflow-y-auto pr-1 custom-scrollbar">
                                <div className="flex items-center gap-2 text-gray-500 pb-2 border-b border-white/20">
                                    <Settings2 size={14} className="text-blue-500" />
                                    <span className="text-[10px] font-black uppercase tracking-tighter">הגדרת מדדים</span>
                                </div>
                                <ParamPriorityManager 
                                    exercise={exercise} 
                                    refreshAll={refreshAll} 
                                />
                            </div>
                        )}

                        {!hasChildren && !hasParams && (
                            <div className="flex flex-col flex-1">
                                <EmptyExerciseState 
                                    exercise={exercise} 
                                    refreshAll={refreshAll} 
                                    onAddSubExercise={() => setIsAddModalOpen(true)} 
                                />
                            </div>
                        )}
                    </div>
                </div>

                

                <AddExerciseModal
                    isOpen={isAddModalOpen}
                    onClose={() => setIsAddModalOpen(false)}
                    parentId={exercise?.id}
                    onSuccess={refreshAll}
                />
            </div>
        </>
    );
};

export default ExerciseManagementPanel;
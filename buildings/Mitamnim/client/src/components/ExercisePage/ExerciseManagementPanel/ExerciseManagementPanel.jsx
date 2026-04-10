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
        {/* Header - Styled to match ExerciseWorkouts */}
            <div className="flex items-center justify-between px-2 mb-4 shrink-0">
                <div className="flex items-center gap-2">
                    <Activity size={16} className="text-blue-500" />
                    <h3 className="font-black text-gray-400 text-[10px] uppercase tracking-widest">
                        ניהול רכיב
                    </h3>
                </div>
                <span className="text-[10px] font-black text-gray-900 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
                    {exercise?.name}
                </span>
            </div>

        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col h-full overflow-hidden w-full animate-in fade-in duration-500">
            
            {/* Content Area - Changed to overflow-hidden so children can scroll */}
            <div className="p-6 flex-1 flex flex-col overflow-hidden">
                
                {hasChildren && (
                    <SubExerciseManager 
                        subExercises={subExercises} 
                        onAdd={() => setIsAddModalOpen(true)} 
                    />
                )}

                {!hasChildren && hasParams && (
                    <div className="flex flex-col gap-6 overflow-y-auto pr-1 custom-scrollbar">
                        <div className="flex items-center gap-2 text-gray-400 pb-2 border-b border-gray-50">
                            <Settings2 size={14} />
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

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50/20 border-t border-gray-50 mt-auto shrink-0">
                <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Gingilla Farm Engine</span>
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]"></div>
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
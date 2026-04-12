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
            <div className="bg-white/80 backdrop-blur-md p-6 rounded-[3.5rem] border border-gray-100/50 shadow-sm flex flex-col min-w-0 h-full justify-between animate-in fade-in duration-500" dir="rtl">
                
                {/* Inner Content Area */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    
                    {hasChildren && (
                        <SubExerciseManager 
                            subExercises={subExercises} 
                            onAdd={() => setIsAddModalOpen(true)} 
                        />
                    )}

                    {!hasChildren && hasParams && (
                        <div className="flex flex-col gap-6 overflow-y-auto pr-1 custom-scrollbar">
                            <div className="flex items-center gap-2 text-gray-500 pb-2 border-b border-gray-100/50">
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
        </>
    );
};

export default ExerciseManagementPanel;
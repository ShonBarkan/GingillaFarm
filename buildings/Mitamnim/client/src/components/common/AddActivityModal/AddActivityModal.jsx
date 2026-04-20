import React, { useState, useEffect, useMemo } from 'react';
import { X, ChevronRight, ChevronLeft, Check, Activity, Target, Loader2, Clock } from 'lucide-react';
import { mitamnimService } from '../../../services/mitamnimService';
import { useExercise } from '../../../context/ExerciseContext';
import ExerciseStep from './ExerciseStep';
import ParameterStep from './ParameterStep';

const AddActivityModal = ({ isOpen, onClose, exercise, onSuccess }) => {
    const { allExercises, listLoading } = useExercise();

    const [step, setStep] = useState('SELECT_CHILD');
    const [currentParent, setCurrentParent] = useState(null);
    const [selectedExercise, setSelectedExercise] = useState(null);
    const [activeParams, setActiveParams] = useState([]);
    const [globalParameters, setGlobalParameters] = useState([]); 
    const [isLoadingParams, setIsLoadingParams] = useState(false);
    const [currentParamIndex, setCurrentParamIndex] = useState(0);
    const [performanceData, setPerformanceData] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [navigationStack, setNavigationStack] = useState([]);
    
    // Time selection state
    const [activityTime, setActivityTime] = useState("");

    const QUICK_OPTIONS = [5, 10, 15, 20, 25, 30, 40, 50, 60, 100];

    useEffect(() => {
        if (isOpen) {
            setPerformanceData({});
            setCurrentParamIndex(0);
            // Default to current local time in YYYY-MM-DDThh:mm format
            const now = new Date();
            now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
            setActivityTime(now.toISOString().slice(0, 16));
            
            if (exercise) {
                initFlow(exercise);
            } else {
                setStep('SELECT_CHILD');
                setCurrentParent(null);
                setNavigationStack([]);
            }
        }
    }, [isOpen, exercise]);

    useEffect(() => {
        const fetchMetadata = async () => {
            try {
                const paramsMetadata = await mitamnimService.getParameters();
                setGlobalParameters(paramsMetadata || []);
            } catch (error) {
                console.error("Failed to fetch parameter metadata:", error);
            }
        };
        if (isOpen) fetchMetadata();
    }, [isOpen]);

    const getParameterInfo = (activeParam) => {
        if (!activeParam) return { name: 'Parameter', unit: '' };
        if (activeParam.parameter_name) return { name: activeParam.parameter_name, unit: activeParam.unit };
        
        const meta = globalParameters.find(p => p.id === activeParam.parameter_id);
        return {
            name: meta ? meta.name : `Metric ${activeParam.parameter_id}`,
            unit: meta ? meta.unit : ''
        };
    };

    const initFlow = (startExercise) => {
        const children = (allExercises || []).filter(ex => ex.parent_id === startExercise.id);
        if (children.length > 0) {
            setStep('SELECT_CHILD');
            setCurrentParent(startExercise);
            setNavigationStack([startExercise]);
        } else {
            startFillingParams(startExercise);
        }
    };

    const startFillingParams = async (ex) => {
        setIsLoadingParams(true);
        setSelectedExercise(ex);
        setStep('FILL_PARAMS');
        try {
            const params = await mitamnimService.getActiveParams({ exercise_id: ex.id });
            setActiveParams(params || []);
            setCurrentParamIndex(0);
        } catch (error) {
            console.error("Error fetching params:", error);
        } finally {
            setIsLoadingParams(false);
        }
    };

    const handleSelectChild = (child) => {
        const furtherChildren = (allExercises || []).filter(ex => ex.parent_id === child.id);
        if (furtherChildren.length > 0) {
            setNavigationStack(prev => [...prev, child]);
            setCurrentParent(child);
        } else {
            startFillingParams(child);
        }
    };

    const handleBack = () => {
        if (step === 'FILL_PARAMS') {
            setStep('SELECT_CHILD');
            setCurrentParent(navigationStack.length > 0 ? navigationStack[navigationStack.length - 1] : null);
        } else if (step === 'SELECT_CHILD' && navigationStack.length > 0) {
            const newStack = [...navigationStack];
            newStack.pop();
            setNavigationStack(newStack);
            setCurrentParent(newStack.length > 0 ? newStack[newStack.length - 1] : null);
        } else {
            onClose();
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const payload = {
                exercise_id: selectedExercise.id,
                performance_data: performanceData,
                timestamp: new Date(activityTime).toISOString(),
                is_manual: true
            };
            await mitamnimService.logActivities(payload);
            onSuccess?.();
            onClose();
        } catch (error) {
            console.error("Submission failed:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const currentViewChildren = useMemo(() => {
        if (!allExercises) return [];
        return allExercises.filter(ex => 
            currentParent ? ex.parent_id === currentParent.id : !ex.parent_id
        );
    }, [allExercises, currentParent]);

    if (!isOpen) return null;

    const currentActiveParam = activeParams[currentParamIndex];
    const info = getParameterInfo(currentActiveParam);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-md animate-in fade-in duration-300" dir="rtl">
            <div className="bg-white/90 backdrop-blur-2xl w-full max-w-xl rounded-[3.5rem] border border-white/20 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                
                <div className="p-8 border-b border-gray-100/50 flex items-center justify-between bg-white/50">
                    <div className="flex items-center gap-4 text-right">
                        <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <Activity size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-gray-900 tracking-tighter leading-none">Log Activity</h2>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                                {step === 'SELECT_CHILD' ? (currentParent ? `Sub-exercise of ${currentParent.name}` : 'Main category') : selectedExercise?.name}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-3 text-gray-400 hover:text-red-500 transition-all"><X size={24} /></button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar min-h-[350px] flex flex-col justify-center">
                    {listLoading ? (
                        <div className="text-center"><Loader2 className="animate-spin mx-auto text-blue-600" size={40} /></div>
                    ) : (
                        <>
                            {step === 'SELECT_CHILD' && (
                                <ExerciseStep children={currentViewChildren} onSelect={handleSelectChild} />
                            )}

                            {step === 'FILL_PARAMS' && (
                                isLoadingParams ? (
                                    <div className="text-center"><Loader2 className="animate-spin mx-auto text-blue-600" size={40} /></div>
                                ) : activeParams.length > 0 ? (
                                    <ParameterStep 
                                        param={{...currentActiveParam, ...info}}
                                        displayName={info.name}
                                        value={performanceData[info.name] || ''}
                                        totalSteps={activeParams.length}
                                        currentIndex={currentParamIndex}
                                        quickOptions={QUICK_OPTIONS}
                                        onChange={(name, val) => setPerformanceData(p => ({ ...p, [name]: val }))}
                                    />
                                ) : (
                                    <div className="py-12 text-center space-y-4">
                                        <Target size={64} className="mx-auto text-gray-200" />
                                        <p className="text-gray-400 font-bold text-lg">No metrics for this exercise.</p>
                                    </div>
                                )
                            )}
                        </>
                    )}
                </div>

                <div className="p-6 bg-white border-t border-gray-100 flex flex-col gap-4">
                    {step === 'FILL_PARAMS' && (
                         <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-2xl">
                             <Clock size={20} className="text-gray-400" />
                             <input 
                                type="datetime-local" 
                                value={activityTime}
                                onChange={(e) => setActivityTime(e.target.value)}
                                className="bg-transparent w-full font-bold text-sm outline-none"
                             />
                         </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                        <button onClick={handleBack} className="flex items-center gap-2 text-gray-400 font-black text-[10px] tracking-widest hover:text-gray-900 transition-colors uppercase">
                            <ChevronRight size={16} /> Back
                        </button>
                        
                        {step === 'FILL_PARAMS' && activeParams.length > 0 && (
                            <button 
                                onClick={() => currentParamIndex < activeParams.length - 1 ? setCurrentParamIndex(c => c + 1) : handleSubmit()}
                                disabled={isSubmitting || isLoadingParams}
                                className="flex items-center gap-3 bg-blue-600 text-white px-10 py-4 rounded-[2rem] font-black shadow-xl hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50"
                            >
                                {isSubmitting ? <Loader2 className="animate-spin" /> : (
                                    <>
                                        <span>{currentParamIndex === activeParams.length - 1 ? 'Save' : 'Next'}</span>
                                        {currentParamIndex === activeParams.length - 1 ? <Check size={20} /> : <ChevronLeft size={20} />}
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddActivityModal;
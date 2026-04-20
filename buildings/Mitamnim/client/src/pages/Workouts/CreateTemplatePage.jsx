import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, X, Loader2 } from 'lucide-react';
import { mitamnimService } from '../../services/mitamnimService';
import { useExercise } from '../../context/ExerciseContext';
import { useToast } from '../../context/ToastContext';

// Sub-components
import TemplateBasicInfo from '../../components/Workouts/TemplateEditor/TemplateBasicInfo';
import ExerciseSelector from '../../components/Workouts/TemplateEditor/ExerciseSelector';
import SelectedExercisesList from '../../components/Workouts/TemplateEditor/SelectedExercisesList';
import SessionParamsConfig from '../../components/Workouts/TemplateEditor/SessionParamsConfig';
import TemplateScheduleConfig from '../../components/Workouts/TemplateEditor/TemplateScheduleConfig';

const generateSafeId = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
};

const CreateTemplatePage = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { showToast } = useToast(); 
    const isEditMode = !!id;

    const { allExercises, refreshGlobalExercises } = useExercise();

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [selectedParentId, setSelectedParentId] = useState("");
    const [selectedExercises, setSelectedExercises] = useState([]);
    const [sessionRequiredParams, setSessionRequiredParams] = useState([]);
    
    const [expectedTime, setExpectedTime] = useState("");
    const [scheduledDays, setScheduledDays] = useState([]);
    
    const [allSystemParams, setAllSystemParams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFetchingExercise, setIsFetchingExercise] = useState(false);

    useEffect(() => {
        const loadInitialData = async () => {
            setLoading(true);
            try {
                if (allExercises.length === 0) {
                    await refreshGlobalExercises();
                }

                const params = await mitamnimService.getParameters();
                setAllSystemParams(params || []);

                if (isEditMode) {
                    const currentTemplate = await mitamnimService.getWorkoutTemplateById(id);
                    
                    if (currentTemplate) {
                        setName(currentTemplate.name);
                        setDescription(currentTemplate.description || "");
                        setSelectedParentId(currentTemplate.parent_exercise_id?.toString() || "");
                        setExpectedTime(currentTemplate.expected_time || "");
                        setScheduledDays(currentTemplate.scheduled_days || []);
                        
                        const exercisesWithIds = (currentTemplate.exercises_config || []).map(ex => ({
                            ...ex,
                            instanceId: ex.instanceId || generateSafeId()
                        }));
                        setSelectedExercises(exercisesWithIds);
                        setSessionRequiredParams(currentTemplate.session_required_params || []);
                    }
                }
            } catch (error) {
                console.error("Failed to load template data:", error);
                showToast("שגיאה בטעינת נתוני השבלונה", "error");
            } finally {
                setLoading(false);
            }
        };
        loadInitialData();
    }, [id, isEditMode, refreshGlobalExercises]);

    const handleAddSessionParam = (param) => {
        if (sessionRequiredParams.find(p => p.parameter_id === param.id)) return;
        setSessionRequiredParams(prev => [...prev, {
            parameter_id: param.id,
            parameter_name: param.name,
            unit: param.unit,
            default_value: "",
            priority_index: prev.length
        }]);
    };

    const handleRemoveSessionParam = (paramId) => {
        setSessionRequiredParams(prev => prev.filter(p => p.parameter_id !== paramId));
    };

    const handleUpdateSessionParamDefault = (paramId, value) => {
        setSessionRequiredParams(prev => prev.map(p => 
            p.parameter_id === paramId ? { ...p, default_value: value } : p
        ));
    };

    const toggleDay = (dayIndex) => {
        setScheduledDays(prev => 
            prev.includes(dayIndex) 
                ? prev.filter(d => d !== dayIndex) 
                : [...prev, dayIndex].sort()
        );
    };

    const handleAddExercise = async (selectedEx) => {
        if (!selectedEx?.id) return;
        
        setIsFetchingExercise(true);
        try {
            const fullExData = await mitamnimService.getExerciseById(selectedEx.id);
            const sourceParams = fullExData?.active_params || fullExData?.parameters || [];

            const enrichedParams = sourceParams.map(p => ({
                parameter_id: p.parameter_id || p.id,
                parameter_name: p.name || p.parameter_name || "Parameter",
                unit: p.unit || "",
                default_value: "" 
            }));

            const newEntry = {
                instanceId: generateSafeId(),
                exercise_id: selectedEx.id,
                exercise_name: selectedEx.name,
                sets: 1,
                parameters: enrichedParams
            };

            setSelectedExercises(prev => [...prev, newEntry]);
            showToast(`נוסף: ${selectedEx.name}`);
        } catch (e) {
            console.error("Error fetching exercise details:", e);
            showToast("שגיאה בשליפת פרטי התרגיל", "error");
        } finally {
            setIsFetchingExercise(false);
        }
    };

    const handleUpdateParamValue = (instanceId, paramId, newValue) => {
        setSelectedExercises(prev => prev.map(ex => {
            if (ex.instanceId !== instanceId) return ex;
            return {
                ...ex,
                parameters: ex.parameters.map(p => 
                    p.parameter_id === paramId ? { ...p, default_value: newValue } : p
                )
            };
        }));
    };

    const handleUpdateSets = (instanceId, value) => {
        setSelectedExercises(prev => prev.map(ex => 
            ex.instanceId === instanceId ? { ...ex, sets: value } : ex
        ));
    };

    const handleSave = async () => {
        if (!name || !selectedParentId || selectedExercises.length === 0) {
            return showToast("אנא מלא את כל שדות החובה", "error");
        }

        const templateData = {
            name,
            description,
            parent_exercise_id: parseInt(selectedParentId),
            expected_time: expectedTime,
            scheduled_days: scheduledDays,
            exercises_config: selectedExercises,
            session_required_params: sessionRequiredParams
        };

        try {
            if (isEditMode) {
                await mitamnimService.updateWorkoutTemplate(id, templateData);
                showToast("השבלונה עודכנה בהצלחה");
            } else {
                await mitamnimService.createWorkoutTemplates([templateData]);
                showToast("השבלונה נוצרה בהצלחה");
            }
            navigate('/workouts');
        } catch (error) {
            console.error("Save error:", error);
            showToast("שגיאה בשמירת השבלונה", "error");
        }
    };

    if (loading) return (
        <div className="p-20 text-center flex flex-col items-center gap-4">
            <Loader2 className="animate-spin text-blue-600" size={40} />
            <p className="font-black text-gray-400 uppercase tracking-widest text-xs">טוען נתוני עורך...</p>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-10" dir="rtl">
            <div className="sticky top-4 z-50 bg-white/80 backdrop-blur-md border border-gray-100/50 px-6 py-4 mb-10 rounded-[3.5rem] shadow-sm animate-in fade-in slide-in-from-top-4 duration-700 max-w-[1600px] mx-auto w-full" dir="rtl">
                <div className="flex items-center justify-between">
                    
                    <div className="space-y-1 text-right px-2">
                        <h1 className="text-2xl md:text-4xl font-black text-gray-900 tracking-tighter leading-tight">
                            {isEditMode ? 'עריכת' : 'יצירת'} <span className="text-blue-600">שבלונה</span>
                        </h1>
                    </div>

                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => navigate('/workouts')} 
                            className="p-3.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                            title="ביטול וחזרה"
                        >
                            <X size={24} />
                        </button>
                        
                        <button 
                            onClick={handleSave} 
                            className="bg-blue-600 text-white px-8 md:px-10 py-3 md:py-4 rounded-[2rem] font-black flex items-center gap-3 shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95 group border border-white/10"
                        >
                            <Save size={20} className="group-hover:rotate-12 transition-transform" />
                            <span className="hidden md:inline text-lg">
                                {isEditMode ? 'עדכן שינויים' : 'שמור שבלונה'}
                            </span>
                            <span className="md:hidden font-black">שמור</span>
                        </button>
                    </div>
                </div>
            </div>

            <TemplateBasicInfo 
                name={name} setName={setName}
                description={description} setDescription={setDescription}
                selectedParentId={selectedParentId} setSelectedParentId={setSelectedParentId}
                parentExercises={allExercises}
                hasExercises={selectedExercises.length > 0}
                onClearExercises={() => setSelectedExercises([])}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                <TemplateScheduleConfig 
                    expectedTime={expectedTime}
                    setExpectedTime={setExpectedTime}
                    scheduledDays={scheduledDays}
                    onToggleDay={toggleDay}
                />

                <SessionParamsConfig 
                    sessionParams={sessionRequiredParams}
                    allSystemParams={allSystemParams}
                    onAdd={handleAddSessionParam}
                    onRemove={handleRemoveSessionParam}
                    onUpdate={handleUpdateSessionParamDefault}
                />
            </div>

           {selectedParentId && (
                <ExerciseSelector 
                    parentId={selectedParentId} 
                    onSelect={handleAddExercise} 
                    isFetchingExercise={isFetchingExercise}
                />        
            )}

            {selectedExercises.length > 0 ? (
                <SelectedExercisesList 
                    exercises={selectedExercises} 
                    setExercises={setSelectedExercises} 
                    onUpdateParam={handleUpdateParamValue}
                    onUpdateSets={handleUpdateSets}
                />
            ) : (
                selectedParentId && (
                    <div className="py-12 text-center border-2 border-dashed border-gray-100 rounded-[3rem]">
                        <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">Gingilla Farm • המתן לבחירת תרגילים</p>
                    </div>
                )
            )}
        </div>
    );
};

export default CreateTemplatePage;
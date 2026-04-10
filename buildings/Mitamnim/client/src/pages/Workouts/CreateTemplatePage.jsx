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

const CreateTemplatePage = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { showToast } = useToast(); 
    const isEditMode = !!id;

    // Global Context Data
    const { allExercises, refreshGlobalExercises } = useExercise();

    // Form State
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [selectedParentId, setSelectedParentId] = useState("");
    const [selectedExercises, setSelectedExercises] = useState([]);
    const [sessionRequiredParams, setSessionRequiredParams] = useState([]);
    
    // Scheduling States
    const [expectedTime, setExpectedTime] = useState("");
    const [scheduledDays, setScheduledDays] = useState([]);
    
    // Data State
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
                            instanceId: ex.instanceId || crypto.randomUUID()
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
            // וודא שמימשת את getExerciseById בתוך mitamnimService
            const fullExData = await mitamnimService.getExerciseById(selectedEx.id);
            const sourceParams = fullExData?.active_params || fullExData?.parameters || [];

            const enrichedParams = sourceParams.map(p => ({
                parameter_id: p.parameter_id || p.id,
                parameter_name: p.name || p.parameter_name || "Parameter",
                unit: p.unit || "",
                default_value: "" 
            }));

            const newEntry = {
                instanceId: crypto.randomUUID(),
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
            <div className="flex items-center justify-between animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black text-gray-900 tracking-tighter">
                        {isEditMode ? 'עריכת' : 'יצירת'} <span className="text-blue-600">שבלונה</span>
                    </h1>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => navigate('/workouts')} className="p-4 text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={24} />
                    </button>
                    <button onClick={handleSave} className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-2 shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95">
                        <Save size={20} />
                        {isEditMode ? 'עדכן שינויים' : 'שמור שבלונה'}
                    </button>
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
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-gray-50/50 p-6 rounded-[2.5rem] border border-gray-100 relative">
                        {isFetchingExercise && (
                            <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-[2.5rem]">
                                <Loader2 className="animate-spin text-blue-600" size={24} />
                            </div>
                        )}
                        <h3 className="text-lg font-black text-gray-900 mb-4 px-2">הוספת תרגילים לאימון</h3>
                        <ExerciseSelector 
                            parentId={selectedParentId} 
                            onSelect={handleAddExercise} 
                        />
                    </div>
                </div>
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
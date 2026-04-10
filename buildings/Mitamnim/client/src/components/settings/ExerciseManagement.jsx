import React, { useState, useEffect, useMemo } from 'react';
import { Plus, FolderTree, Check, ChevronDown, Loader2 } from 'lucide-react';
import { mitamnimService } from '../../services/mitamnimService';
import { useToast } from '../../context/ToastContext';
import { useExercise } from '../../context/ExerciseContext';

const ExerciseManagement = ({ initialParentId = null, onSuccess = null }) => {
    const { showToast } = useToast();
    const { allExercises, refreshGlobalExercises, listLoading } = useExercise();
    
    const [allParams, setAllParams] = useState([]);
    const [loadingParams, setLoadingParams] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        parent_id: initialParentId,
        selected_params: []
    });

    useEffect(() => {
        if (initialParentId) {
            setFormData(prev => ({ ...prev, parent_id: initialParentId }));
        }
    }, [initialParentId]);

    useEffect(() => {
        const loadParams = async () => {
            try {
                const params = await mitamnimService.getParameters();
                setAllParams(params || []);
            } catch (e) {
                showToast("שגיאה בטעינת פרמטרים", "error");
            } finally {
                setLoadingParams(false);
            }
        };
        loadParams();
    }, [showToast]);

    const flattenedCategories = useMemo(() => {
        const categories = [];
        const processNode = (nodes, depth = 0) => {
            nodes.forEach(node => {
                categories.push({
                    id: node.id,
                    label: `${'\u00A0'.repeat(depth * 4)}${node.name}`
                });
                const children = allExercises.filter(ex => ex.parent_id === node.id);
                if (children.length > 0) processNode(children, depth + 1);
            });
        };
        const roots = allExercises.filter(ex => !ex.parent_id);
        processNode(roots);
        return categories;
    }, [allExercises]);

    const toggleParam = (paramId) => {
        setFormData(prev => {
            const isSelected = prev.selected_params.includes(paramId);
            const newList = isSelected 
                ? prev.selected_params.filter(id => id !== paramId)
                : [...prev.selected_params, paramId];
            
            console.log("🎯 Current selected params IDs:", newList);
            return { ...prev, selected_params: newList };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("🚀 Starting Exercise Creation Process...");
        
        if (!formData.name) {
            console.warn("⚠️ Validation failed: Name is missing");
            return showToast("חובה להזין שם תרגיל/קטגוריה", "error");
        }

        setIsSubmitting(true);
        try {
            // 1. Prepare UNIFIED payload
            const unifiedPayload = {
                name: formData.name,
                parent_id: formData.parent_id,
                // These will be processed by the backend in a single step
                active_params: formData.selected_params.map((pid, idx) => ({
                    parameter_id: pid,
                    priority_index: idx
                }))
            };
            
            console.log("📦 Sending Unified Payload to Server:", unifiedPayload);

            // 2. Single API Call
            const response = await mitamnimService.createExerciseNodes(unifiedPayload);
            console.log("✅ Server Response:", response);

            showToast(`התרגיל "${formData.name}" נוצר בהצלחה!`);
            
            // 3. Refresh context and UI
            console.log("🔄 Refreshing global exercise list...");
            await refreshGlobalExercises();
            
            setFormData({ name: '', parent_id: initialParentId, selected_params: [] });
            
            if (onSuccess) {
                console.log("📞 Calling onSuccess callback");
                onSuccess();
            }
        } catch (error) {
            console.error("❌ Creation error:", error);
            showToast("שגיאה בתהליך היצירה", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (listLoading || loadingParams) return (
        <div className="p-12 text-center text-gray-400">
            <Loader2 className="animate-spin mx-auto mb-4" size={32} />
            <span className="font-bold text-[10px] uppercase tracking-widest">מתכונן לעבודה...</span>
        </div>
    );

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500" dir="rtl">
            <form onSubmit={handleSubmit} className="bg-gray-50 rounded-[2.5rem] p-8 border border-gray-100 space-y-8">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-100">
                        <Plus size={20} />
                    </div>
                    <h3 className="text-xl font-black text-gray-900 tracking-tight">יצירת רכיב חדש</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Name */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-2">שם התרגיל / קטגוריה</label>
                        <input 
                            type="text"
                            value={formData.name}
                            onChange={e => setFormData({...formData, name: e.target.value})}
                            className="w-full bg-white border-2 border-transparent focus:border-blue-100 rounded-2xl px-6 py-4 font-bold shadow-sm outline-none transition-all placeholder:text-gray-200"
                            placeholder="למשל: אימון רגליים / סקוואט"
                        />
                    </div>

                    {/* Parent */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-2">מיקום בעץ ההיררכי</label>
                        <div className="relative">
                            <select 
                                className="w-full bg-white border-2 border-transparent focus:border-blue-100 rounded-2xl px-6 py-4 font-bold shadow-sm outline-none appearance-none cursor-pointer transition-all"
                                value={formData.parent_id || ''}
                                onChange={e => setFormData({...formData, parent_id: e.target.value ? parseInt(e.target.value) : null})}
                            >
                                <option value="">-- רמה ראשית (שורש) --</option>
                                {flattenedCategories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.label}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                        </div>
                    </div>
                </div>

                {/* Parameters */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">פרמטרים לתיעוד (עבור תרגיל קצה)</label>
                        <span className="text-[10px] text-blue-600 font-black px-2 py-0.5 bg-blue-50 rounded-full">{formData.selected_params.length} נבחרו</span>
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 bg-white/50 p-4 rounded-[2.5rem] border border-gray-100 shadow-inner">
                        {allParams.map(param => {
                            const isSelected = formData.selected_params.includes(param.id);
                            return (
                                <button
                                    key={param.id}
                                    type="button"
                                    onClick={() => toggleParam(param.id)}
                                    className={`flex items-center justify-between px-4 py-3 rounded-2xl transition-all border-2 ${
                                        isSelected
                                            ? 'bg-blue-600 border-blue-600 text-white shadow-md scale-95'
                                            : 'bg-white border-transparent text-gray-500 hover:border-blue-100 hover:bg-gray-50 shadow-sm'
                                    }`}
                                >
                                    <div className="flex flex-col items-start overflow-hidden text-right">
                                        <span className="text-[11px] font-black truncate w-full">{param.name}</span>
                                        <span className={`text-[9px] font-bold ${isSelected ? 'text-blue-100' : 'text-gray-300'}`}>
                                            {param.unit}
                                        </span>
                                    </div>
                                    {isSelected && <Check size={14} className="shrink-0 mr-2" />}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="pt-6 border-t border-gray-100 flex justify-end">
                    <button 
                        type="submit"
                        disabled={isSubmitting || !formData.name}
                        className="w-full md:w-auto px-16 py-4 bg-gray-900 text-white rounded-[2rem] font-black shadow-xl hover:bg-black transition-all active:scale-95 flex items-center justify-center gap-3 disabled:bg-gray-200"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="animate-spin" size={20} />
                                <span>שולח נתונים...</span>
                            </>
                        ) : "צור רשומה חדשה"}
                    </button>
                </div>
            </form>

            <div className="flex items-center gap-4 p-6 bg-blue-50/50 rounded-[2rem] border border-blue-100 text-blue-700">
                <FolderTree size={24} className="shrink-0 text-blue-400" />
                <p className="text-[11px] font-medium leading-relaxed">
                    <strong>טיפ היררכיה:</strong> אם תבחר פרמטרים, הרשומה תוגדר כ"תרגיל קצה". אם תשאיר ללא פרמטרים, היא תשמש כקטגוריה שתוכל להוסיף לתוכה תרגילים בהמשך.
                </p>
            </div>
        </div>
    );
};

export default ExerciseManagement;
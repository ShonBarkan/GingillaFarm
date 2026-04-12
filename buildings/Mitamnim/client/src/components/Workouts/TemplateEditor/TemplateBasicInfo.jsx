import React, { useMemo } from 'react';
import { Target, Dumbbell, AlignLeft } from 'lucide-react';

const TemplateBasicInfo = ({ name, setName, description, setDescription, selectedParentId, setSelectedParentId, parentExercises, hasExercises, onClearExercises }) => {
    
    const handleParentChange = (e) => {
        const val = e.target.value;
        if (hasExercises && val !== selectedParentId) {
            if (window.confirm("שינוי קטגוריית האימון ינקה את רשימת התרגילים שבחרת. האם להמשיך?")) {
                setSelectedParentId(val);
                onClearExercises();
            }
        } else {
            setSelectedParentId(val);
        }
    };

    const flattenedCategories = useMemo(() => {
        const categories = [];
        const processNode = (nodes, depth = 0) => {
            nodes.forEach(node => {
                categories.push({
                    id: node.id,
                    name: node.name,
                    label: `${'\u00A0'.repeat(depth * 4)}${node.name}`
                });

                const children = parentExercises.filter(ex => ex.parent_id === node.id);
                if (children.length > 0) {
                    processNode(children, depth + 1);
                }
            });
        };

        const roots = parentExercises.filter(ex => !ex.parent_id);
        processNode(roots);
        return categories;
    }, [parentExercises]);

    return (
        <div className="bg-white/80 backdrop-blur-md p-8 rounded-[3.5rem] border border-gray-100/50 shadow-sm flex flex-col gap-8 animate-in fade-in duration-700 h-full" dir="rtl">
            
            {/* 1. Header Section */}
            <div className="flex items-center justify-between pb-6 border-b border-gray-100/50 shrink-0">
                <div className="flex flex-col text-right">
                    <h3 className="text-2xl font-black text-gray-900 tracking-tighter leading-none">הגדרות בסיס</h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-2">פרטי זיהוי וסיווג השבלונה</p>
                </div>
                
                <div className="w-14 h-14 bg-blue-600 text-white rounded-[1.5rem] flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
                    <Target size={26} />
                </div>
            </div>

            {/* 2. Form Fields Content */}
            <div className="space-y-8 flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Category Selector */}
                    <div className="space-y-3 text-right">
                        <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 mr-2">
                            <Target size={14} className="text-blue-500" /> קטגוריית על (אימון)
                        </label>
                        <div className="relative group">
                            <select 
                                value={selectedParentId} 
                                onChange={handleParentChange} 
                                className="w-full bg-gray-100/50 border-2 border-transparent focus:border-blue-200 focus:bg-white rounded-[1.5rem] p-4 pr-5 pl-12 font-black text-gray-900 outline-none transition-all appearance-none cursor-pointer shadow-inner"
                            >
                                <option value="">בחר קטגוריה...</option>
                                {flattenedCategories.map(cat => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.label}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-300 group-focus-within:text-blue-500 transition-colors">
                                <Target size={18} />
                            </div>
                        </div>
                    </div>

                    {/* Template Name */}
                    <div className="space-y-3 text-right">
                        <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 mr-2">
                            <Dumbbell size={14} className="text-blue-500" /> שם השבלונה
                        </label>
                        <input 
                            type="text" 
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                            placeholder="למשל: PUSH - חזה וכתפיים" 
                            className="w-full bg-gray-100/50 border-2 border-transparent focus:border-blue-200 focus:bg-white rounded-[1.5rem] p-4 font-black text-gray-900 outline-none transition-all placeholder:text-gray-300 shadow-inner" 
                        />
                    </div>
                </div>

                {/* Description Field */}
                <div className="space-y-3 text-right">
                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 mr-2">
                        <AlignLeft size={14} className="text-blue-500" /> תיאור והערות (אופציונלי)
                    </label>
                    <textarea 
                        value={description} 
                        onChange={(e) => setDescription(e.target.value)} 
                        placeholder="הוסף הערות לגבי מטרת האימון או דגשים מיוחדים..." 
                        className="w-full bg-gray-100/50 border-2 border-transparent focus:border-blue-200 focus:bg-white rounded-[2rem] p-5 font-bold text-gray-700 min-h-[140px] outline-none transition-all resize-none placeholder:text-gray-300 shadow-inner" 
                    />
                </div>
            </div>

            {/* 3. Footer Decor */}
            <div className="pt-4 border-t border-gray-100/50 shrink-0 text-center">
                <p className="text-[9px] text-gray-300 font-black uppercase tracking-[0.3em] italic opacity-70">
                    Gingilla Farm • Core Metadata Engine
                </p>
            </div>
        </div>
    );
};

export default TemplateBasicInfo;
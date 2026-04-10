import React, { useMemo } from 'react';
import { Target, Dumbbell, AlignLeft } from 'lucide-react';

const TemplateBasicInfo = ({ name, setName, description, setDescription, selectedParentId, setSelectedParentId, parentExercises, hasExercises, onClearExercises }) => {
    
    /**
     * Logic to handle category change.
     * Since exercises are filtered by category, changing it requires a reset confirmation.
     */
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

    /**
     * Helper to create a flat list from the tree with indentation for labels.
     * This helps the user see the hierarchy in the dropdown.
     */
    const flattenedCategories = useMemo(() => {
        const categories = [];
        
        // Internal helper for recursion
        const processNode = (nodes, depth = 0) => {
            nodes.forEach(node => {
                // If the node has children, it's a potential parent category
                const hasChildren = parentExercises.some(ex => ex.parent_id === node.id);
                
                // Add the category with spaces for indentation
                categories.push({
                    id: node.id,
                    name: node.name,
                    label: `${'\u00A0'.repeat(depth * 4)}${node.name}`
                });

                // Find and process children from the flat list
                const children = parentExercises.filter(ex => ex.parent_id === node.id);
                if (children.length > 0) {
                    processNode(children, depth + 1);
                }
            });
        };

        // Start from root nodes (no parent_id)
        const roots = parentExercises.filter(ex => !ex.parent_id);
        processNode(roots);
        
        return categories;
    }, [parentExercises]);

    return (
        <div className="w-full bg-gray-50/30 backdrop-blur-sm border border-gray-100/50 p-3 md:p-5 rounded-[3.5rem] shadow-sm animate-in fade-in duration-700 h-full flex flex-col" dir="rtl">
            
            {/* המעטפת הלבנה הפנימית המאוחדת */}
            <div className="bg-white border border-gray-100/50 rounded-[2.5rem] shadow-inner flex-1 flex flex-col overflow-hidden">
                
                {/* 1. Header Section - כותרת הקבוצה */}
                <div className="flex items-center justify-between px-8 py-6 border-b border-gray-50 shrink-0 bg-white">
                    <div className="flex flex-col text-right">
                        <h3 className="text-xl font-black text-gray-900 tracking-tighter leading-tight">הגדרות בסיס</h3>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">פרטי זיהוי וסיווג השבלונה</p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-100 shrink-0">
                            <Target size={22} />
                        </div>
                    </div>
                </div>

                {/* 2. תוכן השדות - בפריסת גריד פנימית */}
                <div className="p-8 space-y-8 flex-1 overflow-y-auto bg-white">
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* 1. Category Selector */}
                        <div className="space-y-3 text-right">
                            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 mr-2">
                                <Target size={14} className="text-blue-500" /> קטגוריית על (אימון)
                            </label>
                            <div className="relative group">
                                <select 
                                    value={selectedParentId} 
                                    onChange={handleParentChange} 
                                    className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-100 focus:bg-white rounded-2xl p-4 pr-5 pl-12 font-black text-gray-900 outline-none transition-all appearance-none cursor-pointer shadow-sm"
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

                        {/* 2. Template Name */}
                        <div className="space-y-3 text-right">
                            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 mr-2">
                                <Dumbbell size={14} className="text-blue-500" /> שם השבלונה
                            </label>
                            <input 
                                type="text" 
                                value={name} 
                                onChange={(e) => setName(e.target.value)} 
                                placeholder="למשל: PUSH - חזה וכתפיים" 
                                className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-100 focus:bg-white rounded-2xl p-4 font-black text-gray-900 outline-none transition-all placeholder:text-gray-300 shadow-sm" 
                            />
                        </div>
                    </div>

                    {/* 3. Description Field */}
                    <div className="space-y-3 text-right">
                        <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 mr-2">
                            <AlignLeft size={14} className="text-blue-500" /> תיאור והערות (אופציונלי)
                        </label>
                        <textarea 
                            value={description} 
                            onChange={(e) => setDescription(e.target.value)} 
                            placeholder="הוסף הערות לגבי מטרת האימון או דגשים מיוחדים..." 
                            className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-100 focus:bg-white rounded-2xl p-4 font-bold text-gray-700 min-h-[120px] outline-none transition-all resize-none placeholder:text-gray-300 shadow-sm" 
                        />
                    </div>
                </div>

                {/* 3. Footer Decor - סגירת הקופסה הלבנה */}
                <div className="p-4 bg-gray-50/50 border-t border-gray-50 shrink-0 text-center">
                    <p className="text-[9px] text-gray-300 font-black uppercase tracking-[0.3em] italic opacity-70">
                        Gingilla Farm • Core Metadata Engine
                    </p>
                </div>
            </div>
        </div>
    );
};

export default TemplateBasicInfo;
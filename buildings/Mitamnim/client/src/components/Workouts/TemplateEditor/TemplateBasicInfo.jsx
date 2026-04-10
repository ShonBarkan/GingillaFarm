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
        <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-gray-100 space-y-8 animate-in fade-in duration-500">
            {/* Header info inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* 1. Category Selector */}
                <div className="space-y-3">
                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 mr-2">
                        <Target size={14} className="text-blue-500" /> קטגוריית על (אימון)
                    </label>
                    <div className="relative">
                        <select 
                            value={selectedParentId} 
                            onChange={handleParentChange} 
                            className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-100 focus:bg-white rounded-2xl p-4 font-black text-gray-900 outline-none transition-all appearance-none cursor-pointer"
                        >
                            <option value="">בחר קטגוריה...</option>
                            {flattenedCategories.map(cat => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.label}
                                </option>
                            ))}
                        </select>
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                            <Target size={16} />
                        </div>
                    </div>
                </div>

                {/* 2. Template Name */}
                <div className="space-y-3">
                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 mr-2">
                        <Dumbbell size={14} className="text-blue-500" /> שם השבלונה
                    </label>
                    <input 
                        type="text" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        placeholder="למשל: PUSH - חזה וכתפיים" 
                        className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-100 focus:bg-white rounded-2xl p-4 font-black text-gray-900 outline-none transition-all placeholder:text-gray-300" 
                    />
                </div>
            </div>

            {/* 3. Description Field */}
            <div className="space-y-3">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 mr-2">
                    <AlignLeft size={14} className="text-blue-500" /> תיאור והערות (אופציונלי)
                </label>
                <textarea 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)} 
                    placeholder="הוסף הערות לגבי מטרת האימון או דגשים מיוחדים..." 
                    className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-100 focus:bg-white rounded-2xl p-4 font-bold text-gray-700 min-h-[100px] outline-none transition-all resize-none placeholder:text-gray-300" 
                />
            </div>
        </div>
    );
};

export default TemplateBasicInfo;
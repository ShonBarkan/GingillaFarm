import React, { useState } from 'react'; // הוספנו את ה-useState כאן
import { ChevronDown, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ExerciseIcon from '../ExerciseIcon';

const SidebarItem = ({ item, depth = 0 }) => {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();
    const hasChildren = item.children && item.children.length > 0;

    // ניווט לפי ID במקום לפי שם
    const handleNavigate = () => {
        navigate(`/exercise/${item.id}`);
    };

    // טיפול בפתיחה/סגירה של תפריט היררכי
    const handleToggle = (e) => {
        e.stopPropagation(); // מונע מהקליק להגיע ל-div האב ולהפעיל ניווט
        setIsOpen(!isOpen);
    };

    return (
        <div className="w-full" dir="rtl">
            {/* שורת הפריט */}
            <div 
                onClick={handleNavigate}
                className={`
                    flex items-center justify-between px-3 py-3 rounded-xl cursor-pointer
                    transition-all duration-200 group
                    ${depth === 0 ? 'hover:bg-blue-50' : 'hover:bg-gray-50'}
                    ${isOpen && depth === 0 ? 'bg-blue-50/50' : ''}
                `}
                style={{ paddingRight: `${(depth * 12) + 12}px` }}
            >
                <div className="flex items-center gap-4">
                    <div className="w-11 h-11 flex items-center justify-center rounded-xl bg-white shadow-sm border border-gray-100 group-hover:border-blue-200 transition-colors shrink-0">
                        <ExerciseIcon 
                            exerciseName={item.name} 
                            size={32} 
                            className="text-blue-600"
                        />
                    </div>

                    <span className={`
                        text-sm transition-colors
                        ${depth === 0 ? 'text-gray-900 font-black text-base' : 'text-gray-600 font-bold'}
                        group-hover:text-blue-600
                    `}>
                        {item.name}
                    </span>
                </div>

                {/* חץ פתיחה/סגירה */}
                {hasChildren && (
                    <button 
                        onClick={handleToggle}
                        className="p-2 text-gray-300 hover:text-blue-500 hover:bg-white rounded-lg transition-all z-10"
                    >
                        {isOpen ? <ChevronDown size={18} /> : <ChevronLeft size={18} />}
                    </button>
                )}
            </div>

            {/* רינדור ילדים בצורה רקורסיבית */}
            {hasChildren && isOpen && (
                <div className="mt-1 space-y-1 overflow-hidden transition-all animate-in slide-in-from-top-1 duration-200">
                    {item.children.map((child) => (
                        <SidebarItem key={child.id} item={child} depth={depth + 1} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default SidebarItem;
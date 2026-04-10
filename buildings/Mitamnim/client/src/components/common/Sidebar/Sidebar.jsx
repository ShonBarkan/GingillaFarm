import React, { useState, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Settings, ChevronRight, Menu, LayoutGrid, PlusCircle, Activity } from 'lucide-react';
import { useWorkout } from '../../../context/WorkoutContext';
import { useExercise } from '../../../context/ExerciseContext'; // ייבוא הקונטקסט החדש
import SidebarItem from './SidebarItem';

const Sidebar = () => {
    // צריכת הנתונים הגלובליים מהקונטקסט
    const { allExercises, listLoading } = useExercise();
    const [isOpen, setIsOpen] = useState(true);
    const location = useLocation();
    const { isActive: isWorkoutActive } = useWorkout();

    /**
     * פונקציה להפיכת רשימה שטוחה למבנה עץ היררכי.
     * עכשיו היא תלויה ב-allExercises מהקונטקסט.
     */
    const exerciseTree = useMemo(() => {
        const map = {};
        const tree = [];

        // יצירת מיפוי ראשוני
        allExercises.forEach(item => {
            map[item.id] = { ...item, children: [] };
        });

        // בניית ההיררכיה
        allExercises.forEach(item => {
            if (item.parent_id && map[item.parent_id]) {
                map[item.parent_id].children.push(map[item.id]);
            } else {
                tree.push(map[item.id]);
            }
        });

        return tree;
    }, [allExercises]);

    const closeOnMobile = () => {
        if (window.innerWidth < 768) setIsOpen(false);
    };

    return (
        <>
            {/* Mobile Toggle Button */}
            <button 
                className={`fixed top-4 right-4 z-50 p-2 bg-white rounded-xl shadow-lg border border-gray-100 text-blue-600 transition-all duration-300 ${
                    !isOpen ? 'scale-100 opacity-100' : 'md:opacity-0 md:pointer-events-none'
                }`}
                onClick={() => setIsOpen(true)}
            >
                <Menu size={24} />
            </button>

            {/* Sidebar Container */}
            <aside className={`
                fixed inset-y-0 right-0 z-40 bg-white border-l border-gray-200 
                transform transition-all duration-300 ease-in-out flex flex-col
                ${isOpen ? 'translate-x-0 w-64' : 'translate-x-full md:translate-x-0 md:w-0 md:opacity-0'}
                md:relative
            `} dir="rtl">
                
                {/* Header */}
                <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-black text-blue-600 tracking-tight leading-none">מיתאמנים</h1>
                        <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase tracking-widest">Training System</p>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-gray-50 rounded-lg text-gray-400 transition-colors">
                        <ChevronRight size={20} />
                    </button>
                </div>

                {/* Navigation Content */}
                <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6 custom-scrollbar">
                    
                    {/* מרכז אימונים */}
                    <div className="space-y-1">
                        <p className="px-3 text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] mb-2">מרכז אימונים</p>
                        
                        {isWorkoutActive && (
                            <Link 
                                to="/workouts/active" 
                                onClick={closeOnMobile}
                                className="flex items-center gap-3 px-3 py-3 rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-100 mb-4 animate-pulse"
                            >
                                <Activity size={18} />
                                <span className="text-sm font-black">חזור לאימון פעיל</span>
                            </Link>
                        )}

                        <Link to="/workouts" onClick={closeOnMobile} className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${location.pathname === '/workouts' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}>
                            <LayoutGrid size={18} />
                            <span className="text-sm font-bold">שבלונות אימון</span>
                        </Link>

                        <Link to="/workouts/create" onClick={closeOnMobile} className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${location.pathname === '/workouts/create' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}>
                            <PlusCircle size={18} />
                            <span className="text-sm font-bold">יצירת תוכנית</span>
                        </Link>
                    </div>

                    {/* ספריית תרגילים */}
                    <div className="space-y-1">
                        <p className="px-3 text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] mb-2">ספריית תרגילים</p>
                        {listLoading ? (
                            <div className="p-4 text-center text-gray-400 animate-pulse font-bold text-sm">טוען תרגילים...</div>
                        ) : (
                            exerciseTree.map((exercise) => (
                                <SidebarItem key={exercise.id} item={exercise} depth={0} />
                            ))
                        )}
                    </div>
                </nav>

                {/* Settings & Profile */}
                <div className="p-4 border-t border-gray-50 mt-auto space-y-4">
                    <Link 
                        to="/settings" 
                        onClick={closeOnMobile}
                        className="flex items-center gap-3 px-3 py-2 rounded-xl text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all group"
                    >
                        <Settings size={20} className="group-hover:rotate-45 transition-transform duration-300" />
                        <span className="text-sm font-bold">הגדרות מערכת</span>
                    </Link>

                    <div className="flex items-center space-x-3 space-x-reverse p-2 rounded-xl bg-gray-50 border border-gray-100">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold shrink-0">
                            SB
                        </div>
                        <div className="text-right truncate">
                            <p className="text-sm font-bold text-gray-900 leading-none truncate font-sans">שון ברקן</p>
                            <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-tight font-black">מנהל מערכת</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Overlay */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black/20 z-30 md:hidden backdrop-blur-sm"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </>
    );
};

export default Sidebar;
import React, { useState, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Settings, X, Menu, LayoutGrid, PlusCircle, Activity } from 'lucide-react';
import { useWorkout } from '../../../context/WorkoutContext';
import { useExercise } from '../../../context/ExerciseContext'; 
import SidebarItem from './SidebarItem';

const Sidebar = () => {
    const { allExercises, listLoading } = useExercise();
    const [isOpen, setIsOpen] = useState(true);
    const location = useLocation();
    const { isActive: isWorkoutActive } = useWorkout();

    // בניית עץ התרגילים מהרשימה השטוחה
    const exerciseTree = useMemo(() => {
        const map = {};
        const tree = [];
        allExercises.forEach(item => {
            map[item.id] = { ...item, children: [] };
        });
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
            {/* כפתור המבורגר חיצוני - מופיע רק כשהסיידבר סגור */}
            <button 
                className={`fixed top-4 right-4 z-50 p-3 bg-white rounded-2xl shadow-xl border border-gray-100 text-blue-600 transition-all duration-300 hover:scale-105 active:scale-95 ${
                    !isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'
                }`}
                onClick={() => setIsOpen(true)}
            >
                <Menu size={24} />
            </button>

            <aside className={`
                fixed inset-y-0 right-0 z-40 bg-white border-l border-gray-200 
                transform transition-all duration-300 ease-in-out flex flex-col
                ${isOpen ? 'translate-x-0 w-72' : 'translate-x-full md:w-0 md:opacity-0'}
                md:relative
            `} dir="rtl">
                
                {/* Header: לחיצה על הכותרת מחזירה לדף הבית עם שם לזיהוי רקע */}
                <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-white sticky top-0 z-10">
                    <Link 
                        to="/?name=Dashboard" 
                        onClick={closeOnMobile}
                        className="group flex flex-col hover:opacity-80 transition-all"
                    >
                        <h1 className="text-2xl font-black text-blue-600 tracking-tight leading-none group-hover:translate-x-1 transition-transform">
                            מיתאמנים
                        </h1>
                        <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase tracking-widest">Training System</p>
                    </Link>

                    <button 
                        onClick={() => setIsOpen(false)} 
                        className="p-2 hover:bg-red-50 hover:text-red-500 rounded-xl text-gray-400 transition-all duration-200 active:scale-90"
                    >
                        <X size={24} />
                    </button>
                </div>

                <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6 custom-scrollbar bg-white">
                    
                    <div className="space-y-1">
                        <p className="px-3 text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] mb-2">מרכז אימונים</p>
                        
                        {isWorkoutActive && (
                            <Link 
                                to="/workouts/active?name=ActiveWorkout" 
                                onClick={closeOnMobile}
                                className="flex items-center gap-3 px-3 py-3 rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-100 mb-4 hover:bg-blue-700 transition-all animate-in fade-in zoom-in duration-300"
                            >
                                <div className="relative">
                                    <Activity size={18} />
                                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-400 rounded-full animate-ping" />
                                </div>
                                <span className="text-sm font-black">חזור לאימון פעיל</span>
                            </Link>
                        )}

                        <Link 
                            to="/workouts?name=Hub" 
                            onClick={closeOnMobile} 
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-bold text-sm ${location.pathname === '/workouts' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}
                        >
                            <LayoutGrid size={18} />
                            <span>שבלונות אימון</span>
                        </Link>

                        <Link 
                            to="/workouts/create?name=CreateTemplate" 
                            onClick={closeOnMobile} 
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-bold text-sm ${location.pathname === '/workouts/create' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}
                        >
                            <PlusCircle size={18} />
                            <span>יצירת תוכנית</span>
                        </Link>
                    </div>

                    <div className="space-y-1">
                        <p className="px-3 text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] mb-2">ספריית תרגילים</p>
                        {listLoading ? (
                            <div className="p-4 text-center text-gray-400 animate-pulse font-bold text-xs uppercase tracking-widest">טוען תרגילים...</div>
                        ) : (
                            <div className="space-y-0.5">
                                {exerciseTree.map((exercise) => (
                                    <SidebarItem key={exercise.id} item={exercise} depth={0} />
                                ))}
                            </div>
                        )}
                    </div>
                </nav>

                <div className="p-4 border-t border-gray-50 mt-auto bg-white">
                    <Link 
                        to="/settings?name=Settings" 
                        onClick={closeOnMobile}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all group"
                    >
                        <Settings size={20} className="group-hover:rotate-45 transition-transform duration-500" />
                        <span className="font-bold text-sm">הגדרות מערכת</span>
                    </Link>
                </div>
            </aside>

            {/* Overlay למובייל */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black/20 z-30 md:hidden backdrop-blur-sm transition-opacity duration-300"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </>
    );
};

export default Sidebar;
import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Layers, ListTree, ChevronRight, Database } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

import ParameterManagement from '../components/settings/ParameterManagement';
import ExerciseManagement from '../components/settings/ExerciseManagement';
import DatabaseExplorer from '../components/settings/DatabaseExplorer/DatabaseExplorer';

const SettingsPage = () => {
    const location = useLocation();
    const [activeTab, setActiveTab] = useState('parameters');

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const tab = params.get('tab');
        const validTabs = ['parameters', 'exercises', 'database'];
        if (validTabs.includes(tab)) {
            setActiveTab(tab);
        }
    }, [location]);

    const tabs = [
        { 
            id: 'parameters', 
            label: 'ניהול פרמטרים', 
            icon: <Layers size={18} />,
            description: 'הוספה ועריכה של יחידות מידה (משקל, זמן, חזרות...)'
        },
        { 
            id: 'exercises', 
            label: 'מבנה תרגילים', 
            icon: <ListTree size={18} />,
            description: 'בניית היררכיית התרגילים ושיוך פרמטרים לכל תרגיל'
        },
        { 
            id: 'database', 
            label: 'DB Manager', 
            icon: <Database size={18} />,
            description: 'צפייה בנתונים הגולמיים של כל טבלאות המערכת'
        }
    ];

    return (
        /* המכולה הראשית - שקיפות מתונה וטשטוש עמוק */
        <div className="max-w-6xl mx-auto px-6 py-10 bg-white/40 backdrop-blur-2xl border border-white/30 rounded-[3rem] shadow-2xl" dir="rtl">
            
            {/* Breadcrumbs - בועות שקופות לשיפור הקריאות */}
            <nav className="flex items-center gap-2 mb-8 text-[11px] font-black uppercase tracking-widest">
                <Link to="/" className="text-gray-500 hover:text-blue-600 transition-colors bg-white/50 px-3 py-1.5 rounded-full backdrop-blur-sm">דף הבית</Link>
                <ChevronRight size={10} className="text-gray-400" />
                <span className="text-gray-900 bg-white/70 px-3 py-1.5 rounded-full backdrop-blur-sm">הגדרות מערכת</span>
            </nav>

            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div className="flex items-center gap-5">
                    <div className="w-16 h-16 bg-gray-900/90 text-white rounded-[2rem] flex items-center justify-center shadow-2xl border border-white/10 backdrop-blur-md">
                        <SettingsIcon size={32} />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight leading-none mb-2">הגדרות</h1>
                        <p className="text-gray-600 font-bold bg-white/30 px-3 py-1 rounded-lg backdrop-blur-sm w-fit">ניהול המבנה והפרמטרים של Gingilla</p>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs - כרטיסי זכוכית אישיים */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`
                            relative flex flex-col items-start p-8 rounded-[2.5rem] border-2 transition-all duration-300 text-right backdrop-blur-md
                            ${activeTab === tab.id 
                                ? 'bg-white/80 border-blue-600 shadow-2xl scale-[1.02]' 
                                : 'bg-white/20 border-white/10 hover:bg-white/40 text-gray-500'}
                        `}
                    >
                        {/* אייקון בפינה כמו ב-Reference */}
                        <div className={`
                            absolute top-6 left-6 w-10 h-10 rounded-2xl flex items-center justify-center transition-all
                            ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-lg' : 'bg-white/40 text-gray-500 border border-white/20'}
                        `}>
                            {tab.icon}
                        </div>

                        <span className={`text-xl font-black mb-1 ${activeTab === tab.id ? 'text-gray-900' : 'text-gray-600'}`}>
                            {tab.label}
                        </span>
                        <p className={`text-[10px] font-bold leading-tight max-w-[140px] ${activeTab === tab.id ? 'text-blue-600/70' : 'text-gray-400'}`}>
                            {tab.description}
                        </p>
                    </button>
                ))}
            </div>

            {/* Main Content Area - שכבה חלבית עבה יותר לתוכן הפנימי */}
            <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
                <div className="bg-white/80 backdrop-blur-3xl rounded-[3.5rem] border border-white/40 shadow-2xl overflow-hidden">
                    <div className="p-4 sm:p-10">
                        {activeTab === 'parameters' && <ParameterManagement />}
                        {activeTab === 'exercises' && <ExerciseManagement />}
                        {activeTab === 'database' && <DatabaseExplorer />}
                    </div>
                </div>
            </div>

            {/* Footer Note */}
            <div className="mt-16 text-center opacity-40">
                <div className="inline-block bg-white/20 backdrop-blur-sm px-6 py-2 rounded-full border border-white/10">
                    <p className="text-[10px] font-black text-gray-900 uppercase tracking-[0.5em]">
                        Gingilla Control Panel • Modular Architecture
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
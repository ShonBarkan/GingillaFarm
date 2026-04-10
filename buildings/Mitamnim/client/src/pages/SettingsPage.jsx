import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Layers, ListTree, ChevronRight, Database } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom'; // הוספת useNavigate

import ParameterManagement from '../components/settings/ParameterManagement';
import ExerciseManagement from '../components/settings/ExerciseManagement';
import DatabaseExplorer from '../components/settings/DatabaseExplorer/DatabaseExplorer';

const SettingsPage = () => {
    const location = useLocation();
    const navigate = useNavigate(); // הוק לניווט
    const [activeTab, setActiveTab] = useState('parameters');

    /**
     * SYNC URL WITH TABS
     */
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const tab = params.get('tab');
        const validTabs = ['parameters', 'exercises', 'database'];
        if (validTabs.includes(tab)) {
            setActiveTab(tab);
        }
    }, [location]);

    // פונקציה לשינוי טאב שגם מעדכנת את ה-URL
    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
        navigate(`/settings?tab=${tabId}`, { replace: true });
    };

    const tabs = [
        { 
            id: 'parameters', 
            label: 'ניהול פרמטרים', 
            icon: <Layers size={18} />,
            description: 'הגדרת יחידות המדידה הגלובליות של המערכת'
        },
        { 
            id: 'exercises', 
            label: 'מבנה תרגילים', 
            icon: <ListTree size={18} />,
            description: 'בניית היררכיה ושיוך פרמטרים לתרגילים'
        },
        { 
            id: 'database', 
            label: 'DB Manager', 
            icon: <Database size={18} />,
            description: 'גישה ישירה וגולמית לכל טבלאות מסד הנתונים'
        }
    ];

    return (
        <div className="max-w-6xl mx-auto px-4 py-10" dir="rtl">
            {/* Navigation Breadcrumbs */}
            <nav className="flex items-center gap-2 mb-8 text-xs font-bold text-gray-400">
                <Link to="/" className="hover:text-blue-600 transition-colors">דף הבית</Link>
                <ChevronRight size={12} />
                <span className="text-gray-900">הגדרות מערכת</span>
            </nav>

            {/* Page Title & Icon */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div className="flex items-center gap-5">
                    <div className="w-16 h-16 bg-gray-900 text-white rounded-[2rem] flex items-center justify-center shadow-2xl shadow-gray-200">
                        <SettingsIcon size={32} />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight">הגדרות</h1>
                        <p className="text-gray-400 font-bold mt-1">ניהול המבנה והפרמטרים של Gingilla</p>
                    </div>
                </div>
            </div>

            {/* Tab Navigation Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => handleTabChange(tab.id)} // שימוש בפונקציה החדשה
                        className={`
                            flex flex-col items-start p-6 rounded-[2.5rem] border-2 transition-all text-right
                            ${activeTab === tab.id 
                                ? 'bg-white border-blue-600 shadow-xl shadow-blue-50' 
                                : 'bg-gray-50 border-transparent hover:bg-gray-100 text-gray-400'}
                        `}
                    >
                        <div className={`
                            w-10 h-10 rounded-xl flex items-center justify-center mb-4
                            ${activeTab === tab.id ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}
                        `}>
                            {tab.icon}
                        </div>
                        <span className={`text-lg font-black mb-1 ${activeTab === tab.id ? 'text-gray-900' : 'text-gray-500'}`}>
                            {tab.label}
                        </span>
                        <p className={`text-xs font-bold leading-relaxed ${activeTab === tab.id ? 'text-blue-600/60' : 'text-gray-400'}`}>
                            {tab.description}
                        </p>
                    </button>
                ))}
            </div>

            {/* Active Content Box */}
            <div className="animate-in fade-in slide-in-from-bottom-6 duration-500">
                <div className="bg-white rounded-[3rem] border border-gray-100 p-2 sm:p-4 shadow-sm">
                    <div className="p-4 sm:p-6">
                        {/* כאן הקומפוננטות יצרכו את ה-Context באופן אוטומטי */}
                        {activeTab === 'parameters' && <ParameterManagement />}
                        {activeTab === 'exercises' && <ExerciseManagement />}
                        {activeTab === 'database' && <DatabaseExplorer />}
                    </div>
                </div>
            </div>

            {/* System Version Note */}
            <div className="mt-12 text-center">
                <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">
                    Gingilla Farm Control Panel v2.0 • Modular API Sync
                </p>
            </div>
        </div>
    );
};

export default SettingsPage;
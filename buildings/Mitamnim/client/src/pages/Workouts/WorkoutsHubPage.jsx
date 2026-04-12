import React, { useState, useEffect } from 'react';
import { Plus, Play, LayoutGrid, Dumbbell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { mitamnimService } from '../../services/mitamnimService';
import WorkoutTemplateCard from '../../components/Workouts/WorkoutTemplateCard';

const WorkoutsHubPage = () => {
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTemplates = async () => {
            try {
                const data = await mitamnimService.getWorkoutTemplates();
                setTemplates(data || []);
            } catch (error) {
                console.error("Failed to load templates:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchTemplates();
    }, []);

    const handleStartQuickWorkout = () => {
        navigate('/workouts/active?mode=quick');
    };

    return (
        <div className="min-h-screen bg-gray-50/30 p-4 md:p-8" dir="rtl">
            {/* Header Section - Modern Glass Header */}
            <div className="max-w-7xl mx-auto mb-12 bg-white/80 backdrop-blur-md p-8 md:p-12 rounded-[3.5rem] border border-gray-100/50 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-8 animate-in fade-in slide-in-from-top-4 duration-700">
                <div className="space-y-4">
                    <div className="flex items-center gap-3 text-blue-600">
                        <Dumbbell size={28} className="animate-pulse" />
                        <span className="text-xs font-black uppercase tracking-[0.3em]">Workout Center</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-gray-900 tracking-tighter leading-none">
                        תוכניות <span className="text-blue-600">אימון</span>
                    </h1>
                    <p className="text-gray-400 font-bold text-lg md:text-xl">בחר שבלונה מוכנה או התחל אימון חופשי עכשיו</p>
                </div>

                <div className="flex flex-wrap gap-4">
                    <button 
                        onClick={() => navigate('/workouts/create')}
                        className="flex-1 md:flex-none flex items-center justify-center gap-3 bg-gray-900 text-white px-8 py-5 rounded-[2rem] font-black hover:bg-gray-800 transition-all shadow-xl shadow-gray-200 active:scale-95"
                    >
                        <Plus size={22} />
                        <span className="text-lg">שבלונה חדשה</span>
                    </button>
                    <button 
                        onClick={handleStartQuickWorkout}
                        className="flex-1 md:flex-none flex items-center justify-center gap-3 bg-blue-600 text-white px-10 py-5 rounded-[2rem] font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-95"
                    >
                        <Play size={22} fill="currentColor" />
                        <span className="text-lg">אימון מהיר</span>
                    </button>
                </div>
            </div>

            {/* Content Grid */}
            <div className="max-w-7xl mx-auto">
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="h-72 bg-white/50 animate-pulse rounded-[3.5rem] border border-gray-100/50" />
                        ))}
                    </div>
                ) : templates.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 bg-white/60 backdrop-blur-md rounded-[3.5rem] border border-dashed border-gray-200 shadow-inner animate-in zoom-in-95 duration-500">
                        <div className="w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center shadow-sm mb-8">
                            <LayoutGrid size={48} className="text-gray-200" />
                        </div>
                        <h3 className="text-2xl font-black text-gray-900">אין עדיין שבלונות אימון</h3>
                        <p className="text-gray-400 font-bold mt-2 mb-10 text-lg text-center px-6">
                            נראה שהחווה שלך עדיין שקטה. זה הזמן ליצור את תוכנית האימונים הראשונה.
                        </p>
                        <button 
                            onClick={() => navigate('/workouts/create')}
                            className="bg-white border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-full font-black flex items-center gap-3 hover:bg-blue-600 hover:text-white transition-all duration-300"
                        >
                            צור שבלונה עכשיו <Plus size={20} />
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
                        {templates.map(template => (
                            <div key={template.id} className="animate-in fade-in slide-in-from-bottom-6 duration-500">
                                <WorkoutTemplateCard 
                                    template={template} 
                                    onStart={() => navigate(`/workouts/active?templateId=${template.id}`)}
                                    onEdit={() => navigate(`/workouts/edit/${template.id}`)}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default WorkoutsHubPage;
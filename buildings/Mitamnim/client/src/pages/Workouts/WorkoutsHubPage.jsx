import React, { useState, useEffect } from 'react';
import { Plus, Play, LayoutGrid, Activity, Dumbbell, Clock } from 'lucide-react';
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
        // This will be handled by the WorkoutContext later
        navigate('/workouts/active?mode=quick');
    };

    return (
        <div className="min-h-screen bg-white p-4 md:p-8" dir="rtl">
            {/* Header Section */}
            <div className="max-w-7xl mx-auto mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-3 text-blue-600 mb-2">
                        <Dumbbell size={24} className="animate-pulse" />
                        <span className="text-xs font-black uppercase tracking-[0.3em]">Workout Center</span>
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black text-gray-900 tracking-tighter">
                        תוכניות <span className="text-blue-600">אימון</span>
                    </h1>
                    <p className="text-gray-400 font-bold text-lg">בחר שבלונה או התחל אימון חופשי</p>
                </div>

                <div className="flex gap-3">
                    <button 
                        onClick={() => navigate('/workouts/create')}
                        className="flex items-center gap-2 bg-gray-900 text-white px-6 py-4 rounded-2xl font-black hover:bg-gray-800 transition-all shadow-lg shadow-gray-200"
                    >
                        <Plus size={20} />
                        שבלונה חדשה
                    </button>
                    <button 
                        onClick={handleStartQuickWorkout}
                        className="flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-2xl font-black hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
                    >
                        <Play size={20} fill="currentColor" />
                        אימון מהיר
                    </button>
                </div>
            </div>

            {/* Content Grid */}
            <div className="max-w-7xl mx-auto">
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-64 bg-gray-50 animate-pulse rounded-[3rem]" />
                        ))}
                    </div>
                ) : templates.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 bg-gray-50 rounded-[3.5rem] border-2 border-dashed border-gray-100">
                        <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-sm mb-6">
                            <LayoutGrid size={40} className="text-gray-200" />
                        </div>
                        <h3 className="text-xl font-black text-gray-900">אין עדיין שבלונות אימון</h3>
                        <p className="text-gray-400 font-bold mt-2 mb-8">זה הזמן ליצור את תוכנית האימונים הראשונה שלך</p>
                        <button 
                            onClick={() => navigate('/workouts/create')}
                            className="text-blue-600 font-black flex items-center gap-2 hover:gap-4 transition-all"
                        >
                            צור שבלונה עכשיו <Plus size={20} />
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {templates.map(template => (
                            <WorkoutTemplateCard 
                                key={template.id} 
                                template={template} 
                                onStart={() => navigate(`/workouts/active?templateId=${template.id}`)}
                                onEdit={() => navigate(`/workouts/edit/${template.id}`)} // פונקציה חדשה
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Quick Stats Footer (Optional) */}
            <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-gray-50 flex items-center gap-8 text-gray-300">
                <div className="flex items-center gap-2">
                    <Activity size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">{templates.length} שבלונות זמינות</span>
                </div>
                <div className="flex items-center gap-2">
                    <Clock size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">מוכן לאימון הבא</span>
                </div>
            </div>
        </div>
    );
};

export default WorkoutsHubPage;
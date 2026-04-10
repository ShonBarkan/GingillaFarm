import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, Clock, Dumbbell, ArrowRight, Share2, Calendar } from 'lucide-react';

const WorkoutSummaryPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    // In a real scenario, you might fetch the last session details 
    // from the server using the ID passed in location.state
    const [summary, setSummary] = useState({
        duration: "00:00",
        totalExercises: 0,
        date: new Date().toLocaleDateString('he-IL')
    });

    useEffect(() => {
        // If we passed summary data via navigate state:
        if (location.state?.summary) {
            setSummary(location.state.summary);
        }
    }, [location]);

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-4 md:p-8" dir="rtl">
            <div className="max-w-2xl w-full bg-white rounded-[4rem] shadow-2xl shadow-blue-100/50 p-10 md:p-16 text-center border border-blue-50 relative overflow-hidden">
                
                {/* Background Decoration */}
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-50"></div>
                
                {/* Success Icon */}
                <div className="relative mb-10 inline-flex items-center justify-center">
                    <div className="absolute inset-0 bg-green-100 rounded-full scale-150 animate-ping opacity-20"></div>
                    <div className="relative w-24 h-24 bg-green-500 rounded-full flex items-center justify-center text-white shadow-xl shadow-green-200">
                        <CheckCircle size={48} strokeWidth={2.5} />
                    </div>
                </div>

                <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter mb-4">
                    כל הכבוד, <span className="text-blue-600">סיימת!</span>
                </h1>
                <p className="text-gray-400 font-bold text-lg mb-12">הנתונים נשמרו בהצלחה ביומן האימונים שלך.</p>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-6 mb-12">
                    <div className="bg-gray-50 p-6 rounded-[2.5rem] border border-gray-100">
                        <Clock className="text-blue-600 mx-auto mb-3" size={24} />
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">זמן אימון</p>
                        <p className="text-2xl font-black text-gray-900">{summary.duration || "45:00"}</p>
                    </div>
                    <div className="bg-gray-50 p-6 rounded-[2.5rem] border border-gray-100">
                        <Calendar className="text-blue-600 mx-auto mb-3" size={24} />
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">תאריך</p>
                        <p className="text-2xl font-black text-gray-900">{summary.date}</p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-4">
                    <button 
                        onClick={() => navigate('/')}
                        className="w-full bg-gray-900 text-white py-5 rounded-3xl font-black text-lg flex items-center justify-center gap-3 hover:bg-gray-800 transition-all shadow-lg"
                    >
                        חזרה לדאשבורד
                        <ArrowRight size={20} />
                    </button>
                    
                    <div className="flex gap-4">
                        <button 
                            onClick={() => navigate('/workouts')}
                            className="flex-1 bg-white border-2 border-gray-100 text-gray-900 py-4 rounded-3xl font-black flex items-center justify-center gap-2 hover:bg-gray-50 transition-all"
                        >
                            <Dumbbell size={18} />
                            אימון נוסף
                        </button>
                        <button className="bg-blue-50 text-blue-600 p-4 rounded-3xl hover:bg-blue-100 transition-all">
                            <Share2 size={24} />
                        </button>
                    </div>
                </div>

                {/* Motivational Quote */}
                <p className="mt-12 text-sm italic text-gray-300 font-medium">
                    "עקביות היא המפתח להצלחה. נתראה באימון הבא!"
                </p>
            </div>
        </div>
    );
};

export default WorkoutSummaryPage;
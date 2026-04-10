import React, { useState } from 'react';
import { Plus, Activity, Target, Zap } from 'lucide-react';

const Dashboard = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const handleTrainingComplete = () => {
        setRefreshTrigger(prev => prev + 1);
        console.log("Activity logged from dashboard!");
    };

    return (
        <div className="max-w-6xl mx-auto px-4 py-8" dir="rtl">
            <div className="bg-gradient-to-br from-gray-900 to-blue-900 rounded-[2.5rem] p-8 md:p-12 mb-10 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
                
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="text-center md:text-right">
                        <h1 className="text-4xl md:text-6xl font-black text-white mb-4">היי שון,</h1>
                        <p className="text-blue-100 text-lg font-medium opacity-80">מוכן לשבור את השיאים של עצמך היום?</p>
                    </div>

                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="group flex items-center gap-4 px-10 py-5 bg-white text-blue-900 rounded-2xl font-black text-xl shadow-xl hover:bg-blue-50 transition-all transform hover:scale-[1.03] active:scale-[0.97]"
                    >
                        <div className="bg-blue-600 text-white p-2 rounded-xl group-hover:rotate-90 transition-transform duration-300">
                            <Plus size={24} strokeWidth={3} />
                        </div>
                        <span>עשיתי אימון</span>
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-4 text-orange-500 mb-4">
                        <div className="p-3 bg-orange-50 rounded-2xl"><Zap size={24} /></div>
                        <span className="font-black text-gray-900">רצף אימונים</span>
                    </div>
                    <div className="text-3xl font-black">5 ימים</div>
                </div>
                
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-4 text-blue-500 mb-4">
                        <div className="p-3 bg-blue-50 rounded-2xl"><Activity size={24} /></div>
                        <span className="font-black text-gray-900">אימונים השבוע</span>
                    </div>
                    <div className="text-3xl font-black">12</div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-4 text-green-500 mb-4">
                        <div className="p-3 bg-green-50 rounded-2xl"><Target size={24} /></div>
                        <span className="font-black text-gray-900">יעדים שהושגו</span>
                    </div>
                    <div className="text-3xl font-black">2/4</div>
                </div>
            </div>

        
        </div>
    );
};

export default Dashboard;
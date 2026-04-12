import React from 'react';
import { Plus, Zap, Dumbbell } from 'lucide-react';

const DashboardHeader = ({ onLogClick }) => (
    <div className="bg-gradient-to-br from-gray-900 to-blue-900 rounded-[3.5rem] p-8 md:p-12 mb-10 shadow-2xl relative overflow-hidden animate-in fade-in duration-700">
        <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-center md:text-right px-4">
                <div className="flex items-center justify-center md:justify-start gap-3 mb-4 text-blue-400">
                    <Zap size={24} className="animate-pulse" />
                    <span className="text-xs font-black uppercase tracking-[0.3em]">Gingilla Farm Control</span>
                </div>
                <h1 className="text-5xl md:text-7xl font-black text-white mb-4 tracking-tighter leading-tight">היי שון,</h1>
                <p className="text-blue-100 text-lg md:text-xl font-bold opacity-80 italic">מוכן לשבור את השיאים של עצמך היום?</p>
            </div>
            <button 
                onClick={onLogClick}
                className="group flex items-center gap-4 px-10 py-6 bg-white text-blue-900 rounded-[2rem] font-black text-xl shadow-2xl hover:bg-blue-50 transition-all transform hover:scale-[1.03] active:scale-[0.97]"
            >
                <div className="bg-blue-600 text-white p-2 rounded-xl group-hover:rotate-90 transition-transform duration-300">
                    <Plus size={28} strokeWidth={3} />
                </div>
                <span>תיעוד ביצוע</span>
            </button>
        </div>
    </div>
);

export default DashboardHeader;
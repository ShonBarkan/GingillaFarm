import React from 'react';

const PastClassesEmptyState = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[320px] bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 p-8 text-center animate-fadeIn">
      <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6 shadow-sm border border-emerald-100">
        <span className="text-4xl animate-bounce">🌱</span>
      </div>
      
      <h4 className="text-xl font-black text-slate-800 mb-2">
        החווה מעודכנת לגמרי!
      </h4>
      
      <p className="text-sm text-slate-500 font-medium max-w-[240px] leading-relaxed">
        כל השיעורים האחרונים שלך כבר מבורוזים ומסוכמים. זמן מצוין לעשות הפסקה או לחזור על החומר.
      </p>

      <div className="mt-8 flex gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-300"></span>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-200"></span>
      </div>
    </div>
  );
};

export default PastClassesEmptyState;
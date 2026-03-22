import React from 'react';

const PastClassesBadge = ({ type, isMissing }) => {
  if (!isMissing) return null;

  const config = {
    summary: { label: 'PDF', icon: '📄', color: 'bg-rose-50 text-rose-700 border-rose-100' },
    ai_summary: { label: 'AI סיכום', icon: '✨', color: 'bg-rose-50 text-rose-700 border-rose-100' },
    ai_quiz: { label: 'בוחן', icon: '🎯', color: 'bg-rose-50 text-rose-700 border-rose-100' }
  };

  const current = config[type];
  if (!current) return null;

  return (
    <div className={`flex flex-col items-center justify-center gap-1 w-20 h-20 rounded-2xl border shadow-sm text-center transition-transform hover:scale-105 ${current.color}`}>
      <span className="text-xl leading-none">{current.icon}</span>
      <span className="text-[10px] font-black uppercase tracking-tighter leading-tight px-1">
        {current.label}
      </span>
      <div className="flex items-center gap-1 mt-0.5">
        <span className="w-1 h-1 rounded-full bg-current opacity-40 animate-pulse"></span>
        <span className="text-[8px] font-bold opacity-60">חסר</span>
      </div>
    </div>
  );
};

export default PastClassesBadge;
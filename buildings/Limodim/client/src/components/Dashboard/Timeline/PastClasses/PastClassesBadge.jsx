import React from 'react';

const PastClassesBadge = ({ type, isMissing }) => {
  if (!isMissing) return null;

  const config = {
    // Using Red and Warm colors for urgency
    summary: { label: 'PDF סיכומי', icon: '📄', color: 'bg-rose-50 text-rose-700 border-rose-100' },
    ai_summary: { label: 'AI סיכום', icon: '✨', color: 'bg-rose-50 text-rose-700 border-rose-100' },
    ai_quiz: { label: 'בוחן ידע', icon: '🎯', color: 'bg-rose-50 text-rose-700 border-rose-100' }
  };

  const current = config[type];
  if (!current) return null;

  return (
    <div className={`flex flex-col gap-1 p-3 rounded-xl border shadow-sm ${current.color}`}>
      <div className="flex items-center gap-2">
        <span className="text-base">{current.icon}</span>
        <span className="text-[16px] font-black uppercase tracking-tight">{current.label}</span>
      </div>
      <div className="flex items-center gap-1 mt-1">
        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-40 animate-pulse"></span>
        <span className="text-[12px] font-bold opacity-70">טרם הושלם</span>
      </div>
    </div>
  );
};

export default PastClassesBadge;
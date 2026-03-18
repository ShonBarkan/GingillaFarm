// src/components/common/TimeBadge.jsx
import React from 'react';

const TimeBadge = ({ daysLeft, color = 'blue' }) => {
  // 1. Determine the status level
  const isCritical = daysLeft <= 3;
  const isWarning = daysLeft > 3 && daysLeft <= 7;
  
  // 2. Map status to specific Tailwind classes
  const getStatusClasses = () => {
    if (isCritical) {
      return {
        text: 'text-red-600',
        border: 'border-red-200',
        bg: 'bg-red-50',
        label: 'text-red-400',
        animate: 'animate-pulse' // Adds a subtle blink for high urgency
      };
    }
    if (isWarning) {
      return {
        text: 'text-amber-600',
        border: 'border-amber-200',
        bg: 'bg-amber-50',
        label: 'text-amber-400',
        animate: ''
      };
    }
    // Neutral state: Uses the provided color prop logic
    const colorBases = {
      emerald: { text: 'text-emerald-600', border: 'border-emerald-100', bg: 'bg-white', label: 'text-slate-400' },
      blue: { text: 'text-blue-600', border: 'border-blue-100', bg: 'bg-white', label: 'text-slate-400' },
      red: { text: 'text-red-600', border: 'border-red-100', bg: 'bg-white', label: 'text-slate-400' },
    };
    return colorBases[color] || colorBases.blue;
  };

  const status = getStatusClasses();

  return (
    <div className={`text-center px-3 py-1.5 rounded-lg border min-w-[70px] shadow-sm transition-all duration-300 ${status.bg} ${status.border} ${status.animate}`}>
      <span className={`block font-black text-lg leading-none ${status.text}`}>
        {daysLeft === 0 ? 'Today' : daysLeft < 0 ? 'Late' : daysLeft}
      </span>
      <span className={`text-[8px] font-black uppercase mt-1 block tracking-tighter ${status.label}`}>
        {daysLeft === 0 ? 'Good Luck' : daysLeft < 0 ? 'Past Due' : 'Days Left'}
      </span>
    </div>
  );
};

export default TimeBadge;
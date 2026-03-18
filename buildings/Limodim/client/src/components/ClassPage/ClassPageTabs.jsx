import React from 'react';

const ClassPageTabs = ({ activeTab, setActiveTab }) => {
  // Tab configuration for easier maintenance
  const tabs = [
    { id: 'files', label: 'קבצים ומסמכים', icon: '📂' },
    { id: 'summary', label: 'סיכום AI חכם', icon: '✨' },
    { id: 'quiz', label: 'בוחן תרגול', icon: '📝' },
  ];

  return (
    <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto no-scrollbar">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-black transition-all relative whitespace-nowrap ${
              isActive 
                ? 'text-blue-600' 
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50/50'
            }`}
          >
            <span className="text-base">{tab.icon}</span>
            <span>{tab.label}</span>
            
            {/* Active Indicator Line */}
            {isActive && (
              <div 
                className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-full shadow-[0_-2px_10px_rgba(37,99,235,0.3)]" 
                layoutId="activeTab"
              />
            )}
          </button>
        );
      })}
    </div>
  );
};

export default ClassPageTabs;
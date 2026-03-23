import React from 'react';
import { Files, BookOpen, BrainCircuit } from 'lucide-react';

const ClassPageTabs = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'files', label: 'חומרי שיעור', icon: <Files size={18} /> },
    { id: 'summary', label: 'סיכום AI', icon: <BookOpen size={18} /> },
    { id: 'quiz', label: 'תרגול AI', icon: <BrainCircuit size={18} /> },
  ];

  return (
    <div className="flex items-center gap-2 p-1.5 bg-slate-200/50 backdrop-blur-md rounded-[24px] w-fit">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`
            flex items-center gap-2 px-6 py-2.5 rounded-[20px] text-sm font-black transition-all duration-300
            ${activeTab === tab.id 
              ? 'bg-white text-slate-900 shadow-sm' 
              : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'}
          `}
        >
          {tab.icon}
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default ClassPageTabs;
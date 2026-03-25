import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Download } from 'lucide-react';

const ClassPageHeader = ({ 
  courseId, 
  currentClass, 
  prevClass, 
  nextClass, 
  onNavigateClass 
}) => {
  const navigate = useNavigate();

  const handleDownload = () => {
    const classId = currentClass?.id;
    if (!classId) return;
    
    const apiBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:8002";
    const downloadUrl = `${apiBaseUrl}/classes/${classId}/export`;
    
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', `lesson_${classId}.html`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <header className="bg-white border-b border-slate-200 p-4 shadow-sm z-40 sticky top-0">
      <div className="max-w-7xl mx-auto grid grid-cols-3 items-center">
        
        <div className="flex justify-start">
          <button 
            onClick={() => navigate(`/course/${courseId}`)} 
            className="text-slate-400 hover:text-blue-600 transition p-1 text-2xl"
          >
            →
          </button>
        </div>

        <div className="flex items-center justify-center gap-4 md:gap-8">
          <button 
            type="button"
            disabled={!prevClass}
            onClick={() => prevClass?.id && onNavigateClass(prevClass.id)}
            className={`p-2 rounded-full transition ${
              !prevClass ? 'text-slate-200 cursor-not-allowed' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span className="text-2xl">‹</span>
          </button>

          <div className="text-center">
            <h1 className="text-lg md:text-xl font-black text-slate-800 leading-none">
              {currentClass?.name || `Lesson #${currentClass?.number}`}
            </h1>
            <p className="text-[9px] md:text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-widest">
              Lesson #{currentClass?.number} | {currentClass?.date_taken} | {currentClass?.class_type}
            </p>
          </div>

          <button 
            type="button"
            disabled={!nextClass}
            onClick={() => nextClass?.id && onNavigateClass(nextClass.id)}
            className={`p-2 rounded-full transition ${
              !nextClass ? 'text-slate-200 cursor-not-allowed' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span className="text-2xl">›</span>
          </button>
        </div>

        <div className="flex justify-end items-center gap-3">
          <button 
            onClick={handleDownload}
            className="flex items-center gap-2 text-[11px] font-black text-slate-400 hover:text-blue-600 transition-all uppercase tracking-tight bg-slate-50 px-3 py-2 rounded-xl border border-slate-100"
          >
            <Download size={14} />
            <span className="hidden md:inline">Export HTML</span>
          </button>
        </div>

      </div>
    </header>
  );
};

export default ClassPageHeader;
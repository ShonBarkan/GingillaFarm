import React from 'react';
import { useNavigate } from 'react-router-dom';

const ClassPageHeader = ({ 
  courseId, 
  currentClass, 
  prevClass, 
  nextClass, 
  isUploading, 
  handleFileUpload,
  onNavigateClass 
}) => {
  const navigate = useNavigate();

  return (
    <header className="bg-white border-b border-slate-200 p-4 shadow-sm z-40 sticky top-0">
      <div className="max-w-7xl mx-auto grid grid-cols-3 items-center">
        
        <div className="flex justify-start">
          <button 
            onClick={() => navigate(`/course/${courseId}`)} 
            className="text-slate-400 hover:text-blue-600 transition p-1 text-2xl"
            title="חזרה לקורס"
          >
            →
          </button>
        </div>

        <div className="flex items-center justify-center gap-4 md:gap-8">
          <button 
            disabled={!prevClass}
            onClick={() => onNavigateClass(prevClass.id)}
            className={`p-2 rounded-full transition ${
              !prevClass ? 'text-slate-200 cursor-not-allowed' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span className="text-2xl">‹</span>
          </button>

          <div className="text-center">
            <h1 className="text-lg md:text-xl font-black text-slate-800 leading-none">
              {currentClass.name || `שיעור #${currentClass.number}`}
            </h1>
            <p className="text-[9px] md:text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-widest">
              שיעור #{currentClass.number} | {currentClass.date_taken} | {currentClass.class_type}
            </p>
          </div>

          <button 
            disabled={!nextClass}
            onClick={() => onNavigateClass(nextClass.id)}
            className={`p-2 rounded-full transition ${
              !nextClass ? 'text-slate-200 cursor-not-allowed' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span className="text-2xl">›</span>
          </button>
        </div>

        <div className="flex justify-end">
          <label className="bg-blue-600 text-white px-5 py-2 rounded-xl font-bold text-xs cursor-pointer active:scale-95 transition shadow-lg hover:bg-blue-700">
            {isUploading ? 'מעלה...' : '+ הוסף PDF'}
            <input 
              type="file" 
              accept="application/pdf" 
              className="hidden" 
              onChange={handleFileUpload} 
              disabled={isUploading} 
            />
          </label>
        </div>

      </div>
    </header>
  );
};

export default ClassPageHeader;
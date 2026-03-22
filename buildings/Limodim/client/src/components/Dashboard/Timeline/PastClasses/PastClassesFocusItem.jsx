import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from "../../../../api/api";
import PastClassesBadge from './PastClassesBadge';

const PastClassesFocusItem = ({ item, onRefresh, onNext, onPrev, hasPrev, hasNext, currentIndex, total }) => {
  const [birvouzText, setBirvouzText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setBirvouzText(item.birvouz || '');
  }, [item.id, item.birvouz]);

  const handleQuickSave = async () => {
      if (!item.id) {
        console.error("Missing ID: Cannot update a class without a valid ID.");
        alert("שגיאה: לא ניתן לעדכן שיעור ללא מזהה תקין.");
        return;
      }

    setIsSubmitting(true);
    try {
      const updateData = {
        course_id: item.course_id,
        name: item.class_name || `שיעור מ-${item.date}`,
        number: item.number || 1,
        date_taken: item.date,
        birvouz: birvouzText,
      };

      await api.updateClass(item.id, updateData);
      
      onRefresh();
    } catch (err) {
      console.error("Update failed:", err);
      alert("שגיאה בעדכון. וודא שכל השדות תקינים.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative h-full flex items-center px-2" dir="rtl">
      
      {/* Navigation Arrows */}
      <button 
        disabled={!hasPrev}
        onClick={onPrev}
        className={`absolute -right-2 z-10 w-8 h-8 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center transition-all ${!hasPrev ? 'opacity-0' : 'hover:border-red-400 hover:text-red-600 active:scale-90'}`}
      >
        <span className="text-lg">→</span>
      </button>

      <button 
        disabled={!hasNext}
        onClick={onNext}
        className={`absolute -left-2 z-10 w-8 h-8 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center transition-all ${!hasNext ? 'opacity-0' : 'hover:border-red-400 hover:text-red-600 active:scale-90'}`}
      >
        <span className="text-lg">←</span>
      </button>

      <div className="w-full bg-white rounded-3xl p-7 border border-red-50 shadow-[0_8px_30px_rgb(220,38,38,0.03)] flex flex-col h-full min-h-[380px]">
        
        {/* Top Header */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1">
            <h3 className="text-3xl font-black text-slate-900 leading-tight tracking-tight">
              {item.course_name}
            </h3>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-sm font-bold text-slate-500">
                {item.class_name || `שיעור מ-${item.date}`}
              </span>
              <span className="text-[11px] text-slate-300 font-medium tabular-nums">{item.date}</span>
            </div>
          </div>
          <div className="text-[10px] font-black text-slate-200 tabular-nums">
            {currentIndex + 1} / {total}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col md:flex gap-6">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">משימות להשלמה</label>
            
            <div className="flex flex-row gap-3">
              <PastClassesBadge type="summary" isMissing={item.missing.summary} />
              <PastClassesBadge type="ai_summary" isMissing={item.missing.ai_summary} />
              <PastClassesBadge type="ai_quiz" isMissing={item.missing.ai_quiz} />
              
              {!item.missing.summary && !item.missing.ai_summary && !item.missing.ai_quiz && (
                <div className="py-4 text-center border border-dashed border-slate-200 rounded-xl">
                  <span className="text-lg block mb-1">✨</span>
                  <p className="text-[9px] font-bold text-slate-400">הכל מושלם!</p>
                </div>
              )}
            </div>

          {item.missing.birvouz && (

          <div className="flex-[2] flex flex-col h-full">
            <div className="flex items-center justify-between mb-2 px-1">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">תיאור השיעור (בירווז)</label>
            </div>
            <div className="flex flex-col h-full">
              <textarea 
                className="w-full flex-1 p-5 rounded-2xl border border-slate-100 text-sm focus:ring-2 focus:ring-red-500/10 focus:border-red-500 outline-none transition-all resize-none bg-slate-50/30 text-slate-700 font-medium leading-relaxed"
                placeholder="מה למדנו היום? הוסף פירוט כאן..."
                value={birvouzText}
                onChange={(e) => setBirvouzText(e.target.value)}
              />
              <button 
                onClick={handleQuickSave}
                disabled={isSubmitting}
                className="mt-3 w-full bg-red-600 text-white py-3 rounded-xl font-black text-xs hover:bg-red-700 transition-all shadow-md active:scale-[0.98] disabled:opacity-50"
              >
                {isSubmitting ? 'מעדכן...' : 'שמור בירווז'}
              </button>
            </div>
          </div>
          )}


          <div className="flex-1 flex flex-col border-r border-slate-100 pr-6">
            <div className="mt-auto pt-4">
              <Link 
                to={`/course/${item.course_id}/class/${item.id}`}
                className="group flex items-center justify-between w-full p-3 rounded-xl text-red-600 hover:bg-red-600 hover:text-white transition-all border border-red-50"
              >
                <span className="text-[10px] font-black uppercase">לניהול מלא</span>
                <span className="text-sm transition-transform group-hover:-translate-x-1">←</span>
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PastClassesFocusItem;
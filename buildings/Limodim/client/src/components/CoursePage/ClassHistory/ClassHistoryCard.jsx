import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const ClassHistoryCard = ({ cls, isEditing, setEditingCardId, courseId, handleUpdate, handleDelete }) => {
  // Local state to handle input changes without immediate API calls
  const [localData, setLocalData] = useState(cls);
  
  const summaryArray = Array.isArray(localData.summary) 
    ? localData.summary 
    : [];
  const hasSummary = summaryArray.length > 0;

  useEffect(() => {
    setLocalData(cls);
  }, [cls]);

  const handleChange = (field, value) => {
    setLocalData(prev => ({ ...prev, [field]: value }));
  };

  const triggerUpdate = () => {
    if (JSON.stringify(localData) !== JSON.stringify(cls)) {
      handleUpdate(cls.id, localData);
    }
  };

  return (
    <div className={`p-4 md:p-5 rounded-2xl border-r-4 transition-all ${
      isEditing 
        ? 'bg-white border-emerald-400 shadow-md ring-1 ring-emerald-100' 
        : 'bg-slate-50 border-emerald-500 shadow-sm hover:bg-slate-100/50'
    }`}>
      
      {isEditing ? (
        /* --- Edit Mode --- */
        <div className="space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">
              עריכת שיעור #{localData.number}
            </span>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setEditingCardId(null)}
                className="text-[10px] font-bold bg-emerald-600 text-white px-3 py-1 rounded-lg shadow-sm hover:bg-emerald-700 transition"
              >
                סיום
              </button>
              <button 
                onClick={() => handleDelete(cls.id)} 
                className="text-red-400 hover:text-red-600 p-1 transition active:scale-90"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-bold text-slate-400 uppercase">מספר</label>
              <input 
                type="number" 
                className="p-2 border rounded-xl text-sm bg-white outline-none focus:ring-1 focus:ring-emerald-500"
                value={localData.number} 
                onChange={(e) => handleChange('number', parseInt(e.target.value))}
                onBlur={triggerUpdate}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-bold text-slate-400 uppercase">תאריך</label>
              <input 
                type="date" 
                className="p-2 border rounded-xl text-sm bg-white outline-none focus:ring-1 focus:ring-emerald-500"
                value={localData.date_taken} 
                onChange={(e) => handleChange('date_taken', e.target.value)}
                onBlur={triggerUpdate}
              />
            </div>
            <div className="flex flex-col gap-1 col-span-2 md:col-span-1">
              <label className="text-[9px] font-bold text-slate-400 uppercase">סוג שיעור</label>
              <input 
                type="text" 
                className="p-2 border rounded-xl text-sm bg-white outline-none focus:ring-1 focus:ring-emerald-500"
                value={localData.class_type} 
                onChange={(e) => handleChange('class_type', e.target.value)}
                onBlur={triggerUpdate}
              />
            </div>
          </div>

          {/* New Field: Topic/Name in Edit Mode */}
          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-bold text-slate-400 uppercase">נושא השיעור</label>
            <input 
              type="text" 
              placeholder="מה היה נושא השיעור?"
              className="p-2 border rounded-xl text-sm bg-white outline-none focus:ring-1 focus:ring-emerald-500 font-bold"
              value={localData.name || ''} 
              onChange={(e) => handleChange('name', e.target.value)}
              onBlur={triggerUpdate}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[9px] font-bold text-slate-400 uppercase">תיאור (בירווז)</label>
            <textarea 
              className="w-full text-sm p-3 bg-white border rounded-xl outline-none focus:ring-1 focus:ring-emerald-500 min-h-[80px]"
              value={localData.birvouz} 
              onChange={(e) => handleChange('birvouz', e.target.value)}
              onBlur={triggerUpdate}
            />
          </div>
        </div>
      ) : (
        /* --- Display Mode --- */
        <div className="flex justify-between items-start">
          <div className="flex flex-col gap-2 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              {cls.name && (
                <span className="font-bold text-slate-700 text-sm md:text-base border-r-2 border-slate-200 pr-3 truncate">
                  {cls.name}
                </span>
              )}

              <span className="text-[9px] md:text-[10px] bg-emerald-100 text-emerald-700 px-2.5 py-0.5 rounded-full font-black uppercase tracking-tight border border-emerald-200">
                {cls.class_type}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
                {hasSummary ? (
                    <span className="text-[8px] md:text-[9px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded font-black uppercase tracking-tighter">
                    סיכומים זמינים ({summaryArray.length}) 📄
                    </span>
                ) : (
                    <span className="text-[8px] md:text-[9px] bg-slate-200 text-slate-500 px-2 py-0.5 rounded font-black uppercase tracking-tighter">
                    אין סיכום
                    </span>
                )}
            </div>
            
            <p className="text-slate-700 text-[13px] md:text-sm italic leading-relaxed pr-3 border-r-2 border-emerald-200 mt-1">
              "{cls.birvouz}"
            </p>
          </div>

          <div className="flex items-center gap-4 shrink-0 mr-4">
            <div className="flex flex-col items-end gap-2">
              <span className="text-[11px] md:text-xs text-emerald-700 font-bold opacity-60">{cls.date_taken}</span>
              <Link 
                to={`/course/${courseId}/class/${cls.id}`}
                className="text-[10px] font-black bg-white text-emerald-600 border border-emerald-100 px-3 py-1.5 rounded-xl shadow-sm hover:bg-emerald-600 hover:text-white transition-all whitespace-nowrap"
              >
                פתח שיעור ↗
              </Link>
            </div>
            
            {/* Pencil Icon to toggle editing */}
            <button 
              onClick={() => setEditingCardId(cls.id)}
              className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition-all active:scale-90"
              title="Edit Lesson"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassHistoryCard;
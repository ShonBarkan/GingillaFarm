import React, { useState } from 'react';
import TimeBadge from '../../common/TimeBadge';

const HomeworkItem = ({ hw, isManageMode, onUpdate, onDelete, onToggleDone }) => {
  const [isItemEditing, setIsItemEditing] = useState(false);
  const [editBuffer, setEditBuffer] = useState({ ...hw });

  const getDaysLeft = (dueDate) => {
    if (!dueDate) return 999;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    const diffTime = due - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const handleSave = () => {
    onUpdate(hw.id, editBuffer);
    setIsItemEditing(false);
  };

  if (isItemEditing) {
    return (
      <div className="p-5 border border-blue-200 rounded-xl bg-white shadow-sm space-y-3">
        <input 
          className="w-full p-2.5 border border-blue-100 rounded-lg text-sm font-bold outline-none focus:ring-2 focus:ring-blue-50" 
          value={editBuffer.name} 
          onChange={(e) => setEditBuffer({...editBuffer, name: e.target.value})} 
        />
        <div className="grid grid-cols-2 gap-2">
          <input type="date" className="p-2 border border-slate-200 rounded-lg text-sm" value={editBuffer.due_date || ''} onChange={(e) => setEditBuffer({...editBuffer, due_date: e.target.value})} />
          <input type="number" className="p-2 border border-slate-200 rounded-lg text-sm" value={editBuffer.grade || ''} onChange={(e) => setEditBuffer({...editBuffer, grade: parseFloat(e.target.value)})} />
        </div>
        <div className="flex items-center gap-2 py-1">
          <input type="checkbox" id={`done-${hw.id}`} checked={editBuffer.is_done} onChange={(e) => setEditBuffer({...editBuffer, is_done: e.target.checked})} className="w-4 h-4 accent-blue-600 rounded" />
          <label htmlFor={`done-${hw.id}`} className="text-xs font-bold text-slate-600">סומן כבוצע</label>
        </div>
        <div className="flex justify-between items-center pt-2 border-t border-slate-50">
          <button onClick={() => onDelete(hw.id)} className="text-red-500 text-[11px] font-bold hover:underline">מחק</button>
          <div className="flex gap-2">
            <button onClick={() => setIsItemEditing(false)} className="text-slate-400 text-[11px] font-bold px-2 py-1">ביטול</button>
            <button onClick={handleSave} className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-[11px] font-bold shadow-sm">שמור</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-5 md:p-4 border rounded-xl transition-all relative group shadow-sm md:shadow-none ${
      hw.is_done ? 'bg-slate-50 border-slate-100 opacity-60' : 'bg-white border-slate-100 hover:bg-slate-50'
    }`}>
      <div className="flex justify-between items-center gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <input 
              type="checkbox"
              checked={hw.is_done}
              onChange={() => onToggleDone(hw)}
              className="w-5 h-5 accent-emerald-500 cursor-pointer rounded shrink-0"
            />
            <span className={`font-black text-sm md:text-base transition-all truncate ${hw.is_done ? 'line-through text-slate-400' : 'text-slate-800'}`}>
              {hw.name}
            </span>
          </div>
          <div className="flex items-center gap-2 mb-3">
            <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${hw.is_done ? 'bg-slate-200 text-slate-500' : 'bg-blue-50 text-blue-600'}`}>Due</span>
            <p className={`text-[12px] md:text-sm font-bold ${hw.is_done ? 'text-slate-400' : 'text-slate-500'}`}>{hw.due_date || 'No Date'}</p>
          </div>
          <div className="flex items-center gap-2">
            {hw.link_to && (
              <a href={hw.link_to.startsWith('http') ? hw.link_to : `https://${hw.link_to}`} target="_blank" rel="noreferrer" className="text-[11px] font-black text-blue-600 hover:underline">הנחיות 🔗</a>
            )}
            {hw.grade !== null && <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">ציון: {hw.grade}</span>}
          </div>
        </div>
        <div className="flex flex-col items-center gap-2 shrink-0">
          {!hw.is_done && <TimeBadge daysLeft={getDaysLeft(hw.due_date)} color="emerald" />}
          {isManageMode && (
            <button onClick={() => setIsItemEditing(true)} className="text-blue-500 text-[10px] font-bold border border-blue-100 px-3 py-1 rounded-lg hover:bg-blue-50">ערוך</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomeworkItem;
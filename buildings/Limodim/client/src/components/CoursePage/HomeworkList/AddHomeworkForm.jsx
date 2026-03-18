import React, { useState } from 'react';

const AddHomeworkForm = ({ onAdd }) => {
  const [newHw, setNewHw] = useState({ 
    name: '', 
    due_date: '', 
    grade: null, 
    link_to: '', 
    is_done: false 
  });

  const handleSubmit = () => {
    if (!newHw.name.trim()) {
      return alert("יש להזין שם למטלה");
    }

    onAdd(newHw);

    setNewHw({ 
      name: '', 
      due_date: '', 
      grade: null, 
      link_to: '', 
      is_done: false 
    });
  };

  return (
    <div className="p-5 border-2 border-dashed border-blue-100 rounded-xl bg-blue-50/20 space-y-3">
      <div className="flex items-center gap-2 px-1 mb-1">
        <span className="w-1.5 h-4 bg-blue-400 rounded-full"></span>
        <p className="text-[10px] md:text-xs font-black text-blue-500 uppercase tracking-widest">
          מטלה חדשה
        </p>
      </div>
      
      <input 
        placeholder="שם המטלה (חובה)" 
        className="w-full p-3 border border-slate-200 rounded-xl text-sm bg-white font-bold outline-none focus:ring-2 focus:ring-blue-100 transition-all" 
        value={newHw.name} 
        onChange={(e) => setNewHw({...newHw, name: e.target.value})} 
      />
      
      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col gap-1">
          <label className="text-[9px] font-bold text-slate-400 mr-2">תאריך הגשה</label>
          <input 
            type="date" 
            className="w-full p-3 border border-slate-200 rounded-xl text-sm bg-white outline-none focus:ring-2 focus:ring-blue-50 transition-all" 
            value={newHw.due_date} 
            onChange={(e) => setNewHw({...newHw, due_date: e.target.value})} 
          />
        </div>
        
        <div className="flex flex-col gap-1">
          <label className="text-[9px] font-bold text-slate-400 mr-2">ציון (אם יש)</label>
          <input 
            type="number" 
            placeholder="ציון" 
            className="w-full p-3 border border-slate-200 rounded-xl text-sm bg-white outline-none focus:ring-2 focus:ring-blue-50 transition-all" 
            value={newHw.grade || ''} 
            onChange={(e) => setNewHw({...newHw, grade: e.target.value ? parseFloat(e.target.value) : null})} 
          />
        </div>
      </div>

      <input 
        placeholder="URL למטלה" 
        className="w-full p-3 border border-slate-200 rounded-xl text-sm bg-white outline-none focus:ring-2 focus:ring-blue-50 transition-all" 
        value={newHw.link_to} 
        onChange={(e) => setNewHw({...newHw, link_to: e.target.value})} 
      />
      
      <button 
        onClick={handleSubmit} 
        className="w-full bg-blue-600 text-white text-sm font-bold py-3 rounded-xl shadow-lg shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all mt-2"
      >
        הוסף מטלה לרשימה
      </button>
    </div>
  );
};

export default AddHomeworkForm;
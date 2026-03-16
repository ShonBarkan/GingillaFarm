import React from 'react';

const ClassHistoryAddForm = ({ newClass, setNewClass, handleAdd }) => {
  return (
    <div className="p-4 md:p-5 bg-emerald-50 border-2 border-dashed border-emerald-200 rounded-2xl space-y-4 mb-8">
      <p className="text-[10px] md:text-xs font-black text-emerald-700 uppercase tracking-widest">תיעוד שיעור חדש (בירווז)</p>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Number Input */}
        <div className="flex flex-col gap-1">
          <label className="text-[9px] font-bold text-emerald-800/50 uppercase px-1">מספר</label>
          <input 
            type="number" 
            placeholder="#" 
            className="p-3 md:p-2 border rounded-xl text-sm w-full outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
            value={newClass.number} 
            onChange={(e) => setNewClass({...newClass, number: parseInt(e.target.value)})}
          />
        </div>
        
        {/* Date Input */}
        <div className="flex flex-col gap-1 sm:col-span-2">
          <label className="text-[9px] font-bold text-emerald-800/50 uppercase px-1">תאריך</label>
          <input 
            type="date" 
            className="p-3 md:p-2 border rounded-xl text-sm w-full outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
            value={newClass.date_taken} 
            onChange={(e) => setNewClass({...newClass, date_taken: e.target.value})}
          />
        </div>
      </div>

      {/* Name Input - NEW FIELD */}
      <div className="flex flex-col gap-1">
        <label className="text-[9px] font-bold text-emerald-800/50 uppercase px-1">נושא / שם השיעור</label>
        <input 
          placeholder="לדוגמה: מבוא לפוטוסינתזה, תרגול אינטגרלים..."
          className="p-3 md:p-2 border rounded-xl text-sm w-full outline-none focus:ring-1 focus:ring-emerald-500 bg-white font-bold text-emerald-900"
          value={newClass.name || ''} 
          onChange={(e) => setNewClass({...newClass, name: e.target.value})}
        />
      </div>

      {/* Class Type Input */}
      <div className="flex flex-col gap-1">
        <label className="text-[9px] font-bold text-emerald-800/50 uppercase px-1">סוג שיעור</label>
        <input 
          placeholder="לדוגמה: Lecture, Lab, Workshop"
          className="p-3 md:p-2 border rounded-xl text-sm w-full outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
          value={newClass.class_type} 
          onChange={(e) => setNewClass({...newClass, class_type: e.target.value})}
        />
      </div>

      {/* Birvouz Textarea */}
      <div className="flex flex-col gap-1">
        <label className="text-[9px] font-bold text-emerald-800/50 uppercase px-1">תיאור (בירווז)</label>
        <textarea 
          placeholder="מה קרה בשיעור?"
          className="w-full p-3 md:p-2 border rounded-xl text-sm h-24 outline-none focus:ring-1 focus:ring-emerald-500 bg-white resize-none"
          value={newClass.birvouz} 
          onChange={(e) => setNewClass({...newClass, birvouz: e.target.value})}
        />
      </div>

      <button 
        onClick={handleAdd} 
        className="w-full bg-emerald-600 text-white font-bold py-3 rounded-xl hover:bg-emerald-700 transition shadow-md active:scale-[0.98]"
      >
        שמור שיעור חדש לחווה
      </button>
    </div>
  );
};

export default ClassHistoryAddForm;
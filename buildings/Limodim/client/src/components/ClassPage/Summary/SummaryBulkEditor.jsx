import React from 'react';
import { Save, Loader2 } from 'lucide-react';

const SummaryBulkEditor = ({ jsonInput, setJsonInput, onSave, onCancel, isSaving }) => {
  return (
    <div className="space-y-4 animate-in slide-in-from-top-4 duration-300">
      <div className="bg-slate-900 rounded-3xl p-6 shadow-inner border-4 border-slate-800">
        <label className="text-blue-400 text-[10px] font-black mb-3 block uppercase tracking-widest">
          הדבק מבנה JSON מלא (תומך ברקורסיה)
        </label>
        <textarea 
          className="w-full bg-transparent text-blue-300 font-mono text-sm border-none focus:ring-0 outline-none resize-none"
          rows={20}
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
          placeholder='[ { "title": "...", "content": "..." } ]'
          dir="ltr"
          disabled={isSaving}
        />
      </div>
      <div className="flex justify-end gap-3">
        <button 
          onClick={onCancel} 
          className="px-6 py-2 text-slate-500 font-bold" 
          disabled={isSaving}
        >
          ביטול
        </button>
        <button 
          onClick={onSave} 
          disabled={isSaving} 
          className="bg-blue-600 text-white px-8 py-2 rounded-2xl font-black flex items-center gap-2 shadow-lg shadow-blue-200"
        >
          {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
          עדכון מסד נתונים
        </button>
      </div>
    </div>
  );
};

export default SummaryBulkEditor;
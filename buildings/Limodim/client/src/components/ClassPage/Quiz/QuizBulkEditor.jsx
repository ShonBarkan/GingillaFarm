import React from 'react';
import { Save, Loader2 } from 'lucide-react';

const QuizBulkEditor = ({ jsonInput, setJsonInput, onSave, onCancel, isSaving }) => (
  <div className="space-y-4 animate-in slide-in-from-top-4 duration-300">
    <div className="bg-slate-900 rounded-3xl p-6 border-4 border-slate-800 shadow-inner">
      <label className="text-purple-400 text-[10px] font-black mb-3 block uppercase tracking-widest">
        הדבק מבנה JSON לשאלות (מערך אובייקטים)
      </label>
      <textarea 
        className="w-full bg-transparent text-purple-200 font-mono text-sm border-none outline-none resize-none focus:ring-0"
        rows={15}
        value={jsonInput}
        onChange={(e) => setJsonInput(e.target.value)}
        placeholder='[ { "question_text": "...", "correct_answer": "...", "distractors": [...] }, ... ]'
        dir="ltr"
        disabled={isSaving}
      />
    </div>
    <div className="flex justify-end gap-3">
      <button onClick={onCancel} className="px-6 py-2 text-slate-500 font-bold" disabled={isSaving}>ביטול</button>
      <button 
        onClick={onSave} 
        disabled={isSaving}
        className="bg-purple-600 text-white px-8 py-2 rounded-2xl font-black flex items-center gap-2 shadow-lg shadow-purple-100"
      >
        {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
        עדכון שאלות
      </button>
    </div>
  </div>
);

export default QuizBulkEditor;
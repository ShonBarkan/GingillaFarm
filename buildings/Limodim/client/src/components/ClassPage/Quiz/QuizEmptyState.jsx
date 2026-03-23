import React from 'react';
import { BrainCircuit, Sparkles, Plus } from 'lucide-react';

const QuizEmptyState = ({ onCreate, isSaving }) => (
  <div className="py-20 text-center bg-white rounded-[40px] border-2 border-dashed border-slate-200 animate-in fade-in zoom-in-95 duration-500">
    <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-6">
      <BrainCircuit size={40} className="text-purple-400" />
    </div>
    <h3 className="text-xl font-black text-slate-800 mb-2">אין עדיין תרגול לשיעור זה</h3>
    <p className="text-slate-400 text-sm max-w-xs mx-auto mb-8 leading-relaxed">
      צור שאלון חדש כדי להתחיל לבנות תרגול מבוסס AI עם שאלות אמריקאיות והסברים.
    </p>
    <button 
      onClick={onCreate}
      disabled={isSaving}
      className="bg-purple-600 text-white px-10 py-4 rounded-2xl font-black flex items-center gap-2 mx-auto hover:bg-purple-700 transition-all shadow-lg shadow-purple-100 disabled:opacity-50"
    >
      <Plus size={20} />
      יצירת שאלון חדש
    </button>
  </div>
);

export default QuizEmptyState;
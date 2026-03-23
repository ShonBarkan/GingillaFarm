import React from 'react';
import { PlusCircle } from 'lucide-react';

const NodeEditFields = ({ editData, setEditData, onAddSubTopic }) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase text-slate-400 mr-2">סוג תוכן</label>
          <select 
            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-400"
            value={editData.summary_type}
            onChange={(e) => setEditData({...editData, summary_type: e.target.value})}
          >
            <option value="definition">הגדרה</option>
            <option value="proof">הוכחה</option>
            <option value="example">דוגמה</option>
            <option value="formula">נוסחה</option>
          </select>
        </div>
        <div className="space-y-1 flex flex-col justify-end">
          <button 
            onClick={onAddSubTopic}
            className="flex items-center justify-center gap-2 bg-blue-50 text-blue-600 border border-blue-100 py-2 rounded-xl text-xs font-black hover:bg-blue-100 transition-all"
          >
            <PlusCircle size={14} />
            הוספת תת-נושא
          </button>
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-[10px] font-black uppercase text-slate-400 mr-2">תוכן (Markdown + LaTeX)</label>
        <textarea 
          className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm font-mono leading-relaxed focus:ring-2 ring-blue-500/20 outline-none min-h-[120px]"
          value={editData.content}
          onChange={(e) => setEditData({...editData, content: e.target.value})}
        />
      </div>

      <div className="space-y-1">
        <label className="text-[10px] font-black uppercase text-slate-400 mr-2">סוג ויזואליה</label>
        <select 
          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-400"
          value={editData.visual?.type || 'none'}
          onChange={(e) => setEditData({...editData, visual: {...editData.visual, type: e.target.value}})}
        >
          <option value="none">ללא</option>
          <option value="svg">SVG Code</option>
          <option value="url">Image URL</option>
          <option value="mermaid">Mermaid Diagram</option>
        </select>
      </div>

      {editData.visual?.type !== 'none' && (
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase text-blue-400 mr-2">ערך ויזואלי ({editData.visual.type})</label>
          <textarea 
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-mono outline-none focus:border-blue-400"
            value={editData.visual.value}
            onChange={(e) => setEditData({...editData, visual: {...editData.visual, value: e.target.value}})}
            rows={3}
          />
        </div>
      )}
    </div>
  );
};

export default NodeEditFields;
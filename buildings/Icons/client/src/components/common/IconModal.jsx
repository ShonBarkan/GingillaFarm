import React, { useState } from 'react';
import DisplaySvg from './DisplaySvg';

const IconModal = ({ isOpen, onClose, icon, onDelete, onEdit }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ ...icon });
  const [copyStatus, setCopyStatus] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(icon.svg_content);
    setCopyStatus(true);
    setTimeout(() => setCopyStatus(false), 2000);
  };

  const handleSave = (e) => {
    onEdit(icon.id, editData);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm("למחוק את הנכס לצמיתות?")) {
      onDelete(icon.id);
      onClose();
    }
  };

  const handleInternalClose = () => {
    setIsEditing(false);
    setEditData({ ...icon });
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-300"
      onClick={handleInternalClose}
    >
      <div 
        className="relative bg-slate-900 border border-slate-800 p-10 md:p-12 rounded-[3.5rem] shadow-2xl max-w-xl w-full flex flex-col items-center animate-in zoom-in duration-300"
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        {/* כפתור סגירה */}
        <button 
          className="absolute top-8 left-8 text-slate-500 hover:text-white text-2xl transition-colors"
          onClick={handleInternalClose}
        >
          ✕
        </button>

        <div className="absolute top-10 right-10">
          <span className="text-white font-black text-[10px] uppercase tracking-[0.2em] opacity-40">
            {isEditing ? 'עריכת נכס מערכת' : 'תצוגת נכס מורחבת'}
          </span>
        </div>

        {isEditing ? (
          /* מצב עריכה */
          <div className="w-full flex flex-col items-center mt-6">
            <DisplaySvg 
              svgContent={editData.svg_content} 
              className="w-32 h-32 mb-8 shadow-2xl scale-110 border border-emerald-500/20"
            />
            
            <div className="w-full space-y-4 text-right">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] text-slate-500 mr-2 font-bold uppercase">שם האייקון</label>
                  <input 
                    className="w-full bg-slate-950 border border-slate-800 p-3 rounded-2xl text-xs text-white outline-none focus:ring-1 ring-emerald-500 transition-all"
                    value={editData.name}
                    onChange={(e) => setEditData({...editData, name: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] text-slate-500 mr-2 font-bold uppercase">נושא</label>
                  <input 
                    className="w-full bg-slate-950 border border-slate-800 p-3 rounded-2xl text-xs text-white outline-none focus:ring-1 ring-emerald-500 transition-all"
                    value={editData.subject}
                    onChange={(e) => setEditData({...editData, subject: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="space-y-1">
                <label className="text-[9px] text-slate-500 mr-2 font-bold uppercase">תת-נושא</label>
                <input 
                  className="w-full bg-slate-950 border border-slate-800 p-3 rounded-2xl text-xs text-white outline-none focus:ring-1 ring-emerald-500 transition-all"
                  value={editData.sub_subject}
                  onChange={(e) => setEditData({...editData, sub_subject: e.target.value})}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] text-slate-500 mr-2 font-bold uppercase">קוד SVG (וקטורי)</label>
                <textarea 
                  className="w-full bg-slate-950 border border-slate-800 p-4 rounded-2xl text-[10px] text-emerald-400 font-mono h-32 outline-none focus:ring-1 ring-emerald-500 resize-none text-left"
                  dir="ltr"
                  value={editData.svg_content}
                  onChange={(e) => setEditData({...editData, svg_content: e.target.value})}
                />
              </div>
            </div>

            <div className="flex gap-4 mt-8 w-full">
              <button onClick={handleSave} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 rounded-2xl transition-all shadow-lg active:scale-95">
                שמור שינויים
              </button>
              <button onClick={() => setIsEditing(false)} className="px-8 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-4 rounded-2xl transition-all">
                ביטול
              </button>
            </div>
          </div>
        ) : (
          /* מצב תצוגה */
          <div className="w-full flex flex-col items-center mt-6">

            <div className="bg-white/5 p-16 rounded-[3rem] mb-10 shadow-inner border border-white/5">
              <DisplaySvg 
                svgContent={icon.svg_content} 
                className="w-56 h-56 md:w-64 md:h-64 drop-shadow-[0_0_50px_rgba(16,185,129,0.3)]"
              />
            </div>
            
            <div className="text-center space-y-4">
                <h2 className="text-4xl font-black text-white uppercase tracking-tighter">{icon.name}</h2>
                <div className="flex justify-center gap-3">
                    <span className="bg-slate-800 px-4 py-1.5 rounded-full text-[10px] text-slate-400 font-bold uppercase tracking-widest border border-slate-700">{icon.subject}</span>
                    <span className="bg-emerald-500/10 px-4 py-1.5 rounded-full text-[10px] text-emerald-500 font-bold uppercase tracking-widest border border-emerald-500/20">{icon.sub_subject}</span>
                </div>
            </div>

            <div className="flex items-center gap-4 mt-12 w-full justify-center">
              {/* כפתור העתקה - פעולה מרכזית */}
              <button 
                onClick={handleCopy}
                className="bg-white text-slate-950 hover:bg-slate-200 px-10 py-4 rounded-2xl font-black text-sm flex items-center gap-4 transition-all active:scale-95 shadow-xl"
              >
                {copyStatus ? 'הקוד הועתק!' : 'העתק קוד SVG'} 
                <span className="text-xl">{copyStatus ? '✅' : '📋'}</span>
              </button>
              
              {/* כפתורי עריכה ומחיקה - כפתורי אייקון */}
              <div className="flex gap-3">
                <button 
                  onClick={() => setIsEditing(true)} 
                  className="p-4 bg-slate-800 hover:bg-blue-600 text-white rounded-2xl transition-all shadow-xl active:scale-90"
                  title="ערוך"
                >
                  ✏️
                </button>
                <button 
                  onClick={handleDelete} 
                  className="p-4 bg-slate-800 hover:bg-red-600 text-white rounded-2xl transition-all shadow-xl active:scale-90"
                  title="מחק"
                >
                  🗑️
                </button>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default IconModal;
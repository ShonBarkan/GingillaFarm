import React from 'react';

const PastClassesHeader = ({ count, sortOrder, setSortOrder, filter, setFilter }) => {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between" dir="rtl">
      <div>
        <h3 className="font-black text-slate-800 flex items-center gap-2">
          {/* Changed bg-blue-600 to bg-red-600 */}
          <span className="w-2 h-6 bg-red-600 rounded-full"></span>
          שיעורים להשלמה
          {/* Changed bg-blue-50 to bg-red-50 */}
          <span className="bg-red-50 text-red-600 text-[10px] px-2 py-0.5 rounded-full mr-1">
            {count}
          </span>
        </h3>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
        <select 
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="text-[11px] font-bold bg-slate-50 border-none rounded-lg px-2 py-1 outline-none text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <option value="all">הכל</option>
          <option value="birvouz">חסר בירווז</option>
          <option value="summary">חסר PDF</option>
          <option value="ai_summary">חסר סיכום AI</option>
          <option value="ai_quiz">חסר בוחן</option>
        </select>

        <button 
          onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
          className="text-[11px] font-bold text-slate-400 hover:text-slate-600 flex items-center gap-1 bg-slate-50 px-3 py-1 rounded-lg transition-all"
        >
          <span>{sortOrder === 'desc' ? '⬇️ חדש לישן' : '⬆️ ישן לחדש'}</span>
        </button>
      </div>
    </div>
  );
};

export default PastClassesHeader;
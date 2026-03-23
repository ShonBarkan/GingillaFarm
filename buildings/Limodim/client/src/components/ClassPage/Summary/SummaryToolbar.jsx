import React from 'react';
import { Search, X, Code, Sparkles, Plus } from 'lucide-react';

const SummaryToolbar = ({ 
  isBulkEdit, 
  setIsBulkEdit, 
  setShowPrompt, 
  handleAddMainTopic, 
  isSaving, 
  searchQuery, 
  setSearchQuery 
}) => {
  return (
    <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-6 pr-2">
          <button 
            onClick={() => setIsBulkEdit(!isBulkEdit)}
            className={`flex items-center gap-2 text-sm font-bold transition-colors ${isBulkEdit ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <Code size={18} />
            עריכת JSON
          </button>
          <button 
            onClick={() => setShowPrompt(true)}
            className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-blue-500 transition-colors"
          >
            <Sparkles size={18} />
            קבלת פרומפט
          </button>
        </div>

        <button 
          onClick={handleAddMainTopic}
          disabled={isSaving}
          className="bg-slate-900 text-white px-5 py-2.5 rounded-2xl text-sm font-black flex items-center gap-2 hover:bg-slate-800 transition-all disabled:opacity-50"
        >
          <Plus size={18} />
          הוספת נושא ראשי
        </button>
      </div>

      {!isBulkEdit && (
        <div className="relative group">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
          <input 
            type="text"
            placeholder="חיפוש מהיר בסיכום (כותרת או תוכן)..."
            className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 pr-12 pl-12 text-sm outline-none focus:bg-white focus:border-blue-200 focus:ring-4 ring-blue-500/5 transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery("")}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default SummaryToolbar;
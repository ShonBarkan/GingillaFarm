import React from 'react';

const ClassHistoryFilters = ({ 
  isFilterOpen, 
  allAvailableTypes, 
  selectedTypes, 
  handleTypeToggle, 
  setSelectedTypes, 
  sortOrder, 
  setSortOrder 
}) => {
  return (
    <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isFilterOpen ? 'max-h-[500px] opacity-100 mb-6' : 'max-h-0 opacity-0'}`}>
      <div className="flex flex-col gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
        
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">סוגי שיעור (סינון מרובה):</span>
          <div className="flex flex-wrap gap-2">
            {allAvailableTypes.map(type => (
              <button
                key={type}
                onClick={() => handleTypeToggle(type)}
                className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all border ${
                  selectedTypes.includes(type) 
                  ? 'bg-emerald-600 border-emerald-600 text-white' 
                  : 'bg-white border-slate-200 text-slate-600 hover:border-emerald-300'
                }`}
              >
                {type}
              </button>
            ))}
            {selectedTypes.length > 0 && (
              <button onClick={() => setSelectedTypes([])} className="text-[10px] font-bold text-red-500 hover:underline px-2">
                ניקוי
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2 border-t border-slate-200">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">מיון תאריכים:</span>
          <div className="flex gap-2">
            {['Newest', 'Oldest'].map(order => (
              <button
                key={order}
                onClick={() => setSortOrder(order)}
                className={`text-[10px] font-bold px-3 py-1 rounded-lg transition-colors ${
                  sortOrder === order ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {order === 'Newest' ? 'הכי חדש' : 'הכי ישן'}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassHistoryFilters;
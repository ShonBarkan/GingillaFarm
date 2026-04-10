import React from 'react';
import { Database, Search, RefreshCw, Trash2, Download, Upload } from 'lucide-react';

const DatabaseToolbar = ({ 
    selectedTable, 
    onTableChange, 
    tables, 
    searchTerm, 
    onSearchChange, 
    onRefresh, 
    onDeleteSelected, 
    onExport, 
    onImport,
    selectedCount 
}) => {
    return (
        <div className="space-y-4 bg-gray-50 p-6 rounded-[2.5rem] border border-gray-100 shadow-inner">
            <div className="flex flex-wrap items-center justify-between gap-4">
                
                {/* Table Selector */}
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-900 text-white rounded-xl shadow-lg">
                        <Database size={20} />
                    </div>
                    <select 
                        value={selectedTable}
                        onChange={(e) => onTableChange(e.target.value)}
                        className="bg-transparent border-none font-black text-gray-900 text-xl focus:ring-0 cursor-pointer outline-none appearance-none"
                    >
                        {tables.map(t => (
                            <option key={t.id} value={t.id} className="text-base font-sans">
                                {t.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Search & Refresh Group */}
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input 
                            type="text"
                            placeholder="Search in table..."
                            value={searchTerm}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none w-64 shadow-sm transition-all"
                        />
                    </div>
                    <button 
                        onClick={onRefresh} 
                        title="Refresh Data"
                        className="p-2 hover:bg-white hover:shadow-md rounded-xl transition-all text-gray-500 hover:text-blue-600 active:scale-90"
                    >
                        <RefreshCw size={20} />
                    </button>
                </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between pt-4 border-t border-gray-200">
                
                {/* Export / Import Group */}
                <div className="flex items-center gap-2">
                    <button 
                        onClick={onExport}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-black text-gray-600 hover:bg-gray-50 transition-all shadow-sm active:scale-95"
                    >
                        <Download size={14} /> Export JSON
                    </button>
                    <button 
                        onClick={onImport}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-black text-blue-600 hover:bg-blue-50 transition-all shadow-sm active:scale-95"
                    >
                        <Upload size={14} /> Import Data
                    </button>
                </div>

                {/* Bulk Actions Group */}
                <div className="flex items-center gap-2">
                    {selectedCount > 0 && (
                        <button 
                            onClick={onDeleteSelected}
                            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl text-xs font-black hover:bg-red-100 transition-all animate-in fade-in zoom-in duration-200 shadow-sm"
                        >
                            <Trash2 size={14} /> Delete Selected ({selectedCount})
                        </button>
                    )}
                    
                    {/* Note: Truncate is hidden or handled via Bulk Delete of all if needed */}
                    <p className="hidden sm:block text-[9px] font-black text-gray-300 uppercase tracking-widest px-4">
                        Admin Tools Enabled
                    </p>
                </div>
            </div>
        </div>
    );
};

export default DatabaseToolbar;
import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { mitamnimService } from '../../../services/mitamnimService';
import { useToast } from '../../../context/ToastContext';
import InlineJsonTable from './InlineJsonTable';
import DatabaseToolbar from './DatabaseToolbar';
import ImportExportModal from './ImportExportModal';

const DatabaseExplorer = () => {
    const { showToast } = useToast();
    const [selectedTable, setSelectedTable] = useState('exercise_tree');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedIds, setSelectedIds] = useState([]);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);

    // Table mapping consistent with backend/service keys
    const tables = [
        { id: 'exercise_tree', label: 'Exercise Tree' },
        { id: 'parameters', label: 'Parameters' },
        { id: 'active_params', label: 'Active Params (Links)' }, 
        { id: 'workout_templates', label: 'Templates' },
        { id: 'workout_sessions', label: 'Sessions' },
        { id: 'activity_logs', label: 'Activity Logs' },
        { id: 'exercise_assets', label: 'Assets' },
        { id: 'goals', label: 'Goals' }
    ];

    /**
     * Fetches raw data for the currently selected table.
     */
    const fetchData = async () => {
        setLoading(true);
        setSelectedIds([]);
        try {
            // Using the centralized raw fetcher from service
            const result = await mitamnimService.getRawTableData(selectedTable);
            setData(result || []);
        } catch (err) {
            showToast(`Error loading ${selectedTable} data`, "error");
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [selectedTable]);

    /**
     * Exports current table view to a JSON file.
     */
    const handleExport = () => {
        try {
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${selectedTable}_backup.json`;
            a.click();
            showToast("Backup file generated", "success");
        } catch (e) {
            showToast("Failed to export data", "error");
        }
    };

    /**
     * Imports a list of objects into the current table.
     */
    const handleImport = async (jsonList) => {
        if (!window.confirm(`Import ${jsonList.length} rows to ${selectedTable}?`)) return;
        
        try {
            await mitamnimService.importBulk(selectedTable, jsonList);
            showToast(`Import completed!`, "success");
            fetchData();
        } catch (err) {
            showToast("Import failed - check JSON schema", "error");
        }
    };

    /**
     * Deletes selected rows using the bulk delete API.
     */
    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) return;
        if (!window.confirm(`Delete ${selectedIds.length} selected rows from ${selectedTable}?`)) return;
        
        try {
            await mitamnimService.deleteBulk(selectedTable, selectedIds);
            showToast(`Deleted ${selectedIds.length} rows successfully`, "success");
            fetchData();
        } catch (err) {
            showToast("Delete failed - might be due to Foreign Key constraints", "error");
        }
    };

    /**
     * Selection logic
     */
    const toggleSelect = (id) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const columns = data.length > 0 ? Object.keys(data[0]) : [];
    const filteredData = data.filter(row => 
        JSON.stringify(row).toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6" dir="ltr">
            <DatabaseToolbar 
                selectedTable={selectedTable} 
                onTableChange={setSelectedTable}
                tables={tables}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                onRefresh={fetchData}
                onDeleteSelected={handleBulkDelete}
                onExport={handleExport}
                onImport={() => setIsImportModalOpen(true)}
                selectedCount={selectedIds.length}
            />

            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 text-blue-500">
                        <Loader2 className="animate-spin mb-4" size={44} />
                        <span className="font-black uppercase tracking-[0.2em] text-[10px]">Processing Database...</span>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse table-fixed">
                            <thead>
                                <tr className="bg-gray-900 text-white">
                                    <th className="w-12 px-4 py-5 border-r border-gray-800">
                                        <input 
                                            type="checkbox" 
                                            checked={selectedIds.length === filteredData.length && filteredData.length > 0}
                                            onChange={() => setSelectedIds(selectedIds.length === filteredData.length ? [] : filteredData.map(r => r.id))}
                                            className="rounded border-gray-700 bg-gray-800"
                                        />
                                    </th>
                                    {columns.map(col => (
                                        <th key={col} className="px-4 py-5 text-[10px] font-black uppercase tracking-wider border-r border-gray-800 last:border-0">{col}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="align-top">
                                {filteredData.length === 0 ? (
                                    <tr>
                                        <td colSpan={columns.length + 1} className="py-20 text-center text-gray-400 font-bold italic">
                                            No data found in this table.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredData.map((row, idx) => (
                                        <tr key={idx} className={`border-b border-gray-50 transition-colors ${selectedIds.includes(row.id) ? 'bg-blue-50/50' : 'hover:bg-gray-50/50'}`}>
                                            <td className="px-4 py-3 border-r border-gray-50">
                                                <input 
                                                    type="checkbox" 
                                                    checked={selectedIds.includes(row.id)}
                                                    onChange={() => toggleSelect(row.id)}
                                                    className="rounded border-gray-300 text-blue-600"
                                                />
                                            </td>
                                            {columns.map(col => (
                                                <td key={col} className="px-4 py-3 text-xs font-bold text-gray-600 break-words">
                                                    {row[col] !== null && typeof row[col] === 'object' 
                                                        ? <InlineJsonTable val={row[col]} /> 
                                                        : String(row[col] ?? 'null')}
                                                </td>
                                            ))}
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <ImportExportModal 
                isOpen={isImportModalOpen} 
                onClose={() => setIsImportModalOpen(false)} 
                onImport={handleImport}
                tableName={selectedTable}
            />
        </div>
    );
};

export default DatabaseExplorer;
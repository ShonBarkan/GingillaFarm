import React, { useState } from 'react';
import { X, Upload, CheckCircle, AlertTriangle } from 'lucide-react';

const ImportExportModal = ({ isOpen, onClose, onImport, tableName }) => {
    const [jsonText, setJsonText] = useState("");
    const [error, setError] = useState(null);

    if (!isOpen) return null;

    /**
     * Validates and processes the raw JSON string before sending to Parent.
     */
    const handleProcess = () => {
        try {
            const parsed = JSON.parse(jsonText);
            
            // Backend expects an array of objects for bulk operations
            if (!Array.isArray(parsed)) {
                throw new Error("הנתונים חייבים להיות מערך של אובייקטים (Array of Objects)");
            }
            
            if (parsed.length === 0) {
                throw new Error("המערך ריק, אין מה לייבא");
            }

            onImport(parsed);
            setJsonText("");
            setError(null);
            onClose();
        } catch (e) {
            setError(e.message || "JSON לא תקין - בדוק את הפסיקים והסוגריים");
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white rounded-[3rem] w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in duration-300" dir="rtl">
                
                {/* Modal Header */}
                <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900">ייבוא לטבלת {tableName}</h2>
                        <p className="text-gray-400 text-sm font-bold">הדבק כאן מערך JSON כדי לבצע הוספה מסיבית (Bulk Insert)</p>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="p-2 hover:bg-white hover:shadow-md rounded-full transition-all text-gray-400 hover:text-red-500"
                    >
                        <X size={24} />
                    </button>
                </div>
                
                {/* Modal Content */}
                <div className="p-8 space-y-4">
                    <div className="relative">
                        <textarea 
                            value={jsonText}
                            onChange={(e) => { setJsonText(e.target.value); setError(null); }}
                            placeholder='[{"id": 1, "name": "Exercise A"}, {"id": 2, "name": "Exercise B"}]'
                            className={`w-full h-72 p-6 bg-gray-50 border-2 border-dashed rounded-[2rem] font-mono text-[11px] outline-none transition-all text-left resize-none
                                ${error ? 'border-red-200 focus:border-red-400' : 'border-gray-200 focus:border-blue-500'}
                            `}
                            dir="ltr"
                        />
                    </div>
                    
                    {error && (
                        <div className="flex items-center gap-2 px-4 py-3 bg-red-50 text-red-600 rounded-2xl animate-in slide-in-from-top-2">
                            <AlertTriangle size={16} />
                            <p className="text-xs font-black">{error}</p>
                        </div>
                    )}
                </div>

                {/* Modal Footer */}
                <div className="p-8 bg-gray-50 flex flex-col sm:flex-row gap-4">
                    <button 
                        onClick={handleProcess}
                        disabled={!jsonText.trim()}
                        className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 active:scale-95 disabled:opacity-50 disabled:active:scale-100"
                    >
                        <CheckCircle size={20} /> בצע ייבוא למסד הנתונים
                    </button>
                    <button 
                        onClick={onClose} 
                        className="px-8 py-4 font-black text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        ביטול
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ImportExportModal;
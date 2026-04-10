import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Check, X, Layers, Info, Loader2 } from 'lucide-react';
import { mitamnimService } from '../../services/mitamnimService';
import { useToast } from '../../context/ToastContext';
import ConfirmModal from '../ConfirmModal';

const ParameterManagement = () => {
    const { showToast } = useToast();
    const [parameters, setParameters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [paramToDelete, setParamToDelete] = useState(null);

    // Form states
    const [formData, setFormData] = useState({ name: '', unit: '', scope: 'exercise' });
    const [editData, setEditData] = useState({ name: '', unit: '', scope: 'exercise' });

    /**
     * Loads all global parameters from the server.
     */
    const fetchParameters = async () => {
        try {
            // Updated service call name
            const data = await mitamnimService.getParameters();
            setParameters(data || []);
        } catch (e) {
            showToast("נכשל בטעינת פרמטרים", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchParameters();
    }, []);

    /**
     * Creates a new parameter using the bulk-supported create method.
     */
    const handleCreate = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.unit) return;

        try {
            // createParameters accepts an object or an array of objects
            await mitamnimService.createParameters(formData);
            showToast("פרמטר נוצר בהצלחה");
            setFormData({ name: '', unit: '', scope: 'exercise' });
            fetchParameters();
        } catch (e) {
            showToast("שגיאה ביצירת פרמטר", "error");
        }
    };

    /**
     * Updates an existing parameter.
     */
    const handleUpdate = async (id) => {
        try {
            await mitamnimService.updateParameter(id, editData);
            showToast("פרמטר עודכן");
            setEditingId(null);
            fetchParameters();
        } catch (e) {
            showToast("עדכון נכשל", "error");
        }
    };

    /**
     * Deletes a parameter using the bulk delete utility.
     */
    const handleDelete = async () => {
        if (!paramToDelete) return;
        try {
            // Using the new generic deleteBulk logic from the service
            await mitamnimService.deleteBulk('parameters', [paramToDelete.id]);
            showToast("הפרמטר נמחק מהמערכת");
            fetchParameters();
        } catch (e) {
            showToast("מחיקה נכשלה - ייתכן שהפרמטר בשימוש", "error");
        } finally {
            setIsDeleteModalOpen(false);
            setParamToDelete(null);
        }
    };

    const startEdit = (param) => {
        setEditingId(param.id);
        setEditData({ name: param.name, unit: param.unit, scope: param.scope || 'exercise' });
    };

    if (loading) {
        return (
            <div className="p-12 flex flex-col items-center justify-center text-gray-400">
                <Loader2 className="animate-spin mb-4" size={32} />
                <span className="font-bold text-xs uppercase tracking-widest">טוען הגדרות...</span>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Warning Banner */}
            <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex gap-3 items-start">
                <Info className="text-amber-500 shrink-0" size={20} />
                <p className="text-xs text-amber-700 font-bold leading-relaxed">
                    שים לב: מחיקת פרמטר היא פעולה סופית. היא עלולה להסיר את הגישה לנתונים היסטוריים המשתמשים בפרמטר זה.
                </p>
            </div>

            {/* Quick Add Form */}
            <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-gray-50 p-4 rounded-[2rem] border border-gray-100">
                <input 
                    type="text" 
                    placeholder="שם הפרמטר (משקל, חזרות...)" 
                    className="bg-white border-none rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                />
                <input 
                    type="text" 
                    placeholder="יחידה (ק״ג, שניות...)" 
                    className="bg-white border-none rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
                    value={formData.unit}
                    onChange={e => setFormData({...formData, unit: e.target.value})}
                />
                <button type="submit" className="bg-blue-600 text-white rounded-xl font-black text-sm flex items-center justify-center gap-2 hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-100">
                    <Plus size={18} /> הוסף פרמטר
                </button>
            </form>

            {/* Parameters List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {parameters.map(param => (
                    <div key={param.id} className="group bg-white border border-gray-100 p-5 rounded-[2rem] flex items-center justify-between hover:shadow-xl hover:border-blue-50 transition-all duration-300">
                        <div className="flex items-center gap-4 flex-1">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${editingId === param.id ? 'bg-blue-600 text-white' : 'bg-gray-50 text-blue-600 group-hover:bg-blue-50'}`}>
                                <Layers size={20} />
                            </div>
                            
                            {editingId === param.id ? (
                                <div className="flex gap-2 flex-1 ml-4 animate-in fade-in slide-in-from-right-2">
                                    <input 
                                        className="bg-gray-50 border-2 border-blue-100 rounded-lg px-2 py-1 text-xs font-bold w-full outline-none focus:bg-white"
                                        value={editData.name}
                                        onChange={e => setEditData({...editData, name: e.target.value})}
                                    />
                                    <input 
                                        className="bg-gray-50 border-2 border-blue-100 rounded-lg px-2 py-1 text-xs font-bold w-20 outline-none focus:bg-white"
                                        value={editData.unit}
                                        onChange={e => setEditData({...editData, unit: e.target.value})}
                                    />
                                </div>
                            ) : (
                                <div>
                                    <h4 className="font-black text-gray-900">{param.name}</h4>
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{param.unit}</span>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            {editingId === param.id ? (
                                <>
                                    <button onClick={() => handleUpdate(param.id)} className="p-2 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition-colors"><Check size={18}/></button>
                                    <button onClick={() => setEditingId(null)} className="p-2 bg-gray-50 text-gray-400 rounded-xl hover:bg-gray-100 transition-colors"><X size={18}/></button>
                                </>
                            ) : (
                                <>
                                    <button onClick={() => startEdit(param)} className="p-2 text-gray-300 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"><Edit2 size={18}/></button>
                                    <button 
                                        onClick={() => { setParamToDelete(param); setIsDeleteModalOpen(true); }}
                                        className="p-2 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                    >
                                        <Trash2 size={18}/>
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                title="מחיקת פרמטר מערכת"
                message={`אתה עומד למחוק את "${paramToDelete?.name}". שים לב שפעולה זו תסיר את היכולת לתעד נתונים ביחידה זו.`}
            />
        </div>
    );
};

export default ParameterManagement;
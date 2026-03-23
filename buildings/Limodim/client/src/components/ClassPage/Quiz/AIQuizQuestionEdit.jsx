import React, { useState } from 'react';
import { Save, Trash2, Plus, CheckCircle2, XCircle, AlertCircle, Edit3, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import api from '../../../api/api';

const AIQuizQuestionEdit = ({ question, onRefresh }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ ...question });
  const [isSaving, setIsSaving] = useState(false);

  const handleQuestionDelete = async () => {
    if (!window.confirm("בטוח שברצונך למחוק את השאלה הזו?")) return;
    try {
      await api.deleteQuizQuestion(question.id);
      onRefresh();
    } catch (err) {
      alert("המחיקה נכשלה");
    }
  };

  const handleToggleEdit = () => {
    if (isEditing) {
      setEditData({ ...question });
    }
    setIsEditing(!isEditing);
  };

  const updateDistractor = (index, field, value) => {
    const updatedDistractors = [...editData.distractors];
    updatedDistractors[index] = { ...updatedDistractors[index], [field]: value };
    setEditData({ ...editData, distractors: updatedDistractors });
  };

  const addDistractor = () => {
    setEditData({
      ...editData,
      distractors: [...(editData.distractors || []), { answer_text: "", explanation: "" }]
    });
  };

  const removeDistractor = (index) => {
    const updatedDistractors = editData.distractors.filter((_, i) => i !== index);
    setEditData({ ...editData, distractors: updatedDistractors });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await api.saveQuizQuestion(editData);
      setIsEditing(false);
      onRefresh();
    } catch (err) {
      console.error("Failed to save question:", err);
      alert("שגיאה בשמירת השאלה");
    } finally {
      setIsSaving(false);
    }
  };

  const renderMathContent = (content) => (
    <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
      {content}
    </ReactMarkdown>
  );

  return (
    <div className={`
      group relative overflow-hidden transition-all duration-300 rounded-[32px] border-2
      ${isEditing 
        ? 'border-purple-400 bg-purple-50/30 shadow-xl shadow-purple-100' 
        : 'border-slate-100 bg-white hover:border-slate-200 hover:shadow-md'}
    `}>
      
      <div className="p-6 md:p-8">
        {/* Header Section */}
        <div className="flex justify-between items-start gap-4 mb-6">
          <div className="flex-1">
            {isEditing ? (
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-purple-400 px-1">טקסט השאלה (תומך במתמטיקה)</label>
                <textarea
                  className="w-full bg-white border border-purple-100 rounded-2xl px-4 py-3 text-slate-800 font-bold outline-none focus:ring-4 ring-purple-500/10 transition-all min-h-[80px]"
                  value={editData.question_text}
                  onChange={(e) => setEditData({ ...editData, question_text: e.target.value })}
                  placeholder="הזן את השאלה כאן..."
                />
              </div>
            ) : (
              <div className="text-lg font-bold text-slate-800 leading-relaxed pr-2 prose prose-slate max-w-none">
                {renderMathContent(question.question_text)}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <button 
                  onClick={handleSave} 
                  disabled={isSaving}
                  className="p-3 bg-purple-600 text-white rounded-2xl hover:bg-purple-700 transition-all shadow-lg shadow-purple-200 disabled:opacity-50"
                >
                  <Save size={18} />
                </button>
                <button 
                  onClick={handleToggleEdit} 
                  className="p-3 bg-white text-slate-400 border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all"
                >
                  <X size={18} />
                </button>
              </>
            ) : (
              <button 
                onClick={handleToggleEdit}
                className="p-3 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-2xl transition-all opacity-0 group-hover:opacity-100"
              >
                <Edit3 size={18} />
              </button>
            )}
          </div>
          <button 
            onClick={handleQuestionDelete}
            className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all opacity-0 group-hover:opacity-100"
          >
            <Trash2 size={18} />
          </button>
        </div>

        {/* Editing Body */}
        {isEditing ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
            
            {/* Correct Answer Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-green-600 text-[10px] font-black uppercase tracking-widest">
                  <CheckCircle2 size={14} /> תשובה נכונה
                </div>
                <input
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 outline-none focus:border-green-400 transition-colors"
                  value={editData.correct_answer}
                  onChange={(e) => setEditData({ ...editData, correct_answer: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                  <AlertCircle size={14} /> הסבר ללוגיקה
                </div>
                <textarea
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-600 outline-none focus:border-purple-400 transition-colors"
                  value={editData.explanation}
                  onChange={(e) => setEditData({ ...editData, explanation: e.target.value })}
                  rows={2}
                />
              </div>
            </div>

            {/* Distractors Section */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div className="flex justify-between items-center px-1">
                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">מסיחים והסברים (תשובות שגויות)</h5>
                <button 
                  onClick={addDistractor}
                  className="flex items-center gap-1.5 text-purple-600 text-xs font-black hover:bg-purple-50 px-3 py-1.5 rounded-xl transition-all"
                >
                  <Plus size={14} /> הוספת מסיח
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {editData.distractors?.map((dist, idx) => (
                  <div key={idx} className="bg-white/50 border border-slate-100 p-4 rounded-2xl relative group/dist shadow-sm">
                    <button 
                      onClick={() => removeDistractor(idx)}
                      className="absolute top-3 left-3 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover/dist:opacity-100"
                    >
                      <Trash2 size={14} />
                    </button>
                    
                    <div className="flex items-center gap-2 mb-2">
                      <XCircle size={14} className="text-red-300" />
                      <input
                        className="flex-1 bg-transparent border-b border-slate-100 text-sm font-bold text-slate-700 focus:border-purple-300 outline-none transition-all pb-1"
                        placeholder="טקסט המסיח..."
                        value={dist.answer_text}
                        onChange={(e) => updateDistractor(idx, 'answer_text', e.target.value)}
                      />
                    </div>
                    <textarea
                      className="w-full bg-slate-50/50 rounded-xl p-3 text-xs text-slate-500 outline-none focus:bg-white focus:ring-1 ring-slate-100 transition-all"
                      placeholder="הסבר למה המסיח הזה שגוי..."
                      value={dist.explanation}
                      onChange={(e) => updateDistractor(idx, 'explanation', e.target.value)}
                      rows={1}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* View Mode Footer Stats */
          <div className="flex items-center gap-6 mt-4 pt-4 border-t border-slate-50">
             <div className="flex items-center gap-2 text-green-500 bg-green-50 px-3 py-1 rounded-full text-[10px] font-black">
                <CheckCircle2 size={12} /> {question.correct_count || 0} הצלחות
             </div>
             <div className="flex items-center gap-2 text-red-400 bg-red-50 px-3 py-1 rounded-full text-[10px] font-black">
                <XCircle size={12} /> {question.wrong_count || 0} טעויות
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIQuizQuestionEdit;
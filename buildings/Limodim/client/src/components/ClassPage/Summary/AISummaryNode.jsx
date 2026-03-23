import React, { useState, useEffect } from 'react';
import { 
  ChevronDown, ChevronLeft, Edit3, Save, Trash2, 
  Code, Layout 
} from 'lucide-react';
import api from '../../../api/api';
import NodeEditFields from './AISummaryNode/NodeEditFields';
import NodeViewContent from './AISummaryNode/NodeViewContent';
import NodeVisual from './AISummaryNode/NodeVisual';

const AISummaryNode = ({ item, depth = 0, onRefresh }) => {
  const [isExpanded, setIsExpanded] = useState(depth < 1);
  const [isEditing, setIsEditing] = useState(false);
  const [editMode, setEditMode] = useState('fields'); 
  const [editData, setEditData] = useState({ ...item });
  const [jsonText, setJsonText] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isEditing && editMode === 'json') {
      setJsonText(JSON.stringify(editData, null, 2));
    }
  }, [isEditing, editMode, editData]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      let dataToSave = editMode === 'json' ? JSON.parse(jsonText) : editData;
      await api.upsertSummaryTopic(dataToSave);
      setIsEditing(false);
      onRefresh();
    } catch (err) {
      alert("Error saving topic data.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddSubTopic = () => {
    const newSub = {
      class_id: item.class_id,
      parent_id: item.id,
      title: "תת-נושא חדש",
      content: "",
      summary_type: "definition",
      order_index: (editData.sub_topics?.length || 0),
      visual: { type: "none", value: "" },
      sub_topics: []
    };
    setEditData({ ...editData, sub_topics: [...(editData.sub_topics || []), newSub] });
    setIsExpanded(true);
  };

  const handleDelete = async () => {
    if (!window.confirm("למחוק את הנושא הזה ואת כל תתי-הנושאים שלו?")) return;
    try {
      await api.deleteSummaryTopic(item.id);
      onRefresh();
    } catch (err) {
      alert("מחיקה נכשלה");
    }
  };

  return (
    <div className={`flex flex-col ${depth > 0 ? 'mr-6 border-r-2 border-slate-100 pr-4 mt-4' : 'mb-6'}`}>
      <div className={`group flex flex-col p-4 rounded-2xl transition-all border ${isEditing ? 'border-blue-400 bg-blue-50/10 shadow-lg' : 'border-slate-200 bg-white shadow-sm hover:border-slate-300'}`}>
        
        {/* Header Row */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            {(item.sub_topics?.length > 0 || isEditing) && (
              <button onClick={() => setIsExpanded(!isExpanded)} className="text-slate-400 hover:text-slate-600">
                {isExpanded ? <ChevronDown size={18} /> : <ChevronLeft size={18} />}
              </button>
            )}
            
            {isEditing && editMode === 'fields' ? (
              <input 
                className="flex-1 bg-white border border-blue-200 rounded-xl px-3 py-1.5 font-bold text-slate-800 outline-none focus:ring-2 ring-blue-500/20"
                value={editData.title}
                onChange={(e) => setEditData({...editData, title: e.target.value})}
              />
            ) : (
              <h3 className={`font-bold text-slate-800 ${depth === 0 ? 'text-lg' : 'text-base'}`}>{item.title}</h3>
            )}
          </div>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {isEditing && (
              <button onClick={() => setEditMode(editMode === 'fields' ? 'json' : 'fields')} className="p-2 text-blue-500 hover:bg-blue-100 rounded-xl">
                {editMode === 'fields' ? <Code size={18}/> : <Layout size={18}/>}
              </button>
            )}
            {isEditing ? (
              <button onClick={handleSave} disabled={isSaving} className="p-2 text-green-600 hover:bg-green-100 rounded-xl disabled:opacity-50"><Save size={18}/></button>
            ) : (
              <button onClick={() => setIsEditing(true)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl"><Edit3 size={18}/></button>
            )}
            <button onClick={handleDelete} className="p-2 text-slate-400 hover:bg-red-50 hover:text-red-500 rounded-xl"><Trash2 size={18}/></button>
          </div>
        </div>

        {/* Edit Body */}
        {isEditing && (
          <div className="mt-4 animate-in fade-in zoom-in-95 duration-200">
            {editMode === 'json' ? (
              <textarea 
                className="w-full bg-slate-900 text-blue-300 font-mono text-xs p-4 rounded-2xl outline-none min-h-[250px] resize-y shadow-inner"
                value={jsonText}
                onChange={(e) => setJsonText(e.target.value)}
                dir="ltr"
              />
            ) : (
              <NodeEditFields editData={editData} setEditData={setEditData} onAddSubTopic={handleAddSubTopic} />
            )}
          </div>
        )}

        {/* Display Body */}
        {!isEditing && (
          <>
            <NodeViewContent content={item.content} />
            <NodeVisual visual={item.visual} title={item.title} />
          </>
        )}
      </div>

      {/* Recursion - Pass the updated sub_topics if editing */}
      {isExpanded && (isEditing ? editData.sub_topics : item.sub_topics)?.map((sub, idx) => (
        <AISummaryNode key={sub.id || `new-${idx}`} item={sub} depth={depth + 1} onRefresh={onRefresh} />
      ))}
    </div>
  );
};

export default AISummaryNode;
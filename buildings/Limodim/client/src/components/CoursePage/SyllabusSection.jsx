import React, { useState, useEffect } from 'react';
import api from '../../api/api';
import { useCourses } from '../../context/CourseContext';

// --- Internal Helper Component for each Topic ---
const SyllabusTopicCard = ({ topic, isEditing, setEditingTopicId, handleUpdate, handleDelete }) => {
  const [localData, setLocalData] = useState(topic);

  // Sync with parent data if it changes
  useEffect(() => {
    setLocalData(topic);
  }, [topic]);

  const handleChange = (field, value) => {
    setLocalData(prev => ({ ...prev, [field]: value }));
  };

  const handleFinish = async () => {
    // Only call API if data actually changed
    if (JSON.stringify(localData) !== JSON.stringify(topic)) {
      await handleUpdate(topic.id, localData);
    }
    setEditingTopicId(null);
  };

  return (
    <div className={`flex gap-4 p-4 rounded-2xl transition-all ${
      isEditing 
        ? 'bg-white border-blue-400 shadow-md ring-1 ring-blue-100 border' 
        : 'bg-transparent hover:bg-slate-50 border border-transparent'
    }`}>
      
      {/* Topic Number Badge */}
      <div className={`w-8 h-8 flex items-center justify-center rounded-lg shrink-0 font-bold text-sm shadow-sm transition-colors ${
        isEditing ? 'bg-blue-600 text-white' : 'bg-slate-900 text-white'
      }`}>
        {isEditing ? (
          <input 
            type="number"
            className="bg-transparent w-full text-center outline-none"
            value={localData.topic_num}
            onChange={(e) => handleChange('topic_num', parseInt(e.target.value))}
          />
        ) : (
          topic.topic_num
        )}
      </div>

      <div className="flex-1 min-w-0">
        {isEditing ? (
          /* --- Edit Mode --- */
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Edit Topic</span>
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleFinish}
                  className="text-[10px] font-bold bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition"
                >
                  Finish
                </button>
                <button 
                  onClick={() => handleDelete(topic.id)} 
                  className="text-red-400 hover:text-red-600 p-1"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                  </svg>
                </button>
              </div>
            </div>

            <input 
              className="w-full font-bold text-slate-800 p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-100"
              value={localData.topic}
              onChange={(e) => handleChange('topic', e.target.value)}
            />
            
            <textarea 
              className="w-full text-sm text-slate-500 p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-100 min-h-[80px] resize-none"
              value={localData.introduction}
              onChange={(e) => handleChange('introduction', e.target.value)}
            />
          </div>
        ) : (
          /* --- Display Mode --- */
          <div className="flex justify-between items-start group">
            <div className="space-y-1">
              <h4 className="font-bold text-slate-800 text-sm md:text-base leading-snug">{topic.topic}</h4>
              <p className="text-slate-500 text-[13px] md:text-sm leading-relaxed">{topic.introduction}</p>
            </div>
            
            <button 
              onClick={() => setEditingTopicId(topic.id)}
              className="p-2 text-slate-300 hover:text-blue-600 hover:bg-white rounded-full transition-all active:scale-90"
              title="Edit Topic"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Main SyllabusSection Component ---
const SyllabusSection = ({ syllabus, courseId }) => {
  const { loadFullCourse } = useCourses();
  const [isAdding, setIsAdding] = useState(false);
  const [editingTopicId, setEditingTopicId] = useState(null);
  
  const [newTopic, setNewTopic] = useState({ 
    topic_num: (syllabus?.length || 0) + 1, 
    topic: '', 
    introduction: '' 
  });

  const handleUpdate = async (topicId, updatedData) => {
    try {
      await api.updateSyllabusTopic(topicId, updatedData);
      await loadFullCourse(courseId);
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  const handleAdd = async () => {
    if (!newTopic.topic) return;
    try {
      await api.createSyllabusTopic({ ...newTopic, course_id: courseId });
      setNewTopic({ topic_num: (syllabus?.length || 0) + 2, topic: '', introduction: '' });
      setIsAdding(false);
      await loadFullCourse(courseId);
    } catch (err) {
      console.error("Add failed:", err);
    }
  };

  const handleDelete = async (topicId) => {
    if (window.confirm("האם למחוק נושא זה מהסילבוס?")) {
      try {
        await api.deleteSyllabusTopic(topicId);
        await loadFullCourse(courseId);
      } catch (err) {
        console.error("Delete failed:", err);
      }
    }
  };

  return (
    <section className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-100 relative">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6 border-b pb-3">
        <h3 className="text-lg md:text-xl font-bold text-slate-800">סילבוס ונושאי לימוד</h3>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className={`text-[11px] md:text-xs font-bold px-4 py-2 rounded-full transition active:scale-95 ${
            isAdding 
              ? 'bg-slate-800 text-white' 
              : 'text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-100'
          }`}
        >
          {isAdding ? 'ביטול הוספה' : '+ הוסף נושא'}
        </button>
      </div>

      <div className="space-y-6">
        {/* Top Add Form */}
        {isAdding && (
          <div className="bg-slate-50 p-4 rounded-xl border border-dashed border-slate-200 mb-8 space-y-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">תיעוד נושא חדש</p>
            <div className="grid grid-cols-1 sm:grid-cols-6 gap-3">
              <input 
                type="number"
                placeholder="#"
                className="p-2 border rounded-lg text-center font-bold outline-none focus:ring-2 focus:ring-blue-100"
                value={newTopic.topic_num}
                onChange={(e) => setNewTopic({...newTopic, topic_num: parseInt(e.target.value)})}
              />
              <input 
                placeholder="כותרת הנושא"
                className="sm:col-span-5 p-2 border rounded-lg font-bold outline-none focus:ring-2 focus:ring-blue-100"
                value={newTopic.topic}
                onChange={(e) => setNewTopic({...newTopic, topic: e.target.value})}
              />
            </div>
            <textarea 
              placeholder="תיאור קצר / מבוא"
              className="w-full p-3 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-100 min-h-[80px]"
              value={newTopic.introduction}
              onChange={(e) => setNewTopic({...newTopic, introduction: e.target.value})}
            />
            <button 
              onClick={handleAdd}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold shadow-md hover:bg-blue-700 transition"
            >
              הוסף לסילבוס
            </button>
          </div>
        )}

        {/* List of Topics */}
        <div className="space-y-2">
          {syllabus?.sort((a, b) => a.topic_num - b.topic_num).map((topic) => (
            <SyllabusTopicCard 
              key={topic.id}
              topic={topic}
              isEditing={editingTopicId === topic.id}
              setEditingTopicId={setEditingTopicId}
              handleUpdate={handleUpdate}
              handleDelete={handleDelete}
            />
          ))}
        </div>

        {!syllabus?.length && !isAdding && (
          <div className="text-center py-10 text-slate-400 italic text-sm uppercase tracking-widest">
            לא הוגדר סילבוס לקורס זה
          </div>
        )}
      </div>
    </section>
  );
};

export default SyllabusSection;
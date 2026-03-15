// src/components/CoursePage/SyllabusSection.jsx
import React, { useState } from 'react';
import api from '../../api/api';
import { useCourses } from '../../context/CourseContext';

const SyllabusSection = ({ syllabus, courseId }) => {
  const { loadFullCourse } = useCourses();
  const [isEditing, setIsEditing] = useState(false);
  const [newTopic, setNewTopic] = useState({ topic_num: syllabus.length + 1, topic: '', introduction: '' });

  /* Update an existing topic - Logic preserved */
  const handleUpdate = async (topicId, updatedData) => {
    try {
      await api.updateSyllabusTopic(topicId, updatedData);
      await loadFullCourse(courseId);
    } catch (err) {
      console.error("Failed to update syllabus topic:", err);
    }
  };

  /* Add a new topic - Logic preserved */
  const handleAdd = async () => {
    try {
      await api.createSyllabusTopic({ ...newTopic, course_id: courseId });
      setNewTopic({ topic_num: syllabus.length + 2, topic: '', introduction: '' });
      await loadFullCourse(courseId);
    } catch (err) {
      console.error("Failed to add topic:", err);
    }
  };

  /* Delete a topic - Logic preserved */
  const handleDelete = async (topicId) => {
    if (window.confirm("האם למחוק נושא זה מהסילבוס?")) {
      try {
        await api.deleteSyllabusTopic(topicId);
        await loadFullCourse(courseId);
      } catch (err) {
        console.error("Failed to delete topic:", err);
      }
    }
  };

  return (
    /* Adjusted padding for smaller screens (p-4 vs p-6) */
    <section className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-100 relative">
      
      {/* Header with responsive text scaling and action button */}
      <div className="flex justify-between items-center mb-6 border-b pb-3">
        <h3 className="text-lg md:text-xl font-bold text-slate-800">סילבוס ונושאי לימוד</h3>
        <button 
          onClick={() => setIsEditing(!isEditing)}
          className="text-[11px] md:text-xs font-bold text-slate-400 hover:text-slate-900 border border-slate-100 px-3 py-1.5 rounded-lg transition active:scale-95"
        >
          {isEditing ? 'סיום עריכה' : 'עריכת סילבוס'}
        </button>
      </div>

      <div className="space-y-8 md:space-y-6">
        {syllabus?.sort((a, b) => a.topic_num - b.topic_num).map((topic) => (
          <div key={topic.id} className="flex gap-3 md:gap-4 group">
            
            {/* Responsive Topic Number badge */}
            <div className="bg-slate-900 text-white w-7 h-7 md:w-8 md:h-8 flex items-center justify-center rounded-lg shrink-0 font-bold text-xs md:text-sm shadow-sm">
              {isEditing ? (
                <input 
                  type="number"
                  className="bg-transparent w-full text-center outline-none focus:text-blue-400"
                  value={topic.topic_num}
                  onChange={(e) => handleUpdate(topic.id, { ...topic, topic_num: parseInt(e.target.value) })}
                />
              ) : (
                topic.topic_num
              )}
            </div>
            
            <div className="flex-1 space-y-1 min-w-0">
              {isEditing ? (
                /* Edit Mode: Enhanced touch targets and visibility */
                <div className="space-y-3 bg-slate-50/50 p-2 md:p-0 rounded-lg border md:border-0 border-slate-100">
                  <div className="flex justify-between gap-3">
                    <input 
                      className="flex-1 font-bold text-slate-800 border-b border-transparent bg-transparent outline-none focus:border-blue-500 py-1"
                      value={topic.topic}
                      onChange={(e) => handleUpdate(topic.id, { ...topic, topic: e.target.value })}
                    />
                    <button 
                      onClick={() => handleDelete(topic.id)} 
                      className="text-red-400 hover:text-red-600 p-1 active:scale-90 transition-transform"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                      </svg>
                    </button>
                  </div>
                  <textarea 
                    className="text-sm text-slate-500 w-full border border-slate-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-100 bg-white min-h-[80px] resize-none"
                    value={topic.introduction}
                    onChange={(e) => handleUpdate(topic.id, { ...topic, introduction: e.target.value })}
                  />
                </div>
              ) : (
                /* Display Mode: Optimized readability */
                <>
                  <h4 className="font-bold text-slate-800 text-sm md:text-base leading-snug">{topic.topic}</h4>
                  <p className="text-slate-500 text-[13px] md:text-sm leading-relaxed">{topic.introduction}</p>
                </>
              )}
            </div>
          </div>
        ))}

        {/* Add New Topic Row: Redesigned for mobile form factor */}
        {isEditing && (
          <div className="pt-6 mt-6 border-t border-dashed border-slate-200 space-y-4">
            <p className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest px-1">הוספת נושא חדש</p>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-stretch bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div className="flex flex-row sm:flex-col items-center gap-3">
                <span className="text-[10px] font-bold text-slate-400 sm:hidden">מספר:</span>
                <input 
                  type="number"
                  className="w-12 h-10 border border-slate-200 rounded-lg text-center font-bold bg-white focus:ring-2 focus:ring-blue-100 outline-none"
                  value={newTopic.topic_num}
                  onChange={(e) => setNewTopic({...newTopic, topic_num: parseInt(e.target.value)})}
                />
              </div>
              <div className="flex-1 w-full space-y-3">
                <input 
                  placeholder="כותרת הנושא"
                  className="w-full border border-slate-200 rounded-lg p-3 text-sm font-bold bg-white focus:ring-2 focus:ring-blue-100 outline-none"
                  value={newTopic.topic}
                  onChange={(e) => setNewTopic({...newTopic, topic: e.target.value})}
                />
                <textarea 
                  placeholder="תיאור קצר (מבוא)"
                  className="w-full border border-slate-200 rounded-lg p-3 text-xs md:text-sm bg-white focus:ring-2 focus:ring-blue-100 outline-none min-h-[60px] resize-none"
                  value={newTopic.introduction}
                  onChange={(e) => setNewTopic({...newTopic, introduction: e.target.value})}
                />
                <button 
                  onClick={handleAdd}
                  className="w-full sm:w-auto bg-slate-900 text-white px-6 py-3 rounded-xl text-xs font-bold hover:bg-black transition-all shadow-md active:scale-95"
                >
                  הוסף לסילבוס
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default SyllabusSection;
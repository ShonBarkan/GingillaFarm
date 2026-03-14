import React, { useState } from 'react';
import api from '../../api/api';
import { useCourses } from '../../context/CourseContext';

const SyllabusSection = ({ syllabus, courseId }) => {
  const { loadFullCourse } = useCourses();
  const [isEditing, setIsEditing] = useState(false);
  const [newTopic, setNewTopic] = useState({ topic_num: syllabus.length + 1, topic: '', introduction: '' });

  // Update an existing topic
  const handleUpdate = async (topicId, updatedData) => {
    try {
      await api.updateSyllabusTopic(topicId, updatedData);
      await loadFullCourse(courseId);
    } catch (err) {
      console.error("Failed to update syllabus topic:", err);
    }
  };

  // Add a new topic
  const handleAdd = async () => {
    try {
      await api.createSyllabusTopic({ ...newTopic, course_id: courseId });
      setNewTopic({ topic_num: syllabus.length + 2, topic: '', introduction: '' });
      await loadFullCourse(courseId);
    } catch (err) {
      console.error("Failed to add topic:", err);
    }
  };

  // Delete a topic
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
    <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative">
      <div className="flex justify-between items-center mb-6 border-b pb-2">
        <h3 className="text-xl font-bold text-slate-800">סילבוס ונושאי לימוד</h3>
        <button 
          onClick={() => setIsEditing(!isEditing)}
          className="text-xs font-bold text-slate-400 hover:text-slate-900 transition"
        >
          {isEditing ? 'סיום עריכה' : 'עריכת סילבוס'}
        </button>
      </div>

      <div className="space-y-6">
        {syllabus?.sort((a, b) => a.topic_num - b.topic_num).map((topic) => (
          <div key={topic.id} className="flex gap-4 group">
            <div className="bg-slate-900 text-white w-8 h-8 flex items-center justify-center rounded-lg shrink-0 font-bold text-sm">
              {isEditing ? (
                <input 
                  type="number"
                  className="bg-transparent w-full text-center outline-none"
                  value={topic.topic_num}
                  onChange={(e) => handleUpdate(topic.id, { ...topic, topic_num: parseInt(e.target.value) })}
                />
              ) : (
                topic.topic_num
              )}
            </div>
            
            <div className="flex-1 space-y-1">
              {isEditing ? (
                <div className="space-y-2">
                  <div className="flex justify-between gap-2">
                    <input 
                      className="font-bold text-slate-800 border-b w-full outline-none focus:border-blue-500"
                      value={topic.topic}
                      onChange={(e) => handleUpdate(topic.id, { ...topic, topic: e.target.value })}
                    />
                    <button onClick={() => handleDelete(topic.id)} className="text-red-400 hover:text-red-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>
                    </button>
                  </div>
                  <textarea 
                    className="text-sm text-slate-500 w-full border rounded p-2 outline-none focus:ring-1 focus:ring-blue-500"
                    value={topic.introduction}
                    onChange={(e) => handleUpdate(topic.id, { ...topic, introduction: e.target.value })}
                  />
                </div>
              ) : (
                <>
                  <h4 className="font-bold text-slate-800">{topic.topic}</h4>
                  <p className="text-slate-500 text-sm leading-relaxed">{topic.introduction}</p>
                </>
              )}
            </div>
          </div>
        ))}

        {/* Add New Topic Row */}
        {isEditing && (
          <div className="pt-4 mt-4 border-t border-dashed border-slate-200 space-y-3">
            <p className="text-xs font-bold text-slate-400 uppercase">הוספת נושא חדש</p>
            <div className="flex gap-4">
              <input 
                type="number"
                className="w-12 h-10 border rounded text-center font-bold"
                value={newTopic.topic_num}
                onChange={(e) => setNewTopic({...newTopic, topic_num: parseInt(e.target.value)})}
              />
              <div className="flex-1 space-y-2">
                <input 
                  placeholder="כותרת הנושא"
                  className="w-full border rounded p-2 text-sm font-bold"
                  value={newTopic.topic}
                  onChange={(e) => setNewTopic({...newTopic, topic: e.target.value})}
                />
                <textarea 
                  placeholder="תיאור קצר (מבוא)"
                  className="w-full border rounded p-2 text-xs"
                  value={newTopic.introduction}
                  onChange={(e) => setNewTopic({...newTopic, introduction: e.target.value})}
                />
                <button 
                  onClick={handleAdd}
                  className="bg-slate-800 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-black transition"
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
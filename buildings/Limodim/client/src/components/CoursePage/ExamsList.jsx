import React, { useState } from 'react';
import api from '../../api/api';
import { useCourses } from '../../context/CourseContext';

const ExamsList = ({ exams, courseId }) => {
  const { loadFullCourse } = useCourses();
  const [isEditing, setIsEditing] = useState(false);
  const [newExam, setNewExam] = useState({ name: '', percentage: 0, grade: null });

  // Update an existing exam
  const handleUpdateGrade = async (examId, updatedData) => {
    try {
      await api.updateExam(examId, updatedData);
      await loadFullCourse(courseId); // Refresh data
    } catch (err) {
      console.error("Failed to update exam:", err);
    }
  };

  // Delete an exam
  const handleDelete = async (examId) => {
    if (window.confirm("האם למחוק את המבחן/מטלה?")) {
      try {
        await api.deleteExam(examId);
        await loadFullCourse(courseId);
      } catch (err) {
        console.error("Failed to delete exam:", err);
      }
    }
  };

  // Add a new exam
  const handleAddExam = async () => {
    try {
      await api.createExam({ ...newExam, course_id: courseId });
      setNewExam({ name: '', percentage: 0, grade: null }); // Reset form
      await loadFullCourse(courseId);
    } catch (err) {
      console.error("Failed to add exam:", err);
    }
  };

  return (
    <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <span className="w-2 h-6 bg-orange-500 rounded-full"></span>
          מבחנים וציונים
        </h3>
        <button 
          onClick={() => setIsEditing(!isEditing)}
          className="text-xs font-bold text-orange-600 hover:bg-orange-50 px-2 py-1 rounded"
        >
          {isEditing ? 'סיום עריכה' : 'נהל ציונים'}
        </button>
      </div>

      <div className="space-y-3">
        {exams?.map((ex) => (
          <div key={ex.id} className="flex flex-col p-3 bg-slate-50 rounded-xl border border-slate-100 group">
            <div className="flex justify-between items-center">
              <div className="flex-1">
                {isEditing ? (
                  <input 
                    className="font-bold text-sm border-b bg-transparent outline-none focus:border-orange-500 w-full"
                    value={ex.name}
                    onChange={(e) => handleUpdateGrade(ex.id, { ...ex, name: e.target.value })}
                  />
                ) : (
                  <p className="font-bold text-slate-800 text-sm">{ex.name}</p>
                )}
                <p className="text-[10px] text-slate-500">משקל: {ex.percentage}%</p>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-center">
                  {isEditing ? (
                    <input 
                      type="number"
                      className="w-12 p-1 text-center text-sm border rounded font-bold text-orange-600"
                      value={ex.grade || ''}
                      onChange={(e) => handleUpdateGrade(ex.id, { ...ex, grade: parseInt(e.target.value) })}
                    />
                  ) : (
                    <span className="text-lg font-black text-orange-600">{ex.grade || '--'}</span>
                  )}
                </div>
                {isEditing && (
                  <button onClick={() => handleDelete(ex.id)} className="text-red-400 hover:text-red-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Add New Exam Form */}
        {isEditing && (
          <div className="mt-4 p-3 border-2 border-dashed border-slate-200 rounded-xl space-y-2">
            <p className="text-xs font-bold text-slate-400 uppercase">הוספת רכיב ציון חדש</p>
            <div className="grid grid-cols-3 gap-2">
              <input 
                placeholder="שם (למשל: בוחן)" 
                className="text-xs p-2 border rounded col-span-2"
                value={newExam.name}
                onChange={(e) => setNewExam({...newExam, name: e.target.value})}
              />
              <input 
                type="number" 
                placeholder="%" 
                className="text-xs p-2 border rounded"
                value={newExam.percentage}
                onChange={(e) => setNewExam({...newExam, percentage: parseInt(e.target.value)})}
              />
            </div>
            <button 
              onClick={handleAddExam}
              className="w-full bg-orange-500 text-white text-xs font-bold py-2 rounded-lg hover:bg-orange-600 transition"
            >
              הוסף לרשימה
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default ExamsList;
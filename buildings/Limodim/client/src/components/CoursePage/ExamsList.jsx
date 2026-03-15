// src/components/CoursePage/ExamsList.jsx
import React, { useState } from 'react';
import api from '../../api/api';
import { useCourses } from '../../context/CourseContext';

const ExamsList = ({ exams, courseId }) => {
  const { loadFullCourse } = useCourses();
  const [isEditing, setIsEditing] = useState(false);
  const [newExam, setNewExam] = useState({ name: '', percentage: 0, grade: null });

  /* Update an existing exam - Logic preserved */
  const handleUpdateGrade = async (examId, updatedData) => {
    try {
      await api.updateExam(examId, updatedData);
      await loadFullCourse(courseId); 
    } catch (err) {
      console.error("Failed to update exam:", err);
    }
  };

  /* Delete an exam - Logic preserved */
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

  /* Add a new exam - Logic preserved */
  const handleAddExam = async () => {
    try {
      await api.createExam({ ...newExam, course_id: courseId });
      setNewExam({ name: '', percentage: 0, grade: null }); 
      await loadFullCourse(courseId);
    } catch (err) {
      console.error("Failed to add exam:", err);
    }
  };

  return (
    /* Adjusted padding for smaller screens */
    <section className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-100">
      
      {/* Header Section with responsive sizing */}
      <div className="flex justify-between items-center mb-5">
        <h3 className="text-base md:text-lg font-bold text-slate-800 flex items-center gap-2">
          <span className="w-1.5 md:w-2 h-5 md:h-6 bg-orange-500 rounded-full"></span>
          מבחנים וציונים
        </h3>
        <button 
          onClick={() => setIsEditing(!isEditing)}
          className="text-[11px] md:text-xs font-bold text-orange-600 border border-orange-50 px-3 py-1.5 rounded-lg active:scale-95 transition-all"
        >
          {isEditing ? 'סיום עריכה' : 'נהל ציונים'}
        </button>
      </div>

      <div className="space-y-3">
        {exams?.map((ex) => (
          <div key={ex.id} className="flex flex-col p-4 md:p-3 bg-slate-50 rounded-xl border border-slate-100 group">
            <div className="flex justify-between items-center gap-4">
              <div className="flex-1 min-w-0">
                {isEditing ? (
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase">שם המטלה</label>
                    <input 
                      className="font-bold text-sm border-b border-orange-200 bg-transparent outline-none focus:border-orange-500 w-full py-1"
                      value={ex.name}
                      onChange={(e) => handleUpdateGrade(ex.id, { ...ex, name: e.target.value })}
                    />
                  </div>
                ) : (
                  <p className="font-bold text-slate-800 text-sm md:text-base truncate">{ex.name}</p>
                )}
                <p className="text-[10px] md:text-xs text-slate-500 mt-0.5">משקל: {ex.percentage}%</p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="text-center">
                  {isEditing ? (
                    <div className="flex flex-col items-center gap-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase">ציון</label>
                      <input 
                        type="number"
                        className="w-14 p-2 text-center text-sm border border-orange-200 rounded-lg font-bold text-orange-600 bg-white"
                        value={ex.grade || ''}
                        onChange={(e) => handleUpdateGrade(ex.id, { ...ex, grade: parseInt(e.target.value) })}
                      />
                    </div>
                  ) : (
                    <div className="bg-orange-50 px-3 py-1 rounded-lg border border-orange-100">
                      <span className="text-lg md:text-xl font-black text-orange-600">{ex.grade || '--'}</span>
                    </div>
                  )}
                </div>
                
                {isEditing && (
                  <button 
                    onClick={() => handleDelete(ex.id)} 
                    className="text-red-400 hover:text-red-600 p-1 active:scale-90 transition-transform"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Add New Exam Form: Better spacing for mobile form entry */}
        {isEditing && (
          <div className="mt-6 p-4 border-2 border-dashed border-slate-200 rounded-xl space-y-3 bg-white">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">הוספת רכיב ציון חדש</p>
            <div className="grid grid-cols-3 gap-3">
              <input 
                placeholder="שם (למשל: בוחן)" 
                className="text-sm p-3 border border-slate-200 rounded-xl col-span-2 outline-none focus:ring-2 focus:ring-orange-100"
                value={newExam.name}
                onChange={(e) => setNewExam({...newExam, name: e.target.value})}
              />
              <input 
                type="number" 
                placeholder="%" 
                className="text-sm p-3 border border-slate-200 rounded-xl text-center outline-none focus:ring-2 focus:ring-orange-100"
                value={newExam.percentage}
                onChange={(e) => setNewExam({...newExam, percentage: parseInt(e.target.value)})}
              />
            </div>
            <button 
              onClick={handleAddExam}
              className="w-full bg-orange-500 text-white text-sm font-bold py-3 rounded-xl shadow-md active:scale-95 transition-all mt-2"
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
import React, { useState } from 'react';
import api from '../../api/api';
import { useCourses } from '../../context/CourseContext';

const ExamsList = ({ exams, courseId }) => {
  const { loadFullCourse } = useCourses();
  
  const [editingId, setEditingId] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  
  // Buffer for editing existing exams without closing the input on every keystroke
  const [editBuffer, setEditBuffer] = useState(null);

  const [newExam, setNewExam] = useState({ 
    name: '', 
    date: '', // Added: Required for Timeline
    percentage: 0, 
    grade: null 
  });

  // Initialize edit mode for a specific exam
  const startEditing = (ex) => {
    setEditingId(ex.id);
    setEditBuffer({ ...ex });
  };

  // Submit buffered changes to the server
  const handleSaveUpdate = async () => {
    try {
      await api.updateExam(editingId, editBuffer);
      setEditingId(null);
      setEditBuffer(null);
      await loadFullCourse(courseId);
    } catch (err) {
      console.error("Failed to update exam:", err);
    }
  };

  const handleAddExam = async () => {
    if (!newExam.name || !newExam.date) {
      return alert("Please enter both a name and a date for the exam");
    }
    try {
      await api.createExam({ ...newExam, course_id: courseId });
      setNewExam({ name: '', date: '', percentage: 0, grade: null });
      setIsAdding(false);
      await loadFullCourse(courseId);
    } catch (err) {
      console.error("Failed to add exam:", err);
    }
  };

  const handleDelete = async (examId) => {
    if (window.confirm("Are you sure you want to delete this component?")) {
      try {
        await api.deleteExam(examId);
        await loadFullCourse(courseId);
      } catch (err) {
        console.error("Failed to delete exam:", err);
      }
    }
  };

  return (
    <section className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-100">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-5">
        <h3 className="text-base md:text-lg font-bold text-slate-800 flex items-center gap-2">
          <span className="w-1.5 md:w-2 h-5 md:h-6 bg-orange-500 rounded-full"></span>
          מבחנים וציונים
        </h3>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className={`text-[11px] md:text-xs font-bold px-3 py-1.5 rounded-lg border transition active:scale-95 ${
            isAdding ? 'bg-slate-100 text-slate-600 border-slate-200' : 'bg-orange-50 text-orange-700 border-orange-100'
          }`}
        >
          {isAdding ? 'ביטול' : '+ הוספה'}
        </button>
      </div>

      <div className="space-y-3">
        {exams?.map((ex) => (
          <div key={ex.id} className="p-4 bg-slate-50/50 rounded-xl border border-slate-100 group transition-all">
            
            {editingId === ex.id ? (
              /* --- Edit Mode --- */
              <div className="space-y-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase">Component Name</label>
                  <input 
                    className="font-bold text-sm bg-white border border-orange-200 rounded-lg p-2.5 w-full outline-none focus:ring-2 focus:ring-orange-200"
                    value={editBuffer.name}
                    onChange={(e) => setEditBuffer({ ...editBuffer, name: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase">Exam Date</label>
                    <input 
                      type="date"
                      className="bg-white border border-orange-200 rounded-lg p-2.5 text-sm outline-none"
                      value={editBuffer.date || ''}
                      onChange={(e) => setEditBuffer({ ...editBuffer, date: e.target.value })}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase">Weight (%)</label>
                    <input 
                      type="number"
                      className="bg-white border border-orange-200 rounded-lg p-2.5 text-sm outline-none"
                      value={editBuffer.percentage || 0}
                      onChange={(e) => setEditBuffer({ ...editBuffer, percentage: parseFloat(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase">Grade</label>
                  <input 
                    type="number"
                    className="bg-white border border-orange-200 rounded-lg p-2.5 text-sm font-black text-orange-600 outline-none"
                    value={editBuffer.grade || ''}
                    onChange={(e) => setEditBuffer({ ...editBuffer, grade: parseInt(e.target.value) })}
                  />
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-orange-100 mt-2">
                  <button onClick={() => handleDelete(ex.id)} className="text-red-500 text-[10px] font-bold hover:underline">Delete</button>
                  <div className="flex gap-2">
                    <button onClick={() => setEditingId(null)} className="text-slate-500 text-[10px] font-bold px-3 py-1">Cancel</button>
                    <button onClick={handleSaveUpdate} className="bg-orange-500 text-white text-[10px] font-bold px-4 py-1.5 rounded-lg shadow-sm">Save Changes</button>
                  </div>
                </div>
              </div>
            ) : (
              /* --- Display Mode --- */
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <p className="font-bold text-slate-800 text-sm md:text-base">{ex.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                        {ex.date || 'No Date'}
                    </span>
                    <span className="text-[10px] text-slate-300">|</span>
                    <span className="text-[10px] text-slate-400 font-medium">Weight: {ex.percentage}%</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="bg-orange-50 px-3 py-1 rounded-lg border border-orange-100 min-w-[45px] text-center">
                    <span className="text-lg font-black text-orange-600">{ex.grade ?? '--'}</span>
                  </div>
                  <button 
                    onClick={() => startEditing(ex)}
                    className="text-[10px] font-black text-orange-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    Edit
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* --- Add New Mode --- */}
        {isAdding && (
          <div className="mt-4 p-4 border-2 border-dashed border-orange-100 rounded-xl space-y-3 bg-orange-50/10">
            <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest px-1">New Exam Component</p>
            
            <input 
              placeholder="Name (e.g., Final Exam)" 
              className="text-sm p-3 border border-slate-200 rounded-xl w-full outline-none focus:ring-2 focus:ring-orange-200 bg-white"
              value={newExam.name}
              onChange={(e) => setNewExam({...newExam, name: e.target.value})}
            />

            <div className="grid grid-cols-2 gap-3">
              <input 
                type="date" 
                className="text-sm p-3 border border-slate-200 rounded-xl outline-none bg-white"
                value={newExam.date}
                onChange={(e) => setNewExam({...newExam, date: e.target.value})}
              />
              <input 
                type="number" 
                placeholder="Weight (%)" 
                className="text-sm p-3 border border-slate-200 rounded-xl outline-none bg-white"
                value={newExam.percentage || ''}
                onChange={(e) => setNewExam({...newExam, percentage: parseFloat(e.target.value)})}
              />
            </div>

            <button 
              onClick={handleAddExam}
              className="w-full bg-orange-500 text-white text-sm font-bold py-3 rounded-xl shadow-md active:scale-95 transition-all mt-2"
            >
              Add to Course
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default ExamsList;
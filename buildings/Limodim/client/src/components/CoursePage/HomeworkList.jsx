// src/components/CoursePage/HomeworkList.jsx
import React, { useState } from 'react';
import api from '../../api/api';
import { useCourses } from '../../context/CourseContext';

const HomeworkList = ({ homeworks, courseId }) => {
  const { loadFullCourse } = useCourses();
  const [isEditing, setIsEditing] = useState(false);
  const [newHw, setNewHw] = useState({ due_date: '', grade: null, link_to: '' });

  // Update homework entry - Logic preserved
  const handleUpdate = async (id, updatedData) => {
    try {
      await api.updateHomework(id, updatedData);
      await loadFullCourse(courseId);
    } catch (err) {
      console.error("Failed to update homework:", err);
    }
  };

  // Add new homework - Logic preserved
  const handleAdd = async () => {
    try {
      await api.createHomework({ ...newHw, course_id: courseId });
      setNewHw({ due_date: '', grade: null, link_to: '' });
      await loadFullCourse(courseId);
    } catch (err) {
      console.error("Failed to add homework:", err);
    }
  };

  // Delete homework - Logic preserved
  const handleDelete = async (id) => {
    if (window.confirm("למחוק מטלה זו?")) {
      try {
        await api.deleteHomework(id);
        await loadFullCourse(courseId);
      } catch (err) {
        console.error("Failed to delete homework:", err);
      }
    }
  };

  return (
    /* Adjusted padding for mobile screens */
    <section className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-100">
      
      {/* Header with responsive typography and better touch target for button */}
      <div className="flex justify-between items-center mb-6 border-b pb-3">
        <h3 className="text-lg md:text-xl font-bold text-slate-800">מטלות להגשה</h3>
        <button 
          onClick={() => setIsEditing(!isEditing)}
          className="text-[11px] md:text-xs font-bold text-blue-600 border border-blue-50 px-3 py-1.5 rounded-lg active:scale-95 transition-all"
        >
          {isEditing ? 'סיום' : 'ניהול מטלות'}
        </button>
      </div>

      {/* Grid: 1 col on mobile, 2 on medium screens and up */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
        {homeworks?.map((hw) => (
          <div key={hw.id} className="p-5 md:p-4 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors relative group bg-white shadow-sm md:shadow-none">
            {isEditing ? (
              /* Edit Mode: Larger inputs for easier tapping */
              <div className="space-y-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-bold text-slate-400">תאריך הגשה</label>
                  <input type="date" className="w-full p-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-100" value={hw.due_date} onChange={(e) => handleUpdate(hw.id, {...hw, due_date: e.target.value})} />
                </div>
                <input placeholder="לינק למטלה" className="w-full p-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-100" value={hw.link_to || ''} onChange={(e) => handleUpdate(hw.id, {...hw, link_to: e.target.value})} />
                <input type="number" placeholder="ציון" className="w-full p-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-100" value={hw.grade || ''} onChange={(e) => handleUpdate(hw.id, {...hw, grade: parseFloat(e.target.value)})} />
                <button onClick={() => handleDelete(hw.id)} className="text-red-500 text-[11px] font-bold pt-1 hover:underline">מחק מטלה</button>
              </div>
            ) : (
              /* Display Mode: Optimized layout for quick reading */
              <>
                <div className="flex justify-between items-start mb-2">
                  <span className="font-bold text-slate-800 text-sm md:text-base">מטלה #{hw.id}</span>
                  {hw.grade && <span className="text-xs font-black bg-green-100 text-green-700 px-3 py-1 rounded-full">ציון: {hw.grade}</span>}
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-[11px] md:text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded">הגשה</span>
                  <p className="text-[13px] md:text-sm text-slate-600 font-semibold">{hw.due_date}</p>
                </div>
                {hw.link_to && (
                  <a href={hw.link_to} target="_blank" rel="noreferrer" className="inline-flex items-center text-blue-600 text-xs md:text-sm font-bold hover:underline gap-1">
                    מעבר להנחיות המטלה 
                    <span className="text-[10px]">←</span>
                  </a>
                )}
              </>
            )}
          </div>
        ))}

        {/* Add New Homework: Mobile-friendly form layout */}
        {isEditing && (
          <div className="p-5 border-2 border-dashed border-blue-100 rounded-xl bg-blue-50/30 space-y-3">
            <p className="text-[10px] md:text-xs font-black text-blue-400 uppercase tracking-widest px-1">מטלה חדשה</p>
            <input type="date" className="w-full p-3 border border-slate-200 rounded-xl text-sm bg-white outline-none focus:ring-2 focus:ring-blue-100" value={newHw.due_date} onChange={(e) => setNewHw({...newHw, due_date: e.target.value})} />
            <input placeholder="URL למטלה" className="w-full p-3 border border-slate-200 rounded-xl text-sm bg-white outline-none focus:ring-2 focus:ring-blue-100" value={newHw.link_to} onChange={(e) => setNewHw({...newHw, link_to: e.target.value})} />
            <button 
              onClick={handleAdd} 
              className="w-full bg-blue-600 text-white text-sm font-bold py-3 rounded-xl shadow-md active:scale-95 transition-transform mt-2"
            >
              הוסף מטלה
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default HomeworkList;
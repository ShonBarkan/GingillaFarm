import React, { useState } from 'react';
import api from '../../api/api';
import { useCourses } from '../../context/CourseContext';

const HomeworkList = ({ homeworks, courseId }) => {
  const { loadFullCourse } = useCourses();
  const [isEditing, setIsEditing] = useState(false);
  const [newHw, setNewHw] = useState({ due_date: '', grade: null, link_to: '' });

  // Update homework entry
  const handleUpdate = async (id, updatedData) => {
    try {
      await api.updateHomework(id, updatedData);
      await loadFullCourse(courseId);
    } catch (err) {
      console.error("Failed to update homework:", err);
    }
  };

  // Add new homework
  const handleAdd = async () => {
    try {
      await api.createHomework({ ...newHw, course_id: courseId });
      setNewHw({ due_date: '', grade: null, link_to: '' });
      await loadFullCourse(courseId);
    } catch (err) {
      console.error("Failed to add homework:", err);
    }
  };

  // Delete homework
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
    <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <div className="flex justify-between items-center mb-6 border-b pb-2">
        <h3 className="text-xl font-bold text-slate-800">מטלות להגשה</h3>
        <button 
          onClick={() => setIsEditing(!isEditing)}
          className="text-xs font-bold text-blue-600"
        >
          {isEditing ? 'סיום' : 'ניהול מטלות'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {homeworks?.map((hw) => (
          <div key={hw.id} className="p-4 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors relative group">
            {isEditing ? (
              <div className="space-y-2">
                <input type="date" className="w-full p-1 border rounded text-xs" value={hw.due_date} onChange={(e) => handleUpdate(hw.id, {...hw, due_date: e.target.value})} />
                <input placeholder="לינק למטלה" className="w-full p-1 border rounded text-xs" value={hw.link_to || ''} onChange={(e) => handleUpdate(hw.id, {...hw, link_to: e.target.value})} />
                <input type="number" placeholder="ציון" className="w-full p-1 border rounded text-xs" value={hw.grade || ''} onChange={(e) => handleUpdate(hw.id, {...hw, grade: parseFloat(e.target.value)})} />
                <button onClick={() => handleDelete(hw.id)} className="text-red-500 text-[10px]">מחק מטלה</button>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-start mb-2">
                  <span className="font-bold text-slate-800 text-sm">מטלה #{hw.id}</span>
                  {hw.grade && <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded">ציון: {hw.grade}</span>}
                </div>
                <p className="text-xs text-slate-500 mb-3 font-medium">תאריך הגשה: {hw.due_date}</p>
                {hw.link_to && (
                  <a href={hw.link_to} target="_blank" rel="noreferrer" className="text-blue-600 text-xs font-bold hover:underline">
                    מעבר להנחיות המטלה ←
                  </a>
                )}
              </>
            )}
          </div>
        ))}

        {isEditing && (
          <div className="p-4 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
            <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">מטלה חדשה</p>
            <input type="date" className="w-full p-2 border rounded text-xs mb-2" value={newHw.due_date} onChange={(e) => setNewHw({...newHw, due_date: e.target.value})} />
            <input placeholder="URL למטלה" className="w-full p-2 border rounded text-xs mb-2" value={newHw.link_to} onChange={(e) => setNewHw({...newHw, link_to: e.target.value})} />
            <button onClick={handleAdd} className="w-full bg-blue-600 text-white text-xs font-bold py-2 rounded-lg">הוסף מטלה</button>
          </div>
        )}
      </div>
    </section>
  );
};

export default HomeworkList;
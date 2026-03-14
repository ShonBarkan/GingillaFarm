import React, { useState } from 'react';
import api from '../../api/api';
import { useCourses } from '../../context/CourseContext';

const ReceptionHours = ({ hours, courseId }) => {
  const { loadFullCourse } = useCourses();
  const [isEditing, setIsEditing] = useState(false);
  const [newHour, setNewHour] = useState({ 
    name: '', 
    day: 'ראשון', 
    time: '', 
    location_building: '', 
    location_room: '' 
  });

  // Update reception hour
  const handleUpdate = async (id, updatedData) => {
    try {
      await api.updateReceptionHour(id, updatedData);
      await loadFullCourse(courseId);
    } catch (err) {
      console.error("Failed to update reception hour:", err);
    }
  };

  // Create new reception hour
  const handleAdd = async () => {
    try {
      await api.createReceptionHour({ ...newHour, course_id: courseId });
      setNewHour({ name: '', day: 'ראשון', time: '', location_building: '', location_room: '' });
      await loadFullCourse(courseId);
    } catch (err) {
      console.error("Failed to add reception hour:", err);
    }
  };

  // Delete reception hour
  const handleDelete = async (id) => {
    if (window.confirm("למחוק שעת קבלה זו?")) {
      try {
        await api.deleteReceptionHour(id);
        await loadFullCourse(courseId);
      } catch (err) {
        console.error("Failed to delete reception hour:", err);
      }
    }
  };

  return (
    <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <span className="w-2 h-6 bg-yellow-500 rounded-full"></span>
          שעות קבלה
        </h3>
        <button 
          onClick={() => setIsEditing(!isEditing)}
          className="text-xs font-bold text-yellow-700 hover:bg-yellow-50 px-2 py-1 rounded"
        >
          {isEditing ? 'סיום' : 'עריכה'}
        </button>
      </div>

      <div className="space-y-3">
        {hours?.map((rh) => (
          <div key={rh.id} className="text-sm bg-yellow-50 p-3 rounded-xl border border-yellow-100 group relative">
            {isEditing ? (
              <div className="space-y-2">
                <input 
                  className="font-bold bg-transparent border-b border-yellow-300 w-full outline-none"
                  value={rh.name} onChange={(e) => handleUpdate(rh.id, {...rh, name: e.target.value})}
                />
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <select value={rh.day} onChange={(e) => handleUpdate(rh.id, {...rh, day: e.target.value})} className="bg-white border rounded p-1">
                    {["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"].map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <input type="time" value={rh.time} onChange={(e) => handleUpdate(rh.id, {...rh, time: e.target.value})} className="bg-white border rounded p-1" />
                </div>
                <button onClick={() => handleDelete(rh.id)} className="text-red-500 text-[10px] font-bold">מחק</button>
              </div>
            ) : (
              <>
                <p className="font-bold text-yellow-900">{rh.name}</p>
                <p className="text-yellow-700">יום {rh.day} בשעה {rh.time}</p>
                <p className="text-yellow-600 text-xs mt-1">בניין {rh.location_building}, חדר {rh.location_room}</p>
              </>
            )}
          </div>
        ))}

        {isEditing && (
          <div className="mt-4 p-3 border-2 border-dashed border-yellow-200 rounded-xl space-y-2 bg-white">
            <input placeholder="תיאור (למשל: שעת קבלה מרצה)" className="text-xs p-2 border rounded w-full" value={newHour.name} onChange={(e) => setNewHour({...newHour, name: e.target.value})} />
            <div className="grid grid-cols-2 gap-2">
               <select value={newHour.day} onChange={(e) => setNewHour({...newHour, day: e.target.value})} className="text-xs p-2 border rounded">
                 {["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"].map(d => <option key={d} value={d}>{d}</option>)}
               </select>
               <input type="time" className="text-xs p-2 border rounded" value={newHour.time} onChange={(e) => setNewHour({...newHour, time: e.target.value})} />
            </div>
            <button onClick={handleAdd} className="w-full bg-yellow-500 text-white text-xs font-bold py-2 rounded-lg">הוסף שעת קבלה</button>
          </div>
        )}
      </div>
    </section>
  );
};

export default ReceptionHours;
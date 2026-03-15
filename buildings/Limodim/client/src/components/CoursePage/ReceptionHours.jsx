// src/components/CoursePage/ReceptionHours.jsx
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

  // Update reception hour - Logic preserved
  const handleUpdate = async (id, updatedData) => {
    try {
      await api.updateReceptionHour(id, updatedData);
      await loadFullCourse(courseId);
    } catch (err) {
      console.error("Failed to update reception hour:", err);
    }
  };

  // Create new reception hour - Logic preserved
  const handleAdd = async () => {
    try {
      await api.createReceptionHour({ ...newHour, course_id: courseId });
      setNewHour({ name: '', day: 'ראשון', time: '', location_building: '', location_room: '' });
      await loadFullCourse(courseId);
    } catch (err) {
      console.error("Failed to add reception hour:", err);
    }
  };

  // Delete reception hour - Logic preserved
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
    /* Adjusted outer padding for mobile view (p-4) vs desktop (p-6) */
    <section className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-100">
      
      {/* Header with responsive font sizes and better touch target for edit button */}
      <div className="flex justify-between items-center mb-5">
        <h3 className="text-base md:text-lg font-bold text-slate-800 flex items-center gap-2">
          <span className="w-1.5 md:w-2 h-5 md:h-6 bg-yellow-500 rounded-full"></span>
          שעות קבלה
        </h3>
        <button 
          onClick={() => setIsEditing(!isEditing)}
          className="text-[11px] md:text-xs font-bold text-yellow-700 hover:bg-yellow-50 px-3 py-1.5 rounded-lg border border-yellow-100 transition active:scale-95"
        >
          {isEditing ? 'סיום' : 'עריכה'}
        </button>
      </div>

      <div className="space-y-4">
        {hours?.map((rh) => (
          <div key={rh.id} className="text-sm bg-yellow-50/50 p-4 rounded-xl border border-yellow-100 group relative">
            {isEditing ? (
              /* Edit Mode: Enhanced touch targets and spacing */
              <div className="space-y-3">
                <input 
                  className="font-bold bg-white border border-yellow-200 rounded-lg p-2.5 w-full outline-none focus:ring-2 focus:ring-yellow-200"
                  value={rh.name} 
                  onChange={(e) => handleUpdate(rh.id, {...rh, name: e.target.value})}
                  placeholder="שם (מרצה/מתרגל)"
                />
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <select 
                    value={rh.day} 
                    onChange={(e) => handleUpdate(rh.id, {...rh, day: e.target.value})} 
                    className="bg-white border border-yellow-200 rounded-lg p-2.5 outline-none"
                  >
                    {["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"].map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <input 
                    type="time" 
                    value={rh.time} 
                    onChange={(e) => handleUpdate(rh.id, {...rh, time: e.target.value})} 
                    className="bg-white border border-yellow-200 rounded-lg p-2.5 outline-none" 
                  />
                </div>
                <button 
                  onClick={() => handleDelete(rh.id)} 
                  className="text-red-500 text-[10px] md:text-xs font-bold hover:underline px-1 py-1"
                >
                  מחק שעת קבלה
                </button>
              </div>
            ) : (
              /* Display Mode: Optimized readability for mobile devices */
              <>
                <p className="font-bold text-yellow-900 text-sm md:text-base">{rh.name}</p>
                <p className="text-yellow-700 text-xs md:text-sm mt-0.5">יום {rh.day} בשעה {rh.time}</p>
                <div className="flex items-center gap-1.5 text-yellow-600 text-[11px] md:text-xs mt-2 bg-yellow-100/50 w-fit px-2 py-1 rounded-md">
                   <span>בניין {rh.location_building}</span>
                   <span className="opacity-30">|</span>
                   <span>חדר {rh.location_room}</span>
                </div>
              </>
            )}
          </div>
        ))}

        {/* Add New Reception Hour: Mobile-friendly form layout */}
        {isEditing && (
          <div className="mt-6 p-4 border-2 border-dashed border-yellow-200 rounded-xl space-y-3 bg-white shadow-inner">
            <p className="text-[10px] font-black text-yellow-600 uppercase tracking-widest px-1">הוספה חדשה</p>
            <input 
              placeholder="תיאור (למשל: שעת קבלה מרצה)" 
              className="text-sm p-3 border border-slate-200 rounded-xl w-full focus:ring-2 focus:ring-yellow-100 outline-none" 
              value={newHour.name} 
              onChange={(e) => setNewHour({...newHour, name: e.target.value})} 
            />
            <div className="grid grid-cols-2 gap-3">
               <select 
                 value={newHour.day} 
                 onChange={(e) => setNewHour({...newHour, day: e.target.value})} 
                 className="text-sm p-3 border border-slate-200 rounded-xl bg-white"
               >
                 {["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"].map(d => <option key={d} value={d}>{d}</option>)}
               </select>
               <input 
                 type="time" 
                 className="text-sm p-3 border border-slate-200 rounded-xl" 
                 value={newHour.time} 
                 onChange={(e) => setNewHour({...newHour, time: e.target.value})} 
               />
            </div>
            <button 
              onClick={handleAdd} 
              className="w-full bg-yellow-500 text-white text-sm font-bold py-3 rounded-xl shadow-md active:scale-95 transition-transform"
            >
              הוסף שעת קבלה
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default ReceptionHours;
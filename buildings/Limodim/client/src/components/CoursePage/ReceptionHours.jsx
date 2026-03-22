import React, { useState } from 'react';
import api from '../../api/api';
import { useCourses } from '../../context/CourseContext';

const ReceptionHours = ({ hours, courseId }) => {
  const { loadFullCourse } = useCourses();
  const [editingId, setEditingId] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [editBuffer, setEditBuffer] = useState(null);
  const [newHour, setNewHour] = useState({ 
    name: '', day: 'ראשון', time: '', location_building: '', location_room: '' 
  });

  const startEditing = (rh) => {
    setEditingId(rh.id);
    setEditBuffer({ ...rh });
  };

  const handleSaveUpdate = async () => {
    try {
      await api.updateReceptionHour(editingId, editBuffer);
      setEditingId(null);
      setEditBuffer(null);
      await loadFullCourse(courseId);
    } catch (err) {
      console.error("Failed to update reception hour:", err);
    }
  };

  const handleAdd = async () => {
    if (!newHour.name) return alert("יש להזין שם (מרצה/מתרגל)");
    try {
      await api.createReceptionHour({ ...newHour, course_id: courseId });
      setNewHour({ name: '', day: 'ראשון', time: '', location_building: '', location_room: '' });
      setIsAdding(false);
      await loadFullCourse(courseId);
    } catch (err) {
      console.error("Failed to add reception hour:", err);
    }
  };

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
    <section className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-100">
      <div className="flex justify-between items-center mb-5">
        <h3 className="text-base md:text-lg font-bold text-slate-800 flex items-center gap-2">
          <span className="w-1.5 md:w-2 h-5 md:h-6 bg-yellow-500 rounded-full"></span>
          שעות קבלה
        </h3>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className={`text-[11px] md:text-xs font-bold px-3 py-1.5 rounded-lg border transition ${
            isAdding ? 'bg-slate-100 text-slate-600 border-slate-200' : 'bg-yellow-50 text-yellow-700 border-yellow-100'
          }`}
        >
          {isAdding ? 'ביטול' : '+ הוספה'}
        </button>
      </div>

      <div className="space-y-4">
        {hours?.map((rh) => (
          <div key={rh.id} className="text-sm bg-yellow-50/40 p-4 rounded-xl border border-yellow-100 group relative">
            
            {editingId === rh.id ? (
              <div className="space-y-3">
                <input 
                  className="font-bold bg-white border border-yellow-200 rounded-lg p-2.5 w-full outline-none focus:ring-2 focus:ring-yellow-400"
                  value={editBuffer.name} 
                  onChange={(e) => setEditBuffer({...editBuffer, name: e.target.value})}
                  placeholder="שם (מרצה/מתרגל)"
                />
                
                <div className="grid grid-cols-2 gap-3">
                  <select 
                    value={editBuffer.day} 
                    onChange={(e) => setEditBuffer({...editBuffer, day: e.target.value})} 
                    className="bg-white border border-yellow-200 rounded-lg p-2.5 outline-none"
                  >
                    {["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"].map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <input 
                    type="time" 
                    value={editBuffer.time} 
                    onChange={(e) => setEditBuffer({...editBuffer, time: e.target.value})} 
                    className="bg-white border border-yellow-200 rounded-lg p-2.5 outline-none" 
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <input 
                    placeholder="בניין" 
                    className="bg-white border border-yellow-200 rounded-lg p-2.5 outline-none" 
                    value={editBuffer.location_building || ''} 
                    onChange={(e) => setEditBuffer({...editBuffer, location_building: e.target.value})}
                  />
                  <input 
                    placeholder="חדר" 
                    className="bg-white border border-yellow-200 rounded-lg p-2.5 outline-none" 
                    value={editBuffer.location_room || ''} 
                    onChange={(e) => setEditBuffer({...editBuffer, location_room: e.target.value})}
                  />
                </div>

                <div className="flex justify-between items-center pt-2">
                  <button onClick={() => handleDelete(rh.id)} className="text-red-500 text-[10px] font-bold hover:underline">מחק</button>
                  <div className="flex gap-2">
                    <button onClick={() => setEditingId(null)} className="text-slate-500 text-[10px] font-bold px-3 py-1">ביטול</button>
                    <button onClick={handleSaveUpdate} className="bg-yellow-500 text-white text-[10px] font-bold px-4 py-1.5 rounded-lg shadow-sm">שמור שינויים</button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold text-yellow-900 text-sm md:text-base">{rh.name}</p>
                  <p className="text-yellow-700 text-xs md:text-sm mt-0.5">יום {rh.day} בשעה {rh.time}</p>
                  {(rh.location_building || rh.location_room) && (
                    <div className="flex items-center gap-1.5 text-yellow-600 text-[11px] md:text-xs mt-2 bg-yellow-100/50 w-fit px-2 py-1 rounded-md">
                        <span>בניין {rh.location_building}</span>
                        <span className="opacity-30">|</span>
                        <span>חדר {rh.location_room}</span>
                    </div>
                  )}
                </div>
                <button 
                  onClick={() => startEditing(rh)}
                  className="text-[10px] font-black text-yellow-600 bg-white border border-yellow-200 px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ערוך
                </button>
              </div>
            )}
          </div>
        ))}

        {isAdding && (
          <div className="mt-4 p-4 border-2 border-dashed border-yellow-200 rounded-xl space-y-3 bg-yellow-50/20">
            <input 
              placeholder="שם (מרצה/מתרגל)" 
              className="text-sm p-3 border border-slate-200 rounded-xl w-full focus:ring-2 focus:ring-yellow-400 outline-none" 
              value={newHour.name} 
              onChange={(e) => setNewHour({...newHour, name: e.target.value})} 
            />
            <div className="grid grid-cols-2 gap-3">
               <select value={newHour.day} onChange={(e) => setNewHour({...newHour, day: e.target.value})} className="text-sm p-3 border border-slate-200 rounded-xl bg-white outline-none">
                 {["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"].map(d => <option key={d} value={d}>{d}</option>)}
               </select>
               <input type="time" className="text-sm p-3 border border-slate-200 rounded-xl" value={newHour.time} onChange={(e) => setNewHour({...newHour, time: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-3">
               <input placeholder="בניין" className="text-sm p-3 border border-slate-200 rounded-xl" value={newHour.location_building} onChange={(e) => setNewHour({...newHour, location_building: e.target.value})} />
               <input placeholder="חדר" className="text-sm p-3 border border-slate-200 rounded-xl" value={newHour.location_room} onChange={(e) => setNewHour({...newHour, location_room: e.target.value})} />
            </div>
            <button onClick={handleAdd} className="w-full bg-yellow-500 text-white text-sm font-bold py-3 rounded-xl shadow-md">שמור שעת קבלה</button>
          </div>
        )}
      </div>
    </section>
  );
};

export default ReceptionHours;
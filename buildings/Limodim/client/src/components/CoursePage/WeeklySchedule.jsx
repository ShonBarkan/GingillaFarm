import React, { useState } from 'react';
import { useCourses } from '../../context/CourseContext';

const WeeklySchedule = ({ course }) => {
  const { editCourse } = useCourses();
  
  const [editingIndex, setEditingIndex] = useState(null);
  const [localSchedule, setLocalSchedule] = useState([...(course.schedule || [])]);

  // פונקציית עזר לשמירה מול השרת
  const persistSchedule = async (updatedSchedule) => {
    const updatedCourse = { ...course, schedule: updatedSchedule };
    await editCourse(course.id, updatedCourse);
  };

  const handleFinishEditing = async () => {
    await persistSchedule(localSchedule);
    setEditingIndex(null);
  };

  const addNewSlot = () => {
    const newSlot = {
      day_of_week: "ראשון",
      start_time: "00:00",
      end_time: "00:00",
      location_building: "",
      location_room: "",
      class_type: "הרצאה",
      zoom_link: ""
    };
    const updated = [...localSchedule, newSlot];
    setLocalSchedule(updated);
    setEditingIndex(updated.length - 1);
  };

  const removeSlot = async (index) => {
    if (window.confirm("למחוק את המועד הזה?")) {
      const filtered = localSchedule.filter((_, i) => i !== index);
      setLocalSchedule(filtered);
      await persistSchedule(filtered); // שמירה אוטומטית גם במחיקה
      if (editingIndex === index) setEditingIndex(null);
    }
  };

  const updateSlot = (index, field, value) => {
    const updated = localSchedule.map((slot, i) => 
      i === index ? { ...slot, [field]: value } : slot
    );
    setLocalSchedule(updated);
  };

  return (
    <section className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-100 relative">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-base md:text-lg font-bold text-slate-800 flex items-center gap-2">
          <span className="w-1.5 md:w-2 h-5 md:h-6 bg-blue-500 rounded-full"></span>
          מערכת שעות קבועה
        </h3>
        
        <button 
          onClick={addNewSlot} 
          className="text-[11px] md:text-xs font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-4 py-2 rounded-full transition active:scale-95 shadow-sm border border-emerald-100"
        >
          + הוסף מועד
        </button>
      </div>

      <div className="space-y-4">
        {localSchedule.length > 0 ? localSchedule.map((slot, index) => {
          const isCurrentEditing = editingIndex === index;
          
          return (
            <div 
              key={index} 
              className={`p-4 rounded-xl border transition-all ${
                isCurrentEditing 
                  ? 'bg-white border-blue-400 shadow-md ring-1 ring-blue-100' 
                  : 'bg-blue-50 border-blue-100 hover:bg-blue-100/50'
              }`}
            >
              {isCurrentEditing ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2 mb-2">
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">עריכת מועד</span>
                    <button 
                      onClick={handleFinishEditing}
                      className="text-[10px] font-black bg-blue-600 text-white px-4 py-1.5 rounded-lg shadow-md hover:bg-blue-700 active:scale-95 transition"
                    >
                      סיום ושמירה
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">יום</label>
                      <select 
                        className="p-2 border rounded-lg bg-white outline-none focus:ring-2 focus:ring-blue-200"
                        value={slot.day_of_week}
                        onChange={(e) => updateSlot(index, 'day_of_week', e.target.value)}
                      >
                        {["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"].map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                    
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">סוג</label>
                      <select 
                        className="p-2 border rounded-lg bg-white outline-none focus:ring-2 focus:ring-blue-200"
                        value={slot.class_type}
                        onChange={(e) => updateSlot(index, 'class_type', e.target.value)}
                      >
                        <option value="הרצאה">הרצאה</option>
                        <option value="תרגול">תרגול</option>
                        <option value="תגבור">תגבור</option>
                      </select>
                    </div>

                    <div className="col-span-2 flex flex-col gap-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">זמן (התחלה - סיום)</label>
                      <div className="flex items-center gap-2">
                        <input type="time" className="p-2 border rounded-lg w-full bg-white" value={slot.start_time} onChange={(e) => updateSlot(index, 'start_time', e.target.value)} />
                        <span className="text-slate-400">-</span>
                        <input type="time" className="p-2 border rounded-lg w-full bg-white" value={slot.end_time} onChange={(e) => updateSlot(index, 'end_time', e.target.value)} />
                      </div>
                    </div>

                    <div className="col-span-2 flex flex-col gap-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">מיקום (בניין / חדר)</label>
                      <div className="flex gap-2">
                        <input placeholder="בניין" className="p-2 border rounded-lg w-1/2 bg-white" value={slot.location_building} onChange={(e) => updateSlot(index, 'location_building', e.target.value)} />
                        <input placeholder="חדר" className="p-2 border rounded-lg w-1/2 bg-white" value={slot.location_room} onChange={(e) => updateSlot(index, 'location_room', e.target.value)} />
                      </div>
                    </div>

                    <div className="col-span-2 flex flex-col gap-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">קישור לזום / הקלטות</label>
                      <input 
                        placeholder="https://zoom.us/j/..." 
                        className="p-2 border rounded-lg w-full bg-white outline-none focus:ring-2 focus:ring-blue-200" 
                        value={slot.zoom_link || ""} 
                        onChange={(e) => updateSlot(index, 'zoom_link', e.target.value)} 
                      />
                    </div>

                    <button 
                      onClick={() => removeSlot(index)} 
                      className="col-span-2 text-red-500 font-bold mt-2 hover:bg-red-50 rounded-lg py-2 border border-red-100 transition text-[10px] uppercase tracking-widest"
                    >
                      מחק מועד זה מהלו"ז
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-start">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-blue-900 text-sm md:text-base">יום {slot.day_of_week}</span>
                      <span className="text-[9px] md:text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-black uppercase">
                        {slot.class_type}
                      </span>
                    </div>
                    <div className="text-[12px] md:text-sm text-blue-700 flex flex-wrap gap-x-2">
                      <span className="font-bold">{slot.start_time} - {slot.end_time}</span>
                      <span className="text-blue-200">|</span>
                      <span>בניין {slot.location_building}, חדר {slot.location_room}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {slot.zoom_link && (
                      <a 
                        href={slot.zoom_link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2 text-blue-600 hover:bg-blue-200/50 rounded-full transition shadow-sm bg-white border border-blue-100"
                        title="הצטרף לזום"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M16 16L21 20V4L16 8V16ZM14 8C14 6.89543 13.1046 6 12 6H4C2.89543 6 2 6.89543 2 8V16C2 17.1046 2.89543 18 4 18H12C13.1046 18 14 17.1046 14 16V8Z"/>
                        </svg>
                      </a>
                    )}
                    
                    <button 
                      onClick={() => setEditingIndex(index)}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-white rounded-full transition-all active:scale-90"
                      title="ערוך מועד"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        }) : (
          <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <p className="text-slate-400 italic text-sm">אין מועדים קבועים במערכת</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default WeeklySchedule;
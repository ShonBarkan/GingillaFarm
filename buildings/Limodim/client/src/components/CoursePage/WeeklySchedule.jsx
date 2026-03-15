import React, { useState } from 'react';
import { useCourses } from '../../context/CourseContext';

const WeeklySchedule = ({ course }) => {
  const { editCourse } = useCourses();
  const [isEditing, setIsEditing] = useState(false);
  const [localSchedule, setLocalSchedule] = useState([...(course.schedule || [])]);

  // Save the entire schedule back to the course object
  const handleSave = async () => {
    const updatedCourse = { ...course, schedule: localSchedule };
    await editCourse(course.id, updatedCourse);
    setIsEditing(false);
  };

  // Add a new empty time slot
  const addNewSlot = () => {
    const newSlot = {
      day_of_week: "ראשון",
      start_time: "00:00",
      end_time: "00:00",
      location_building: "",
      location_room: "",
      class_type: "Lecture"
    };
    setLocalSchedule([...localSchedule, newSlot]);
  };

  // Remove a specific slot by index
  const removeSlot = (index) => {
    const filtered = localSchedule.filter((_, i) => i !== index);
    setLocalSchedule(filtered);
  };

  // Update a specific field in a slot
  const updateSlot = (index, field, value) => {
    const updated = localSchedule.map((slot, i) => 
      i === index ? { ...slot, [field]: value } : slot
    );
    setLocalSchedule(updated);
  };

  return (
    /* Responsive padding for the main section */
    <section className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-100 relative">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-base md:text-lg font-bold text-slate-800 flex items-center gap-2">
          <span className="w-1.5 md:w-2 h-5 md:h-6 bg-blue-500 rounded-full"></span>
          מערכת שעות קבועה
        </h3>
        
        {/* Action buttons with better touch spacing */}
        <div className="flex gap-3 md:gap-2">
          {isEditing ? (
            <>
              <button onClick={addNewSlot} className="text-[10px] md:text-xs font-bold text-emerald-600 hover:bg-emerald-50 px-2 py-1 rounded">
                + הוסף
              </button>
              <button onClick={handleSave} className="text-[10px] md:text-xs font-bold text-white bg-blue-600 px-3 py-1 rounded-full shadow-md active:scale-95 transition">
                שמור
              </button>
              <button onClick={() => { setIsEditing(false); setLocalSchedule([...course.schedule]); }} className="text-[10px] md:text-xs font-bold text-slate-400">
                ביטול
              </button>
            </>
          ) : (
            <button onClick={() => setIsEditing(true)} className="text-[11px] md:text-xs font-bold text-blue-600 border border-blue-100 px-3 py-1 rounded-full hover:bg-blue-50 transition">
              ערוך לו"ז
            </button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {localSchedule.length > 0 ? localSchedule.map((slot, index) => (
          <div key={index} className={`p-4 rounded-xl border transition-all ${isEditing ? 'bg-slate-50 border-slate-200 shadow-inner' : 'bg-blue-50 border-blue-100'}`}>
            {isEditing ? (
              /* EDIT MODE: Optimized grid for touchscreens */
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase">יום</label>
                  <select 
                    className="p-2 border rounded-lg bg-white outline-none focus:ring-2 focus:ring-blue-200"
                    value={slot.day_of_week}
                    onChange={(e) => updateSlot(index, 'day_of_week', e.target.value)}
                  >
                    {["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"].map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase">סוג</label>
                  <select 
                    className="p-2 border rounded-lg bg-white outline-none focus:ring-2 focus:ring-blue-200"
                    value={slot.class_type}
                    onChange={(e) => updateSlot(index, 'class_type', e.target.value)}
                  >
                    <option value="Lecture">הרצאה</option>
                    <option value="Tutorial">תרגול</option>
                  </select>
                </div>

                <div className="col-span-2 flex flex-col gap-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase">זמן (התחלה - סיום)</label>
                  <div className="flex items-center gap-2">
                    <input type="time" className="p-2 border rounded-lg w-full bg-white" value={slot.start_time} onChange={(e) => updateSlot(index, 'start_time', e.target.value)} />
                    <span className="text-slate-400">-</span>
                    <input type="time" className="p-2 border rounded-lg w-full bg-white" value={slot.end_time} onChange={(e) => updateSlot(index, 'end_time', e.target.value)} />
                  </div>
                </div>

                <div className="col-span-2 flex flex-col gap-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase">מיקום (בניין / חדר)</label>
                  <div className="flex gap-2">
                    <input placeholder="בניין" className="p-2 border rounded-lg w-1/2 bg-white" value={slot.location_building} onChange={(e) => updateSlot(index, 'location_building', e.target.value)} />
                    <input placeholder="חדר" className="p-2 border rounded-lg w-1/2 bg-white" value={slot.location_room} onChange={(e) => updateSlot(index, 'location_room', e.target.value)} />
                  </div>
                </div>

                <button onClick={() => removeSlot(index)} className="col-span-2 text-red-500 font-bold mt-2 hover:bg-red-50 rounded-lg py-2 border border-red-100 transition text-xs">
                  מחק שורה זו
                </button>
              </div>
            ) : (
              /* DISPLAY MODE: Clear hierarchy for mobile viewing */
              <>
                <div className="flex justify-between items-start font-bold text-blue-900">
                  <span className="text-sm md:text-base">יום {slot.day_of_week}</span>
                  <span className="text-xs bg-blue-100 px-2 py-0.5 rounded-full">
                    {slot.class_type === 'Lecture' ? 'הרצאה' : 'תרגול'}
                  </span>
                </div>
                <div className="text-[13px] md:text-sm text-blue-700 mt-2 flex flex-wrap gap-x-2">
                  <span className="font-medium">{slot.start_time} - {slot.end_time}</span>
                  <span className="text-blue-300">|</span>
                  <span>בניין {slot.location_building}, חדר {slot.location_room}</span>
                </div>
              </>
            )}
          </div>
        )) : (
          <div className="text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <p className="text-slate-400 italic text-sm">לא הוזן לו"ז</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default WeeklySchedule;
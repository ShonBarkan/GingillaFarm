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
    <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <span className="w-2 h-6 bg-blue-500 rounded-full"></span>
          מערכת שעות קבועה
        </h3>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <button onClick={addNewSlot} className="text-xs font-bold text-emerald-600 hover:bg-emerald-50 px-2 py-1 rounded">+ הוסף</button>
              <button onClick={handleSave} className="text-xs font-bold text-white bg-blue-600 px-3 py-1 rounded-full">שמור</button>
              <button onClick={() => { setIsEditing(false); setLocalSchedule([...course.schedule]); }} className="text-xs font-bold text-slate-400">ביטול</button>
            </>
          ) : (
            <button onClick={() => setIsEditing(true)} className="text-xs font-bold text-blue-600">ערוך לו"ז</button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {localSchedule.length > 0 ? localSchedule.map((slot, index) => (
          <div key={index} className={`p-3 rounded-xl border transition ${isEditing ? 'bg-slate-50 border-slate-200' : 'bg-blue-50 border-blue-100'}`}>
            {isEditing ? (
              /* EDIT MODE ROW */
              <div className="grid grid-cols-2 gap-2 text-xs">
                <select 
                  className="p-1 border rounded"
                  value={slot.day_of_week}
                  onChange={(e) => updateSlot(index, 'day_of_week', e.target.value)}
                >
                  {["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"].map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <select 
                  className="p-1 border rounded"
                  value={slot.class_type}
                  onChange={(e) => updateSlot(index, 'class_type', e.target.value)}
                >
                  <option value="Lecture">הרצאה</option>
                  <option value="Tutorial">תרגול</option>
                </select>
                <div className="flex items-center gap-1">
                  <input type="time" className="p-1 border rounded w-full" value={slot.start_time} onChange={(e) => updateSlot(index, 'start_time', e.target.value)} />
                  <span>-</span>
                  <input type="time" className="p-1 border rounded w-full" value={slot.end_time} onChange={(e) => updateSlot(index, 'end_time', e.target.value)} />
                </div>
                <div className="flex gap-1">
                  <input placeholder="בניין" className="p-1 border rounded w-1/2" value={slot.location_building} onChange={(e) => updateSlot(index, 'location_building', e.target.value)} />
                  <input placeholder="חדר" className="p-1 border rounded w-1/2" value={slot.location_room} onChange={(e) => updateSlot(index, 'location_room', e.target.value)} />
                </div>
                <button onClick={() => removeSlot(index)} className="col-span-2 text-red-500 font-bold mt-1 hover:bg-red-50 rounded py-1">מחק שורה זו</button>
              </div>
            ) : (
              /* DISPLAY MODE ROW */
              <>
                <div className="flex justify-between font-bold text-blue-900">
                  <span>יום {slot.day_of_week}</span>
                  <span>{slot.class_type === 'Lecture' ? 'הרצאה' : 'תרגול'}</span>
                </div>
                <div className="text-sm text-blue-700 mt-1">
                  {slot.start_time} - {slot.end_time} | בניין {slot.location_building}, חדר {slot.location_room}
                </div>
              </>
            )}
          </div>
        )) : <p className="text-slate-400 italic text-sm">לא הוזן לו"ז</p>}
      </div>
    </section>
  );
};

export default WeeklySchedule;
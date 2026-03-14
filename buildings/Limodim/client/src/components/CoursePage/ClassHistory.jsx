import React, { useState } from 'react';
import api from '../../api/api';
import { useCourses } from '../../context/CourseContext';

const ClassHistory = ({ classes, courseId }) => {
  const { loadFullCourse } = useCourses();
  const [isEditing, setIsEditing] = useState(false);
  const [newClass, setNewClass] = useState({
    number: (classes?.length || 0) + 1,
    date_taken: new Date().toISOString().split('T')[0],
    birvouz: '',
    location_building: '',
    location_room: '',
    time: '',
    class_type: 'Lecture' // Added default value
  });

  // Update an existing class log (Birvouz)
  const handleUpdate = async (classId, updatedData) => {
    try {
      await api.updateClass(classId, updatedData);
      await loadFullCourse(courseId);
    } catch (err) {
      console.error("Failed to update class log:", err);
    }
  };

  // Add a new class log
  const handleAdd = async () => {
    try {
      await api.createClass({ ...newClass, course_id: courseId });
      // Reset form with incremented class number
      setNewClass({
        number: classes.length + 2,
        date_taken: new Date().toISOString().split('T')[0],
        birvouz: '',
        location_building: '',
        location_room: '',
        time: '',
        class_type: 'Lecture'
      });
      await loadFullCourse(courseId);
    } catch (err) {
      console.error("Failed to add class log:", err);
    }
  };

  // Delete a class log
  const handleDelete = async (classId) => {
    if (window.confirm("האם למחוק את תיעוד השיעור הזה מהחווה?")) {
      try {
        await api.deleteClass(classId);
        await loadFullCourse(courseId);
      } catch (err) {
        console.error("Failed to delete class log:", err);
      }
    }
  };

  return (
    <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <div className="flex justify-between items-center mb-6 border-b pb-2">
        <h3 className="text-xl font-bold text-slate-800">היסטוריית שיעורים (בירווזים)</h3>
        <button 
          onClick={() => setIsEditing(!isEditing)}
          className="text-xs font-bold text-emerald-600 hover:bg-emerald-50 px-3 py-1 rounded-full transition"
        >
          {isEditing ? 'סיום עריכה' : '+ הוסף / ערוך שיעור'}
        </button>
      </div>

      <div className="space-y-4">
        {/* Add New Class Form */}
        {isEditing && (
          <div className="p-4 bg-emerald-50 border-2 border-dashed border-emerald-200 rounded-xl space-y-3 mb-6">
            <p className="text-xs font-bold text-emerald-700 uppercase">תיעוד שיעור חדש (בירווז)</p>
            <div className="grid grid-cols-3 gap-2">
              <input 
                type="number" placeholder="#" className="p-2 border rounded text-sm w-full outline-none focus:ring-1 focus:ring-emerald-500"
                value={newClass.number} onChange={(e) => setNewClass({...newClass, number: parseInt(e.target.value)})}
              />
              <input 
                type="date" className="p-2 border rounded text-sm w-full col-span-2 outline-none focus:ring-1 focus:ring-emerald-500"
                value={newClass.date_taken} onChange={(e) => setNewClass({...newClass, date_taken: e.target.value})}
              />
            </div>
            
            {/* New: Class Type Selector in Form */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-emerald-600 uppercase">סוג שיעור</label>
              <select 
                className="p-2 border rounded text-sm w-full outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
                value={newClass.class_type} 
                onChange={(e) => setNewClass({...newClass, class_type: e.target.value})}
              >
                <option value="Lecture">הרצאה</option>
                <option value="Tutorial">תרגול</option>
              </select>
            </div>

            <textarea 
              placeholder="מה קרה בשיעור?"
              className="w-full p-2 border rounded text-sm h-20 outline-none focus:ring-1 focus:ring-emerald-500"
              value={newClass.birvouz} onChange={(e) => setNewClass({...newClass, birvouz: e.target.value})}
            />
            <div className="grid grid-cols-3 gap-2">
              <input placeholder="בניין" className="p-2 border rounded text-xs" value={newClass.location_building} onChange={(e) => setNewClass({...newClass, location_building: e.target.value})} />
              <input placeholder="חדר" className="p-2 border rounded text-xs" value={newClass.location_room} onChange={(e) => setNewClass({...newClass, location_room: e.target.value})} />
              <input type="time" className="p-2 border rounded text-xs" value={newClass.time} onChange={(e) => setNewClass({...newClass, time: e.target.value})} />
            </div>
            <button 
              onClick={handleAdd}
              className="w-full bg-emerald-600 text-white font-bold py-2 rounded-lg hover:bg-emerald-700 transition"
            >
              שמור שיעור חדש
            </button>
          </div>
        )}

        {/* List of Existing Classes */}
        {classes?.length > 0 ? classes.sort((a, b) => b.number - a.number).map((cls) => (
          <div key={cls.id} className="p-4 bg-slate-50 border-r-4 border-emerald-500 rounded-lg group relative">
            {isEditing && (
              <button 
                onClick={() => handleDelete(cls.id)}
                className="absolute top-2 left-2 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>
              </button>
            )}
            
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-3">
                <span className="font-bold text-emerald-900">
                  {isEditing ? (
                    <input 
                      type="number" className="w-10 bg-transparent border-b border-emerald-300 outline-none"
                      value={cls.number} onChange={(e) => handleUpdate(cls.id, {...cls, number: parseInt(e.target.value)})}
                    />
                  ) : `שיעור #${cls.number}`}
                </span>
                
                {/* Display/Edit Class Type Badge */}
                {isEditing ? (
                  <select 
                    className="text-[10px] bg-white border border-emerald-200 rounded px-1 outline-none"
                    value={cls.class_type || 'Lecture'} 
                    onChange={(e) => handleUpdate(cls.id, {...cls, class_type: e.target.value})}
                  >
                    <option value="Lecture">הרצאה</option>
                    <option value="Tutorial">תרגול</option>
                  </select>
                ) : (
                  <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded font-bold uppercase">
                    {cls.class_type === 'Tutorial' ? 'תרגול' : 'הרצאה'}
                  </span>
                )}
              </div>

              <span className="text-xs text-emerald-700">
                {isEditing ? (
                  <input 
                    type="date" className="bg-transparent border-b border-emerald-300 outline-none"
                    value={cls.date_taken} onChange={(e) => handleUpdate(cls.id, {...cls, date_taken: e.target.value})}
                  />
                ) : cls.date_taken}
              </span>
            </div>

            {isEditing ? (
              <textarea 
                className="w-full text-sm italic text-slate-700 bg-white border p-2 rounded outline-none"
                value={cls.birvouz}
                onChange={(e) => handleUpdate(cls.id, {...cls, birvouz: e.target.value})}
              />
            ) : (
              <p className="text-slate-700 text-sm italic leading-relaxed">"{cls.birvouz}"</p>
            )}

            <div className="mt-2 text-[10px] text-emerald-600 font-bold uppercase tracking-wider flex gap-4">
              <span>בניין {cls.location_building}, חדר {cls.location_room}</span>
              <span>שעה: {cls.time}</span>
            </div>
          </div>
        )) : (
          <p className="text-slate-400 italic text-sm">טרם בוצעו שיעורים בקורס זה.</p>
        )}
      </div>
    </section>
  );
};

export default ClassHistory;
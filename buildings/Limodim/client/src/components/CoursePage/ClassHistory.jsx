import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // Added Link for navigation
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
    class_type: 'Lecture'
  });

  // Update an existing class log
  const handleUpdate = async (classId, updatedData) => {
    try {
      await api.updateClass(classId, updatedData);
      await loadFullCourse(courseId);
    } catch (err) {
      console.error("Failed to update class log:", err);
    }
  };

  // Add a new class log - Logic preserved
  const handleAdd = async () => {
    try {
      await api.createClass({ ...newClass, course_id: courseId });
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

  // Delete a class log - Logic preserved
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
    <section className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-100">
      <div className="flex justify-between items-center mb-6 border-b pb-3">
        <h3 className="text-lg md:text-xl font-bold text-slate-800">היסטוריית שיעורים (בירווזים)</h3>
        <button 
          onClick={() => setIsEditing(!isEditing)}
          className="text-[11px] md:text-xs font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-4 py-2 rounded-full transition active:scale-95"
        >
          {isEditing ? 'סיום עריכה' : '+ הוסף / ערוך שיעור'}
        </button>
      </div>

      <div className="space-y-6">
        {/* Add New Class Form - Optimized for mobile inputs */}
        {isEditing && (
          <div className="p-4 md:p-5 bg-emerald-50 border-2 border-dashed border-emerald-200 rounded-2xl space-y-4 mb-8">
            <p className="text-[10px] md:text-xs font-black text-emerald-700 uppercase tracking-widest">תיעוד שיעור חדש (בירווז)</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input 
                type="number" placeholder="#" className="p-3 md:p-2 border rounded-xl text-sm w-full outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
                value={newClass.number} onChange={(e) => setNewClass({...newClass, number: parseInt(e.target.value)})}
              />
              <input 
                type="date" className="p-3 md:p-2 border rounded-xl text-sm w-full col-span-2 outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
                value={newClass.date_taken} onChange={(e) => setNewClass({...newClass, date_taken: e.target.value})}
              />
            </div>
            
            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-bold text-emerald-600 uppercase">סוג שיעור</label>
              <select 
                className="p-3 md:p-2 border rounded-xl text-sm w-full outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
                value={newClass.class_type} 
                onChange={(e) => setNewClass({...newClass, class_type: e.target.value})}
              >
                <option value="Lecture">הרצאה</option>
                <option value="Tutorial">תרגול</option>
              </select>
            </div>

            <textarea 
              placeholder="מה קרה בשיעור?"
              className="w-full p-3 md:p-2 border rounded-xl text-sm h-24 outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
              value={newClass.birvouz} onChange={(e) => setNewClass({...newClass, birvouz: e.target.value})}
            />
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <input placeholder="בניין" className="p-3 md:p-2 border rounded-xl text-xs bg-white" value={newClass.location_building} onChange={(e) => setNewClass({...newClass, location_building: e.target.value})} />
              <input placeholder="חדר" className="p-3 md:p-2 border rounded-xl text-xs bg-white" value={newClass.location_room} onChange={(e) => setNewClass({...newClass, location_room: e.target.value})} />
              <input type="time" className="col-span-2 md:col-span-1 p-3 md:p-2 border rounded-xl text-xs bg-white" value={newClass.time} onChange={(e) => setNewClass({...newClass, time: e.target.value})} />
            </div>
            
            <button 
              onClick={handleAdd}
              className="w-full bg-emerald-600 text-white font-bold py-3 rounded-xl hover:bg-emerald-700 transition shadow-md"
            >
              שמור שיעור חדש
            </button>
          </div>
        )}

        {/* List of Existing Classes */}
        {classes?.length > 0 ? classes.sort((a, b) => b.number - a.number).map((cls) => (
          <div key={cls.id} className="p-4 md:p-5 bg-slate-50 border-r-4 border-emerald-500 rounded-2xl group relative shadow-sm md:shadow-none">
            {isEditing && (
              <button 
                onClick={() => handleDelete(cls.id)}
                className="absolute top-3 left-3 text-red-400 hover:text-red-600 md:opacity-0 md:group-hover:opacity-100 transition-opacity p-1"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>
              </button>
            )}
            
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-3">
                <span className="font-bold text-emerald-900 text-sm md:text-base">
                  {isEditing ? (
                    <input 
                      type="number" className="w-12 bg-white border border-emerald-200 rounded px-2 py-1 outline-none focus:ring-1 focus:ring-emerald-500"
                      value={cls.number} onChange={(e) => handleUpdate(cls.id, {...cls, number: parseInt(e.target.value)})}
                    />
                  ) : `שיעור #${cls.number}`}
                </span>
                
                {isEditing ? (
                  <select 
                    className="text-[10px] bg-white border border-emerald-200 rounded px-1 py-1 outline-none"
                    value={cls.class_type || 'Lecture'} 
                    onChange={(e) => handleUpdate(cls.id, {...cls, class_type: e.target.value})}
                  >
                    <option value="Lecture">הרצאה</option>
                    <option value="Tutorial">תרגול</option>
                  </select>
                ) : (
                  <span className="text-[9px] md:text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-black uppercase tracking-tight">
                    {cls.class_type === 'Tutorial' ? 'תרגול' : 'הרצאה'}
                  </span>
                )}
              </div>

              <div className="flex flex-col items-end gap-2">
                <span className="text-[11px] md:text-xs text-emerald-700 font-medium">
                  {isEditing ? (
                    <input 
                      type="date" className="bg-white border border-emerald-200 rounded px-1 outline-none"
                      value={cls.date_taken} onChange={(e) => handleUpdate(cls.id, {...cls, date_taken: e.target.value})}
                    />
                  ) : cls.date_taken}
                </span>

                {/* NEW: Navigation Button to ClassPage */}
                {!isEditing && (
                  <Link 
                    to={`/course/${courseId}/class/${cls.id}`}
                    className="text-[10px] font-bold bg-white text-emerald-600 border border-emerald-100 px-3 py-1 rounded-full shadow-sm hover:bg-emerald-600 hover:text-white transition-all flex items-center gap-1"
                  >
                    פתח דף שיעור <span>↗</span>
                  </Link>
                )}
              </div>
            </div>

            {isEditing ? (
              <textarea 
                className="w-full text-sm italic text-slate-700 bg-white border border-emerald-100 p-2 rounded-xl outline-none focus:ring-1 focus:ring-emerald-500 min-h-[80px]"
                value={cls.birvouz}
                onChange={(e) => handleUpdate(cls.id, {...cls, birvouz: e.target.value})}
              />
            ) : (
              <p className="text-slate-700 text-[13px] md:text-sm italic leading-relaxed pr-2 border-r-2 border-emerald-200">
                "{cls.birvouz}"
              </p>
            )}

            <div className="mt-3 text-[10px] text-emerald-600 font-bold uppercase tracking-wider flex flex-wrap gap-4 pt-2 border-t border-emerald-50">
              <span>בניין {cls.location_building}, חדר {cls.location_room}</span>
              <span className="opacity-40">|</span>
              <span>שעה: {cls.time}</span>
            </div>
          </div>
        )) : (
          <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <p className="text-slate-400 italic text-sm">טרם בוצעו שיעורים בקורס זה.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default ClassHistory;
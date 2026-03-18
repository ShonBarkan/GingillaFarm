import React, { useState, useEffect } from 'react';
import { useCourses } from '../context/CourseContext';

// Define a key for localStorage
const STORAGE_KEY = 'gingilla_course_draft';

const AddCourseForm = () => {
  const { addCourse } = useCourses();

  const initialState = {
    name: '',
    degree_points: 0,
    lecturer: '',
    practitioner: '',
    semester: 1,
    link_to: '',
    start_date: '',
    end_date: '',
    schedule: [{ day_of_week: 'ראשון', start_time: '', end_time: '', location_building: '', location_room: '', class_type: 'הרצאה' }],
    exams: [{ name: '', percentage: 0 }],
    reception_hours: [{ name: 'מרצה', day: 'ראשון', time: '', location_building: '', location_room: '' }],
    syllabus: [{ topic_num: 1, topic: '' }]
  };

  const [courseInfo, setCourseInfo] = useState(initialState);

  // 1. LOAD: On mount, check if there is a draft in localStorage
  useEffect(() => {
    const savedDraft = localStorage.getItem(STORAGE_KEY);
    if (savedDraft) {
      try {
        setCourseInfo(JSON.parse(savedDraft));
      } catch (e) {
        console.error("Failed to parse course draft", e);
      }
    }
  }, []);

  // 2. SAVE: Every time courseInfo changes, save to localStorage
  useEffect(() => {
    // We don't want to save if it's identical to the initial state to keep storage clean
    if (JSON.stringify(courseInfo) !== JSON.stringify(initialState)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(courseInfo));
    }
  }, [courseInfo]);

  // Generic Row Handlers
  const addRow = (key, initialObj) => {
    setCourseInfo(prev => ({ ...prev, [key]: [...prev[key], initialObj] }));
  };

  const updateRow = (key, index, field, value) => {
    const newArr = [...courseInfo[key]];
    newArr[index][field] = value;
    setCourseInfo({ ...courseInfo, [key]: newArr });
  };

  const removeRow = (key, index) => {
    if (courseInfo[key].length > 1) {
      setCourseInfo(prev => ({ ...prev, [key]: prev[key].filter((_, i) => i !== index) }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addCourse(courseInfo);
      
      // 3. CLEANUP: Remove draft upon successful submission
      localStorage.removeItem(STORAGE_KEY);
      setCourseInfo(initialState); // Optional: Reset form
      
      alert("הקורס וכל הנתונים הנלווים נשמרו בהצלחה!");
    } catch (err) {
      alert("שגיאה בשמירת הנתונים");
    }
  };

  const clearDraft = () => {
    if(window.confirm("האם למחוק את כל הנתונים שמילאת ולהתחיל מחדש?")) {
        localStorage.removeItem(STORAGE_KEY);
        setCourseInfo(initialState);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 md:space-y-10 bg-white p-4 md:p-8 rounded-2xl shadow-sm border border-slate-100 max-w-5xl mx-auto">
      
      {/* Draft Indicator */}
      <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            שמירה אוטומטית פעילה (Gingilla Safe)
        </span>
        <button type="button" onClick={clearDraft} className="text-[10px] font-bold text-red-400 hover:text-red-600">מחק טיוטה</button>
      </div>

      {/* 1. Basic Course Info & Semester */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        <div className="space-y-4">
          <h3 className="text-lg md:text-xl font-bold text-slate-800 border-s-4 border-blue-500 pr-3">פרטים כלליים</h3>
          <input required className="w-full p-3 md:p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-100" placeholder="שם הקורס" value={courseInfo.name} onChange={e => setCourseInfo({...courseInfo, name: e.target.value})} />
          
          <div className="flex flex-col sm:flex-row gap-3 md:gap-2">
            <input className="w-full sm:w-1/2 p-3 md:p-2 border rounded-lg outline-none" placeholder='מרצה' value={courseInfo.lecturer} onChange={e => setCourseInfo({...courseInfo, lecturer: e.target.value})} />
            <input className="w-full sm:w-1/2 p-3 md:p-2 border rounded-lg outline-none" placeholder='מתרגל' value={courseInfo.practitioner} onChange={e => setCourseInfo({...courseInfo, practitioner: e.target.value})} />
          </div>

          <div className="flex gap-3 md:gap-2">
            <div className="w-1/2">
               <label className="text-[10px] font-bold text-slate-400 block pr-1">סמסטר</label>
               <input type="number" className="w-full p-3 md:p-2 border rounded-lg outline-none" value={courseInfo.semester} onChange={e => setCourseInfo({...courseInfo, semester: parseInt(e.target.value)})} />
            </div>
            <div className="w-1/2">
               <label className="text-[10px] font-bold text-slate-400 block pr-1">נק"ז</label>
               <input type="number" step="0.5" className="w-full p-3 md:p-2 border rounded-lg outline-none" placeholder='נק"ז' value={courseInfo.degree_points} onChange={e => setCourseInfo({...courseInfo, degree_points: parseFloat(e.target.value)})} />
            </div>
          </div>

          <div className="flex flex-col">
            <label className="text-[10px] font-bold text-slate-400 block pr-1">לינק חיצוני (Moodle/Drive)</label>
            <input className="w-full p-3 md:p-2 border rounded-lg outline-none" placeholder='https://...' value={courseInfo.link_to} onChange={e => setCourseInfo({...courseInfo, link_to: e.target.value})} />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg md:text-xl font-bold text-slate-800 border-s-4 border-orange-500 pr-3">זמני סמסטר</h3>
          <div className="bg-slate-50 p-4 rounded-xl space-y-4">
            <div className="flex flex-col">
              <label className="text-xs font-bold text-slate-500 mb-1">תאריך התחלה</label>
              <input type="date" className="p-3 md:p-2 border rounded-lg outline-none w-full" value={courseInfo.start_date} onChange={e => setCourseInfo({...courseInfo, start_date: e.target.value})} />
            </div>
            <div className="flex flex-col">
              <label className="text-xs font-bold text-slate-500 mb-1">תאריך סיום</label>
              <input type="date" className="p-3 md:p-2 border rounded-lg outline-none w-full" value={courseInfo.end_date} onChange={e => setCourseInfo({...courseInfo, end_date: e.target.value})} />
            </div>
          </div>
        </div>
      </section>

      {/* 2. Weekly Schedule */}
      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg md:text-xl font-bold text-slate-800 border-s-4 border-indigo-500 pr-3">לו"ז שבועי קבוע</h3>
          <button type="button" onClick={() => addRow('schedule', { day_of_week: 'ראשון', start_time: '', end_time: '', location_building: '', location_room: '', class_type: 'הרצאה' })} className="text-[10px] md:text-xs bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full font-bold">+ הוסף יום</button>
        </div>
        {courseInfo.schedule.map((slot, i) => (
          <div key={i} className="grid grid-cols-2 md:grid-cols-6 gap-2 md:gap-3 p-3 bg-slate-50 rounded-lg relative">
            <select className="p-2 md:p-1 border rounded text-sm bg-white" value={slot.day_of_week} onChange={e => updateRow('schedule', i, 'day_of_week', e.target.value)}>
              {['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי'].map(d => <option key={d}>{d}</option>)}
            </select>
            <input type="time" className="p-2 md:p-1 border rounded text-sm bg-white" value={slot.start_time} onChange={e => updateRow('schedule', i, 'start_time', e.target.value)} />
            <input type="time" className="p-2 md:p-1 border rounded text-sm bg-white" value={slot.end_time} onChange={e => updateRow('schedule', i, 'end_time', e.target.value)} />
            <input className="p-2 md:p-1 border rounded text-sm bg-white" placeholder="בניין" value={slot.location_building} onChange={e => updateRow('schedule', i, 'location_building', e.target.value)} />
            <input className="p-2 md:p-1 border rounded text-sm bg-white" placeholder="חדר" value={slot.location_room} onChange={e => updateRow('schedule', i, 'location_room', e.target.value)} />
            <button type="button" onClick={() => removeRow('schedule', i)} className="text-red-500 text-[11px] font-medium pt-1 md:pt-0">מחק שורה</button>
          </div>
        ))}
      </section>

      {/* 3. Exams & Grades */}
      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg md:text-xl font-bold text-slate-800 border-s-4 border-red-500 pr-3">מבחנים ומטלות</h3>
          <button type="button" onClick={() => addRow('exams', { name: '', percentage: 0 })} className="text-[10px] md:text-xs bg-red-50 text-red-600 px-3 py-1 rounded-full font-bold">+ הוסף מבחן</button>
        </div>
        {courseInfo.exams.map((ex, i) => (
          <div key={i} className="flex flex-col sm:flex-row gap-2 p-3 md:p-2 bg-slate-50 rounded-lg">
            <input className="flex-1 p-3 md:p-1 border rounded text-sm bg-white" placeholder="שם המבחן/מטלה" value={ex.name} onChange={e => updateRow('exams', i, 'name', e.target.value)} />
            <div className="flex gap-2">
              <input type="number" className="flex-1 sm:w-24 p-3 md:p-1 border rounded text-sm bg-white" placeholder="אחוז" value={ex.percentage} onChange={e => updateRow('exams', i, 'percentage', parseFloat(e.target.value))} />
              <button type="button" onClick={() => removeRow('exams', i)} className="text-red-500 text-xs px-2">מחק</button>
            </div>
          </div>
        ))}
      </section>

      {/* 4. Syllabus Topics */}
      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg md:text-xl font-bold text-slate-800 border-s-4 border-green-500 pr-3">סילבוס / נושאי לימוד</h3>
          <button type="button" onClick={() => addRow('syllabus', { topic_num: courseInfo.syllabus.length + 1, topic: '' })} className="text-[10px] md:text-xs bg-green-50 text-green-600 px-3 py-1 rounded-full font-bold">+ הוסף נושא</button>
        </div>
        {courseInfo.syllabus.map((s, i) => (
          <div key={i} className="flex gap-2 p-3 md:p-2 bg-slate-50 rounded-lg">
            <span className="text-xs font-bold text-slate-400 self-center">#{s.topic_num}</span>
            <input className="flex-1 p-3 md:p-1 border rounded text-sm bg-white" placeholder="נושא לימוד" value={s.topic} onChange={e => updateRow('syllabus', i, 'topic', e.target.value)} />
            <button type="button" onClick={() => removeRow('syllabus', i)} className="text-red-500 text-xs px-2">מחק</button>
          </div>
        ))}
      </section>

      {/* 5. Reception Hours */}
      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg md:text-xl font-bold text-slate-800 border-s-4 border-yellow-500 pr-3">שעות קבלה</h3>
          <button type="button" onClick={() => addRow('reception_hours', { name: 'מרצה', day: 'ראשון', time: '', location_building: '', location_room: '' })} className="text-[10px] md:text-xs bg-yellow-50 text-yellow-600 px-3 py-1 rounded-full font-bold">+ הוסף שעה</button>
        </div>
        {courseInfo.reception_hours.map((rh, i) => (
          <div key={i} className="grid grid-cols-2 md:grid-cols-5 gap-2 md:gap-3 p-3 bg-slate-50 rounded-lg">
            <input className="p-2 md:p-1 border rounded text-sm bg-white" placeholder="תפקיד (מרצה/מתרגל)" value={rh.name} onChange={e => updateRow('reception_hours', i, 'name', e.target.value)} />
            <select className="p-2 md:p-1 border rounded text-sm bg-white" value={rh.day} onChange={e => updateRow('reception_hours', i, 'day', e.target.value)}>
              {['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי'].map(d => <option key={d}>{d}</option>)}
            </select>
            <input className="p-2 md:p-1 border rounded text-sm bg-white" placeholder="שעה (14:00)" value={rh.time} onChange={e => updateRow('reception_hours', i, 'time', e.target.value)} />
            <input className="p-2 md:p-1 border rounded text-sm bg-white" placeholder="בניין וחדר" value={rh.location_building} onChange={e => updateRow('reception_hours', i, 'location_building', e.target.value)} />
            <button type="button" onClick={() => removeRow('reception_hours', i)} className="text-red-500 text-[11px] font-medium pt-1 md:pt-0">מחק שורה</button>
          </div>
        ))}
      </section>

      <button type="submit" className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-black transition-all shadow-xl active:scale-95 text-lg">
        שמור את כל נתוני הקורס 
      </button>
    </form>
  );
};

export default AddCourseForm;
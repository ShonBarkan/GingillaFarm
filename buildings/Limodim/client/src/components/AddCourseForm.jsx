import React, { useState } from 'react';
import { useCourses } from '../context/CourseContext';

const AddCourseForm = () => {
  const { addCourse } = useCourses();

  const [courseInfo, setCourseInfo] = useState({
    name: '',
    degree_points: 0,
    lecturer: '',
    practitioner: '',
    semester: 1,
    link_to: '',
    start_date: '',
    end_date: '',
    schedule: [{ day_of_week: 'ראשון', start_time: '', end_time: '', location_building: '', location_room: '', class_type: 'Lecture' }],
    exams: [{ name: '', percentage: 0 }],
    reception_hours: [{ name: 'מרצה', day: 'ראשון', time: '', location_building: '', location_room: '' }],
    syllabus: [{ topic_num: 1, topic: '' }]
  });

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
      alert("הקורס וכל הנתונים הנלווים נשמרו בהצלחה!");
    } catch (err) {
      alert("שגיאה בשמירת הנתונים");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-10 bg-white p-8 rounded-2xl shadow-sm border border-slate-100 max-w-5xl mx-auto">
      
      {/* 1. Basic Course Info & Semester */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-slate-800 border-s-4 border-blue-500 pr-3">פרטים כלליים</h3>
          <input required className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-100" placeholder="שם הקורס" onChange={e => setCourseInfo({...courseInfo, name: e.target.value})} />
          
          <div className="flex gap-2">
            <input className="w-1/2 p-2 border rounded-lg outline-none" placeholder='מרצה' onChange={e => setCourseInfo({...courseInfo, lecturer: e.target.value})} />
            <input className="w-1/2 p-2 border rounded-lg outline-none" placeholder='מתרגל' onChange={e => setCourseInfo({...courseInfo, practitioner: e.target.value})} />
          </div>

          <div className="flex gap-2">
            <div className="w-1/2">
               <label className="text-[10px] font-bold text-slate-400 block pr-1">סמסטר</label>
               <input type="number" className="w-full p-2 border rounded-lg outline-none" value={courseInfo.semester} onChange={e => setCourseInfo({...courseInfo, semester: parseInt(e.target.value)})} />
            </div>
            <div className="w-1/2">
               <label className="text-[10px] font-bold text-slate-400 block pr-1">נק"ז</label>
               <input type="number" step="0.5" className="w-full p-2 border rounded-lg outline-none" placeholder='נק"ז' onChange={e => setCourseInfo({...courseInfo, degree_points: parseFloat(e.target.value)})} />
            </div>
          </div>

          <div className="flex flex-col">
            <label className="text-[10px] font-bold text-slate-400 block pr-1">לינק חיצוני (Moodle/Drive)</label>
            <input className="w-full p-2 border rounded-lg outline-none" placeholder='https://...' onChange={e => setCourseInfo({...courseInfo, link_to: e.target.value})} />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-bold text-slate-800 border-s-4 border-orange-500 pr-3">זמני סמסטר</h3>
          <div className="bg-slate-50 p-4 rounded-xl space-y-4">
            <div className="flex flex-col">
              <label className="text-xs font-bold text-slate-500 mb-1">תאריך התחלה</label>
              <input type="date" className="p-2 border rounded-lg outline-none" onChange={e => setCourseInfo({...courseInfo, start_date: e.target.value})} />
            </div>
            <div className="flex flex-col">
              <label className="text-xs font-bold text-slate-500 mb-1">תאריך סיום</label>
              <input type="date" className="p-2 border rounded-lg outline-none" onChange={e => setCourseInfo({...courseInfo, end_date: e.target.value})} />
            </div>
          </div>
        </div>
      </section>

      {/* 2. Weekly Schedule */}
      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold text-slate-800 border-s-4 border-indigo-500 pr-3">לו"ז שבועי קבוע</h3>
          <button type="button" onClick={() => addRow('schedule', { day_of_week: 'ראשון', start_time: '', end_time: '', location_building: '', location_room: '', class_type: 'Lecture' })} className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full font-bold">+ הוסף יום</button>
        </div>
        {courseInfo.schedule.map((slot, i) => (
          <div key={i} className="grid grid-cols-2 md:grid-cols-6 gap-2 p-3 bg-slate-50 rounded-lg relative">
            <select className="p-1 border rounded text-sm" value={slot.day_of_week} onChange={e => updateRow('schedule', i, 'day_of_week', e.target.value)}>
              {['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי'].map(d => <option key={d}>{d}</option>)}
            </select>
            <input type="time" className="p-1 border rounded text-sm" onChange={e => updateRow('schedule', i, 'start_time', e.target.value)} />
            <input type="time" className="p-1 border rounded text-sm" onChange={e => updateRow('schedule', i, 'end_time', e.target.value)} />
            <input className="p-1 border rounded text-sm" placeholder="בניין" onChange={e => updateRow('schedule', i, 'location_building', e.target.value)} />
            <input className="p-1 border rounded text-sm" placeholder="חדר" onChange={e => updateRow('schedule', i, 'location_room', e.target.value)} />
            <button type="button" onClick={() => removeRow('schedule', i)} className="text-red-400 text-xs">מחק</button>
          </div>
        ))}
      </section>

      {/* 3. Exams & Grades */}
      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold text-slate-800 border-s-4 border-red-500 pr-3">מבחנים ומטלות</h3>
          <button type="button" onClick={() => addRow('exams', { name: '', percentage: 0 })} className="text-xs bg-red-50 text-red-600 px-3 py-1 rounded-full font-bold">+ הוסף מבחן</button>
        </div>
        {courseInfo.exams.map((ex, i) => (
          <div key={i} className="flex gap-2 p-2 bg-slate-50 rounded-lg">
            <input className="flex-1 p-1 border rounded text-sm" placeholder="שם המבחן/מטלה" onChange={e => updateRow('exams', i, 'name', e.target.value)} />
            <input type="number" className="w-24 p-1 border rounded text-sm" placeholder="אחוז" onChange={e => updateRow('exams', i, 'percentage', parseFloat(e.target.value))} />
            <button type="button" onClick={() => removeRow('exams', i)} className="text-red-400 text-xs">מחק</button>
          </div>
        ))}
      </section>

      {/* 4. Syllabus Topics */}
      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold text-slate-800 border-s-4 border-green-500 pr-3">סילבוס / נושאי לימוד</h3>
          <button type="button" onClick={() => addRow('syllabus', { topic_num: courseInfo.syllabus.length + 1, topic: '' })} className="text-xs bg-green-50 text-green-600 px-3 py-1 rounded-full font-bold">+ הוסף נושא</button>
        </div>
        {courseInfo.syllabus.map((s, i) => (
          <div key={i} className="flex gap-2 p-2 bg-slate-50 rounded-lg">
            <span className="text-xs font-bold text-slate-400 self-center">#{s.topic_num}</span>
            <input className="flex-1 p-1 border rounded text-sm" placeholder="נושא לימוד" onChange={e => updateRow('syllabus', i, 'topic', e.target.value)} />
            <button type="button" onClick={() => removeRow('syllabus', i)} className="text-red-400 text-xs">מחק</button>
          </div>
        ))}
      </section>

      {/* 5. Reception Hours */}
      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold text-slate-800 border-s-4 border-yellow-500 pr-3">שעות קבלה</h3>
          <button type="button" onClick={() => addRow('reception_hours', { name: 'מרצה', day: 'ראשון', time: '', location_building: '', location_room: '' })} className="text-xs bg-yellow-50 text-yellow-600 px-3 py-1 rounded-full font-bold">+ הוסף שעה</button>
        </div>
        {courseInfo.reception_hours.map((rh, i) => (
          <div key={i} className="grid grid-cols-2 md:grid-cols-5 gap-2 p-3 bg-slate-50 rounded-lg">
            <input className="p-1 border rounded text-sm" placeholder="תפקיד (מרצה/מתרגל)" value={rh.name} onChange={e => updateRow('reception_hours', i, 'name', e.target.value)} />
            <select className="p-1 border rounded text-sm" value={rh.day} onChange={e => updateRow('reception_hours', i, 'day', e.target.value)}>
              {['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי'].map(d => <option key={d}>{d}</option>)}
            </select>
            <input className="p-1 border rounded text-sm" placeholder="שעה (למשל 14:00)" onChange={e => updateRow('reception_hours', i, 'time', e.target.value)} />
            <input className="p-1 border rounded text-sm" placeholder="בניין וחדר" onChange={e => updateRow('reception_hours', i, 'location_building', e.target.value)} />
            <button type="button" onClick={() => removeRow('reception_hours', i)} className="text-red-400 text-xs">מחק</button>
          </div>
        ))}
      </section>

      <button type="submit" className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-black transition-all shadow-xl active:scale-95">
        שמור את כל נתוני הקורס 
      </button>
    </form>
  );
};

export default AddCourseForm;
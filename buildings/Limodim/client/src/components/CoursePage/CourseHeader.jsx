import React, { useState } from 'react';
import { useCourses } from '../../context/CourseContext';
import { useNavigate } from 'react-router-dom';

const CourseHeader = ({ course }) => {
  const { editCourse, removeCourse } = useCourses();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ ...course });

  const handleSave = async () => {
    await editCourse(course.id, formData);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm(`האם למחוק את "${course.name}"? הפעולה תמחק את כל היסטוריית השיעורים והמטלות.`);
    if (confirmDelete) {
      try {
        await removeCourse(course.id);
        navigate('/');
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <header className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden">
      {/* Decorative Background Element */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-full -mr-16 -mt-16 z-0" />

      {/* Action Buttons Container */}
      <div className="flex gap-2 mb-4 justify-end">
        {isEditing ? (
          <>
            <button 
              onClick={handleSave} 
              className="bg-emerald-600 text-white px-4 py-1 rounded-full text-xs font-bold hover:bg-emerald-700 transition"
            >
              שמור
            </button>
            <button 
              onClick={() => { setIsEditing(false); setFormData({...course}); }} 
              className="bg-slate-200 text-slate-600 px-4 py-1 rounded-full text-xs font-bold hover:bg-slate-300 transition"
            >
              ביטול
            </button>
          </>
        ) : (
          <>
            <button 
              onClick={() => setIsEditing(true)} 
              className="bg-blue-50 text-blue-600 px-4 py-1 rounded-full text-xs font-bold hover:bg-blue-100 transition border border-blue-100"
            >
              עריכה
            </button>
            <button 
              onClick={handleDelete} 
              className="bg-red-50 text-red-600 px-4 py-1 rounded-full text-xs font-bold hover:bg-red-100 transition border border-red-100"
            >
              מחיקה
            </button>
          </>
        )}
      </div>

      <div className="relative z-10">
        {isEditing ? (
          /* --- EDIT MODE --- */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-y-6 gap-x-8">
            <div className="lg:col-span-6 space-y-4">
              <div className="flex flex-col">
                <label className="text-[10px] font-bold text-slate-400 uppercase pr-1">שם הקורס</label>
                <input className="text-2xl font-black text-slate-800 border-b-2 border-blue-200 outline-none focus:border-blue-500 transition-colors bg-transparent pb-1" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="flex flex-col">
                <label className="text-[10px] font-bold text-slate-400 uppercase pr-1">לינק חיצוני (Moodle/Drive)</label>
                <input className="text-sm border-b border-slate-200 outline-none focus:border-blue-500 bg-transparent pb-1" value={formData.link_to || ''} placeholder="https://..." onChange={(e) => setFormData({...formData, link_to: e.target.value})} />
              </div>
            </div>

            <div className="lg:col-span-6 grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="text-[10px] font-bold text-slate-400 uppercase">מרצה</label>
                <input className="border-b border-slate-200 outline-none p-1 text-sm" value={formData.lecturer || ''} onChange={(e) => setFormData({...formData, lecturer: e.target.value})} />
              </div>
              <div className="flex flex-col">
                <label className="text-[10px] font-bold text-slate-400 uppercase">מתרגל/ת</label>
                <input className="border-b border-slate-200 outline-none p-1 text-sm" value={formData.practitioner || ''} onChange={(e) => setFormData({...formData, practitioner: e.target.value})} />
              </div>
              <div className="flex flex-col">
                <label className="text-[10px] font-bold text-slate-400 uppercase">סמסטר</label>
                <input type="number" className="border-b border-slate-200 outline-none p-1 text-sm" value={formData.semester || ''} onChange={(e) => setFormData({...formData, semester: parseInt(e.target.value)})} />
              </div>
              <div className="flex flex-col">
                <label className="text-[10px] font-bold text-slate-400 uppercase">נק"ז</label>
                <input type="number" step="0.5" className="border-b border-slate-200 outline-none p-1 text-sm" value={formData.degree_points || ''} onChange={(e) => setFormData({...formData, degree_points: parseFloat(e.target.value)})} />
              </div>
            </div>
          </div>
        ) : (
          /* --- DISPLAY MODE --- */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7">
              <div className="flex items-center gap-3 mb-3">
                <span className="bg-blue-600 text-white text-[10px] font-black px-2 py-1 rounded uppercase tracking-wider">Course</span>
                {course.final_grade && (
                  <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black px-2 py-1 rounded">ציון: {course.final_grade}</span>
                )}
              </div>
              <h1 className="text-4xl lg:text-5xl font-black text-slate-900 leading-tight mb-4">{course.name}</h1>
              <div className="flex flex-wrap gap-3">
                <span className="bg-slate-100 text-slate-600 px-4 py-1.5 rounded-full text-xs font-bold">סמסטר {course.semester}</span>
                <span className="bg-slate-100 text-slate-600 px-4 py-1.5 rounded-full text-xs font-bold">{course.degree_points} נק"ז</span>
                {course.link_to && (
                  <a href={course.link_to} target="_blank" rel="noreferrer" className="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-xs font-bold hover:bg-blue-100 transition-colors flex items-center gap-2">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    אתר הקורס
                  </a>
                )}
              </div>
            </div>

            <div className="lg:col-span-5 grid grid-cols-2 gap-y-6 border-r-2 border-slate-100 pr-8">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">מרצה</p>
                <p className="font-bold text-slate-800 text-sm">{course.lecturer || '---'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">מתרגל/ת</p>
                <p className="font-bold text-slate-800 text-sm">{course.practitioner || '---'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">תקופת לימודים</p>
                <p className="text-xs font-medium text-slate-600 italic">
                  {course.start_date} <span className="mx-1"> עד </span> {course.end_date}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default CourseHeader;
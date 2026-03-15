import React, { useState } from 'react';
import { useCourses } from '../../context/CourseContext';
import { useNavigate } from 'react-router-dom';

const CourseHeader = ({ course }) => {
  const { editCourse, removeCourse } = useCourses();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ ...course });

  /* Preserve save logic */
  const handleSave = async () => {
    await editCourse(course.id, formData);
    setIsEditing(false);
  };

  /* Preserve delete logic */
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
    /* Adjusted padding: p-5 for mobile, p-8 for desktop */
    <header className="bg-white p-5 md:p-8 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden">
      
      {/* Decorative Background Element - Scaled for mobile */}
      <div className="absolute top-0 right-0 w-24 md:w-32 h-24 md:h-32 bg-blue-50/50 rounded-full -mr-12 md:-mr-16 -mt-12 md:-mt-16 z-0" />

      {/* Action Buttons Container - Better touch spacing */}
      <div className="flex gap-3 md:gap-2 mb-6 md:mb-4 justify-end relative z-20">
        {isEditing ? (
          <>
            <button 
              onClick={handleSave} 
              className="bg-emerald-600 text-white px-5 py-1.5 md:px-4 md:py-1 rounded-full text-[11px] md:text-xs font-bold hover:bg-emerald-700 transition shadow-sm active:scale-95"
            >
              שמור
            </button>
            <button 
              onClick={() => { setIsEditing(false); setFormData({...course}); }} 
              className="bg-slate-200 text-slate-600 px-5 py-1.5 md:px-4 md:py-1 rounded-full text-[11px] md:text-xs font-bold hover:bg-slate-300 transition active:scale-95"
            >
              ביטול
            </button>
          </>
        ) : (
          <>
            <button 
              onClick={() => setIsEditing(true)} 
              className="bg-blue-50 text-blue-600 px-5 py-1.5 md:px-4 md:py-1 rounded-full text-[11px] md:text-xs font-bold hover:bg-blue-100 transition border border-blue-100 active:scale-95"
            >
              עריכה
            </button>
            <button 
              onClick={handleDelete} 
              className="bg-red-50 text-red-600 px-5 py-1.5 md:px-4 md:py-1 rounded-full text-[11px] md:text-xs font-bold hover:bg-red-100 transition border border-red-100 active:scale-95"
            >
              מחיקה
            </button>
          </>
        )}
      </div>

      <div className="relative z-10">
        {isEditing ? (
          /* --- EDIT MODE --- */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-y-6 lg:gap-x-8">
            <div className="lg:col-span-6 space-y-5">
              <div className="flex flex-col">
                <label className="text-[10px] font-bold text-slate-400 uppercase pr-1">שם הקורס</label>
                <input className="text-xl md:text-2xl font-black text-slate-800 border-b-2 border-blue-200 outline-none focus:border-blue-500 transition-colors bg-transparent pb-1" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="flex flex-col">
                <label className="text-[10px] font-bold text-slate-400 uppercase pr-1">לינק חיצוני (Moodle/Drive)</label>
                <input className="text-sm border-b border-slate-200 outline-none focus:border-blue-500 bg-transparent pb-1" value={formData.link_to || ''} placeholder="https://..." onChange={(e) => setFormData({...formData, link_to: e.target.value})} />
              </div>
            </div>

            <div className="lg:col-span-6 grid grid-cols-2 gap-4 mt-2 lg:mt-0">
              <div className="flex flex-col">
                <label className="text-[10px] font-bold text-slate-400 uppercase">מרצה</label>
                <input className="border-b border-slate-200 outline-none p-2 md:p-1 text-sm bg-slate-50/50 md:bg-transparent rounded-t" value={formData.lecturer || ''} onChange={(e) => setFormData({...formData, lecturer: e.target.value})} />
              </div>
              <div className="flex flex-col">
                <label className="text-[10px] font-bold text-slate-400 uppercase">מתרגל/ת</label>
                <input className="border-b border-slate-200 outline-none p-2 md:p-1 text-sm bg-slate-50/50 md:bg-transparent rounded-t" value={formData.practitioner || ''} onChange={(e) => setFormData({...formData, practitioner: e.target.value})} />
              </div>
              <div className="flex flex-col">
                <label className="text-[10px] font-bold text-slate-400 uppercase">סמסטר</label>
                <input type="number" className="border-b border-slate-200 outline-none p-2 md:p-1 text-sm" value={formData.semester || ''} onChange={(e) => setFormData({...formData, semester: parseInt(e.target.value)})} />
              </div>
              <div className="flex flex-col">
                <label className="text-[10px] font-bold text-slate-400 uppercase">נק"ז</label>
                <input type="number" step="0.5" className="border-b border-slate-200 outline-none p-2 md:p-1 text-sm" value={formData.degree_points || ''} onChange={(e) => setFormData({...formData, degree_points: parseFloat(e.target.value)})} />
              </div>
            </div>
          </div>
        ) : (
          /* --- DISPLAY MODE --- */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-start">
            <div className="lg:col-span-7">
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-blue-600 text-white text-[9px] md:text-[10px] font-black px-2 py-1 rounded uppercase tracking-wider">Course</span>
                {course.final_grade && (
                  <span className="bg-emerald-100 text-emerald-700 text-[9px] md:text-[10px] font-black px-2 py-1 rounded">ציון: {course.final_grade}</span>
                )}
              </div>
              <h1 className="text-2xl md:text-4xl lg:text-5xl font-black text-slate-900 leading-tight mb-4">{course.name}</h1>
              <div className="flex flex-wrap gap-2 md:gap-3">
                <span className="bg-slate-100 text-slate-600 px-3 py-1.5 md:px-4 md:py-1.5 rounded-full text-[10px] md:text-xs font-bold">סמסטר {course.semester}</span>
                <span className="bg-slate-100 text-slate-600 px-3 py-1.5 md:px-4 md:py-1.5 rounded-full text-[10px] md:text-xs font-bold">{course.degree_points} נק"ז</span>
                {course.link_to && (
                  <a href={course.link_to} target="_blank" rel="noreferrer" className="bg-blue-50 text-blue-600 px-3 py-1.5 md:px-4 md:py-1.5 rounded-full text-[10px] md:text-xs font-bold hover:bg-blue-100 transition-colors flex items-center gap-2">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    אתר הקורס
                  </a>
                )}
              </div>
            </div>

            {/* Right side info: Remove vertical border on mobile, keep on LG screens */}
            <div className="lg:col-span-5 grid grid-cols-2 gap-y-5 md:gap-y-6 border-r-0 lg:border-r-2 border-slate-100 lg:pr-8 mt-4 lg:mt-0">
              <div className="space-y-1">
                <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">מרצה</p>
                <p className="font-bold text-slate-800 text-xs md:text-sm">{course.lecturer || '---'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">מתרגל/ת</p>
                <p className="font-bold text-slate-800 text-xs md:text-sm">{course.practitioner || '---'}</p>
              </div>
              <div className="col-span-2 space-y-1 pt-2 border-t lg:border-0 border-slate-50">
                <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">תקופת לימודים</p>
                <p className="text-[11px] md:text-xs font-medium text-slate-600 italic">
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
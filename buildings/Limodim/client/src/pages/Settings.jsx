import React from 'react';
import AddCourseForm from '../components/Settings/AddCourseForm';

const Settings = () => {
  return (
    /* Added horizontal padding on mobile to prevent content from touching screen edges */
    <div className="max-w-4xl mx-auto space-y-8 md:space-y-10 px-4 md:px-0">
      
      {/* Header Section - Scale text size for smaller screens */}
      <header className="border-b border-slate-200 pb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800">הגדרות וניהול החווה</h1>
        <p className="text-sm md:text-base text-slate-500 mt-2">נהל את הנתונים האקדמיים של חוות ג'ינג'ילה</p>
      </header>

      <div className="grid grid-cols-1 gap-8 md:gap-12">
        {/* Add Course Section - Increased padding for better touch targets on mobile */}
        <section className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="mb-6 px-2">
            <h2 className="text-xl md:text-2xl font-bold text-blue-600">רישום קורס חדש</h2>
            <p className="text-xs md:text-sm text-slate-400 mt-1">
              הוסף מבנה חדש לחווה על ידי הזנת פרטי הקורס, הסילבוס והמטלות.
            </p>
          </div>
          
          <AddCourseForm />
        </section>

        {/* Additional Management Sections (Placeholders for later) */}
        <section className="opacity-50 pointer-events-none pb-10">
          <h2 className="text-lg md:text-xl font-semibold mb-4 text-slate-400">ניהול נתונים מתקדם</h2>
          <div className="border-2 border-dashed border-slate-200 p-6 md:p-8 rounded-xl text-center">
            <p className="text-slate-400 text-xs md:text-sm">אפשרויות גיבוי וייצוא נתונים יהיו זמינות בקרוב...</p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Settings;
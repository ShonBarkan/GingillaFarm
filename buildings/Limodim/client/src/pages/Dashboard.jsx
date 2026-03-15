import React from 'react';
import { Link } from 'react-router-dom';
import { useCourses } from '../context/CourseContext';
import Timeline from '../components/Dashboard/Timeline'; // Import the new Timeline component

const Dashboard = () => {
  const { courses, healthStatus } = useCourses();

  return (
    /* Added horizontal padding for mobile view */
    <div className="space-y-6 md:space-y-8 pb-12 px-2 md:px-0">
      
      {/* Page Header - Responsive font sizes */}
      <header>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800">לוח בקרה אקדמי</h1>
        <p className="text-sm md:text-base text-slate-500">סקירה כללית של הסמסטר</p>
      </header>

      {/* Top Stats & Quick Actions - Grid handles 1 col on mobile, 3 on desktop */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        
        {/* Stats Card */}
        <div className="bg-white p-5 md:p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-[10px] md:text-sm font-medium text-slate-500 uppercase tracking-wider">קורסים פעילים</h3>
          <p className="text-3xl md:text-4xl font-bold text-slate-900 mt-1 md:mt-2">{courses.length}</p>
        </div>

        {/* Health Status Card */}
        <div className="bg-white p-5 md:p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-[10px] md:text-sm font-medium text-slate-500 uppercase tracking-wider">סטטוס מערכת</h3>
          <div className="flex items-center gap-2 mt-2 md:mt-3">
            <span className={`h-2.5 w-2.5 md:h-3 md:w-3 rounded-full animate-pulse ${healthStatus === 'online' ? 'bg-green-500' : 'bg-red-500'}`}></span>
            <p className="text-base md:text-lg font-semibold">{healthStatus === 'online' ? 'מחובר' : 'מנותק'}</p>
          </div>
        </div>

        {/* Quick Action Card - Optimized for touch on mobile */}
        <Link 
          to="/settings" 
          className="group bg-blue-600 p-5 md:p-6 rounded-xl shadow-md hover:bg-blue-700 transition-all flex flex-row md:flex-col justify-center items-center gap-3 md:gap-0 text-white"
        >
          <span className="text-xl md:text-2xl mb-0 md:mb-1 group-hover:scale-125 transition-transform">+</span>
          <span className="font-bold text-sm md:text-base">רישום קורס חדש</span>
        </Link>
      </div>

      {/* Smart Timeline Section */}
      <div className="mt-6 md:mt-8">
        <Timeline />
      </div>

      {/* Courses Quick Access Section */}
      <section className="bg-white p-5 md:p-8 rounded-xl border border-slate-200 shadow-sm mt-6 md:mt-8">
        <h2 className="text-lg md:text-xl font-bold mb-4 md:mb-6 text-slate-800 border-b pb-4">גישה מהירה לקורסים</h2>
        
        {courses.length === 0 ? (
          <div className="text-center py-10 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200 px-4">
             <p className="text-sm md:text-base text-slate-400 italic">לא נמצאו קורסים במערכת. לחץ על "רישום קורס חדש" כדי להתחיל.</p>
          </div>
        ) : (
          /* Grid adjustments: 1 col for small phones, 2 for tablets, 4 for desktop */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {courses.map(course => (
              <Link 
                key={course.id} 
                to={`/course/${course.id}`}
                className="p-4 md:p-5 border border-slate-100 rounded-xl hover:bg-blue-50 hover:border-blue-100 transition-all group"
              >
                <p className="font-bold text-slate-700 group-hover:text-blue-600 transition-colors text-sm md:text-base">{course.name}</p>
                <p className="text-[11px] md:text-xs text-slate-400 mt-1">{course.lecturer}</p>
                <div className="mt-3 md:mt-4 flex justify-end">
                  <span className="text-[9px] md:text-[10px] bg-slate-100 text-slate-500 px-2 py-1 rounded group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">צפייה בסילבוס ←</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Dashboard;
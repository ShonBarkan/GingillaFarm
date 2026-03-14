import React from 'react';
import { Link } from 'react-router-dom';
import { useCourses } from '../context/CourseContext';
import Timeline from '../components/Dashboard/Timeline'; // Import the new Timeline component

const Dashboard = () => {
  const { courses, healthStatus } = useCourses();

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <header>
        <h1 className="text-3xl font-bold text-slate-800">לוח בקרה אקדמי</h1>
        <p className="text-slate-500">סקירה כללית של הסמסטר</p>
      </header>

      {/* Top Stats & Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Stats Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">קורסים פעילים</h3>
          <p className="text-4xl font-bold text-slate-900 mt-2">{courses.length}</p>
        </div>

        {/* Health Status Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">סטטוס מערכת</h3>
          <div className="flex items-center gap-2 mt-3">
            <span className={`h-3 w-3 rounded-full animate-pulse ${healthStatus === 'online' ? 'bg-green-500' : 'bg-red-500'}`}></span>
            <p className="text-lg font-semibold">{healthStatus === 'online' ? 'מחובר' : 'מנותק'}</p>
          </div>
        </div>

        {/* Quick Action Card */}
        <Link 
          to="/settings" 
          className="group bg-blue-600 p-6 rounded-xl shadow-md hover:bg-blue-700 transition-all flex flex-col justify-center items-center text-white"
        >
          <span className="text-2xl mb-1 group-hover:scale-125 transition-transform">+</span>
          <span className="font-bold">רישום קורס חדש</span>
        </Link>
      </div>

      {/* NEW: Smart Timeline Section */}
      <div className="mt-8">
        <Timeline />
      </div>

      {/* Courses Quick Access Section */}
      <section className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm mt-8">
        <h2 className="text-xl font-bold mb-6 text-slate-800 border-b pb-4">גישה מהירה לקורסים</h2>
        
        {courses.length === 0 ? (
          <div className="text-center py-10 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
             <p className="text-slate-400 italic">לא נמצאו קורסים במערכת. לחץ על "רישום קורס חדש" כדי להתחיל.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {courses.map(course => (
              <Link 
                key={course.id} 
                to={`/course/${course.id}`}
                className="p-5 border border-slate-100 rounded-xl hover:bg-blue-50 hover:border-blue-100 transition-all group"
              >
                <p className="font-bold text-slate-700 group-hover:text-blue-600 transition-colors">{course.name}</p>
                <p className="text-xs text-slate-400 mt-1">{course.lecturer}</p>
                <div className="mt-4 flex justify-end">
                  <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-1 rounded group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">צפייה בסילבוס ←</span>
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
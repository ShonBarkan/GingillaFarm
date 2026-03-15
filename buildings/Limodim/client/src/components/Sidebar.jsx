import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useCourses } from '../context/CourseContext';

const Sidebar = () => {
  const { courses } = useCourses();

  return (
    /* Mobile: Full width, fixed height, horizontal layout.
       Desktop: Fixed width (w-64), full height (h-screen), vertical layout.
    */
    <aside className="w-full md:w-64 bg-slate-900 text-white flex flex-col md:h-screen shadow-xl z-[100]">
      
      {/* Header - Hidden on mobile to save space, or kept small */}
      <div className="p-4 md:p-6 border-b border-slate-800 flex items-center justify-between md:block">
        <Link to="/" className="text-xl md:text-2xl font-bold tracking-wider text-orange-400">
          לימודים
        </Link>
        
        {/* Mobile-only "Add" shortcut to save vertical space */}
        <Link to="/settings" className="md:hidden bg-blue-600 px-3 py-1 rounded text-xs font-bold">
          + חדש
        </Link>
      </div>

      {/* Navigation Area */}
      <nav className="flex-1 flex flex-row md:flex-col overflow-x-auto md:overflow-y-auto p-2 md:p-4 no-scrollbar">
        
        {/* Main Links - Side by side on mobile */}
        <div className="flex flex-row md:flex-col mb-0 md:mb-6 border-l md:border-l-0 border-slate-800 ml-2 md:ml-0">
          <NavLink 
            to="/" 
            className={({isActive}) => `flex items-center p-2 md:p-3 rounded-lg transition whitespace-nowrap ${isActive ? 'bg-blue-600' : 'hover:bg-slate-800'}`}
          >
            <span className="text-sm md:text-base">לוח בקרה</span>
          </NavLink>
        </div>

        {/* Courses List - Horizontal scroll on mobile */}
        <div className="flex flex-row md:flex-col items-center md:items-stretch gap-1">
          <p className="hidden md:block text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4 px-2">
            הקורסים שלי
          </p>
          
          <div className="flex flex-row md:flex-col space-x-reverse space-x-1 md:space-x-0 md:space-y-1">
            {courses.map(course => (
              <NavLink 
                key={course.id} 
                to={`/course/${course.id}`}
                className={({isActive}) => `block p-2 text-xs md:text-sm rounded-md transition whitespace-nowrap ${isActive ? 'bg-orange-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
              >
                {course.name}
              </NavLink>
            ))}
          </div>
        </div>
      </nav>

      {/* Sidebar Footer Action - Hidden on mobile as we added a shortcut in the header */}
      <div className="hidden md:block p-4 border-t border-slate-800">
        <Link 
          to="/settings" 
          className="flex items-center justify-center w-full py-2 bg-slate-800 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors"
        >
          + הוספת קורס חדש
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;
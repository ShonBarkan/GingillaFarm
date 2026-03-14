import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useCourses } from '../context/CourseContext';

const Sidebar = () => {
  const { courses } = useCourses();

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-xl">
      <div className="p-6 border-b border-slate-800">
        <Link to="/" className="text-2xl font-bold tracking-wider text-orange-400">
          לימודים
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto p-4">
        {/* Main Links */}
        <div className="mb-6">
          <NavLink 
            to="/" 
            className={({isActive}) => `flex items-center p-3 rounded-lg transition ${isActive ? 'bg-blue-600' : 'hover:bg-slate-800'}`}
          >
            <span>לוח בקרה</span>
          </NavLink>
        </div>

        {/* Courses List */}
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4 px-2">
            הקורסים שלי
          </p>
          <div className="space-y-1">
            {courses.map(course => (
              <NavLink 
                key={course.id} 
                to={`/course/${course.id}`}
                className={({isActive}) => `block p-2 text-sm rounded-md transition ${isActive ? 'bg-orange-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
              >
                {course.name}
              </NavLink>
            ))}
          </div>
        </div>
      </nav>

      {/* Sidebar Footer Action */}
      <div className="p-4 border-t border-slate-800">
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
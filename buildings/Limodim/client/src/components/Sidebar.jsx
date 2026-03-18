import React, { useState, useMemo } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useCourses } from '../context/CourseContext';

const Sidebar = () => {
  const { courses } = useCourses();
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [openSemesters, setOpenSemesters] = useState({});

  const groupedCourses = useMemo(() => {
    return courses.reduce((acc, course) => {
      const s = course.semester || 1;
      if (!acc[s]) acc[s] = [];
      acc[s].push(course);
      return acc;
    }, {});
  }, [courses]);

  const toggleSemester = (s) => {
    if (isCollapsed) setIsCollapsed(false);
    setOpenSemesters(prev => ({ ...prev, [s]: !prev[s] }));
  };

  return (
    <aside className={`bg-slate-900 text-white flex flex-col transition-all duration-300 z-[100] shadow-xl border-l border-slate-800
      ${isOpen ? 'h-screen' : 'h-16 md:h-screen'} 
      ${isCollapsed ? 'md:w-20' : 'md:w-64'} w-full`}>
      
      {/* --- Header Area --- */}
      <div className="p-4 md:p-6 border-b border-slate-800 flex items-center justify-between shrink-0 overflow-hidden">
        {(!isCollapsed || isOpen) && (
          <Link to="/" className="text-xl font-bold tracking-wider text-orange-400 whitespace-nowrap">
            לימודים
          </Link>
        )}
        
        {/* Toggle Button (Desktop: Collapse, Mobile: Hamburger) */}
        <button 
          onClick={() => {
            if (window.innerWidth < 768) setIsOpen(!isOpen);
            else setIsCollapsed(!isCollapsed);
          }}
          className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
        >
          {isOpen || (isCollapsed && !isOpen) ? '☰' : '◀'}
        </button>
      </div>

      {/* --- Navigation Area --- */}
      <nav className={`flex-1 flex flex-col overflow-y-auto p-3 no-scrollbar transition-opacity duration-300
        ${isOpen ? 'opacity-100' : 'opacity-0 md:opacity-100 pointer-events-none md:pointer-events-auto'}`}>
        
        {/* Dashboard Link */}
        <NavLink 
          to="/" 
          onClick={() => setIsOpen(false)}
          className={({isActive}) => `flex items-center gap-3 p-3 rounded-xl transition mb-6 ${isActive ? 'bg-blue-600 shadow-lg' : 'hover:bg-slate-800 text-slate-400'}`}
        >
          <span className="text-lg">🏠</span>
          {(!isCollapsed || isOpen) && <span className="font-bold whitespace-nowrap">לוח בקרה</span>}
        </NavLink>

        {/* Semesters & Courses */}
        <div className="space-y-4">
          {Object.keys(groupedCourses).sort().map(s => (
            <div key={s} className="space-y-1">
              {/* Semester Header */}
              <button 
                onClick={() => toggleSemester(s)}
                className={`w-full flex items-center justify-between p-2 hover:bg-slate-800/50 rounded-lg text-slate-300 transition-all
                  ${isCollapsed && !isOpen ? 'justify-center' : ''}`}
              >
                <div className="flex items-center gap-3">
                   <span className="text-xs font-black text-blue-400">S{s}</span>
                   {(!isCollapsed || isOpen) && <span className="text-sm font-black whitespace-nowrap">סמסטר {s}</span>}
                </div>
                {(!isCollapsed || isOpen) && (
                  <span className={`text-[10px] transition-transform ${openSemesters[s] ? 'rotate-180' : ''}`}>▼</span>
                )}
              </button>

              {/* Course Items */}
              <div className={`overflow-hidden transition-all duration-300 ${openSemesters[s] && (!isCollapsed || isOpen) ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="pr-9 py-1 flex flex-col gap-1">
                  {groupedCourses[s].map(course => (
                    <NavLink 
                      key={course.id} 
                      to={`/course/${course.id}`}
                      onClick={() => setIsOpen(false)}
                      className={({isActive}) => `block p-2 text-xs rounded-lg transition whitespace-nowrap ${isActive ? 'text-orange-400 font-bold' : 'text-slate-500 hover:text-white'}`}
                    >
                      • {course.name}
                    </NavLink>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </nav>

      {/* --- Footer (Add Course) --- */}
      <div className={`p-4 border-t border-slate-800 transition-all ${isCollapsed && !isOpen ? 'items-center' : ''}`}>
        <Link 
          to="/settings" 
          onClick={() => setIsOpen(false)}
          className={`flex items-center justify-center bg-slate-800 hover:bg-blue-700 text-white rounded-xl transition-all h-12
            ${isCollapsed && !isOpen ? 'w-12' : 'w-full px-4'}`}
          title="הוספת קורס"
        >
          <span className="text-xl font-bold">+</span>
          {(!isCollapsed || isOpen) && <span className="mr-2 text-xs font-black uppercase whitespace-nowrap">הוסף קורס</span>}
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useCourses } from './context/CourseContext';

// Components & Pages
import Dashboard from './pages/Dashboard';
import CoursePage from './pages/CoursePage';
import Sidebar from './components/Sidebar';
import Settings from './pages/Settings';
import ClassPage from './pages/ClassPage';

function App() {
  const { healthStatus } = useCourses();

  return (
    <Router>
      {/* Layout change: default is flex-col for mobile (stacked), 
        switching to flex-row-reverse for medium screens and up (desktop sidebar).
      */}
      <div className="flex flex-col md:flex-row-reverse h-screen w-full bg-slate-50 text-right overflow-hidden" dir="rtl">
        
        {/* Navigation Sidebar - will need responsive logic inside its own component */}
        <Sidebar />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
          
          {/* Health Indicator (Fixed bottom-left) */}
          <div className="fixed bottom-4 left-4 md:bottom-6 md:left-6 flex items-center gap-2 bg-white px-3 py-1 rounded-full shadow-md border border-slate-200 z-50">
            <span className={`flex h-2 w-2 md:h-3 md:w-3 rounded-full ${healthStatus === 'online' ? 'bg-green-500' : 'bg-red-500'}`}></span>
            <span className="text-[10px] md:text-xs font-medium text-slate-500 uppercase tracking-tighter">
              {healthStatus || 'Checking...'}
            </span>
          </div>

          {/* Route Switcher */}
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/course/:id" element={<CoursePage />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/course/:courseId/class/:classId" element={<ClassPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
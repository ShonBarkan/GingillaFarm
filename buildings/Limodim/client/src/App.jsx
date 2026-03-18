import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useCourses } from './context/CourseContext';

// Components
import Sidebar from './components/Sidebar';

// Pages
import Dashboard from './pages/Dashboard';
import CoursePage from './pages/CoursePage';
import Settings from './pages/Settings';
import ClassPage from './pages/ClassPage';

function App() {
  const { healthStatus } = useCourses();

  return (
    <Router>
      <div className="flex flex-col md:flex-row h-screen w-full bg-slate-50 text-right overflow-hidden" dir="rtl">
        
        {/* Sidebar Area */}
        <Sidebar />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 relative">
          
          {/* Health Indicator (Fixed bottom-left) */}
          <div className="fixed bottom-6 left-6 flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm border border-slate-200 z-50">
            <span className={`flex h-2 w-2 rounded-full ${healthStatus === 'online' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">
              {healthStatus || 'Checking...'}
            </span>
          </div>

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
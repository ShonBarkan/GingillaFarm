import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useCourses } from './context/CourseContext';

// Components & Pages
import Dashboard from './pages/Dashboard';
import CoursePage from './pages/CoursePage';
import Sidebar from './components/Sidebar';
import Settings from './pages/Settings';



function App() {
  const { healthStatus } = useCourses();

  return (
    <Router>
      {/* The main container uses flex-row-reverse to put the sidebar 
        on the right side for RTL. 
      */}
      <div className="flex h-screen w-full bg-slate-50 text-right overflow-hidden" dir="rtl">
        
        {/* Navigation Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          
          {/* Health Indicator (Fixed bottom-left) */}
          <div className="fixed bottom-6 left-6 flex items-center gap-2 bg-white px-3 py-1 rounded-full shadow-sm border border-slate-200 z-50">
            <span className={`flex h-3 w-3 rounded-full ${healthStatus === 'online' ? 'bg-green-500' : 'bg-red-500'}`}></span>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-tighter">
              {healthStatus || 'Checking...'}
            </span>
          </div>

          {/* Route Switcher */}
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/course/:id" element={<CoursePage />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
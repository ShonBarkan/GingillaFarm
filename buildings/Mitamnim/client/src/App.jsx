import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/common/Sidebar/Sidebar';
import Dashboard from './pages/Dashboard';
import ExercisePage from './pages/ExercisePage';
import { ToastProvider } from './context/ToastContext';
import { WorkoutProvider } from './context/WorkoutContext';
import { ExerciseProvider } from './context/ExerciseContext'; // 1. ייבוא ה-Provider החדש
import SettingsPage from './pages/SettingsPage';

// New Pages
import WorkoutsHubPage from './pages/Workouts/WorkoutsHubPage';
import ActiveWorkoutPage from './pages/Workouts/ActiveWorkoutPage';
import WorkoutSummaryPage from './pages/Workouts/WorkoutSummaryPage';
import CreateTemplatePage from './pages/Workouts/CreateTemplatePage';

function App() {
  return (
    <ToastProvider>
      <WorkoutProvider>
        {/* 2. עטיפת כל האפליקציה ב-ExerciseProvider */}
        <ExerciseProvider> 
          <Router>
            <div className="flex h-screen bg-gray-50 text-gray-900 overflow-hidden" dir="rtl">
              {/* עכשיו Sidebar יכול לצרוך את useExercise ללא שגיאה */}
              <Sidebar />
              
              <div className="flex flex-col flex-1 min-w-0 transition-all duration-300 ease-in-out">
                <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    {/* שים לב: שינינו בסידבר לניווט לפי ID, אז identifier כאן הוא ה-ID */}
                    <Route path="/exercise/:identifier" element={<ExercisePage />} />
                    <Route path="/workouts" element={<WorkoutsHubPage />} />
                    <Route path="/workouts/active" element={<ActiveWorkoutPage />} />
                    <Route path="/workouts/summary" element={<WorkoutSummaryPage />} />
                    <Route path="/workouts/create" element={<CreateTemplatePage />} />
                    <Route path="/workouts/edit/:id" element={<CreateTemplatePage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                  </Routes>
                </main>
              </div>
            </div>
          </Router>
        </ExerciseProvider>
      </WorkoutProvider>
    </ToastProvider>
  );
}

export default App;
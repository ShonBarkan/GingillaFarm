import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css' // וודא שייבאת את ה-CSS של Tailwind
import App from './App.jsx'

// ייבוא של כל ה-Providers
import { CourseProvider } from './context/CourseContext'
import { ClassProvider } from './context/ClassContext'
import { HomeworkProvider } from './context/HomeworkContext'
import { ReceptionHourProvider } from './context/ReceptionHourContext'
import { ExamProvider } from './context/ExamContext'
import { SyllabusProvider } from './context/SyllabusContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <CourseProvider>
      <ClassProvider>
        <HomeworkProvider>
          <ReceptionHourProvider>
            <ExamProvider>
              <SyllabusProvider>
                <App />
              </SyllabusProvider>
            </ExamProvider>
          </ReceptionHourProvider>
        </HomeworkProvider>
      </ClassProvider>
    </CourseProvider>
  </StrictMode>,
)
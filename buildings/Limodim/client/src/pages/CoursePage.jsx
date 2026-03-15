import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useCourses } from '../context/CourseContext';
import CourseHeader from '../components/CoursePage/CourseHeader';
import WeeklySchedule from '../components/CoursePage/WeeklySchedule';
import ReceptionHours from '../components/CoursePage/ReceptionHours';
import ExamsList from '../components/CoursePage/ExamsList';
import SyllabusSection from '../components/CoursePage/SyllabusSection';
import ClassHistory from '../components/CoursePage/ClassHistory';
import HomeworkList from '../components/CoursePage/HomeworkList';

const CoursePage = () => {
  const { id } = useParams();
  const { loadFullCourse, currentFullCourse, loading } = useCourses();

  // Load course data on mount or when ID changes
  useEffect(() => {
    if (id) {
      loadFullCourse(parseInt(id));
    }
  }, [id]);

  // Loading state - adjusted text size for mobile
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-pulse text-slate-500 font-bold text-lg md:text-xl">טוען נתוני קורס...</div>
      </div>
    );
  }
  
  // Error state - added responsive padding
  if (!currentFullCourse || !currentFullCourse.course) {
    return (
      <div className="p-6 md:p-8 text-center bg-red-50 text-red-600 rounded-xl border border-red-100 font-bold m-4">
        הנתונים לא נמצאו במערכת.
      </div>
    );
  }

  // Destructure data for cleaner props passing
  const { 
    course, 
    classes, 
    exams, 
    syllabus, 
    homeworks, 
    reception_hours 
  } = currentFullCourse;

  return (
    /* Adjusted outer padding for small screens and spacing between sections */
    <div className="max-w-6xl mx-auto space-y-6 md:space-y-8 p-3 md:p-4 pb-24 md:pb-20" dir="rtl">
      
      {/* Main Header Component */}
      <CourseHeader course={course} />

      {/* Grid: Stacks vertically on mobile/tablet, side-by-side on desktop (lg) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
        
        {/* Sidebar Sections (Priority info for mobile: Schedule and Exams) */}
        <div className="lg:col-span-4 space-y-6 order-1 lg:order-1">
          <WeeklySchedule course={course} />
          <ReceptionHours hours={reception_hours} courseId={course.id} />
          <ExamsList exams={exams} courseId={course.id} />
        </div>

        {/* Main Content Sections (Syllabus, History, etc.) */}
        <div className="lg:col-span-8 space-y-6 order-2 lg:order-2">
          <SyllabusSection syllabus={syllabus} courseId={course.id} />
          <ClassHistory classes={classes} courseId={course.id} />
          <HomeworkList homeworks={homeworks} courseId={course.id} />
        </div>

      </div>
    </div>
  );
};

export default CoursePage;
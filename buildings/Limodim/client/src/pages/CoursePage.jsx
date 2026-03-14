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

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-pulse text-slate-500 font-bold text-xl">טוען נתוני קורס...</div>
      </div>
    );
  }
  
  // Error state if course not found
  if (!currentFullCourse || !currentFullCourse.course) {
    return (
      <div className="p-8 text-center bg-red-50 text-red-600 rounded-xl border border-red-100 font-bold m-4">
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
    <div className="max-w-6xl mx-auto space-y-8 p-4 pb-20" dir="rtl">
      
      {/* Main Header Component */}
      <CourseHeader course={course} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Right Sidebar (4/12): Schedules, Reception and Exams */}
        <div className="lg:col-span-4 space-y-6">
          <WeeklySchedule course={course} />
          <ReceptionHours hours={reception_hours} courseId={course.id} />
          <ExamsList exams={exams} courseId={course.id} />
        </div>

        {/* Left Main Content (8/12): Syllabus, History and Homework */}
        <div className="lg:col-span-8 space-y-6">
          <SyllabusSection syllabus={syllabus} courseId={course.id} />
          <ClassHistory classes={classes} courseId={course.id} />
          <HomeworkList homeworks={homeworks} courseId={course.id} />
        </div>

      </div>
    </div>
  );
};

export default CoursePage;
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCourses } from '../context/CourseContext';
import api from '../api/api';
import ClassPageHeader from '../components/ClassPage/ClassPageHeader';
import ClassPageBirvouzBanner from '../components/ClassPage/ClassPageBirvouzBanner';
import ClassPageTabs from '../components/ClassPage/ClassPageTabs';
import ClassPageFileSection from '../components/ClassPage/ClassPageFileSection';
import ClassPageAISummary from '../components/ClassPage/Summary/ClassPageAISummary';
import ClassPageAIQuiz from '../components/ClassPage/Quiz/ClassPageAIQuiz';

const ClassPage = () => {
  const { courseId, classId } = useParams();
  const navigate = useNavigate();
  const { currentFullCourse, loadFullCourse } = useCourses();
  
  const [activeTab, setActiveTab] = useState('files');
  const [summaryData, setSummaryData] = useState([]);
  const [quizData, setQuizData] = useState(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  const currentClass = useMemo(() => 
    currentFullCourse?.classes.find(c => c.id === parseInt(classId))
  , [currentFullCourse?.classes, classId]);

  const { prevClass, nextClass } = useMemo(() => {
    if (!currentFullCourse?.classes || !classId) return { prevClass: null, nextClass: null };
    
    const sortedClasses = [...currentFullCourse.classes].sort((a, b) => a.number - b.number);
    const currentIndex = sortedClasses.findIndex(c => c.id === parseInt(classId));
    
    return {
      prevClass: currentIndex > 0 ? sortedClasses[currentIndex - 1] : null,
      nextClass: currentIndex < sortedClasses.length - 1 ? sortedClasses[currentIndex + 1] : null
    };
  }, [currentFullCourse?.classes, classId]);

  const fetchAiContent = useCallback(async () => {
    if (!classId) return;
    
    if (activeTab === 'summary') {
      setIsLoadingAI(true);
      try {
        const res = await api.getAiSummary(classId);
        setSummaryData(res.data || []);
      } catch (err) {
        console.error("Summary fetch error", err);
      } finally {
        setIsLoadingAI(false);
      }
    }

    if (activeTab === 'quiz') {
      setIsLoadingAI(true);
      try {
        const res = await api.getAiQuiz(classId);
        setQuizData(res.data || null);
      } catch (err) {
        console.error("Quiz fetch error", err);
      } finally {
        setIsLoadingAI(false);
      }
    }
  }, [classId, activeTab]);

  useEffect(() => {
    fetchAiContent();
  }, [fetchAiContent, classId]); 

  useEffect(() => {
    if (courseId && (!currentFullCourse || currentFullCourse.course.id !== parseInt(courseId))) {
      loadFullCourse(parseInt(courseId));
    }
  }, [courseId, loadFullCourse, currentFullCourse]);

  const handleNavigateClass = (newId) => {
    if (!newId) return;
    setSummaryData([]);
    setQuizData(null);
    navigate(`/course/${courseId}/class/${newId}`);
  };

  if (!currentClass) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-slate-500 font-bold">טוען נתוני שיעור...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 pb-20" dir="rtl">
      <ClassPageHeader 
        courseId={courseId}
        currentClass={currentClass}
        prevClass={prevClass}
        nextClass={nextClass}
        onNavigateClass={handleNavigateClass}
      />

      <ClassPageBirvouzBanner birvouz={currentClass.birvouz} />

      <div className="max-w-7xl mx-auto w-full px-4">
        <div className="flex justify-center mt-6">
          <ClassPageTabs activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
        
        <div className="mt-10">
          {activeTab === 'files' && (
            <ClassPageFileSection 
              summaryFiles={currentClass.summary}
              classId={classId}
              courseName={currentFullCourse?.course?.name}
              onRefresh={() => loadFullCourse(courseId)}
              apiBaseUrl={import.meta.env.VITE_API_URL || "http://localhost:8002"}
            />
          )}

          {activeTab === 'summary' && (
            <ClassPageAISummary 
              classId={classId}
              data={summaryData} 
              isLoading={isLoadingAI}
              onRefresh={fetchAiContent}
            />
          )}

          {activeTab === 'quiz' && (
            <ClassPageAIQuiz 
              classId={classId}
              data={quizData} 
              isLoading={isLoadingAI}
              onRefresh={fetchAiContent}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ClassPage;
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

  // Fetch AI content based on active tab
  const fetchAiContent = useCallback(async () => {
    if (!classId) return;
    
    // Summary is fetched only when tab is active to save resources
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

    // Quiz is fetched only when tab is active
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
  }, [fetchAiContent]);

  useEffect(() => {
    if (courseId && (!currentFullCourse || currentFullCourse.course.id !== parseInt(courseId))) {
      loadFullCourse(parseInt(courseId));
    }
  }, [courseId, loadFullCourse, currentFullCourse]);

  const handleNavigateClass = (newId) => {
    setSummaryData([]);
    setQuizData(null);
    navigate(`/course/${courseId}/class/${newId}`);
  };

  if (!currentClass) {
    return <div className="min-h-screen flex items-center justify-center">טוען נתונים...</div>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 pb-20" dir="rtl">
      <ClassPageHeader 
        courseId={courseId}
        currentClass={currentClass}
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
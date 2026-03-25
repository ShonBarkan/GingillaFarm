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
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFilePath, setSelectedFilePath] = useState(null);

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


  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      alert("Please upload PDF files only");
      return;
    }
    setIsUploading(true);
    try {
      await api.uploadPdf(currentFullCourse.course.name, classId, file);
      await loadFullCourse(courseId);
      e.target.value = ''; 
      console.log("Success!");
    } catch (err) {
      console.error("Upload Error:", err.response?.data || err);
      const detail = err.response?.data?.detail;
      const msg = typeof detail === 'string' ? detail : "Invalid file format or server error";
      alert(`Upload failed: ${msg}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteFile = async (path) => {
    if (!window.confirm("Delete this document?")) return;
    try {
      await api.deleteClassFile(currentFullCourse.course.name, classId, path);
      if (selectedFilePath === path) setSelectedFilePath(null);
      await loadFullCourse(courseId);
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const handleUpdateBirvouz = async (newText) => {
  try {
    const payload = {
      ...currentClass,
      birvouz: newText,
      number: parseInt(currentClass.number),
      course_id: parseInt(courseId),
      summary: Array.isArray(currentClass.summary) ? currentClass.summary : []
    };
    await api.updateClass(classId, payload);
    await loadFullCourse(courseId);
  } catch (err) {
    console.error("Failed to update birvouz", err);
    alert("Update failed. Check your connection.");
  }
};

  const fetchAiContent = useCallback(async () => {
    if (!classId) return;
    setIsLoadingAI(true);
    try {
      if (activeTab === 'summary') {
        const res = await api.getAiSummary(classId);
        setSummaryData(res.data || []);
      }
      if (activeTab === 'quiz') {
        const res = await api.getAiQuiz(classId);
        setQuizData(res.data || null);
      }
    } catch (err) {
      console.error("AI fetch error", err);
    } finally {
      setIsLoadingAI(false);
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
    setSelectedFilePath(null);
    navigate(`/course/${courseId}/class/${newId}`);
  };

  if (!currentClass) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
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

      <ClassPageBirvouzBanner birvouz={currentClass.birvouz} onUpdate={handleUpdateBirvouz} />

      <div className="max-w-7xl mx-auto w-full px-4">
        <div className="flex justify-center mt-6">
          <ClassPageTabs activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
        
        <div className="mt-10">
          {activeTab === 'files' && (
            <ClassPageFileSection 
              summaryFiles={currentClass.summary}
              selectedFilePath={selectedFilePath}
              onSelectFile={setSelectedFilePath}
              onDeleteFile={handleDeleteFile}
              isUploading={isUploading}
              handleFileUpload={handleFileUpload}
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
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCourses } from '../context/CourseContext';
import api, { uploadPdf, deleteClassFile } from '../api/api';

// Sub-components imports
import ClassPageHeader from '../components/ClassPage/ClassPageHeader';
import ClassPageBirvouzBanner from '../components/ClassPage/ClassPageBirvouzBanner';
import ClassPageTabs from '../components/ClassPage/ClassPageTabs';
import ClassPageFileSection from '../components/ClassPage/ClassPageFileSection';
import ClassPageAISummary from '../components/ClassPage/ClassPageAISummary';
import ClassPageAIQuiz from '../components/ClassPage/ClassPageAIQuiz';

const ClassPage = () => {
  const { courseId, classId } = useParams();
  const navigate = useNavigate();
  const { currentFullCourse, loadFullCourse } = useCourses();
  
  const [activeTab, setActiveTab] = useState('files');
  const [selectedFilePath, setSelectedFilePath] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8002';
  
  const currentClass = useMemo(() => 
    currentFullCourse?.classes.find(c => c.id === parseInt(classId))
  , [currentFullCourse?.classes, classId]);

// Utility: Recursive Citation Cleaner
  const cleanCitations = (data) => {
    // Standard Regex literal for
    const citeRegex = /\[(cite:.*?|\d+)\]/g;

    if (typeof data === 'string') {
      return data.replace(citeRegex, '').replace(/\s\s+/g, ' ').trim();
    }

    if (Array.isArray(data)) {
      return data.map(item => cleanCitations(item));
    }

    if (typeof data === 'object' && data !== null) {
      const cleanedObj = {};
      for (const key in data) {
        cleanedObj[key] = cleanCitations(data[key]);
      }
      return cleanedObj;
    }

    return data;
  };

  const aiSummaryData = useMemo(() => {
    if (!currentClass?.ai_summary) return [];
    try {
      return typeof currentClass.ai_summary === 'string' 
        ? JSON.parse(currentClass.ai_summary) 
        : currentClass.ai_summary;
    } catch (e) {
      console.error("Error parsing AI Summary:", e);
      return [];
    }
  }, [currentClass?.ai_summary]);

  const aiQuizData = useMemo(() => {
    if (!currentClass?.ai_quiz) return { questions: [], history: [] };
    try {
      return typeof currentClass.ai_quiz === 'string' 
        ? JSON.parse(currentClass.ai_quiz) 
        : currentClass.ai_quiz;
    } catch (e) {
      console.error("Error parsing AI Quiz:", e);
      return { questions: [], history: [] };
    }
  }, [currentClass?.ai_quiz]);

  const sortedClasses = useMemo(() => 
    [...(currentFullCourse?.classes || [])].sort((a, b) => a.number - b.number)
  , [currentFullCourse?.classes]);

  const currentIndex = sortedClasses.findIndex(c => c.id === parseInt(classId));
  const prevClass = sortedClasses[currentIndex - 1];
  const nextClass = sortedClasses[currentIndex + 1];

  const summaryFiles = useMemo(() => {
    if (!currentClass?.summary) return [];
    try {
      const parsed = typeof currentClass.summary === 'string' 
        ? JSON.parse(currentClass.summary) 
        : currentClass.summary;
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }, [currentClass?.summary]);

  useEffect(() => {
    if (classId) {
      if (!currentFullCourse || currentFullCourse.course.id !== parseInt(courseId)) {
        loadFullCourse(parseInt(courseId));
      }
    }
  }, [classId, courseId, loadFullCourse, currentFullCourse]);

  useEffect(() => {
    if (summaryFiles.length > 0 && !selectedFilePath) {
      setSelectedFilePath(summaryFiles[0]);
    }
  }, [summaryFiles, selectedFilePath]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    setIsUploading(true);
    try {
      const courseName = currentFullCourse?.course?.name || "Unknown";
      await uploadPdf(courseName, classId, formData);
      await loadFullCourse(courseId); 
    } catch (err) {
      alert("העלאה נכשלה.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteFile = async (path) => {
    if (!window.confirm("למחוק את הקובץ?")) return;
    try {
      const courseName = currentFullCourse?.course?.name || "Unknown";
      await deleteClassFile(courseName, classId, path);
      if (selectedFilePath === path) setSelectedFilePath(null);
      await loadFullCourse(courseId);
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const handleNavigateClass = (newId) => {
    setSelectedFilePath(null);
    navigate(`/course/${courseId}/class/${newId}`);
  };

  const handleUpdateAI = async (updatedFields) => {
    try {
      const { id, ...classDataWithoutId } = currentClass;

      // Clean citations recursively using the helper function
      const cleanedFields = {};
      for (const key in updatedFields) {
        cleanedFields[key] = cleanCitations(updatedFields[key]);
      }

      const payload = { 
        ...classDataWithoutId, 
        ...cleanedFields 
      };

      await api.updateClass(classId, payload); 
      await loadFullCourse(courseId); 
      alert("השינויים נשמרו בהצלחה!");
    } catch (err) {
      console.error("Failed to update AI content:", err);
      alert("השמירה נכשלה.");
    }
  };

  if (!currentClass) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="font-black text-slate-400 uppercase tracking-widest text-xs">טוען נתוני שיעור...</p>
        </div>
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
        isUploading={isUploading}
        handleFileUpload={handleFileUpload}
        onNavigateClass={handleNavigateClass}
      />

      <ClassPageBirvouzBanner birvouz={currentClass.birvouz} />

      <div className="max-w-7xl mx-auto w-full px-4">
        <ClassPageTabs 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
        />
        
        <div className="mt-8">
          {activeTab === 'files' && (
            <ClassPageFileSection 
              summaryFiles={summaryFiles}
              selectedFilePath={selectedFilePath}
              onSelectFile={setSelectedFilePath}
              onDeleteFile={handleDeleteFile}
              apiBaseUrl={apiBaseUrl}
            />
          )}

          {activeTab === 'summary' && (
            <ClassPageAISummary 
              aiSummary={aiSummaryData} 
              onUpdate={(newData) => handleUpdateAI({ ai_summary: newData })}
            />
          )}

          {activeTab === 'quiz' && (
            <ClassPageAIQuiz 
              aiQuiz={aiQuizData} 
              onUpdate={(newData) => handleUpdateAI({ ai_quiz: newData })}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ClassPage;
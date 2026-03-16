// src/pages/ClassPage.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SimpleMDE from "react-simplemde-editor";
import "easymde/dist/easymde.min.css";
import ReactMarkdown from 'react-markdown';
import { useCourses } from '../context/CourseContext';
import api from '../api/api';

const ClassPage = () => {
  const { courseId, classId } = useParams();
  const navigate = useNavigate();
  const { currentFullCourse, loadFullCourse } = useCourses();
  
  const [summary, setSummary] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState("edit"); 
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!currentFullCourse || currentFullCourse.course.id !== parseInt(courseId)) {
      loadFullCourse(parseInt(courseId));
    }
  }, [courseId, currentFullCourse, loadFullCourse]);

  const currentClass = currentFullCourse?.classes.find(c => c.id === parseInt(classId));

  useEffect(() => {
    if (currentClass) {
      const draft = localStorage.getItem(`draft_class_${classId}`);
      setSummary(draft || currentClass.summary || "");
    }
  }, [currentClass, classId]);

  const handleEditorChange = useCallback((value) => {
    setSummary(value);
    localStorage.setItem(`draft_class_${classId}`, value);
  }, [classId]);

  const mdeOptions = useMemo(() => ({
    spellChecker: false,
    autosave: { enabled: false },
    placeholder: "Write in Hebrew... start with # for headers",
    minHeight: "400px",
    status: false,
    sideBySideFullscreen: false,
    toolbar: ["bold", "italic", "heading", "|", "quote", "unordered-list", "ordered-list", "|", "link", "image", "|", "side-by-side", "fullscreen"]
  }), []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await api.updateClass(classId, { ...currentClass, summary });
      localStorage.removeItem(`draft_class_${classId}`);
      setIsEditMode(false);
    } catch (err) {
      console.error(err);
      alert("Save failed.");
    } finally {
      setIsSaving(false);
    }
  };

  const sortedClasses = [...(currentFullCourse?.classes || [])].sort((a, b) => a.number - b.number);
  const currentIndex = sortedClasses.findIndex(c => c.id === parseInt(classId));
  const prevClass = sortedClasses[currentIndex - 1];
  const nextClass = sortedClasses[currentIndex + 1];

  if (!currentClass) return <div className="p-10 text-center font-bold">טוען נתוני שיעור...</div>;

  return (
    <div className="max-w-7xl mx-auto flex flex-col h-[calc(100vh-80px)] bg-white" dir="rtl">
      
      <header className="bg-white border-b border-slate-200 p-4 md:p-6 shadow-sm z-20">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(`/course/${courseId}`)} className="text-slate-400 hover:text-blue-600 transition p-1">
              <span className="text-2xl">→</span>
            </button>
            <div className="flex items-center bg-slate-100 rounded-xl p-1">
               <button 
                 disabled={!prevClass}
                 onClick={() => navigate(`/course/${courseId}/class/${prevClass.id}`)}
                 className={`p-2 rounded-lg ${!prevClass ? 'text-slate-300' : 'text-slate-600 hover:bg-white shadow-sm'}`}
               >
                 <span className="text-xl">‹</span>
               </button>
               <button 
                 disabled={!nextClass}
                 onClick={() => navigate(`/course/${courseId}/class/${nextClass.id}`)}
                 className={`p-2 rounded-lg ${!nextClass ? 'text-slate-300' : 'text-slate-600 hover:bg-white shadow-sm'}`}
               >
                 <span className="text-xl">›</span>
               </button>
            </div>
          </div>
          
          <div className="flex gap-2">
            {!isEditMode ? (
              <button onClick={() => setIsEditMode(true)} className="bg-blue-50 text-blue-600 px-5 py-2 rounded-xl font-bold text-sm border border-blue-100">
                ערוך סיכום
              </button>
            ) : (
              <>
                <button onClick={() => setIsEditMode(false)} className="bg-slate-100 text-slate-500 px-5 py-2 rounded-xl font-bold text-sm">
                  ביטול
                </button>
                <button onClick={handleSave} disabled={isSaving} className="bg-slate-900 text-white px-5 py-2 rounded-xl font-bold text-sm shadow-lg active:scale-95 transition">
                  {isSaving ? 'שומר...' : 'שמור'}
                </button>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-black text-slate-800 leading-none">שיעור #{currentClass.number}</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
            {currentClass.date_taken} | בניין {currentClass.location_building} חדר {currentClass.location_room} | <span className="text-blue-500">{currentClass.class_type}</span>
          </p>
        </div>
      </header>

      <main className="flex-1 overflow-hidden flex flex-col bg-slate-50/30">
        {!isEditMode ? (
          <div className="flex-1 overflow-y-auto p-6 md:p-12">
            <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-slate-100">
              {/* Preview with forced RTL and typography classes */}
              <div className="prose prose-slate prose-rtl prose-blue lg:prose-lg markdown-body" dir="rtl">
                <ReactMarkdown>
                  {summary || "_אין עדיין סיכום לשיעור זה._"}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col flex-1 overflow-hidden">
            <div className="flex md:hidden border-b bg-white">
              <button onClick={() => setActiveTab('edit')} className={`flex-1 py-3 text-xs font-black ${activeTab === 'edit' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-slate-400'}`}>
                כתיבה
              </button>
              <button onClick={() => setActiveTab('preview')} className={`flex-1 py-3 text-xs font-black ${activeTab === 'preview' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-slate-400'}`}>
                תצוגה מקדימה
              </button>
            </div>

            <div className="flex flex-1 overflow-hidden">
              {/* Editor wrapper with explicit RTL */}
              <div className={`flex-1 overflow-y-auto p-4 md:p-6 bg-white border-l border-slate-100 ${activeTab === 'edit' ? 'block' : 'hidden md:block'}`} dir="rtl">
                <SimpleMDE value={summary} onChange={handleEditorChange} options={mdeOptions} />
              </div>

              {/* Live Preview Panel */}
              <div className={`flex-1 overflow-y-auto p-6 md:p-10 bg-slate-50/50 ${activeTab === 'preview' ? 'block' : 'hidden md:block'}`}>
                <div className="prose prose-slate prose-rtl prose-blue max-w-none markdown-body" dir="rtl">
                  <ReactMarkdown>{summary || "*התוכן ריק...*"}</ReactMarkdown>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ClassPage;
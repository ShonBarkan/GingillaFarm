import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCourses } from '../context/CourseContext';
import { uploadPdf, deleteClassFile } from '../api/api';

const ClassPage = () => {
  const { courseId, classId } = useParams();
  const navigate = useNavigate();
  const { currentFullCourse, loadFullCourse } = useCourses();
  
  const [selectedFilePath, setSelectedFilePath] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8002';
  const currentClass = currentFullCourse?.classes.find(c => c.id === parseInt(classId));

  // Safe parsing of the summary JSON string into an array
  const summaryFiles = useMemo(() => {
    if (!currentClass?.summary) return [];
    try {
      const parsed = typeof currentClass.summary === 'string' 
        ? JSON.parse(currentClass.summary) 
        : currentClass.summary;
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error("Failed to parse summary array", e);
      return [];
    }
  }, [currentClass?.summary]);

  // Lesson Navigation Logic
  const sortedClasses = [...(currentFullCourse?.classes || [])].sort((a, b) => a.number - b.number);
  const currentIndex = sortedClasses.findIndex(c => c.id === parseInt(classId));
  const prevClass = sortedClasses[currentIndex - 1];
  const nextClass = sortedClasses[currentIndex + 1];

  useEffect(() => {
    if (classId) {
      if (!currentFullCourse || currentFullCourse.course.id !== parseInt(courseId)) {
        loadFullCourse(parseInt(courseId));
      }
    }
  }, [classId, courseId]);

  // Auto-select the first file if none is selected
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
      alert("Upload failed. Verify backend connection.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (path) => {
    if (!window.confirm("Delete this file?")) return;
    try {
      const courseName = currentFullCourse?.course?.name || "Unknown";
      await deleteClassFile(courseName, classId, path);
      if (selectedFilePath === path) setSelectedFilePath(null);
      await loadFullCourse(courseId);
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  if (!currentClass) return <div className="p-10 text-center font-bold text-slate-400 uppercase">Loading Lesson Data...</div>;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 pb-20" dir="rtl">
      
      {/* 1. Navigation Header */}
      <header className="bg-white border-b border-slate-200 p-4 shadow-sm z-40 top-0">
        <div className="max-w-7xl mx-auto grid grid-cols-3 items-center">
          <div className="flex justify-start">
            <button onClick={() => navigate(`/course/${courseId}`)} className="text-slate-400 hover:text-blue-600 transition p-1 text-2xl">
              →
            </button>
          </div>

          <div className="flex items-center justify-center gap-4 md:gap-8">
            <button 
              disabled={!prevClass}
              onClick={() => { setSelectedFilePath(null); navigate(`/course/${courseId}/class/${prevClass.id}`); }}
              className={`p-2 rounded-full transition ${!prevClass ? 'text-slate-200 cursor-not-allowed' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              <span className="text-2xl">‹</span>
            </button>

            <div className="text-center">
              <h1 className="text-lg md:text-xl font-black text-slate-800 leading-none">
                {currentClass.name || `שיעור #${currentClass.number}`}
              </h1>
              <p className="text-[9px] md:text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-widest">
                שיעור #{currentClass.number} | {currentClass.date_taken} | {currentClass.class_type}
              </p>
            </div>

            <button 
              disabled={!nextClass}
              onClick={() => { setSelectedFilePath(null); navigate(`/course/${courseId}/class/${nextClass.id}`); }}
              className={`p-2 rounded-full transition ${!nextClass ? 'text-slate-200 cursor-not-allowed' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              <span className="text-2xl">›</span>
            </button>
          </div>

          <div className="flex justify-end">
            <label className="bg-blue-600 text-white px-5 py-2 rounded-xl font-bold text-xs cursor-pointer active:scale-95 transition shadow-lg hover:bg-blue-700">
              {isUploading ? 'מעלה...' : '+ הוסף PDF'}
              <input type="file" accept="application/pdf" className="hidden" onChange={handleFileUpload} disabled={isUploading} />
            </label>
          </div>
        </div>
      </header>

      {/* 2. Centered Birvouz Bar */}
      {currentClass.birvouz && (
        <div className="bg-amber-50/50 border-y border-amber-100 py-10 px-6 my-6 shadow-sm">
          <div className="max-w-3xl mx-auto flex flex-col items-center text-center gap-4">
            <div className="flex items-center gap-4">
              <div className="h-[1px] w-12 bg-amber-200"></div>
              <h2 className="text-amber-600 text-[12px] font-black uppercase tracking-[0.4em] flex items-center gap-2">
                בירווז 🦆
              </h2>
              <div className="h-[1px] w-12 bg-amber-200"></div>
            </div>
            <p className="text-xl md:text-2xl font-bold text-amber-900 leading-relaxed italic">
              "{currentClass.birvouz}"
            </p>
          </div>
        </div>
      )}

      {/* 3. Main Flex Area */}
      <div className="max-w-7xl mx-auto w-full px-4 flex flex-col md:flex-row gap-6">
        
        {/* Sidebar: File Selection */}
        <aside className="w-full md:w-64 shrink-0">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden sticky top-24">
            <div className="p-4 bg-slate-50 border-b">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">מסמכי השיעור ({summaryFiles.length})</p>
            </div>
            <div className="p-2 space-y-1">
              {summaryFiles.map((path, idx) => {
                const fileName = path.split('/').pop().replace(/^\d+_/, '');
                return (
                  <div 
                    key={idx}
                    onClick={() => setSelectedFilePath(path)}
                    className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border ${
                      selectedFilePath === path ? 'bg-blue-50 border-blue-100 text-blue-700 shadow-sm' : 'border-transparent hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-lg">📄</span>
                      <span className="text-xs font-bold truncate max-w-[130px]">{fileName}</span>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDelete(path); }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-red-400 hover:text-red-600 transition"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </button>
                  </div>
                );
              })}
              {summaryFiles.length === 0 && (
                <div className="p-8 text-center text-slate-300 text-[10px] font-bold uppercase">אין קבצים</div>
              )}
            </div>
          </div>
        </aside>

        {/* PDF Viewer */}
        <main className="flex-1 min-w-0 pb-10">
          {selectedFilePath ? (
            <div className="w-full bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
              <iframe 
                src={`${apiBaseUrl}/pdf-files/${selectedFilePath}#toolbar=1`} 
                className="w-full border-none" 
                title="Class PDF Viewer"
                style={{ height: '2500px', minHeight: '1200px' }} 
              />
            </div>
          ) : (
            <div className="min-h-[500px] flex flex-col items-center justify-center text-slate-400 bg-white rounded-3xl border-2 border-dashed border-slate-200">
              <span className="text-5xl mb-4">📂</span>
              <p className="font-black text-sm uppercase tracking-widest">בחר קובץ להצגה מהצד</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ClassPage;
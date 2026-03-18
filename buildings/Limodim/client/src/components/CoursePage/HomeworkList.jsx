import React, { useState, useEffect, useRef } from 'react';
import api from '../../api/api';
import { useCourses } from '../../context/CourseContext';
import HomeworkItem from './HomeworkList/HomeworkItem';
import AddHomeworkForm from './HomeworkList/AddHomeworkForm';

const HomeworkList = ({ homeworks, courseId }) => {
  const { loadFullCourse } = useCourses();
  const [isManageMode, setIsManageMode] = useState(false);
  const [sortOrder, setSortOrder] = useState('asc');
  
  const [localHomeworks, setLocalHomeworks] = useState(homeworks || []);
  const isInternalUpdate = useRef(false);

  useEffect(() => {
    if (isInternalUpdate.current) {
      isInternalUpdate.current = false;
      return;
    }
    setLocalHomeworks(homeworks || []);
  }, [homeworks]);

  const sortedHomeworks = [...localHomeworks].sort((a, b) => {
    if (!a.due_date) return 1;
    if (!b.due_date) return -1;
    const dateA = new Date(a.due_date);
    const dateB = new Date(b.due_date);
    return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
  });

  const handleUpdate = async (id, updatedData) => {
    isInternalUpdate.current = true;
    setLocalHomeworks(prev => prev.map(h => h.id === id ? updatedData : h));
    
    try {
      await api.updateHomework(id, updatedData);
    } catch (err) {
      console.error("Update failed:", err);
      setLocalHomeworks(homeworks);
    }
  };

  const handleToggleDone = async (hw) => {
    const updated = { ...hw, is_done: !hw.is_done };
    isInternalUpdate.current = true;
    setLocalHomeworks(prev => prev.map(h => h.id === hw.id ? updated : h));

    try {
      await api.updateHomework(hw.id, updated);
    } catch (err) {
      console.error("Toggle failed:", err);
      setLocalHomeworks(homeworks);
    }
  };

  const handleAdd = async (newHwData) => {
    try {
      const res = await api.createHomework({ ...newHwData, course_id: courseId });

      const newItem = res.data?.data || res.data;

      if (newItem) {
        isInternalUpdate.current = true;
        setLocalHomeworks(prev => [...prev, newItem]);
        loadFullCourse(courseId);
      }
    } catch (err) {
      console.error("Add failed:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("למחוק מטלה זו?")) return;
    isInternalUpdate.current = true;
    setLocalHomeworks(prev => prev.filter(h => h.id !== id));

    try {
      await api.deleteHomework(id);
    } catch (err) {
      console.error("Delete failed:", err);
      setLocalHomeworks(homeworks);
    }
  };

  return (
    <section className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-100">
      <div className="flex justify-between items-center mb-6 border-b pb-3">
        <h3 className="text-lg md:text-xl font-bold text-slate-800 flex items-center gap-2">
          <span className="w-1.5 h-6 bg-blue-500 rounded-full"></span> 
          מטלות להגשה
        </h3>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors"
          >
            <svg className={`w-4 h-4 transition-transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
            </svg>
          </button>
          <button 
            onClick={() => {
                if (isManageMode) loadFullCourse(courseId);
                setIsManageMode(!isManageMode);
            }}
            className={`text-[11px] md:text-xs font-bold px-3 py-1.5 rounded-lg border transition-all active:scale-95 ${
              isManageMode ? 'bg-slate-800 text-white border-slate-800' : 'text-blue-600 border-blue-50 bg-blue-50/30'
            }`}
          >
            {isManageMode ? 'סיום ושמירה' : 'ניהול מטלות'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
        {sortedHomeworks.map((hw) => (
          <HomeworkItem
            key={hw.id} 
            hw={hw} 
            isManageMode={isManageMode}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            onToggleDone={handleToggleDone}
          />
        ))}
        {isManageMode && <AddHomeworkForm onAdd={handleAdd} />}
      </div>
    </section>
  );
};

export default HomeworkList;
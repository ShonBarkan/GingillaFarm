import React, { useState, useMemo } from 'react';
import api from '../../api/api';
import { useCourses } from '../../context/CourseContext';
import ClassHistoryFilters from './ClassHistory/ClassHistoryFilters';
import ClassHistoryAddForm from './ClassHistory/ClassHistoryAddForm';
import ClassHistoryCard from './ClassHistory/ClassHistoryCard';

const ClassHistory = ({ classes, courseId }) => {
  const { loadFullCourse } = useCourses();
  
  // States
  const [isAdding, setIsAdding] = useState(false);
  const [editingCardId, setEditingCardId] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState([]); 
  const [sortOrder, setSortOrder] = useState('Newest');
  
  // Updated newClass to include 'name'
  const [newClass, setNewClass] = useState({
    number: (classes?.length || 0) + 1,
    name: '', // <--- New Field
    date_taken: new Date().toISOString().split('T')[0],
    birvouz: '',
    location_building: '',
    location_room: '',
    time: '',
    class_type: 'הרצאה'
  });

  // Extract unique class types for filtering
  const allAvailableTypes = useMemo(() => {
    const types = classes?.map(cls => cls.class_type).filter(Boolean) || [];
    return [...new Set(types)];
  }, [classes]);

  const handleTypeToggle = (type) => {
    setSelectedTypes(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  // API Call Handlers
  const handleUpdate = async (classId, updatedData) => {
    try {
      await api.updateClass(classId, updatedData);
      await loadFullCourse(courseId);
    } catch (err) {
      console.error("Failed to update class log:", err);
    }
  };

  const handleAdd = async () => {
    try {
      await api.createClass({ ...newClass, course_id: courseId });
      
      // Reset state with incremented number and empty name
      setNewClass({
        number: (classes?.length || 0) + 2,
        name: '', // <--- Reset Field
        date_taken: new Date().toISOString().split('T')[0],
        birvouz: '',
        location_building: '',
        location_room: '',
        time: '',
        class_type: 'הרצאה'
      });
      
      setIsAdding(false);
      await loadFullCourse(courseId);
    } catch (err) {
      console.error("Failed to add class log:", err);
    }
  };

  const handleDelete = async (classId) => {
    if (window.confirm("האם למחוק את תיעוד השיעור הזה מהחווה?")) {
      try {
        await api.deleteClass(classId);
        await loadFullCourse(courseId);
      } catch (err) {
        console.error("Failed to delete class log:", err);
      }
    }
  };

  // Processing list for UI
  const processedClasses = (classes || [])
    .filter(cls => selectedTypes.length === 0 || selectedTypes.includes(cls.class_type))
    .sort((a, b) => {
      const dateA = new Date(a.date_taken);
      const dateB = new Date(b.date_taken);
      return sortOrder === 'Newest' ? dateB - dateA : dateA - dateB;
    });

  return (
    <section className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-100">

      {/* Header */}
      <div className="flex justify-between items-center mb-6 border-b pb-3">
        <div className="flex items-center gap-3">
          <h3 className="text-lg md:text-xl font-bold text-slate-800">היסטוריית שיעורים</h3>
          <button 
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`p-1.5 rounded-lg transition-all ${isFilterOpen ? 'bg-slate-800 text-white shadow-md' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
          >
            <svg 
              className={`w-4 h-4 transition-transform duration-300 ${isFilterOpen ? 'rotate-180' : ''}`} 
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path d="M19 9l-7 7-7-7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <button 
          onClick={() => setIsAdding(!isAdding)}
          className={`text-[11px] md:text-xs font-bold px-4 py-2 rounded-full transition active:scale-95 ${
            isAdding 
              ? 'bg-slate-800 text-white shadow-lg' 
              : 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100'
          }`}
        >
          {isAdding ? 'ביטול הוספה' : '+ הוסף שיעור חדש'}
        </button>
      </div>

      <ClassHistoryFilters
        isFilterOpen={isFilterOpen}
        allAvailableTypes={allAvailableTypes}
        selectedTypes={selectedTypes}
        handleTypeToggle={handleTypeToggle}
        setSelectedTypes={setSelectedTypes}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
      />

      {isAdding && (
        <ClassHistoryAddForm 
          newClass={newClass}
          setNewClass={setNewClass}
          handleAdd={handleAdd}
        />
      )}

      {/* Render processed class cards */}
      <div className="space-y-6">
        {processedClasses.length > 0 ? processedClasses.map((cls) => (
          <ClassHistoryCard
            key={cls.id}
            cls={cls}
            isEditing={editingCardId === cls.id}
            setEditingCardId={setEditingCardId}
            courseId={courseId}
            handleUpdate={handleUpdate}
            handleDelete={handleDelete}
          />
        )) : (
          <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400 italic text-sm">
            לא נמצאו שיעורים התואמים את הסינון.
          </div>
        )}
      </div>
    </section>
  );
};

export default ClassHistory;
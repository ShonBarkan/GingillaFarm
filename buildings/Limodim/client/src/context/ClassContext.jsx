import React, { createContext, useContext, useState } from 'react';
import api from '../api/api';
import { useCourses } from './CourseContext'; // Import to allow refreshing the full view

const ClassContext = createContext();

export const ClassProvider = ({ children }) => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const { loadFullCourse, currentFullCourse } = useCourses();

  // Helper to refresh current view if we are inside a specific course dashboard
  const refreshIfActive = async (courseId) => {
    if (currentFullCourse?.course?.id === courseId) {
      await loadFullCourse(courseId);
    }
  };

  // --- Actions ---

  const fetchClasses = async (courseId = null) => {
    setLoading(true);
    try {
      const response = await api.getClasses(courseId);
      setClasses(response.data.data || []);
    } catch (err) {
      setError("Failed to fetch classes");
    } finally {
      setLoading(false);
    }
  };

  const addClass = async (classData) => {
    try {
      await api.createClass(classData);
      await refreshIfActive(classData.course_id);
    } catch (err) {
      setError("Failed to create class");
    }
  };

  const editClass = async (classId, classData) => {
    try {
      await api.updateClass(classId, classData);
      await refreshIfActive(classData.course_id);
    } catch (err) {
      setError("Failed to update class");
    }
  };

  const removeClass = async (classId, courseId = null) => {
    try {
      await api.deleteClass(classId);
      setClasses(prev => prev.filter(c => c.id !== classId));
      if (courseId) {
        await refreshIfActive(courseId);
      }
    } catch (err) {
      setError("Failed to delete class");
    }
  };

  const value = {
    classes,
    loading,
    error,
    fetchClasses,
    addClass,
    editClass,
    removeClass
  };

  return (
    <ClassContext.Provider value={value}>
      {children}
    </ClassContext.Provider>
  );
};

export const useClasses = () => {
  const context = useContext(ClassContext);
  if (!context) {
    throw new Error('useClasses must be used within a ClassProvider');
  }
  return context;
};
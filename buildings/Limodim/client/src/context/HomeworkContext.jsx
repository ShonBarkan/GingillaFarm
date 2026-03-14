import React, { createContext, useContext, useState } from 'react';
import api from '../api/api';
import { useCourses } from './CourseContext'; 

const HomeworkContext = createContext();

export const HomeworkProvider = ({ children }) => {
  const [homeworks, setHomeworks] = useState([]);
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

  // Fetch homeworks - can be filtered by courseId
  const fetchHomeworks = async (courseId = null) => {
    setLoading(true);
    try {
      const response = await api.getHomeworks(courseId);
      setHomeworks(response.data.data || []);
    } catch (err) {
      setError("Failed to fetch homeworks");
    } finally {
      setLoading(false);
    }
  };

  // Create new homework
  const addHomework = async (hwData) => {
    try {
      await api.createHomework(hwData);
      await refreshIfActive(hwData.course_id);
      // Optional: if we are in a global homeworks view, refresh the list
      await fetchHomeworks(hwData.course_id); 
    } catch (err) {
      setError("Failed to create homework");
    }
  };

  // Update existing homework
  const editHomework = async (hwId, hwData) => {
    try {
      await api.updateHomework(hwId, hwData);
      await refreshIfActive(hwData.course_id);
    } catch (err) {
      setError("Failed to update homework");
    }
  };

  // Delete homework
  const removeHomework = async (hwId, courseId = null) => {
    try {
      await api.deleteHomework(hwId);
      setHomeworks(prev => prev.filter(h => h.id !== hwId));
      if (courseId) {
        await refreshIfActive(courseId);
      }
    } catch (err) {
      setError("Failed to delete homework");
    }
  };

  const value = {
    homeworks,
    loading,
    error,
    fetchHomeworks,
    addHomework,
    editHomework,
    removeHomework
  };

  return (
    <HomeworkContext.Provider value={value}>
      {children}
    </HomeworkContext.Provider>
  );
};

export const useHomeworks = () => {
  const context = useContext(HomeworkContext);
  if (!context) {
    throw new Error('useHomeworks must be used within a HomeworkProvider');
  }
  return context;
};
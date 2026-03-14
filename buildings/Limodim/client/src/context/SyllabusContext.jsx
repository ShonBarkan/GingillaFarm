import React, { createContext, useContext, useState } from 'react';
import api from '../api/api';
import { useCourses } from './CourseContext'; 

const SyllabusContext = createContext();

export const SyllabusProvider = ({ children }) => {
  const [syllabus, setSyllabus] = useState([]);
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

  const fetchSyllabus = async (courseId = null) => {
    setLoading(true);
    try {
      const response = await api.getSyllabus(courseId);
      // Sorting by topic_num to ensure logical order in the UI
      const sortedData = (response.data.data || []).sort((a, b) => a.topic_num - b.topic_num);
      setSyllabus(sortedData);
    } catch (err) {
      setError("Failed to fetch syllabus topics");
    } finally {
      setLoading(false);
    }
  };

  const addSyllabusTopic = async (topicData) => {
    try {
      await api.createSyllabusTopic(topicData);
      await refreshIfActive(topicData.course_id);
    } catch (err) {
      setError("Failed to create syllabus topic");
    }
  };

  const editSyllabusTopic = async (topicId, topicData) => {
    try {
      await api.updateSyllabusTopic(topicId, topicData);
      await refreshIfActive(topicData.course_id);
    } catch (err) {
      setError("Failed to update syllabus topic");
    }
  };

  const removeSyllabusTopic = async (topicId, courseId = null) => {
    try {
      await api.deleteSyllabusTopic(topicId);
      setSyllabus(prev => prev.filter(t => t.id !== topicId));
      if (courseId) {
        await refreshIfActive(courseId);
      }
    } catch (err) {
      setError("Failed to delete syllabus topic");
    }
  };

  const value = {
    syllabus,
    loading,
    error,
    fetchSyllabus,
    addSyllabusTopic,
    editSyllabusTopic,
    removeSyllabusTopic
  };

  return (
    <SyllabusContext.Provider value={value}>
      {children}
    </SyllabusContext.Provider>
  );
};

export const useSyllabus = () => {
  const context = useContext(SyllabusContext);
  if (!context) {
    throw new Error('useSyllabus must be used within a SyllabusProvider');
  }
  return context;
};
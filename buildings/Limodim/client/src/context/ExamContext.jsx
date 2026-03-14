import React, { createContext, useContext, useState } from 'react';
import api from '../api/api';
import { useCourses } from './CourseContext'; 

const ExamContext = createContext();

export const ExamProvider = ({ children }) => {
  const [exams, setExams] = useState([]);
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

  const fetchExams = async (courseId = null) => {
    setLoading(true);
    try {
      const response = await api.getExams(courseId);
      setExams(response.data.data || []);
    } catch (err) {
      setError("Failed to fetch exams");
    } finally {
      setLoading(false);
    }
  };

  const addExam = async (examData) => {
    try {
      await api.createExam(examData);
      await refreshIfActive(examData.course_id);
    } catch (err) {
      setError("Failed to create exam");
    }
  };

  const editExam = async (examId, examData) => {
    try {
      await api.updateExam(examId, examData);
      await refreshIfActive(examData.course_id);
    } catch (err) {
      setError("Failed to update exam");
    }
  };

  const removeExam = async (examId, courseId = null) => {
    try {
      await api.deleteExam(examId);
      setExams(prev => prev.filter(e => e.id !== examId));
      if (courseId) {
        await refreshIfActive(courseId);
      }
    } catch (err) {
      setError("Failed to delete exam");
    }
  };

  const value = {
    exams,
    loading,
    error,
    fetchExams,
    addExam,
    editExam,
    removeExam
  };

  return (
    <ExamContext.Provider value={value}>
      {children}
    </ExamContext.Provider>
  );
};

export const useExams = () => {
  const context = useContext(ExamContext);
  if (!context) {
    throw new Error('useExams must be used within an ExamProvider');
  }
  return context;
};
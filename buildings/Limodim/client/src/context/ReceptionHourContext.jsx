import React, { createContext, useContext, useState } from 'react';
import api from '../api/api';
import { useCourses } from './CourseContext'; 

const ReceptionHourContext = createContext();

export const ReceptionHourProvider = ({ children }) => {
  const [receptionHours, setReceptionHours] = useState([]);
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

  const fetchReceptionHours = async (courseId = null) => {
    setLoading(true);
    try {
      const response = await api.getReceptionHours(courseId);
      setReceptionHours(response.data.data || []);
    } catch (err) {
      setError("Failed to fetch reception hours");
    } finally {
      setLoading(false);
    }
  };

  const addReceptionHour = async (rhData) => {
    try {
      await api.createReceptionHour(rhData);
      await refreshIfActive(rhData.course_id);
    } catch (err) {
      setError("Failed to create reception hour");
    }
  };

  const editReceptionHour = async (rhId, rhData) => {
    try {
      await api.updateReceptionHour(rhId, rhData);
      await refreshIfActive(rhData.course_id);
    } catch (err) {
      setError("Failed to update reception hour");
    }
  };

  const removeReceptionHour = async (rhId, courseId = null) => {
    try {
      await api.deleteReceptionHour(rhId);
      setReceptionHours(prev => prev.filter(rh => rh.id !== rhId));
      if (courseId) {
        await refreshIfActive(courseId);
      }
    } catch (err) {
      setError("Failed to delete reception hour");
    }
  };

  const value = {
    receptionHours,
    loading,
    error,
    fetchReceptionHours,
    addReceptionHour,
    editReceptionHour,
    removeReceptionHour
  };

  return (
    <ReceptionHourContext.Provider value={value}>
      {children}
    </ReceptionHourContext.Provider>
  );
};

export const useReceptionHours = () => {
  const context = useContext(ReceptionHourContext);
  if (!context) {
    throw new Error('useReceptionHours must be used within a ReceptionHourProvider');
  }
  return context;
};
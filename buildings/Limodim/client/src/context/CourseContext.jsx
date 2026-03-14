import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/api';

const CourseContext = createContext();

export const CourseProvider = ({ children }) => {
  const [courses, setCourses] = useState([]);
  const [currentFullCourse, setCurrentFullCourse] = useState(null);
  const [healthStatus, setHealthStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Initial check and fetch
  useEffect(() => {
    checkServerHealth();
    fetchCourses();
  }, []);

  // --- Infrastructure ---
  const checkServerHealth = async () => {
    try {
      const response = await api.checkHealth();
      setHealthStatus(response.data.status);
    } catch (err) {
      setHealthStatus("offline");
      setError("Limodim Server is unreachable");
    }
  };

  // --- Course CRUD Logic ---

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const response = await api.getCourses();
      setCourses(response.data.data || []);
    } catch (err) {
      setError("Failed to fetch courses list");
    } finally {
      setLoading(false);
    }
  };

  const loadFullCourse = async (courseId) => {
    setLoading(true);
    try {
      const response = await api.getFullCourse(courseId);
      setCurrentFullCourse(response.data);
      return response.data;
    } catch (err) {
      setError(`Failed to load full data for course ${courseId}`);
    } finally {
      setLoading(false);
    }
  };

  const addCourse = async (courseData) => {
    try {
      await api.createCourse(courseData);
      await fetchCourses();
    } catch (err) {
      setError("Failed to create new course");
    }
  };

  const editCourse = async (courseId, courseData) => {
    try {
      await api.updateCourse(courseId, courseData);
      await fetchCourses();
      // If we are currently looking at this course, refresh it
      if (currentFullCourse?.course?.id === courseId) {
        await loadFullCourse(courseId);
      }
    } catch (err) {
      setError("Failed to update course");
    }
  };

  const removeCourse = async (courseId) => {
    try {
      await api.deleteCourse(courseId);
      setCourses(prev => prev.filter(c => c.id !== courseId));
      if (currentFullCourse?.course?.id === courseId) {
        setCurrentFullCourse(null);
      }
    } catch (err) {
      setError("Failed to delete course");
    }
  };

  const value = {
    courses,
    currentFullCourse,
    healthStatus,
    loading,
    error,
    setError,
    fetchCourses,
    loadFullCourse,
    addCourse,
    editCourse,
    removeCourse
  };

  return (
    <CourseContext.Provider value={value}>
      {children}
    </CourseContext.Provider>
  );
};

export const useCourses = () => {
  const context = useContext(CourseContext);
  if (!context) {
    throw new Error('useCourses must be used within a CourseProvider');
  }
  return context;
};
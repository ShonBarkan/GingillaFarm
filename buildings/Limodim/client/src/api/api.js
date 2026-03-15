import axios from 'axios';
// Create an axios instance with the base URL of your Limodim server
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8002',
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- Health Check ---
export const checkHealth = () => api.get('/health');

// --- Courses ---
export const getFullCourse = (courseId) => api.get(`/full-course/${courseId}`);

export const getCourses = () => api.get('/courses');

export const createCourse = (courseData) => api.post('/courses', courseData);

export const updateCourse = (courseId, courseData) => 
  api.put(`/courses/${courseId}`, courseData);

export const deleteCourse = (courseId) => api.delete(`/courses/${courseId}`);

// --- Classes ---
export const getClasses = (courseId = null) => 
  api.get('/classes', { params: courseId ? { course_id: courseId } : {} });

export const createClass = (classData) => api.post('/classes', classData);

export const updateClass = (classId, classData) => 
  api.put(`/classes/${classId}`, classData);

export const deleteClass = (classId) => api.delete(`/classes/${classId}`);

// --- Homeworks ---
export const getHomeworks = (courseId = null) => 
  api.get('/homeworks', { params: courseId ? { course_id: courseId } : {} });

export const createHomework = (hwData) => api.post('/homeworks', hwData);

export const updateHomework = (hwId, hwData) => 
  api.put(`/homeworks/${hwId}`, hwData);

export const deleteHomework = (hwId) => api.delete(`/homeworks/${hwId}`);

// --- Reception Hours ---
export const getReceptionHours = (courseId = null) => 
  api.get('/reception-hours', { params: courseId ? { course_id: courseId } : {} });

export const createReceptionHour = (rhData) => api.post('/reception-hours', rhData);

export const updateReceptionHour = (rhId, rhData) => 
  api.put(`/reception-hours/${rhId}`, rhData);

export const deleteReceptionHour = (rhId) => api.delete(`/reception-hours/${rhId}`);

// --- Exams ---
export const getExams = (courseId = null) => 
  api.get('/exams', { params: courseId ? { course_id: courseId } : {} });

export const createExam = (examData) => api.post('/exams', examData);

export const updateExam = (examId, examData) => 
  api.put(`/exams/${examId}`, examData);

export const deleteExam = (examId) => api.delete(`/exams/${examId}`);

// --- Syllabus ---
export const getSyllabus = (courseId = null) => 
  api.get('/syllabus', { params: courseId ? { course_id: courseId } : {} });

export const createSyllabusTopic = (topicData) => api.post('/syllabus', topicData);

export const updateSyllabusTopic = (topicId, topicData) => 
  api.put(`/syllabus/${topicId}`, topicData);

export const deleteSyllabusTopic = (topicId) => api.delete(`/syllabus/${topicId}`);

// --- Timeline ---
export const getTimeline = () => api.get('/timeline');


export default {
  checkHealth,
  createCourse,
  getFullCourse,
  getClasses,
  createClass,
  updateClass,
  deleteClass,
  getHomeworks,
  createHomework,
  updateHomework,
  deleteHomework,
  getReceptionHours,
  createReceptionHour,
  updateReceptionHour,
  deleteReceptionHour,
  getExams,
  createExam,
  updateExam,
  deleteExam,
  getSyllabus,
  createSyllabusTopic,
  updateSyllabusTopic,
  deleteSyllabusTopic,
  getCourses,
  updateCourse,
  deleteCourse,
  getTimeline,
};
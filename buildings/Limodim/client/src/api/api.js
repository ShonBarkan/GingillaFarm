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
export const getClasses = (courseId = null) => api.get('/classes', { params: courseId ? { course_id: courseId } : {} });

export const createClass = (classData) => api.post('/classes', classData);

export const updateClass = (classId, classData) => api.put(`/classes/${classId}`, classData);

export const deleteClass = (classId) => api.delete(`/classes/${classId}`);

// --- AI Summary ---
export const getAiSummary = (classId) => api.get(`/classes/${classId}/ai-summary`);
export const upsertSummaryTopic = (topicData) => api.post(`/ai-summary`, topicData);
export const updateSummaryTopic = (topicId, topicData) => api.put(`/ai-summary/${topicId}`, topicData);
export const deleteSummaryTopic = (topicId) => api.delete(`/ai-summary/${topicId}`);
export const updateSummaryStatus = (topicId, status) => api.patch(`/ai-summary/${topicId}/status`, status);

// --- AI Quiz ---
export const upsertQuiz = (quizData) => api.post(`/ai-quizzes`, quizData);
export const getAiQuiz = (classId) => api.get(`/classes/${classId}/ai-quiz`);
export const submitQuizAttempt = (quizId, scoreData) => api.post(`/ai-quizzes/${quizId}/attempt`, scoreData);
export const saveQuizQuestion = (questionData) => api.post(`/ai-quiz/question`, questionData);
export const updateQuestionStats = (questionId, isCorrect) => 
  api.post(`/ai-quiz/question/${questionId}/stats`, { is_correct: isCorrect });
export const deleteQuizQuestion = (questionId) => api.delete(`/ai-quiz/question/${questionId}`);

// --- Class Files (PDF Management) ---

export const uploadPdf = (courseName, classId, formData) => {
  const encodedName = encodeURIComponent(courseName);
  return api.post(`/upload-pdf/${encodedName}/${classId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const deleteClassFile = (courseName, classId, filePath) => {
  const encodedName = encodeURIComponent(courseName);
  return api.post(`/delete-class-file/${encodedName}/${classId}`, { 
    file_path: filePath 
  });
};

export const getClassSummary = (classId) => api.get(`/class-summary/${classId}`);

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

// --- Timeline & Dashboard ---
export const getTimelineFutureClasses = () => api.get('/timeline/future-classes');
export const getTimelinePastClasses = () => api.get('/timeline/past-classes');
export const getTimelineFutureExams = () => api.get('/timeline/future-exams');
export const getTimelineReceptionHours = () => api.get('/timeline/reception-hours');
export const getTimelineDueHomework = () => api.get('/timeline/due-homework');

// --- Stats ---
export const getMissingSummaries = () => api.get(`/classes/missing-summaries`);


export default {
  checkHealth,
  createCourse,
  getFullCourse,
  getClasses,
  createClass,
  updateClass,
  deleteClass,
  deleteClassFile,
  uploadPdf,
  getClassSummary,
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
  getTimelineFutureClasses,
  getTimelinePastClasses,
  getTimelineFutureExams,
  getTimelineReceptionHours,
  getTimelineDueHomework,
  getMissingSummaries,
  getAiSummary,
  upsertSummaryTopic,
  updateSummaryTopic,
  deleteSummaryTopic,
  updateSummaryStatus,
  getAiQuiz,
  submitQuizAttempt,
  saveQuizQuestion,
  upsertQuiz,
  updateQuestionStats,
  deleteQuizQuestion,
};
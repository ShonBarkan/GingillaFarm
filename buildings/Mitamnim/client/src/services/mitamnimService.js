import axios from 'axios';

/**
 * =================================================================
 * CONFIGURATION & INSTANCE
 * =================================================================
 */
const API_BASE = import.meta.env.VITE_MITAMNIM_API_URL || "http://localhost:8001";

const mitamnimApi = axios.create({
    baseURL: API_BASE,
});

// ROUTES Map - Centralized for easy maintenance
const ROUTES = {
    'activity_logs': '/activity-logs/',
    'activity_history': '/history/', // New History Endpoint
    'exercise_tree': '/exercise-tree/',
    'exercise_assets': '/exercise-assets/',
    'goals': '/goals/',
    'parameters': '/parameters/',
    'workout_templates': '/workout-templates/',
    'workout_sessions': '/workout-sessions/',
    'active_params': '/active-params/'
};

export const mitamnimService = {

    /**
     * =================================================================
     * 1. EXERCISE TREE (Hierarchy & Categories)
     * =================================================================
     */
    
    getExerciseTree: async (parentId = null, limit = null) => {
        const params = {};
        if (parentId !== null) params.parent_id = parentId;
        if (limit) params.limit = limit;
        const response = await mitamnimApi.get(ROUTES.exercise_tree, { params });
        return response.data;
    },

    getFullHierarchy: async () => {
        return mitamnimService.getExerciseTree();
    },

    getExerciseNodeById: async (id) => {
        const response = await mitamnimApi.get(`${ROUTES.exercise_tree}${id}`);
        return response.data;
    },

    createExerciseNodes: async (nodesData) => {
        const data = Array.isArray(nodesData) ? nodesData : [nodesData];
        const response = await mitamnimApi.post(ROUTES.exercise_tree, data);
        return response.data;
    },

    updateExerciseNode: async (id, nodeData) => {
        const response = await mitamnimApi.patch(`${ROUTES.exercise_tree}${id}`, nodeData);
        return response.data;
    },


    /**
     * =================================================================
     * 2. ACTIVE PARAMETERS (The Junction)
     * =================================================================
     */

    getActiveParams: async (filters = {}, limit = null) => {
        const params = { ...filters };
        if (limit) params.limit = limit;
        const response = await mitamnimApi.get(ROUTES.active_params, { params });
        return response.data;
    },

    createActiveParams: async (paramsData) => {
        const data = Array.isArray(paramsData) ? paramsData : [paramsData];
        const response = await mitamnimApi.post(ROUTES.active_params, data);
        return response.data;
    },


    /**
     * =================================================================
     * 3. ACTIVITY LOGS (Raw Logs & Submissions)
     * =================================================================
     */

    getActivityLogs: async (filters = {}, limit = null) => {
        const params = { ...filters };
        if (limit) params.limit = limit;
        const response = await mitamnimApi.get(ROUTES.activity_logs, { params });
        return response.data;
    },

    logActivities: async (activitiesData) => {
        const data = Array.isArray(activitiesData) ? activitiesData : [activitiesData];
        const response = await mitamnimApi.post(ROUTES.activity_logs, data);
        return response.data;
    },

    updateActivityLog: async (id, logData) => {
        const response = await mitamnimApi.patch(`${ROUTES.activity_logs}${id}`, logData);
        return response.data;
    },


    /**
     * =================================================================
     * 4. WORKOUTS (Templates & Sessions)
     * =================================================================
     */

    getWorkoutTemplates: async (filters = {}, limit = null) => {
        const params = { ...filters };
        if (limit) params.limit = limit;
        const response = await mitamnimApi.get(ROUTES.workout_templates, { params });
        return response.data;
    },

    createWorkoutTemplates: async (templatesData) => {
        const data = Array.isArray(templatesData) ? templatesData : [templatesData];
        const response = await mitamnimApi.post(ROUTES.workout_templates, data);
        return response.data;
    },

    getWorkoutSessions: async (filters = {}, limit = null) => {
        const params = { ...filters };
        if (limit) params.limit = limit;
        const response = await mitamnimApi.get(ROUTES.workout_sessions, { params });
        return response.data;
    },

    startWorkoutSessions: async (sessionsData) => {
        const data = Array.isArray(sessionsData) ? sessionsData : [sessionsData];
        const response = await mitamnimApi.post(ROUTES.workout_sessions, data);
        return response.data;
    },

    updateWorkoutSession: async (id, sessionData) => {
        const response = await mitamnimApi.patch(`${ROUTES.workout_sessions}${id}`, sessionData);
        return response.data;
    },

    getRecursiveExerciseIds: (exerciseId, allExercises) => {
        const ids = [exerciseId];
        const findChildren = (parentId) => {
            const children = allExercises.filter(ex => ex.parent_id === parentId);
            children.forEach(child => {
                ids.push(child.id);
                findChildren(child.id);
            });
        };
        findChildren(exerciseId);
        return ids;
    },


    /**
     * =================================================================
     * 5. GLOBAL METADATA (Parameters, Assets, Goals)
     * =================================================================
     */

    getParameters: async (scope = null, limit = null) => {
        const params = {};
        if (scope) params.scope = scope;
        if (limit) params.limit = limit;
        const response = await mitamnimApi.get(ROUTES.parameters, { params });
        return response.data;
    },

    createParameters: async (paramsData) => {
        const data = Array.isArray(paramsData) ? paramsData : [paramsData];
        const response = await mitamnimApi.post(ROUTES.parameters, data);
        return response.data;
    },

    updateParameter: async (id, paramData) => {
        const response = await mitamnimApi.patch(`${ROUTES.parameters}${id}`, paramData);
        return response.data;
    },

    getExerciseAssets: async (exerciseId = null) => {
        const params = exerciseId ? { exercise_id: exerciseId } : {};
        const response = await mitamnimApi.get(ROUTES.exercise_assets, { params });
        return response.data;
    },

    getGoals: async (exerciseId = null, isCompleted = null) => {
        const params = {};
        if (exerciseId) params.exercise_id = exerciseId;
        if (isCompleted !== null) params.is_completed = isCompleted;
        const response = await mitamnimApi.get(ROUTES.goals, { params });
        return response.data;
    },


    /**
     * =================================================================
     * 6. ADMIN & BULK UTILITIES
     * =================================================================
     */

    getRawTableData: async (tableKey) => {
        const response = await mitamnimApi.get(ROUTES[tableKey]);
        return response.data;
    },

    deleteBulk: async (tableKey, ids) => {
        const response = await mitamnimApi.delete(ROUTES[tableKey], { data: ids });
        return response.data;
    },

    importBulk: async (tableKey, data) => {
        const response = await mitamnimApi.post(ROUTES[tableKey], data);
        return response.data;
    },

    /**
     * =================================================================
     * 7. STATISTICS & ANALYTICS
     * =================================================================
     */

    getExerciseStats: async (exerciseId) => {
        try {
            const response = await mitamnimApi.get(`/stats/exercise/${exerciseId}`);
            return response.data;
        } catch (error) {
            console.error(`Failed to fetch stats for exercise ${exerciseId}:`, error);
            return {
                exercise_id: exerciseId,
                exercise_name: "",
                parameters: [],
                total_logs_count: 0,
                last_session_date: null
            };
        }
    },

    getTrendData: async (exerciseId, start, end) => {
        const params = {};
        if (start) params.start = start;
        if (end) params.end = end;
        const response = await mitamnimApi.get(`/stats/exercise/${exerciseId}/trend`, { params });
        return response.data;
    },

    updateExerciseParams: async (exerciseId, paramsList) => {
        const response = await mitamnimApi.post(`/active-params/sync/${exerciseId}`, paramsList); 
        return response.data;
    },

    getExerciseById: async (id) => {
        try {
            const response = await mitamnimApi.get(`${ROUTES.exercise_tree}${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching exercise ${id}:`, error);
            throw error;
        }
    },

    getWorkoutTemplateById: async (id) => {
        try {
            const response = await mitamnimApi.get(`${ROUTES.workout_templates}${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching template ${id}:`, error);
            throw error;
        }
    },

    /**
     * =================================================================
     * 8. HISTORY & LOGS ANALYTICS (Smart Recursive Fetching)
     * =================================================================
     */

    // Fetches history with smart exercise inheritance (includes children)
    getActivityHistory: async (filters = {}) => {
        const params = { ...filters };
        const response = await mitamnimApi.get(ROUTES.activity_history, { params });
        return response.data;
    },

    // Shortcut for exercise-specific history (used for progress charts)
    getExerciseHistory: async (exerciseId, limit = 20) => {
        const response = await mitamnimApi.get(`${ROUTES.activity_history}exercise/${exerciseId}`, {
            params: { limit }
        });
        return response.data;
    }
};
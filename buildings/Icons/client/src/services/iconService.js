import axios from 'axios';

const API_BASE = import.meta.env.VITE_ICONS_API_URL || "http://localhost:8301";

const iconApi = axios.create({
    baseURL: API_BASE,
});

export const iconService = {
    // Fetchers
    getSubjects: () => iconApi.get('/subjects').then(res => res.data),
    
    getIcons: (subject = '', subSubject = '') => {
        const params = new URLSearchParams();
        if (subject) params.append('subject', subject);
        if (subSubject) params.append('sub_subject', subSubject);
        return iconApi.get(`/icons?${params.toString()}`).then(res => res.data);
    },

    getRandomIcons: (limit = 20) => 
        iconApi.get(`/icons/random?limit=${limit}`).then(res => res.data),

    deleteBulk: (subject = '', subSubject = '') => {
        const params = new URLSearchParams();
        if (subject) params.append('subject', subject);
        if (subSubject) params.append('sub_subject', subSubject);
        return iconApi.delete(`/icons/bulk/delete?${params.toString()}`);
    },

    // Actions
    uploadIcon: (iconData) => 
        iconApi.post('/icons', iconData),

    bulkUpload: (jsonPayload) => 
        iconApi.post('/icons/bulk', jsonPayload),

    updateIcon: (id, data) => 
        iconApi.put(`/icons/${id}`, data),

    deleteIcon: (id) => 
        iconApi.delete(`/icons/${id}`),
    
};
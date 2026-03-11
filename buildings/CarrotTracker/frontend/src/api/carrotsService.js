
import api from './axiosConfig';
import { toast } from 'react-toastify';

export const carrotsService = {
    getAll: async (params) => {
        try {
            const res = await api.get('/carrots', { params });
            return res.data;
        } catch (err) {
            toast.error("Failed to fetch carrots");
            throw err;
        }
    },
    create: async (data) => {
        try {
            const res = await api.post('/carrots', data);
            toast.success("Carrots created successfully!");
            return res.data;
        } catch (err) {
            toast.error("Failed to create carrots");
            throw err;
        }
    },
    remove: async (id) => {
        try {
            await api.delete(`/carrots/${id}`);
            toast.warn("Carrots removed.");
        } catch (err) {
            toast.error("Delete failed");
        }
    }
};

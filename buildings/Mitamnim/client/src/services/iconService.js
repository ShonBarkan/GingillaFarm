import axios from 'axios';

const BASE_URL = import.meta.env.VITE_ICONS_API_URL || 'http://localhost:8301/icons';
const CACHE_KEY = import.meta.env.VITE_ICONS_API_URL ||'gingilla_icons_cache';

// Load existing cache from localStorage or start empty
const getStoredCache = () => {
    try {
        const saved = localStorage.getItem(CACHE_KEY);
        return saved ? JSON.parse(saved) : {};
    } catch (e) {
        return {};
    }
};

let iconsCache = getStoredCache();

export const iconService = {
    getIconByName: async (name) => {
        if (!name) return null;

        // 1. Check if we already have the result (success or failure) in cache
        if (iconsCache[name] !== undefined) {
            return iconsCache[name]; // Can be the SVG string or null (if failed before)
        }

        try {
            const response = await fetch(`${BASE_URL}/name/${encodeURIComponent(name)}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });

            if (!response.ok) {
                throw new Error('Server error');
            }

            const data = await response.json();
            
            // 2. Save success to cache
            iconsCache[name] = data;
            localStorage.setItem(CACHE_KEY, JSON.stringify(iconsCache));
            
            return data;

        } catch (error) {
            
            // 3. Save failure (null) to cache so we don't try again in this session
            iconsCache[name] = null;
            localStorage.setItem(CACHE_KEY, JSON.stringify(iconsCache));
            
            return null;
        }
    },

    // Optional: method to clear cache if needed
    clearCache: () => {
        iconsCache = {};
        localStorage.removeItem(CACHE_KEY);
    }
};
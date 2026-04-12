import React, { useMemo } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { useExercise } from '../context/ExerciseContext';

const BG_CONFIG = {
    PLANNING: '/assets/Background/office.png',
    GENERAL: '/assets/Background/Dashboard.png',
    JUDO: '/assets/Background/Judo.png',    
    STRENGTH: '/assets/Background/Outdoor.png', 
    STUDIO: '/assets/Background/Default_exercise.png',
    SWIMMING: '/assets/Background/Swimming.png',
    GYM: '/assets/Background/Gym.png',
    BODYWEIGHT: '/assets/Background/Outdoor.png'
};

const EXERCISE_KEYWORDS = {
    JUDO: ["ג'ודו", 'גודו', 'Judo', 'מזרן', 'קרב', 'סמבו', 'Sambo'],
    STRENGTH: ['פארק', 'מתקני רחוב', 'מתח', 'מקבילים'],
    SWIMMING: ['שחייה', 'בריכה', 'חתירה', 'Swim', 'Pool', 'חזה'],
    GYM: ['משקולות', 'חדר כושר', 'דדליפט', 'סקוואט', 'לחיצת חזה', 'Gym', 'Bench Press'],
    BODYWEIGHT: ['משקל גוף', 'יוגה', 'פילאטיס', 'שכיבות סמיכה', 'Bodyweight', 'Yoga', 'Push up']
};

const DynamicBackground = () => {
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const { exercise } = useExercise();
    
    const backgroundImage = useMemo(() => {
        const path = location.pathname;
        
        const isPlanningPage = ['/settings', '/workouts/create', '/workouts/edit'].some(p => path.includes(p));
        if (isPlanningPage) return BG_CONFIG.PLANNING;

        const isGeneralPage = path === '/' || path === '/workouts';
        if (isGeneralPage) return BG_CONFIG.GENERAL;

        if (path.includes('/exercise/') || path.includes('/workouts/active')) {
            // עדיפות לשם מה-URL (מיידי), גיבוי לשם מהקונטקסט
            const nameFromUrl = searchParams.get('name') || "";
            const nameFromContext = exercise?.name || "";
            const fullName = `${nameFromUrl} ${nameFromContext}`.toLowerCase();

            if (EXERCISE_KEYWORDS.JUDO.some(k => fullName.includes(k.toLowerCase()))) return BG_CONFIG.JUDO;
            if (EXERCISE_KEYWORDS.SWIMMING.some(k => fullName.includes(k.toLowerCase()))) return BG_CONFIG.SWIMMING;
            if (EXERCISE_KEYWORDS.GYM.some(k => fullName.includes(k.toLowerCase()))) return BG_CONFIG.GYM;
            if (EXERCISE_KEYWORDS.BODYWEIGHT.some(k => fullName.includes(k.toLowerCase()))) return BG_CONFIG.BODYWEIGHT;
            if (EXERCISE_KEYWORDS.STRENGTH.some(k => fullName.includes(k.toLowerCase()))) return BG_CONFIG.STRENGTH;
            
            return BG_CONFIG.STUDIO;
        }

        return BG_CONFIG.GENERAL;
    }, [location.pathname, searchParams, exercise]);

    return (
        <div 
            className="fixed inset-0 z-[-1] transition-all duration-1000 ease-in-out pointer-events-none"
            style={{
                backgroundImage: `url(${backgroundImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'left center',
                backgroundAttachment: 'fixed'
            }}
        />
    );
};

export default DynamicBackground;
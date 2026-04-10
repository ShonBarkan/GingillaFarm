import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { mitamnimService } from '../services/mitamnimService';

const WorkoutContext = createContext();

export const WorkoutProvider = ({ children }) => {
    const [activeSession, setActiveSession] = useState(null);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [isActive, setIsActive] = useState(false);

    /**
     * 1. HYDRATION & PERSISTENCE
     * Recover state from localStorage on initial load
     */
    useEffect(() => {
        const savedState = localStorage.getItem('active_workout_state');
        if (savedState) {
            try {
                const parsed = JSON.parse(savedState);
                if (parsed.id) {
                    setActiveSession(parsed);
                    setIsActive(true);
                    
                    const savedTime = localStorage.getItem('workout_elapsed_time');
                    if (savedTime) setElapsedTime(parseInt(savedTime));
                }
            } catch (e) {
                console.error("Failed to parse saved workout state", e);
            }
        }
    }, []);

    /**
     * 2. TIMER LOGIC
     */
    useEffect(() => {
        let interval = null;
        if (isActive) {
            interval = setInterval(() => {
                setElapsedTime((prevTime) => {
                    const newTime = prevTime + 1;
                    if (newTime % 5 === 0) {
                        localStorage.setItem('workout_elapsed_time', newTime.toString());
                    }
                    return newTime;
                });
            }, 1000);
        } else {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [isActive]);

    /**
     * 3. START WORKOUT
     * Initializes the session in the DB and then local state
     */
    const startWorkout = useCallback(async (templateId = null) => {
        try {
            const sessionPayload = {
                template_id: templateId ? parseInt(templateId) : null,
                start_time: new Date().toISOString(),
                status: 'active',
                notes: "",
                summary_data: {}, 
                session_required_params: []
            };

            const response = await mitamnimService.startWorkoutSessions([sessionPayload]);
            const newSession = response.data && response.data[0] ? response.data[0] : response[0];
            
            if (!newSession || !newSession.id) throw new Error("Invalid session response");

            const sessionData = { 
                id: newSession.id, 
                templateId, 
                startTime: sessionPayload.start_time 
            };
            
            setActiveSession(sessionData);
            setElapsedTime(0);
            setIsActive(true);
            
            localStorage.setItem('active_workout_state', JSON.stringify(sessionData));
            localStorage.setItem('workout_elapsed_time', '0');
            
            return newSession.id;
        } catch (error) {
            console.error("Failed to start workout session:", error);
            throw error;
        }
    }, []);

    /**
     * 4. FINISH WORKOUT (Atomic & Safe Save)
     * Steps: 
     * 1. Send all data (logs + session update) to DB.
     * 2. If successful, clear local persistence.
     */
    const finishWorkout = useCallback(async (finalSessionData, allLogs = []) => {
        if (!activeSession) return;

        try {
            const atomicPayload = {
                end_time: new Date().toISOString(),
                status: 'completed',
                notes: finalSessionData.notes || "",
                summary_data: {
                    // Merging manual parameters (weight, heart rate, etc.) with workout duration
                    ...(finalSessionData.summary_data || {}),
                    duration_seconds: elapsedTime
                },
                activity_logs: allLogs.map(log => ({
                    ...log,
                    timestamp: new Date().toISOString()
                }))
            };

            // Step 1: Save to Database
            await mitamnimService.updateWorkoutSession(activeSession.id, atomicPayload);

            // Step 2: Clear local state ONLY after successful DB update
            setActiveSession(null);
            setIsActive(false);
            setElapsedTime(0);
            localStorage.removeItem('workout_elapsed_time');
            localStorage.removeItem('active_workout_state');
            
            return { success: true };
        } catch (error) {
            console.error("Critical: Failed to save workout to DB. Keeping local state.", error);
            // Re-throw so the UI can notify the user that data is still local
            throw error; 
        }
    }, [activeSession, elapsedTime]);

    /**
     * 5. CANCEL WORKOUT
     */
    const cancelWorkout = useCallback(() => {
        setActiveSession(null);
        setIsActive(false);
        setElapsedTime(0);
        localStorage.removeItem('workout_elapsed_time');
        localStorage.removeItem('active_workout_state');
    }, []);

    const value = {
        activeSession,
        elapsedTime,
        isActive,
        startWorkout,
        finishWorkout,
        cancelWorkout,
        setElapsedTime
    };

    return (
        <WorkoutContext.Provider value={value}>
            {children}
        </WorkoutContext.Provider>
    );
};

export const useWorkout = () => {
    const context = useContext(WorkoutContext);
    if (!context) {
        throw new Error("useWorkout must be used within a WorkoutProvider");
    }
    return context;
};
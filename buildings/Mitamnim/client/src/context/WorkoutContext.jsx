import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { mitamnimService } from '../services/mitamnimService';

const WorkoutContext = createContext();

export const WorkoutProvider = ({ children }) => {
    const [activeSession, setActiveSession] = useState(null);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [isActive, setIsActive] = useState(false);

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

    const finishWorkout = useCallback(async (finalSessionData, allLogs = []) => {
        if (!activeSession) return;

        try {
            // Use the timestamp provided by the modal, or fallback to current time
            const sessionTimestamp = finalSessionData.start_time || new Date().toISOString();
            
            const atomicPayload = {
                end_time: new Date().toISOString(),
                status: 'completed',
                notes: finalSessionData.notes || "",
                summary_data: {
                    ...(finalSessionData.summary_data || {}),
                    duration_seconds: finalSessionData.duration * 60 || elapsedTime
                },
                activity_logs: allLogs.map(log => ({
                    ...log,
                    // Use the specific log timestamp if provided by the modal
                    timestamp: log.timestamp || sessionTimestamp 
                }))
            };

            await mitamnimService.updateWorkoutSession(activeSession.id, atomicPayload);

            setActiveSession(null);
            setIsActive(false);
            setElapsedTime(0);
            localStorage.removeItem('workout_elapsed_time');
            localStorage.removeItem('active_workout_state');
            
            return { success: true };
        } catch (error) {
            console.error("Critical: Failed to save workout to DB.", error);
            throw error; 
        }
    }, [activeSession, elapsedTime]);

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
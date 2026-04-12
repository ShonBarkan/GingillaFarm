import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { mitamnimService } from '../services/mitamnimService';

const ExerciseContext = createContext();

export const useExercise = () => {
    const context = useContext(ExerciseContext);
    if (!context) {
        throw new Error('useExercise must be used within an ExerciseProvider');
    }
    return context;
};

export const ExerciseProvider = ({ children }) => {
    const [allExercises, setAllExercises] = useState([]); 
    const [listLoading, setListLoading] = useState(true);
    const [exercise, setExercise] = useState(null);      
    const [logs, setLogs] = useState([]);                
    const [stats, setStats] = useState(null);            
    const [loading, setLoading] = useState(false);        
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const refreshGlobalExercises = useCallback(async () => {
        setListLoading(true);
        try {
            const data = await mitamnimService.getExerciseTree();
            setAllExercises(data || []);
        } catch (error) {
            console.error("Failed to refresh global exercise list:", error);
        } finally {
            setListLoading(false);
        }
    }, []);

    useEffect(() => {
        refreshGlobalExercises();
    }, [refreshGlobalExercises]);

    /**
     * Updated fetchHistory to support date filtering
     */
    const fetchHistory = useCallback(async (exerciseId, limit = 50, startDate = null, endDate = null) => {
        setLoading(true);
        try {
            const data = await mitamnimService.getExerciseHistory(exerciseId, limit, startDate, endDate);
            setLogs(data || []);
        } catch (error) {
            console.error(`Error fetching history for exercise ${exerciseId}:`, error);
            setLogs([]);
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Updated fetchExerciseData to ensure history is also filtered by range
     */
    const fetchExerciseData = useCallback(async (id, startDate = null, endDate = null) => {
        if (!id) return;
        setLoading(true);
        try {
            const [node, activeParams, exerciseStats, historyData] = await Promise.all([
                mitamnimService.getExerciseNodeById(id),
                mitamnimService.getActiveParams({ exercise_id: id }),
                mitamnimService.getExerciseStats(id, startDate, endDate),
                // Fix: passing startDate and endDate to history fetch
                mitamnimService.getExerciseHistory(id, 50, startDate, endDate)
            ]);

            setExercise({
                ...node,
                active_params: activeParams
            });
            
            setStats(exerciseStats);
            setLogs(historyData || []);
        } catch (error) {
            console.error("Error loading full exercise data:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    const refreshAll = useCallback(async () => {
        // Simple artificial delay for visual feedback
        await new Promise(resolve => setTimeout(resolve, 400));
        setRefreshTrigger(prev => prev + 1);
    }, []);

    const value = {
        allExercises,
        listLoading,
        refreshGlobalExercises,
        exercise,
        setExercise,
        logs,
        setLogs,
        stats,
        setStats,
        loading,
        refreshTrigger,
        fetchExerciseData,
        fetchHistory,
        refreshAll 
    };

    return (
        <ExerciseContext.Provider value={value}>
            {children}
        </ExerciseContext.Provider>
    );
};
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

    const fetchHistory = useCallback(async (exerciseId, limit = 50) => {
        setLoading(true);
        try {
            const data = await mitamnimService.getExerciseHistory(exerciseId, limit);
            setLogs(data || []);
        } catch (error) {
            console.error(`Error fetching history for exercise ${exerciseId}:`, error);
            setLogs([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchExerciseData = useCallback(async (id) => {
        if (!id) return;
        setLoading(true);
        try {
            const [node, activeParams, exerciseStats, historyData] = await Promise.all([
                mitamnimService.getExerciseNodeById(id),
                mitamnimService.getActiveParams({ exercise_id: id }),
                mitamnimService.getExerciseStats(id),
                mitamnimService.getExerciseHistory(id)
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

    useEffect(() => {
        if (exercise?.id) {
            fetchExerciseData(exercise.id);
        }
    }, [refreshTrigger, exercise?.id, fetchExerciseData]); 

    const refreshAll = useCallback(async () => {
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
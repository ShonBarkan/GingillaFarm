import React, { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useExercise } from '../context/ExerciseContext';
import ExerciseHeader from '../components/ExercisePage/ExerciseHeader';
import ExerciseBreadcrumbs from '../components/ExercisePage/ExerciseBreadcrumbs';
import StatsDisplay from '../components/ExercisePage/StatsDisplay/StatsDisplay';
import ExerciseHistory from '../components/ExercisePage/ExerciseHistory/ExerciseHistory';
import ExerciseManagementPanel from '../components/ExercisePage/ExerciseManagementPanel/ExerciseManagementPanel';
import ExerciseWorkouts from '../components/ExercisePage/ExerciseWorkouts';
import TimeRangePicker from '../components/ExercisePage/TimeRangePicker';
import AddActivityModal from '../components/common/AddActivityModal/AddActivityModal';

const ExercisePage = () => {
    const { identifier } = useParams();
    const { 
        exercise, 
        loading, 
        fetchExerciseData, 
        refreshTrigger, 
        refreshAll, 
        allExercises, 
        stats, 
        logs 
    } = useExercise();
    
    // State for the "I did this exercise" modular process
    const [isLogModalOpen, setIsLogModalOpen] = useState(false);
    const [timeRange, setTimeRange] = useState('all');

  
    const rangeDates = useMemo(() => {
        const start = new Date();
        const end = new Date();
        end.setHours(23, 59, 59, 999);

        if (timeRange === 'day') {
            start.setHours(0, 0, 0, 0);
        } 
        else if (timeRange === 'week') {
            const day = start.getDay();
            start.setDate(start.getDate() - day);
            start.setHours(0, 0, 0, 0);
        } 
        else if (timeRange === 'month') {
            start.setDate(1);
            start.setHours(0, 0, 0, 0);
        } 
        else if (timeRange === 'all') {
            return { start: null, end: null };
        }

        const formatDate = (date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        return {
            start: formatDate(start),
            end: formatDate(end)
        };
    }, [timeRange]);

    /**
     * Fetch all data when identifier or timeRange changes
     */
    useEffect(() => {
        if (identifier) {
            fetchExerciseData(identifier, rangeDates.start, rangeDates.end);
        }
    }, [identifier, rangeDates, fetchExerciseData, refreshTrigger]);

    const { subExercises, hasChildren, hasParams } = useMemo(() => {
        if (!exercise) return { subExercises: [], hasChildren: false, hasParams: false };
        const subs = allExercises.filter(ex => ex.parent_id === exercise.id);
        return {
            subExercises: subs,
            hasChildren: subs.length > 0,
            hasParams: exercise.active_params && exercise.active_params.length > 0
        };
    }, [exercise, allExercises]);

    const hasAnyData = useMemo(() => {
        const hasStats = stats?.parameters?.some(p => p.name && p.name.trim() !== "");
        const hasLogs = logs && logs.length > 0;
        return hasStats || hasLogs;
    }, [stats, logs]);

    if (loading && !exercise) {
        return (
            <div className="max-w-[1600px] mx-auto px-4 py-6 min-h-screen space-y-8 animate-pulse" dir="rtl">
                <div className="h-32 w-full bg-white/20 rounded-[2.5rem]" />
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <div className="col-span-1 h-96 bg-white/20 rounded-[2.5rem]" />
                    <div className="col-span-3 h-96 bg-white/20 rounded-[2.5rem]" />
                </div>
            </div>
        );
    }

    if (!exercise) return <div className="p-20 text-center text-red-500 font-bold" dir="rtl">תרגיל לא נמצא</div>;

    return (
        <div className="max-w-[1600px] mx-auto px-4 py-4 min-h-screen flex flex-col" dir="rtl">
            
            {/* Header Section: Breadcrumbs closely coupled with Header */}
            <div className="mb-8 md:mb-12">
                <ExerciseBreadcrumbs exercise={exercise} allExercises={allExercises} />
                <ExerciseHeader 
                    exercise={exercise} 
                    onOpenModal={() => setIsLogModalOpen(true)} 
                />
            </div>
            
            <div className="flex flex-col lg:grid lg:grid-cols-4 gap-6 items-start">
                {/* Sidebar */}
                <div className="lg:col-span-1 flex flex-col gap-6 w-full lg:sticky lg:top-6">
                    <ExerciseWorkouts exerciseId={exercise.id} />
                    <ExerciseManagementPanel 
                        exercise={exercise}
                        subExercises={subExercises}
                        hasChildren={hasChildren}
                        hasParams={hasParams}
                        refreshAll={refreshAll}
                    />
                </div>

                {/* Main Content */}
                <div className="lg:col-span-3 w-full space-y-8">
                    {hasAnyData && (
                        <div className="animate-in fade-in slide-in-from-left-4 duration-500">
                            <TimeRangePicker currentRange={timeRange} onRangeChange={setTimeRange}  />
                        </div>
                    )}
                    
                    <StatsDisplay exerciseId={exercise.id} timeRange={timeRange} rangeDates={rangeDates}  />
                    
                    <div className="w-full pb-10">
                         <ExerciseHistory exerciseId={exercise.id} timeRange={timeRange} />
                    </div>
                </div>
            </div>

            <AddActivityModal 
                isOpen={isLogModalOpen}
                onClose={() => setIsLogModalOpen(false)}
                exercise={exercise}
                allExercises={allExercises}
                onSuccess={refreshAll}
            />
        </div>
    );
};

export default ExercisePage;
import React, { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useExercise } from '../context/ExerciseContext';
import ExerciseHeader from '../components/ExercisePage/ExerciseHeader';
import ExerciseBreadcrumbs from '../components/ExercisePage/ExerciseBreadcrumbs';
import StatsDisplay from '../components/ExercisePage/StatsDisplay/StatsDisplay';
import ExerciseHistory from '../components/ExercisePage/ExerciseHistory/ExerciseHistory';
import ExerciseManagementPanel from '../components/ExercisePage/ExerciseManagementPanel/ExerciseManagementPanel';
import ExerciseWorkouts from '../components/ExercisePage/ExerciseWorkouts';

const ExercisePage = () => {
    const { identifier } = useParams();
    const { exercise, loading, fetchExerciseData, refreshTrigger, refreshAll, allExercises } = useExercise();
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        if (identifier) fetchExerciseData(identifier);
    }, [identifier, fetchExerciseData, refreshTrigger]);

    const { subExercises, hasChildren, hasParams } = useMemo(() => {
        if (!exercise) return { subExercises: [], hasChildren: false, hasParams: false };
        const subs = allExercises.filter(ex => ex.parent_id === exercise.id);
        return {
            subExercises: subs,
            hasChildren: subs.length > 0,
            hasParams: exercise.active_params && exercise.active_params.length > 0
        };
    }, [exercise, allExercises]);

    if (loading && !exercise) {
        return (
            <div className="max-w-[1600px] mx-auto px-4 py-6 min-h-screen space-y-8" dir="rtl">
                <div className="h-6 w-48 bg-gray-100 animate-pulse rounded" />
                <div className="h-32 w-full bg-gray-50 animate-pulse rounded-[2.5rem]" />
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <div className="col-span-1 h-64 bg-gray-50 animate-pulse rounded-[2.5rem]" />
                    <div className="col-span-3 h-64 bg-gray-50 animate-pulse rounded-[2.5rem]" />
                </div>
            </div>
        );
    }

    if (!exercise) return <div className="p-20 text-center text-red-500 font-bold" dir="rtl">תרגיל לא נמצא</div>;

    return (
        <div className="max-w-[1600px] mx-auto px-4 py-6 min-h-screen flex flex-col space-y-6 md:space-y-10" dir="rtl">
            
            {/* 1. Navigation & Breadcrumbs */}
            <div className="flex items-center shrink-0 overflow-x-auto no-scrollbar">
                <ExerciseBreadcrumbs exercise={exercise} allExercises={allExercises} />
            </div>
            
            {/* 2. Page Header */}
            <div className="shrink-0">
                <ExerciseHeader 
                    exercise={exercise} 
                    onOpenModal={() => setIsModalOpen(true)} 
                />
            </div>

            {/* 3. Main Dashboard Layout */}
            <div className="flex flex-col lg:grid lg:grid-cols-4 gap-6 items-start">
                
                {/* Right Column (Desktop) / Top Column (Mobile): Workouts & Management */}
                <div className="lg:col-span-1 flex flex-col gap-6 w-full lg:sticky lg:top-6">
                    
                    {/* Workouts Card */}
                    <div className="w-full">
                        <ExerciseWorkouts exerciseId={exercise.id} />
                    </div>

                    {/* Management Panel */}
                    <div className="w-full">
                        <ExerciseManagementPanel 
                            exercise={exercise}
                            subExercises={subExercises}
                            hasChildren={hasChildren}
                            hasParams={hasParams}
                            refreshAll={refreshAll}
                        />
                    </div>
                </div>

                {/* Left Column (Desktop) / Bottom Column (Mobile): Stats & Analytics */}
                <div className="lg:col-span-3 w-full space-y-8">
                    <div className="bg-transparent rounded-none">
                        <StatsDisplay exerciseId={exercise.id} />
                    </div>
                    
                    {/* Activity History integrated here or below */}
                    <div className="w-full pb-10">
                         <ExerciseHistory exerciseId={exercise.id} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExercisePage;
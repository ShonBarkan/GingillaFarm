import React, { useState, useEffect, useCallback } from 'react';
import { useExercise } from '../context/ExerciseContext';
import { mitamnimService } from '../services/mitamnimService';
import TodaysWorkouts from '../components/dashboard/TodaysWorkouts';
import FeaturedStats from '../components/dashboard/FeaturedStats';
import AddActivityModal from '../components/common/AddActivityModal/AddActivityModal';
import DashboardHeader from '../components/dashboard/DashboardHeader';

const Dashboard = () => {
    const { refreshTrigger, refreshAll } = useExercise();
    const [isSelectorOpen, setIsSelectorOpen] = useState(false);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);

    const loadDashboardData = useCallback(async () => {
        setLoading(true);
        try {
            const end = new Date().toISOString().split('T')[0];
            const start = new Date();
            start.setMonth(start.getMonth() - 1);
            const data = await mitamnimService.getDashboardSummary(start.toISOString().split('T')[0], end);
            setSummary(data);
        } catch (error) {
            console.error("Dashboard Load Error:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadDashboardData();
    }, [loadDashboardData, refreshTrigger]);

    const handleActivitySaved = async () => {
        setIsSelectorOpen(false);
        if (refreshAll) await refreshAll();
    };

    return (
        <div className="min-h-screen bg-transparent py-8 px-4 md:px-8" dir="rtl">
            <div className="max-w-7xl mx-auto space-y-10">
                
                {/* 1. Header Section - Solid isolation from background */}
                <div className="relative z-20">
                    <DashboardHeader onLogClick={() => setIsSelectorOpen(true)} />
                </div>

                {/* 2. Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* Right Side: Today's Workouts (Main Area - 8/12 cols) */}
                    <div className="lg:col-span-4 space-y-6">
                        <section className="bg-white/70 backdrop-blur-xl rounded-[3.5rem] p-8 md:p-10 border border-white/40 shadow-2xl shadow-blue-900/10">
                            <TodaysWorkouts 
                                workouts={summary?.todays_workouts} 
                                loading={loading} 
                            />
                        </section>
                    </div>

                    {/* Left Side: Featured Stats (Sidebar Area - 4/12 cols) */}
                    <div className="lg:col-span-8 space-y-6">
                        <aside className="bg-white/80 backdrop-blur-2xl rounded-[3.5rem] p-8 border border-white/50 shadow-2xl shadow-gray-900/5">
                            <FeaturedStats 
                                stats={summary?.featured_stats} 
                                loading={loading} 
                            />
                        </aside>
                    </div>

                </div>
            </div>

            <AddActivityModal 
                isOpen={isSelectorOpen}
                onClose={() => setIsSelectorOpen(false)}
                onSaved={handleActivitySaved}
            />
        </div>
    );
};

export default Dashboard;
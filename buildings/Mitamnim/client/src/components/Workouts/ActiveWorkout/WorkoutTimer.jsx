import React from 'react';
import { useWorkout } from '../../../context/WorkoutContext';
import { Clock } from 'lucide-react';

const WorkoutTimer = () => {
    const { elapsedTime } = useWorkout();

    const formatTime = (totalSeconds) => {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        const pad = (num) => String(num).padStart(2, '0');

        if (hours > 0) {
            return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
        }
        return `${pad(minutes)}:${pad(seconds)}`;
    };

    return (
        <div className="flex items-center gap-2 text-blue-600">
            <Clock size={16} className="animate-pulse" />
            <span className="font-mono text-lg font-black tracking-wider">
                {formatTime(elapsedTime)}
            </span>
        </div>
    );
};

export default WorkoutTimer;
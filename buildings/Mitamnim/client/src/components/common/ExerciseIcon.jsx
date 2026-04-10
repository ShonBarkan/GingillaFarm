import React, { useState, useEffect } from 'react';
import { Dumbbell } from 'lucide-react';
import { iconService } from '../../services/iconService';

const ExerciseIcon = ({ exerciseName, size = 24, className = "" }) => {
    const [iconSvg, setIconSvg] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        const fetchIcon = async () => {
            // If no name is provided, stop loading and exit
            if (!exerciseName) {
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                const data = await iconService.getIconByName(exerciseName);
                if (isMounted && data && data.svg_content) {
                    setIconSvg(data.svg_content);
                }
            } catch (error) {
                console.error(`Failed to load icon for: ${exerciseName}`);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchIcon();
        return () => { isMounted = false; };
    }, [exerciseName]);

    // Show skeleton only during active loading
    if (loading) {
        return (
            <div 
                className={`animate-pulse bg-gray-100 rounded-full ${className}`} 
                style={{ width: size, height: size }} 
            />
        );
    }

    return (
        <div 
            className={`flex items-center justify-center ${className}`}
            style={{ width: size, height: size }}
        >
            {iconSvg ? (
                <div 
                    className="w-full h-full flex items-center justify-center [&>svg]:w-full [&>svg]:h-full"
                    dangerouslySetInnerHTML={{ __html: iconSvg }} 
                />
            ) : (
                <Dumbbell size={size * 0.7} className="text-gray-300" />
            )}
        </div>
    );
};

export default ExerciseIcon;
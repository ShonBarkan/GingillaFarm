import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, Home } from 'lucide-react';

const ExerciseBreadcrumbs = ({ exercise, allExercises }) => {
    const getBreadcrumbs = () => {
        const crumbs = [];
        let currentParentId = exercise.parent_id;
        
        while (currentParentId) {
            const parent = allExercises.find(ex => ex.id === currentParentId);
            if (parent) {
                crumbs.unshift(parent);
                currentParentId = parent.parent_id;
            } else {
                break;
            }
        }
        return crumbs;
    };

    const breadcrumbs = getBreadcrumbs();

    return (
        <nav className="
            inline-flex items-center flex-wrap gap-y-2 gap-x-1 px-5 py-2.5 mb-4
            bg-white/80 backdrop-blur-md rounded-[3.5rem] 
            border border-gray-100/50 shadow-sm
            text-[10px] md:text-xs font-bold text-gray-400/80
            max-w-full" 
            dir="rtl">
            
            {/* Home Link */}
            <Link to="/" className="flex items-center gap-1 hover:text-blue-600 transition-colors">
                <Home size={12} className="opacity-50" />
                <span className="whitespace-nowrap">דף הבית</span>
            </Link>
            
            {breadcrumbs.map((crumb) => (
                <React.Fragment key={crumb.id}>
                    <ChevronLeft size={10} className="flex-shrink-0 opacity-30" />
                    <Link 
                        to={`/exercise/${crumb.id}`} 
                        className="hover:text-blue-600 transition-colors"
                    >
                        {crumb.name}
                    </Link>
                </React.Fragment>
            ))}
            
            <ChevronLeft size={10} className="flex-shrink-0 opacity-30" />
            
            {/* Current Item */}
            <span className="text-blue-600 font-black px-1">
                {exercise.name}
            </span>
        </nav>
    );
};

export default ExerciseBreadcrumbs;
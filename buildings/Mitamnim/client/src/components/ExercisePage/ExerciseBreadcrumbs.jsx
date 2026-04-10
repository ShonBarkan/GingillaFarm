import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

const ExerciseBreadcrumbs = ({ exercise, allExercises }) => {
    /**
     * פונקציית עזר לבניית מערך הלחם-פרורים מהעץ השטוח
     */
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
        <nav className="flex items-center gap-2 mb-8 text-sm text-gray-400 overflow-x-auto pb-2 custom-scrollbar font-bold" dir="rtl">
            <Link to="/" className="hover:text-blue-600 transition-colors whitespace-nowrap">דף הבית</Link>
            
            {breadcrumbs.map((crumb) => (
                <React.Fragment key={crumb.id}>
                    <ChevronLeft size={14} className="flex-shrink-0" />
                    <Link 
                        to={`/exercise/${crumb.id}`} 
                        className="hover:text-blue-600 transition-colors whitespace-nowrap"
                    >
                        {crumb.name}
                    </Link>
                </React.Fragment>
            ))}
            
            <ChevronLeft size={14} className="flex-shrink-0" />
            <span className="text-gray-900 whitespace-nowrap">{exercise.name}</span>
        </nav>
    );
};

export default ExerciseBreadcrumbs;
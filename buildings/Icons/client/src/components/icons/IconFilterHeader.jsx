import React from 'react';
import FolderCard from '../common/FolderCard';

const IconFilterHeader = ({ subject, subSubjects = [], activeSub, onSelectSub }) => {
  return (
    <div className="mb-12" dir="rtl">
      {/* כותרת הקטגוריה */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-8 mb-8">
        <div className="text-right">
          <h1 className="text-5xl font-black text-white capitalize flex items-center gap-4">
            <span className="text-3xl opacity-50">#</span> 
            {subject || "כל החווה"}
          </h1>
          <p className="text-slate-500 text-sm mt-2 font-medium">
            נמצאו {subSubjects.length} תתי-קטגוריות זמינות לעיון.
          </p>
        </div>
      </div>

      {/* תצוגת תיקיות סינון */}
      <div className="space-y-4">
        <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mr-1">סינון לפי תת-נושא</h3>
        
        <div className="flex flex-wrap gap-3">
          {/* תיקיית "הכל" */}
          <FolderCard 
            name="הכל" 
            size="sm" 
            isActive={activeSub === ''} 
            onClick={() => onSelectSub('')}
          />

          {/* רשימת תתי-נושאים כתיקיות קטנות */}
          {subSubjects.map(sub => (
            <FolderCard 
              key={sub}
              name={sub}
              size="sm"
              type="sub"
              parentSubject={subject}
              isActive={activeSub === sub}
              onClick={() => onSelectSub(sub)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default IconFilterHeader;
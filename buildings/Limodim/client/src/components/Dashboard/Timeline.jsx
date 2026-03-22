import React from 'react';
import FutureExams from './Timeline/FutureExams';
import DueHomework from './Timeline/DueHomework';
import FutureClasses from './Timeline/FutureClasses';
import PastClasses from './Timeline/PastClasses';
import ReceptionHours from './Timeline/ReceptionHours';

const Timeline = () => {
  return (
    <div className="space-y-8 mt-8" dir="rtl">
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <FutureExams />
        <DueHomework />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <PastClasses />
          <FutureClasses />
          <ReceptionHours />
      </div>
      
    </div>
  );
};

export default Timeline;
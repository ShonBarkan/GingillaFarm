// src/components/Dashboard/QuickUpdateModal.jsx
import React, { useState } from 'react';
import api from '../../api/api';

const QuickUpdateModal = ({ lesson, onClose, onRefresh }) => {
  const [birvouz, setBirvouz] = useState('');

  const handleSubmit = async () => {
    try {
      await api.createClass({
        course_id: lesson.course_id,
        date_taken: lesson.date,
        birvouz: birvouz,
        time: lesson.time,
        location_building: lesson.location.split('/')[0],
        location_room: lesson.location.split('/')[1],
        class_type: lesson.class_type || "Lecture"
      });
      onRefresh();
      onClose();
    } catch (err) { console.error(err); }
  };

  return (
    /* Background Overlay: Ensuring items-center for desktop and items-end/center for mobile 
       to help with keyboard visibility. 
    */
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[200] p-4 md:p-6" dir="rtl">
      
      {/* Modal Container: Max-width for desktop, full-width with padding for mobile */}
      <div className="bg-white rounded-2xl p-5 md:p-8 max-w-md w-full shadow-2xl transform transition-all animate-in fade-in zoom-in duration-200">
        
        {/* Header Section */}
        <h4 className="font-bold text-lg md:text-xl text-slate-800 mb-1 leading-tight">
          עדכון שיעור: {lesson.course_name}
        </h4>
        <p className="text-[11px] md:text-xs text-slate-500 mb-5 font-medium">
          {lesson.date} | יום {lesson.day}
        </p>

        {/* Input Section - Optimized height for mobile screens */}
        <textarea 
          placeholder="מה למדנו? (בירווז מהיר)"
          className="w-full border border-slate-200 rounded-xl p-4 h-32 md:h-40 text-sm md:text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-shadow resize-none"
          value={birvouz}
          onChange={(e) => setBirvouz(e.target.value)}
          autoFocus
        />

        {/* Action Buttons - Larger tap targets for touchscreens */}
        <div className="flex flex-row gap-3 mt-6">
          <button 
            onClick={handleSubmit} 
            className="flex-1 bg-blue-600 text-white font-bold py-3 md:py-2 rounded-xl md:rounded-lg hover:bg-blue-700 active:scale-95 transition-all text-sm md:text-base shadow-lg shadow-blue-100"
          >
            שמור
          </button>
          <button 
            onClick={onClose} 
            className="flex-1 bg-slate-100 text-slate-600 font-bold py-3 md:py-2 rounded-xl md:rounded-lg hover:bg-slate-200 active:scale-95 transition-all text-sm md:text-base"
          >
            ביטול
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuickUpdateModal;
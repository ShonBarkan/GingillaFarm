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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" dir="rtl">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
        <h4 className="font-bold text-lg mb-2">עדכון שיעור: {lesson.course_name}</h4>
        <p className="text-xs text-slate-500 mb-4">{lesson.date} | יום {lesson.day}</p>
        <textarea 
          placeholder="מה למדנו? (בירווז מהיר)"
          className="w-full border rounded-xl p-3 h-32 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          value={birvouz}
          onChange={(e) => setBirvouz(e.target.value)}
        />
        <div className="flex gap-2 mt-4">
          <button onClick={handleSubmit} className="flex-1 bg-blue-600 text-white font-bold py-2 rounded-lg hover:bg-blue-700">שמור</button>
          <button onClick={onClose} className="flex-1 bg-slate-100 text-slate-600 font-bold py-2 rounded-lg hover:bg-slate-200">ביטול</button>
        </div>
      </div>
    </div>
  );
};

export default QuickUpdateModal;
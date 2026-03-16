// src/components/Dashboard/QuickUpdateModal.jsx
import React, { useState } from 'react';
import api from '../../api/api';

const QuickUpdateModal = ({ lesson, onClose, onRefresh }) => {
  const [birvouz, setBirvouz] = useState('');
  const [name, setName] = useState('');
  const [number, setNumber] = useState(''); 

  const handleSubmit = async () => {
    if (!name || !number) {
      alert("חובה להזין נושא ומספר שיעור");
      return;
    }

    try {
      await api.createClass({
        course_id: lesson.course_id,
        name: name,
        number: parseInt(number), 
        date_taken: lesson.date,
        birvouz: birvouz,
        time: lesson.time,
        location_building: lesson.location?.split('/')[0] || "",
        location_room: lesson.location?.split('/')[1] || "",
        class_type: lesson.class_type || "Lecture"
      });
      onRefresh();
      onClose();
    } catch (err) { 
      console.error("Failed to quick update class:", err); 
      alert("שגיאה בעדכון השיעור. בדוק את הנתונים.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[200] p-4 md:p-6" dir="rtl">
      
      <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl transform transition-all animate-in fade-in zoom-in duration-200">
        
        {/* Header Section */}
        <div className="mb-6">
          <h4 className="font-black text-xl text-slate-800 leading-tight">
            בירווז מהיר: {lesson.course_name}
          </h4>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">
            {lesson.date} | {lesson.time}
          </p>
        </div>

        <div className="space-y-4">
          {/* row for Number and Name */}
          <div className="flex gap-3">
            <div className="w-20">
              <label className="text-[10px] font-black text-slate-400 uppercase mr-1">מספר</label>
              <input 
                type="number"
                placeholder="#"
                className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <label className="text-[10px] font-black text-slate-400 uppercase mr-1">נושא השיעור</label>
              <input 
                type="text"
                placeholder="על מה דיברנו?"
                className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

          {/* Description Textarea */}
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase mr-1">תיאור (בירווז)</label>
            <textarea 
              placeholder="פירוט חופשי..."
              className="w-full border border-slate-200 rounded-xl p-4 h-32 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none bg-slate-50/50"
              value={birvouz}
              onChange={(e) => setBirvouz(e.target.value)}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-row gap-3 mt-8">
          <button 
            onClick={handleSubmit} 
            className="flex-[2] bg-slate-900 text-white font-black py-4 rounded-2xl hover:bg-black active:scale-95 transition-all text-sm shadow-lg"
          >
            שמור בחווה
          </button>
          <button 
            onClick={onClose} 
            className="flex-1 bg-slate-100 text-slate-500 font-bold py-4 rounded-2xl hover:bg-slate-200 active:scale-95 transition-all text-sm"
          >
            ביטול
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuickUpdateModal;
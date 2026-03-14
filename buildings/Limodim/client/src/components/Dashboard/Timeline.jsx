// src/components/Dashboard/Timeline.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/api';
import QuickUpdateModal from './QuickUpdateModal';

const Timeline = () => {
  const [data, setData] = useState({ past: [], future: [] });
  const [selectedLesson, setSelectedLesson] = useState(null);

  const fetchTimeline = () => {
    api.getTimeline().then(res => setData(res.data));
  };
  
  useEffect(() => { fetchTimeline(); }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8" dir="rtl">
      <section className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <h3 className="font-black text-slate-800 mb-4 flex items-center gap-2">
          <span className="w-2 h-6 bg-slate-300 rounded-full"></span> שיעורים אחרונים
        </h3>
        <div className="space-y-3">
          {data.past.map((item, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div>
                <Link to={`/course/${item.course_id}`} className="font-bold text-slate-800 block hover:text-blue-600">{item.course_name}-{item.class_type==='Tutorial'?'תרגול':'הרצאה'}</Link>
                <span className="text-[10px] text-slate-500">{item.date} | {item.time}</span>
              </div>
              {item.is_performed ? (
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">עודכן בחווה</span>
              ) : (
                <button 
                  onClick={() => setSelectedLesson(item)}
                  className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-1 rounded-full border border-red-100 hover:bg-red-100 transition"
                >
                  לא עודכן +
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <h3 className="font-black text-slate-800 mb-4 flex items-center gap-2">
          <span className="w-2 h-6 bg-blue-500 rounded-full"></span> שיעורים קרובים
        </h3>
        <div className="space-y-3">
          {data.future.map((item, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-blue-50 rounded-xl border border-blue-100">
              <div>
                <Link to={`/course/${item.course_id}`} className="font-bold text-blue-900 block">{item.course_name}-{item.class_type==='Tutorial'?'תרגול':'הרצאה'}</Link>
                <span className="text-[10px] text-blue-600">יום {item.day} ב-{item.time} | {item.location}</span>
              </div>
              <span className="text-[10px] font-bold text-blue-500 italic">בהמתנה...</span>
            </div>
          ))}
        </div>
      </section>

      {selectedLesson && (
        <QuickUpdateModal 
          lesson={selectedLesson} 
          onClose={() => setSelectedLesson(null)} 
          onRefresh={fetchTimeline}
        />
      )}
    </div>
  );
};

export default Timeline;
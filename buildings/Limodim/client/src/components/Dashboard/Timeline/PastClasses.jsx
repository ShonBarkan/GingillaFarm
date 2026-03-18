import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../../api/api';
import QuickUpdateModal from '../QuickUpdateModal';

const PastClasses = () => {
  const [past, setPast] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null);

  const fetchData = () => api.getTimelinePastClasses().then(res => setPast(res.data));
  useEffect(() => { fetchData(); }, []);

  return (
    <section className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm h-full">
      <h3 className="font-black text-slate-800 mb-4 flex items-center gap-2">
        <span className="w-2 h-6 bg-slate-300 rounded-full"></span> שיעורים אחרונים
      </h3>
      <div className="space-y-3">
        {past.map((item, i) => (
          <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className="flex flex-col">
              <Link to={`/course/${item.course_id}`} className="font-bold text-slate-800 block hover:text-blue-600 text-sm">
                {item.course_name}
              </Link>
              <span className="text-[10px] text-slate-500">{item.date} | {item.time}</span>
            </div>
            {item.is_performed ? (
              <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100 uppercase">Synced</span>
            ) : (
              <button onClick={() => setSelectedLesson(item)} className="text-[9px] font-black text-red-600 bg-red-50 px-2 py-1 rounded-full border border-red-100 hover:bg-red-100">UPDATE +</button>
            )}
          </div>
        ))}
      </div>
      {selectedLesson && <QuickUpdateModal lesson={selectedLesson} onClose={() => setSelectedLesson(null)} onRefresh={fetchData} />}
    </section>
  );
};

export default PastClasses;
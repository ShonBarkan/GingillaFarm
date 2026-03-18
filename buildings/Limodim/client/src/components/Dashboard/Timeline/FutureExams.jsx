import React, { useEffect, useState } from 'react';
import api from '../../../api/api';
import TimeBadge from '../../common/TimeBadge';

const FutureExams = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getTimelineFutureExams()
      .then(res => {
        setExams(res.data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching exams:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return (
    <div className="animate-pulse bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
      <div className="h-4 bg-slate-200 rounded w-1/4 mb-4"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="h-16 bg-slate-100 rounded-xl"></div>
        <div className="h-16 bg-slate-100 rounded-xl"></div>
      </div>
    </div>
  );

  return (
    <section className="bg-white p-6 rounded-2xl border border-purple-100 shadow-sm relative overflow-hidden h-full min-h-[200px] flex flex-col">
      {/* Decorative background element - Purple */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-full -mr-16 -mt-16 opacity-40 pointer-events-none"></div>

      {/* Header */}
      <h3 className="font-black text-slate-800 mb-4 flex items-center gap-2 relative z-10">
        <span className="w-2 h-6 bg-purple-500 rounded-full"></span> 
        מבחנים קרובים
      </h3>

      <div className="relative z-10 flex-1 flex flex-col justify-start pt-1">
        {exams.length > 0 ? (
          /* List State */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {exams.map((exam, i) => (
              <div key={i} className={`p-3 rounded-xl border flex justify-between items-center transition-all ${
                exam.days_left <= 3 
                  ? 'bg-purple-50 border-purple-200 shadow-sm' 
                  : 'bg-slate-50 border-slate-100'
              }`}>
                <div className="min-w-0">
                  <p className="font-black text-slate-800 text-sm truncate">{exam.course_name}</p>
                  <p className={`text-[10px] font-bold ${exam.days_left <= 3 ? 'text-purple-600' : 'text-slate-500'}`}>
                    {exam.exam_name} • {exam.date}
                  </p>
                </div>
                {/* Assuming TimeBadge supports purple or using a consistent variant */}
                <TimeBadge daysLeft={exam.days_left} color="purple" />
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center py-10">
            <div className="w-14 h-14 bg-purple-50 rounded-full flex items-center justify-center mb-4 border border-purple-100 shadow-sm">
              <span className="text-3xl animate-pulse">☀️</span>
            </div>
            <h4 className="text-lg font-black text-slate-800">אין מבחנים באופק</h4>
            <p className="text-[10px] text-purple-600 font-bold uppercase tracking-widest mt-1">
              לוח המבחנים ריק כרגע. אפשר לנשום לרווחה.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default FutureExams;
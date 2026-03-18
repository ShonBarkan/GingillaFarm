import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../../api/api';
import TimeBadge from '../../common/TimeBadge';

const DueHomework = () => {
  const [hw, setHw] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHomework = () => {
    api.getTimelineDueHomework()
      .then(res => {
        setHw(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching homework:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchHomework();
  }, []);

  const handleMarkAsDone = async (item) => {
    try {
      // Optimistic UI update: remove from list immediately
      setHw(prev => prev.filter(h => h.id !== item.id));
      
      // API call to update the database
      await api.updateHomework(item.id, { ...item, is_done: true });
    } catch (err) {
      console.error("Failed to mark homework as done:", err);
      // Re-fetch in case of error to stay in sync
      fetchHomework();
    }
  };

  if (loading) return (
    <div className="animate-pulse bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
      <div className="h-4 bg-slate-200 rounded w-1/4 mb-4"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="h-20 bg-slate-100 rounded-xl"></div>
        <div className="h-20 bg-slate-100 rounded-xl"></div>
      </div>
    </div>
  );

  if (hw.length === 0) return null;

  return (
    <section className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-sm relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -mr-16 -mt-16 opacity-40 pointer-events-none"></div>

      <h3 className="font-black text-slate-800 mb-6 flex items-center gap-2 relative z-10">
        <span className="w-2 h-6 bg-emerald-500 rounded-full"></span> 
        מטלות להגשה
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
        {hw.map((item) => (
          <div key={item.id} className={`p-4 rounded-xl border flex justify-between items-center transition-all hover:shadow-md ${
            item.days_left <= 2 ? 'bg-emerald-50 border-emerald-200 shadow-sm' : 'bg-white border-slate-100'
          }`}>
            
            <div className="min-w-0 flex-1">
              <Link 
                to={`/course/${item.course_id}`} 
                className="font-black text-emerald-900 text-sm md:text-base hover:text-emerald-600 transition-colors block truncate"
              >
                {item.course_name}
              </Link>
              <p className="text-[11px] font-bold text-emerald-600 truncate mt-0.5">
                {item.name}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0 ml-4">

              {/* Assignment Link */}
              {item.link && (
                <a 
                  href={item.link.startsWith('http') ? item.link : `https://${item.link}`} 
                  target="_blank" 
                  rel="noreferrer" 
                  title="קישור למטלה"
                  className="h-[42px] w-[42px] flex items-center justify-center bg-white text-blue-500 border border-blue-100 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-all shadow-sm active:scale-90"
                >
                  <span className="text-lg leading-none">🔗</span>
                </a>
              )}

              {/* The Badge */}
              <TimeBadge daysLeft={item.days_left} color="emerald" />
            </div>
            
          </div>
        ))}
      </div>
    </section>
  );
};

export default DueHomework;
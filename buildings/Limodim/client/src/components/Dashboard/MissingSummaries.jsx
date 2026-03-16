import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/api';

const MissingSummaries = () => {
  const [missing, setMissing] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getMissingSummaries()
      .then(res => {
        // Validation: Ensure we are setting an array
        // Sometimes axios returns { data: [...] } and sometimes { data: { data: [...] } }
        const dataToSet = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        setMissing(dataToSet);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching missing summaries:", err);
        setMissing([]); // Fallback to empty array on error
        setLoading(false);
      });
  }, []);

  // Defensive check: only render if missing is an array and has items
  if (loading || !Array.isArray(missing) || missing.length === 0) return null;

  return (
    <section className="bg-white p-6 rounded-2xl border border-red-100 shadow-sm mt-8 mb-8" dir="rtl">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-black text-slate-800 flex items-center gap-2 text-lg">
          <span className="w-2.5 h-6 bg-red-500 rounded-full"></span> 
          שיעורים ללא סיכום ({missing.length})
        </h3>
        <span className="text-[10px] font-black text-red-500 bg-red-50 px-3 py-1 rounded-full animate-pulse border border-red-100 uppercase tracking-tighter">
          Missing PDF 📄
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {missing.map((item) => (
          <Link 
            key={item.id}
            to={`/course/${item.course_id}/class/${item.id}`}
            className="group flex flex-col p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-white hover:border-red-300 hover:shadow-xl hover:shadow-red-500/5 transition-all duration-300 relative overflow-hidden"
          >
            <div className="absolute -left-3 -bottom-3 text-5xl opacity-[0.03] group-hover:opacity-[0.08] transition-opacity rotate-12 grayscale">
              📄
            </div>
            
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-black text-slate-400 bg-white px-2 py-0.5 rounded-md border border-slate-100">
                שיעור #{item.number}
              </span>
              <span className="text-[10px] font-bold text-slate-400">{item.date}</span>
            </div>
            
            <h4 className="font-black text-slate-800 text-sm truncate group-hover:text-red-600 transition-colors">
              {item.course_name}
            </h4>
            <p className="text-xs text-slate-500 truncate mt-1 font-medium">
              {item.name}
            </p>
            
            <div className="mt-4 flex items-center justify-between">
              <span className="text-[10px] font-black text-red-500 group-hover:translate-x-[-4px] transition-transform">
                לחץ להעלאה ←
              </span>
              <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-[10px]">➕</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default MissingSummaries;
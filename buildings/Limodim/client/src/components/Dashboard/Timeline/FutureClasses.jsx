import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../../api/api';

const FutureClasses = () => {
  const [future, setFuture] = useState([]);
  const [now, setNow] = useState(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    api.getTimelineFutureClasses()
      .then(res => {
        setFuture(res.data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching future classes:", err);
        setLoading(false);
      });
  }, []);

  const isClassToday = (classDay) => {
    const daysMap = {
      'א': 0, 'ב': 1, 'ג': 2, 'ד': 3, 'ה': 4, 'ו': 5, 'ש': 6,
      'ראשון': 0, 'שני': 1, 'שלישי': 2, 'רביעי': 3, 'חמישי': 4, 'שישי': 5, 'שבת': 6
    };
    
    const todayIndex = now.getDay();
    const cleanDay = classDay?.replace(/'/g, '').trim(); 
    return daysMap[cleanDay] === todayIndex;
  };

  const getMinutesUntil = (classTimeStr, classDay) => {
    if (!classTimeStr || !isClassToday(classDay)) return null;

    const [hours, minutes] = classTimeStr.split(':').map(Number);
    const classTime = new Date(now);
    classTime.setHours(hours, minutes, 0, 0);
    
    const diffMs = classTime - now;
    const diffMins = Math.floor(diffMs / (1000 * 60));

    return diffMins;
  };

  if (loading) return (
    <div className="animate-pulse bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
      <div className="h-4 bg-slate-200 rounded w-1/4 mb-4"></div>
      <div className="space-y-3">
        <div className="h-16 bg-slate-100 rounded-xl"></div>
        <div className="h-16 bg-slate-100 rounded-xl"></div>
      </div>
    </div>
  );

  return (
    <section className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm h-full relative overflow-hidden flex flex-col min-h-[250px]">
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 opacity-40 pointer-events-none"></div>

      <h3 className="font-black text-slate-800 mb-6 flex items-center gap-2 relative z-10">
        <span className="w-2 h-6 bg-blue-500 rounded-full"></span> שיעורים קרובים
      </h3>
      
      {/* Changed justify-center to justify-start and added pt-1 */}
      <div className="relative z-10 flex-1 flex flex-col justify-start pt-1">
        {future.length > 0 ? (
          <div className="space-y-3">
            {future.map((item, i) => {
              const minsLeft = getMinutesUntil(item.time, item.day);
              const isStartingSoon = minsLeft !== null && minsLeft > 0 && minsLeft <= 60;

              return (
                <div 
                  key={i} 
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-300 ${
                    isStartingSoon 
                      ? 'border-blue-500 shadow-lg ring-2 ring-blue-500/10 bg-blue-300/30 scale-[1.02] z-10' 
                      : 'border-blue-100 bg-blue-100/30'
                  }`}
                >
                  <div className="min-w-0 flex-1 text-right">
                    <div className="flex items-center gap-2 justify-start">
                      <Link 
                        to={`/course/${item.course_id}`} 
                        className={`font-black block hover:underline text-sm truncate ${isStartingSoon ? 'text-blue-700' : 'text-blue-900'}`}
                      >
                        {item.course_name}
                      </Link>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase ${isStartingSoon ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-700'}`}>
                        {item.class_type}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[10px] font-bold ${isStartingSoon ? 'text-blue-500' : 'text-blue-400'}`}>
                        יום {item.day} ב-{item.time} | {item.location}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mr-4">
                    {isStartingSoon && (
                      <div className="flex flex-col items-center justify-center bg-blue-50 border border-blue-200 px-2 py-1 rounded-lg shadow-sm animate-pulse">
                        <span className="text-[10px] font-black text-blue-600 leading-none">{minsLeft}</span>
                        <span className="text-[7px] font-bold text-blue-400 uppercase">דקות</span>
                      </div>
                    )}

                    {item.zoom_link && (
                      <a href={item.zoom_link} target="_blank" rel="noopener noreferrer" 
                         className={`p-2 rounded-lg transition shadow-sm active:scale-90 ${isStartingSoon ? 'bg-blue-600 text-white shadow-blue-200' : 'bg-blue-100 text-blue-600 hover:bg-blue-200'}`}>
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M16 16L21 20V4L16 8V16ZM14 8C14 6.89543 13.1046 6 12 6H4C2.89543 6 2 6.89543 2 8V16C2 17.1046 2.89543 18 4 18H12C13.1046 18 14 17.1046 14 16V8Z"/>
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty state remains centered visually within its own padding but starts from top of container */
          <div className="flex flex-col items-center py-10">
            <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mb-4 border border-blue-100 shadow-sm">
              <span className="text-3xl animate-pulse">🛋️</span>
            </div>
            <h4 className="text-lg font-black text-slate-800">הלו"ז פנוי</h4>
            <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest mt-1">
              אין שיעורים קרובים מתוכננים. אפשר לנוח.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default FutureClasses;
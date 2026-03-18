import React, { useEffect, useState } from 'react';
import api from '../../../api/api';

const ReceptionHours = () => {
  const [reception, setReception] = useState([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    api.getTimelineReceptionHours()
      .then(res => {
        const data = res.data || [];
        const uniqueSlots = Array.from(new Map(data.map(item => [
          `${item.course_name}-${item.staff_name}-${item.day}-${item.time}`, 
          item
        ])).values());
        
        setReception(uniqueSlots);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching reception hours:", err);
        setLoading(false);
      });
  }, []);

  const isToday = (dayStr) => {
    const daysMap = {
      'א': 0, 'ב': 1, 'ג': 2, 'ד': 3, 'ה': 4, 'ו': 5, 'ש': 6,
      'א\'': 0, 'ב\'': 1, 'ג\'': 2, 'ד\'': 3, 'ה\'': 4, 'ו\'': 5, 'ש\'': 6,
      'ראשון': 0, 'שני': 1, 'שלישי': 2, 'רביעי': 3, 'חמישי': 4, 'שישי': 5, 'שבת': 6
    };
    const todayIndex = now.getDay();
    const cleanDay = dayStr?.trim();
    return daysMap[cleanDay] === todayIndex;
  };

  const getMinutesUntil = (timeStr, dayStr) => {
    if (!timeStr || !isToday(dayStr)) return null;

    const [hours, minutes] = timeStr.split(':').map(Number);
    const startTime = new Date(now);
    startTime.setHours(hours, minutes, 0, 0);

    const diffMs = startTime - now;
    return Math.floor(diffMs / (1000 * 60));
  };

  if (loading) return (
    <div className="animate-pulse bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
      <div className="h-4 bg-slate-200 rounded w-1/4 mb-4"></div>
      <div className="space-y-3">
        <div className="h-16 bg-slate-50 rounded-xl"></div>
      </div>
    </div>
  );

  return (
    <section className="bg-white p-6 rounded-2xl border border-amber-100 shadow-sm h-full relative overflow-hidden flex flex-col min-h-[250px]">
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-full -mr-16 -mt-16 opacity-40 pointer-events-none"></div>
      
      <h3 className="font-black text-slate-800 mb-6 flex items-center gap-2 relative z-10">
        <span className="w-2 h-6 bg-amber-500 rounded-full"></span> שעות קבלה קרובות
      </h3>
      
      {/* Changed justify-center to justify-start and added pt-1 */}
      <div className="relative z-10 flex-1 flex flex-col justify-start pt-1">
        {reception.length > 0 ? (
          <div className="space-y-3">
            {reception.map((slot) => {
              const minsLeft = getMinutesUntil(slot.time, slot.day);
              const isStartingSoon = minsLeft !== null && minsLeft > 0 && minsLeft <= 60;
              const uniqueKey = `${slot.course_name}-${slot.staff_name}-${slot.day}-${slot.time}`;

              return (
                <div 
                  key={uniqueKey} 
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                    isStartingSoon 
                      ? 'bg-amber-100/50 border-amber-400 shadow-md ring-1 ring-amber-400/30' 
                      : 'bg-amber-50 border-amber-100 transition-hover hover:shadow-md'
                  }`}
                >
                  <div className="flex flex-col min-w-0 flex-1 text-right">
                    <span className="font-black text-amber-900 text-sm truncate">{slot.course_name}</span>
                    <span className={`text-[11px] font-bold ${isStartingSoon ? 'text-amber-800' : 'text-amber-700'}`}>
                      {slot.staff_name} • {slot.day}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {isStartingSoon && (
                      <div className="flex flex-col items-center justify-center bg-amber-500 text-white px-2 py-1 rounded-lg shadow-sm animate-pulse min-w-[45px]">
                        <span className="text-[10px] font-black leading-none">{minsLeft}</span>
                        <span className="text-[7px] font-bold uppercase">דקות</span>
                      </div>
                    )}

                    <div className="text-left shrink-0">
                      <div className={`text-xs font-black px-2 py-1 rounded-md border ${
                        isStartingSoon ? 'bg-white border-amber-400 text-amber-600' : 'bg-white border-amber-200 text-slate-800'
                      }`}>
                        {slot.time}
                      </div>
                      <p className={`text-[10px] mt-1 font-medium text-center ${isStartingSoon ? 'text-amber-700' : 'text-amber-600'}`}>
                        {slot.location}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center py-10">
            <div className="w-14 h-14 bg-amber-50 rounded-full flex items-center justify-center mb-4 border border-amber-100 shadow-sm">
              <span className="text-3xl animate-pulse">💬</span>
            </div>
            <h4 className="text-lg font-black text-slate-800">אין שעות קבלה באופק</h4>
            <p className="text-[10px] text-amber-600 font-bold uppercase tracking-widest mt-1">
              לוח שעות הקבלה ריק כרגע.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default ReceptionHours;
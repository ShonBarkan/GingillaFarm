import React, { useEffect, useState } from 'react';
import api from '../../../api/api';

const ReceptionHours = () => {
  const [reception, setReception] = useState([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(new Date());

  // עדכון השעה בכל דקה
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    api.getTimelineReceptionHours()
      .then(res => {
        // --- מנגנון סינון כפילויות ---
        // אנחנו יוצרים "מפתח" ייחודי לכל שורה ומסננים כפילויות לפי המפתח הזה
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

  // בדיקה האם שעת הקבלה היא היום
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

  // חישוב דקות עד שעת הקבלה (רק אם זה היום)
  const getMinutesUntil = (timeStr, dayStr) => {
    if (!timeStr || !isToday(dayStr)) return null;

    const [hours, minutes] = timeStr.split(':').map(Number);
    const startTime = new Date(now);
    startTime.setHours(hours, minutes, 0, 0);

    const diffMs = startTime - now;
    return Math.floor(diffMs / (1000 * 60));
  };

  if (loading) return null;
  if (reception.length === 0) return null;

  return (
    <section className="bg-white p-6 rounded-2xl border border-amber-100 shadow-sm h-full relative overflow-hidden">
      <h3 className="font-black text-slate-800 mb-4 flex items-center gap-2">
        <span className="w-2 h-6 bg-amber-500 rounded-full"></span> שעות קבלה קרובות
      </h3>
      
      <div className="space-y-3">
        {reception.map((slot) => {
          const minsLeft = getMinutesUntil(slot.time, slot.day);
          const isStartingSoon = minsLeft !== null && minsLeft > 0 && minsLeft <= 60;
          
          // מפתח ייחודי ל-React key (עדיף מ-index i)
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
    </section>
  );
};

export default ReceptionHours;
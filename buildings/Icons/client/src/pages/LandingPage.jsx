import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { iconService } from '../services/iconService';
import IconCarousel from '../components/landing/IconCarousel';
import FolderCard from '../components/common/FolderCard'; // רכיב התיקייה הגנרי החדש

const LandingPage = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadSubjects = async () => {
    try {
      const data = await iconService.getSubjects();
      setSubjects(data);
    } catch (err) {
      console.error("Failed to load subjects:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubjects();
  }, []);

  return (
    <div className="pb-24" dir="rtl">
      {/* Hero Section */}
      <section className="py-24 px-6 max-w-7xl mx-auto text-center">
        <div className="inline-block px-4 py-1.5 mb-6 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-emerald-500 text-xs font-bold uppercase tracking-widest">
          תשתית Gingilla Farm
        </div>
        <h1 className="text-7xl font-black tracking-tighter text-white mb-6">
          נכסי <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">SVG</span>
        </h1>
        <p className="text-slate-400 max-w-2xl mx-auto text-lg mb-10 leading-relaxed">
          המרכז הראשי של החווה לאייקונים. ניהול, עיון והטמעה של גרפיקה וקטורית בכל רחבי המערכת.
        </p>
        <Link 
          to="/add-icon" 
          className="bg-emerald-600 hover:bg-emerald-500 text-white px-10 py-4 rounded-2xl font-black text-lg transition-all shadow-lg shadow-emerald-900/20 active:scale-95 inline-block"
        >
          לשתול אייקון חדש
        </Link>
      </section>

      {/* 4 Carousels Row */}
      <section className="flex flex-col gap-4 mb-24">
        <IconCarousel direction="right" speed="45s" />
        <IconCarousel direction="left" speed="35s" />
        <IconCarousel direction="right" speed="55s" />
        <IconCarousel direction="left" speed="40s" />
      </section>

      {/* Folders Section */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="flex items-center gap-4 mb-12">
          <h2 className="text-3xl font-black tracking-tight text-white uppercase">קטגוריות ראשיות</h2>
          <div className="h-[2px] flex-grow bg-slate-800" />
        </div>
        
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-pulse text-emerald-500 font-bold uppercase tracking-widest">טוען מבנה תיקיות...</div>
          </div>
        ) : subjects.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {subjects.map((sub) => (
              <FolderCard 
                key={sub} 
                name={sub} 
                size="lg" 
                type="subject" 
                onDeleteSuccess={loadSubjects} // רענון הרשימה לאחר מחיקה
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-slate-900/30 rounded-[3rem] border border-dashed border-slate-800">
            <p className="text-slate-500 italic text-lg">עדיין לא נשתלו אייקונים בחווה.</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default LandingPage;
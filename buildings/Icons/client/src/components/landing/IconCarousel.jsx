import React, { useEffect, useState } from 'react';
import { iconService } from '../../services/iconService';
import DisplaySvg from '../common/DisplaySvg';
import IconModal from '../common/IconModal'; // ייבוא המודל החדש

const IconCarousel = ({ direction = 'left', speed = '30s' }) => {
  const [icons, setIcons] = useState([]);
  const [selectedIcon, setSelectedIcon] = useState(null); // State לאייקון שנבחר

  useEffect(() => {
    const fetchRandom = async () => {
      try {
        const data = await iconService.getRandomIcons(15);
        setIcons(data.data || data);
      } catch (err) {
        console.error("טעינת הקרוסלה נכשלה:", err);
      }
    };
    fetchRandom();
  }, []);

  // פונקציית מחיקה מקומית (בשביל המודל)
  const handleDelete = async (id) => {
    try {
      await iconService.deleteIcon(id);
      setIcons(icons.filter(icon => icon.id !== id));
      setSelectedIcon(null);
    } catch (err) {
      alert("המחיקה נכשלה.");
    }
  };

  // פונקציית עריכה מקומית (בשביל המודל)
  const handleEdit = async (id, updatedData) => {
    try {
      await iconService.updateIcon(id, updatedData);
      setIcons(prev => prev.map(icon => 
        icon.id === id ? { ...icon, ...updatedData } : icon
      ));
      // עדכון האייקון הנבחר כדי שהמודל יתעדכן ויזואלית
      setSelectedIcon({ ...updatedData, id });
    } catch (err) {
      alert("העדכון נכשל.");
    }
  };

  if (icons.length === 0) return <div className="h-20" />;

  const displayIcons = [...icons, ...icons];
  const animationClass = direction === 'left' ? 'animate-marquee-left' : 'animate-marquee-right';

  return (
    <>
      <div className="relative flex overflow-x-hidden border-y border-slate-900/50 py-6 bg-slate-900/10 backdrop-blur-sm" dir="ltr">
        <div 
          className={`flex whitespace-nowrap ${animationClass} hover:[animation-play-state:paused]`}
          style={{ animationDuration: speed }}
        >
          {displayIcons.map((icon, idx) => (
            <div 
              key={`${icon.id}-${idx}`} 
              className="mx-10 flex flex-col items-center group cursor-pointer" // שינוי ל-cursor-pointer
              onClick={() => setSelectedIcon(icon)} // פתיחת המודל בלחיצה
            >
              <DisplaySvg 
                svgContent={icon.svg_content}
                className="w-14 h-14 opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300 shadow-xl"
              />
              <span className="text-[10px] font-mono text-slate-500 mt-2 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity text-center w-full">
                {icon.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* שימוש במודל - נפתח רק כשיש selectedIcon */}
      <IconModal 
        isOpen={!!selectedIcon}
        onClose={() => setSelectedIcon(null)}
        icon={selectedIcon}
        onDelete={handleDelete}
        onEdit={handleEdit}
      />
    </>
  );
};

export default IconCarousel;
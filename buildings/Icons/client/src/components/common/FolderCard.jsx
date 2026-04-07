import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { iconService } from '../../services/iconService';
import DisplaySvg from './DisplaySvg';

const FolderCard = ({ 
  name, 
  type = 'subject', 
  size = 'lg', 
  parentSubject = '', 
  isActive = false, 
  onClick, 
  onDeleteSuccess 
}) => {
  const [folderIcon, setFolderIcon] = useState(null);

  useEffect(() => {
    const checkFolderIcon = async () => {
      try {
        const data = await iconService.getIcons(''); 
        const icons = data.data || data;
        const match = icons.find(icon => icon.name.toLowerCase() === name.toLowerCase());
        if (match) setFolderIcon(match.svg_content);
      } catch (err) { console.error(err); }
    };
    checkFolderIcon();
  }, [name]);

  const handleDeleteFolder = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const confirmMsg = type === 'subject' 
      ? `זהירות! האם למחוק את כל הנושא "${name}" על כל האייקונים שבו?`
      : `האם למחוק את כל האייקונים תחת תת-הנושא "${name}"?`;

    if (!window.confirm(confirmMsg)) return;

    try {
      // קריאה למחיקה המונית בשרת
      if (type === 'subject') {
        await iconService.deleteBulk(name);
      } else {
        await iconService.deleteBulk(parentSubject, name);
      }
      
      if (onDeleteSuccess) onDeleteSuccess();
    } catch (err) {
      console.error("Bulk delete failed:", err);
      alert("המחיקה נכשלה.");
    }
  };

  const sizes = {
      sm: {
        // הקטנו פדינג מ-3 ל-2, והגדלנו מינימום רוחב כדי שהטקסט לא ימחץ את האייקון
        container: "p-2 rounded-xl gap-1.5 min-w-[110px] min-h-[100px] justify-center",
        // הגדלנו מ-w-8 h-8 ל-w-14 h-14 (כמעט כפול!)
        iconBox: "w-14 h-14 flex items-center justify-center", 
        emoji: "text-2xl",
        title: "text-[12px] leading-tight mt-1",
        badge: "hidden",
        deleteBtn: "top-1 left-1 p-1 text-[10px]"
      },
      lg: {
        // הגדלנו את התיקיות הגדולות שיהיו מרשימות יותר
        container: "p-6 rounded-[2.5rem] gap-4 min-w-[200px]",
        // הגדלנו מ-w-20 h-20 ל-w-32 h-32
        iconBox: "w-32 h-32 flex items-center justify-center",
        emoji: "text-7xl",
        title: "text-2xl mt-2",
        badge: "block",
        deleteBtn: "top-4 left-4 p-2 text-sm"
      }
    };

  const currentSize = sizes[size];
  const activeClass = isActive 
    ? "border-emerald-500 bg-emerald-500/10" 
    : "border-slate-800 bg-slate-900 hover:border-slate-700";

  const Container = onClick ? 'div' : Link;
  const containerProps = onClick 
    ? { onClick: () => onClick() } 
    : { to: type === 'subject' ? `/icons?subject=${name}` : `/icons?subject=${parentSubject}&sub_subject=${name}` };

  return (
    <Container 
      {...containerProps}
      dir="rtl"
      className={`group relative border transition-all duration-300 overflow-hidden flex flex-col items-center text-center cursor-pointer shadow-lg ${currentSize.container} ${activeClass}`}
    >
      {/* כפתור המחיקה - מופיע בריחוף */}
      <button 
        onClick={handleDeleteFolder}
        className={`absolute bg-red-500/10 text-red-500 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white transition-all z-30 ${currentSize.deleteBtn}`}
        title="מחק את כל תוכן התיקייה"
      >
        🗑️
      </button>

      <div className={`flex items-center justify-center transform group-hover:scale-110 transition-transform ${currentSize.iconBox}`}>
        {folderIcon ? (
          <DisplaySvg svgContent={folderIcon} className="w-full h-full" />
        ) : (
          <span className={currentSize.emoji}>{name === 'הכל' ? '🌟' : '📁'}</span>
        )}
      </div>

      <h3 className={`font-bold transition-colors ${currentSize.title} ${isActive ? 'text-emerald-400' : 'text-slate-300'}`}>
        {name}
      </h3>
    </Container>
  );
};

export default FolderCard;
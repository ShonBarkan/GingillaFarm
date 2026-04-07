import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { iconService } from '../services/iconService';
import IconCard from '../components/icons/IconCard';
import IconFilterHeader from '../components/icons/IconFilterHeader';

const IconsPage = () => {
  const [searchParams] = useSearchParams();
  const subjectParam = searchParams.get('subject') || '';
  
  const [icons, setIcons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSub, setActiveSub] = useState('');

  useEffect(() => {
    setActiveSub(''); 
    loadIcons();
  }, [subjectParam]);

  const loadIcons = async () => {
    setLoading(true);
    try {
      const data = await iconService.getIcons(subjectParam);
      const iconList = data.data || data;
      setIcons(iconList);
    } catch (err) {
      console.error("Failed to load icons:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("למחוק את האייקון הזה מהחווה?")) return;
    try {
      await iconService.deleteIcon(id);
      setIcons(icons.filter(icon => icon.id !== id));
    } catch (err) {
      alert("המחיקה נכשלה.");
    }
  };

  // הפונקציה המעודכנת: מקבלת את הנתונים ישירות מהכרטיס ושולחת לשרת
  const handleEdit = async (id, updatedData) => {
    try {
      await iconService.updateIcon(id, updatedData);
      
      // עדכון ה-State המקומי כדי שהשינוי יופיע מיד ללא טעינת דף
      setIcons(prev => prev.map(icon => 
        icon.id === id ? { ...icon, ...updatedData } : icon
      ));
      
      console.log("נכס עודכן בהצלחה");
    } catch (err) {
      console.error("Update failed:", err);
      alert("העדכון נכשל במערכת.");
    }
  };

  const subSubjects = [...new Set(icons.map(i => i.sub_subject))].sort();

  const filteredIcons = activeSub 
    ? icons.filter(i => i.sub_subject === activeSub) 
    : icons;

  return (
    <div className="max-w-7xl mx-auto px-6 py-12" dir="rtl">
      <IconFilterHeader 
        subject={subjectParam} 
        subSubjects={subSubjects}
        activeSub={activeSub}
        onSelectSub={setActiveSub}
      />

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin text-4xl">⚙️</div>
        </div>
      ) : filteredIcons.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {filteredIcons.map(icon => (
            <IconCard 
              key={icon.id} 
              icon={icon} 
              onDelete={handleDelete}
              onEdit={handleEdit} // הפונקציה החדשה מועברת כאן
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-slate-900/30 rounded-3xl border border-slate-800">
          <p className="text-slate-500 italic">לא נמצאו אייקונים בקטגוריה זו.</p>
        </div>
      )}
    </div>
  );
};

export default IconsPage;
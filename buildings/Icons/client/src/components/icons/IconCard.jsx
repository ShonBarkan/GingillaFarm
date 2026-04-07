import React, { useState } from 'react';
import DisplaySvg from '../common/DisplaySvg';
import IconModal from '../common/IconModal';

const IconCard = ({ icon, onDelete, onEdit }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      {/* תצוגת הכרטיס בגלריה */}
      <div 
        className="group relative bg-slate-900 border border-slate-800 p-6 rounded-3xl hover:border-emerald-500/50 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col items-center shadow-lg"
        dir="rtl"
        onClick={() => setIsModalOpen(true)}
      >
        <DisplaySvg 
          svgContent={icon.svg_content} 
          className="w-16 h-16 mb-4 shadow-inner group-hover:scale-110 transition-transform"
        />
        <h3 className="font-bold text-slate-200 text-sm truncate w-full text-center px-1">
          {icon.name}
        </h3>
        <p className="text-[10px] text-slate-500 font-mono mt-1 uppercase tracking-tighter">
          {icon.sub_subject}
        </p>
      </div>

      {/* המודל המשויך לכרטיס */}
      <IconModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        icon={icon}
        onDelete={onDelete}
        onEdit={onEdit}
      />
    </>
  );
};

export default IconCard;
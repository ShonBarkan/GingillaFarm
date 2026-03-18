import React from 'react';

const ClassPageBirvouzBanner = ({ birvouz }) => {
  // Only render the banner if there is a 'birvouz' quote provided
  if (!birvouz) return null;

  return (
    <div className="bg-amber-50/50 border-y border-amber-100 py-10 px-6 my-6 shadow-sm">
      <div className="max-w-3xl mx-auto flex flex-col items-center text-center gap-4">
        
        {/* Decorative elements around the header */}
        <div className="flex items-center gap-4">
          <div className="h-[1px] w-12 bg-amber-200"></div>
          <h2 className="text-amber-600 text-[12px] font-black uppercase tracking-[0.4em] flex items-center gap-2">
            BIROVOUZ 🦆
          </h2>
          <div className="h-[1px] w-12 bg-amber-200"></div>
        </div>

        {/* The main quote text */}
        <p className="text-xl md:text-2xl font-bold text-amber-900 leading-relaxed italic">
          "{birvouz}"
        </p>

      </div>
    </div>
  );
};

export default ClassPageBirvouzBanner;
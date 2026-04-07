import React from 'react';

const DisplaySvg = ({ svgContent, className = "" }) => {
  const contentLower = svgContent.toLowerCase();

  const isDark = 
    /fill=['"](black|#000|#000000|#111|#111111|#1a1a1a|#020617)['"]/.test(contentLower) || 
    /stroke=['"](black|#000|#000000|#111|#111111|#1a1a1a|#020617)['"]/.test(contentLower) ||
    /style=.*(fill|stroke):\s*(black|#000|#000000)/.test(contentLower) ||
    (!contentLower.includes('fill=') && !contentLower.includes('fill:') && !contentLower.includes('none'));

  return (
    <div className={`
      relative flex items-center justify-center rounded-2xl p-3 transition-all duration-300
      ${isDark ? 'bg-white border border-slate-200 shadow-sm' : 'bg-slate-950 border border-slate-800'} 
      ${className}
    `}>
      <div 
        className="w-full h-full flex items-center justify-center [&>svg]:w-full [&>svg]:h-full"
        dangerouslySetInnerHTML={{ __html: svgContent }} 
      />
    </div>
  );
};

export default DisplaySvg;
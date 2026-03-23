import React from 'react';

const NodeVisual = ({ visual, title }) => {
  if (!visual || visual.type === 'none' || !visual.value) return null;

  switch (visual.type) {
    case 'svg':
      return (
        <div 
          className="my-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm overflow-auto"
          dangerouslySetInnerHTML={{ __html: visual.value }} 
        />
      );
    case 'url':
      return (
        <img 
          src={visual.value} 
          alt={title} 
          className="my-4 rounded-xl border border-slate-200 max-h-96 object-contain" 
        />
      );
    case 'mermaid':
      return (
        <div className="my-4 p-4 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs text-blue-700">
          <pre>{visual.value}</pre>
        </div>
      );
    default:
      return null;
  }
};

export default NodeVisual;
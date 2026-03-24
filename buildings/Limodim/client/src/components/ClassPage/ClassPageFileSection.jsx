import React from 'react';

const ClassPageFileSection = ({ 
  summaryFiles = [], // Default to empty array to prevent undefined errors
  selectedFilePath, 
  onSelectFile, 
  onDeleteFile, 
  apiBaseUrl 
}) => {
  
  // Ensure we are always working with an array even if the prop is null
  const files = Array.isArray(summaryFiles) ? summaryFiles : [];

  return (
    <div className="flex flex-col md:flex-row gap-6 animate-fadeIn">
      
      {/* Sidebar: File Selection List */}
      <aside className="w-full md:w-64 shrink-0">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden sticky top-24">
          <div className="p-4 bg-slate-50 border-b">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Lesson Documents ({files.length})
            </p>
          </div>
          
          <div className="p-2 space-y-1 max-h-[70vh] overflow-y-auto custom-scrollbar">
            {files.map((path, idx) => {
              // Safety check for path string
              if (typeof path !== 'string') return null;

              // Extracting file name by removing the unique timestamp prefix
              const fileName = path.split('/').pop().replace(/^\d+_/, '');
              const isActive = selectedFilePath === path;
              
              return (
                <div 
                  key={idx}
                  onClick={() => onSelectFile(path)}
                  className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border ${
                    isActive 
                      ? 'bg-blue-50 border-blue-100 text-blue-700 shadow-sm' 
                      : 'border-transparent hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-lg">📄</span>
                    <span className="text-xs font-bold truncate max-w-[130px]">{fileName}</span>
                  </div>
                  
                  {/* Delete Action */}
                  <button 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      onDeleteFile(path); 
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-red-400 hover:text-red-600 transition-opacity"
                    title="Delete file"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path 
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>
              );
            })}
            
            {/* Empty State */}
            {files.length === 0 && (
              <div className="p-8 text-center text-slate-300 text-[10px] font-bold uppercase">
                No files uploaded yet
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main View: PDF Viewer Iframe */}
      <main className="flex-1 min-w-0 pb-10">
        {selectedFilePath ? (
          <div className="w-full bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <iframe 
              src={`${apiBaseUrl}/pdf-files/${selectedFilePath}#toolbar=1`} 
              className="w-full border-none" 
              title="Class PDF Viewer"
              style={{ height: '100vh', minHeight: '800px' }} 
            />
          </div>
        ) : (
          <div className="min-h-[500px] flex flex-col items-center justify-center text-slate-400 bg-white rounded-3xl border-2 border-dashed border-slate-200">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <span className="text-4xl">📂</span>
            </div>
            <p className="font-black text-sm uppercase tracking-widest text-slate-300">
              Select a document to view
            </p>
          </div>
        )}
      </main>
      
    </div>
  );
};

export default ClassPageFileSection;
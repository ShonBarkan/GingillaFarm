import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

const ClassPageAISubjectItem = ({ subject, level = 0 }) => {
  if (!subject) return null;

  const getHeaderSize = (lvl) => {
    switch (lvl) {
      case 0: return "text-2xl md:text-3xl font-black text-slate-900 mb-4 tracking-tight";
      case 1: return "text-lg md:text-xl font-bold text-blue-700 mb-3";
      case 2: return "text-base md:text-lg font-bold text-slate-800 mb-2";
      default: return "text-sm md:text-base font-semibold text-slate-700 mb-2";
    }
  };

  const getContainerStyle = (lvl) => {
    if (lvl === 0) return "mb-16 last:mb-0";
    return "mt-8 mr-4 md:mr-8 border-r-2 border-slate-100 pr-5 md:pr-7";
  };

  const getBorderColor = (lvl) => {
    if (lvl === 0) return "border-blue-600/20 border-r-4 pr-6";
    if (lvl === 1) return "border-blue-400/20";
    return "border-slate-200/50";
  };

  return (
    <div className={`${getContainerStyle(level)} group transition-all duration-300`}>
      
      <div className={`${getHeaderSize(level)} flex items-center gap-3`}>
        {level === 1 && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />}
        <ReactMarkdown 
          remarkPlugins={[remarkMath]} 
          rehypePlugins={[rehypeKatex]}
          components={{
            p: ({node, ...props}) => <span {...props} /> 
          }}
        >
          {subject.title}
        </ReactMarkdown>
      </div>

      <div className={`${level === 0 ? getBorderColor(0) : ''}`}>
        <div className="prose prose-slate max-w-none text-slate-600 text-sm md:text-[16px] leading-relaxed antialiased">
          <ReactMarkdown 
            remarkPlugins={[remarkMath]} 
            rehypePlugins={[rehypeKatex]}
          >
            {subject.description}
          </ReactMarkdown>
        </div>

        {subject.sub_topics && subject.sub_topics.length > 0 && (
          <div className="flex flex-col">
            {subject.sub_topics.map((sub, idx) => (
              <ClassPageAISubjectItem 
                key={idx} 
                subject={sub} 
                level={level + 1} 
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClassPageAISubjectItem;
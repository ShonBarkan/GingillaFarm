import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

const ClassPageAIQuizQuestion = ({ questionData, selectedAnswer, onSelect, showResult }) => {
  const allOptions = [questionData.correct_answer, ...questionData.distractors];
  
  // Sort options to keep them consistent during a single session
  const sortedOptions = React.useMemo(() => [...allOptions].sort(), [questionData]);

  return (
    <div className="space-y-6">
      <div className="text-lg font-bold text-slate-800 bg-slate-50 p-6 rounded-2xl border border-slate-100">
        <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
          {questionData.question}
        </ReactMarkdown>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {sortedOptions.map((option, idx) => {
          const isCorrect = option === questionData.correct_answer;
          const isSelected = selectedAnswer === option;
          
          let statusClasses = "border-slate-200 hover:border-blue-300 hover:bg-blue-50";
          if (showResult) {
            if (isCorrect) statusClasses = "border-emerald-500 bg-emerald-50 text-emerald-700 ring-2 ring-emerald-100";
            else if (isSelected && !isCorrect) statusClasses = "border-red-500 bg-red-50 text-red-700";
            else statusClasses = "border-slate-100 opacity-50";
          } else if (isSelected) {
            statusClasses = "border-blue-600 bg-blue-50 text-blue-700 ring-2 ring-blue-100";
          }

          return (
            <button
              key={idx}
              disabled={showResult}
              onClick={() => onSelect(option)}
              className={`p-4 rounded-xl border-2 text-right font-bold transition-all flex items-center gap-4 ${statusClasses}`}
            >
              <div className={`w-5 h-5 rounded-full border-2 flex shrink-0 items-center justify-center ${
                isSelected ? 'border-blue-600 bg-blue-600' : 'border-slate-300'
              }`}>
                {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
              </div>
              <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                {option}
              </ReactMarkdown>
            </button>
          );
        })}
      </div>

      {showResult && questionData.explanation && (
        <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 mt-4">
          <p className="text-[10px] font-black text-blue-400 uppercase mb-1">Explanation</p>
          <div className="text-blue-800 text-sm italic">
            <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
              {questionData.explanation}
            </ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassPageAIQuizQuestion;
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

const NodeViewContent = ({ content }) => {
  if (!content) return null;

  return (
    <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed dark:prose-invert mt-2 pr-2">
      <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default NodeViewContent;
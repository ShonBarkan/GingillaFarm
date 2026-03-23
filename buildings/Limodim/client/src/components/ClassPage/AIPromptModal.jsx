import React from 'react';
import { Copy, X, Sparkles, BrainCircuit, FileText } from 'lucide-react';

const AIPromptModal = ({ isOpen, onClose, type = 'summary' }) => {
  if (!isOpen) return null;

  // Define prompts for each mode
  const prompts = {
    summary: {
      title: "פרומפט ליצירת סיכום",
      icon: <FileText size={20} />,
      color: "text-blue-600",
      text: `Generate a detailed academic summary for a university lecture. 
Return ONLY a JSON array of objects. 
Each object must follow this structure:
{
  "title": "Topic Title",
  "content": "Detailed explanation using Markdown and LaTeX for math (e.g., $\\alpha \\cap \\beta$)",
  "summary_type": "definition/proof/example/formula",
  "order_index": 0,
  "visual": { "type": "svg/url/mermaid/none", "value": "..." },
  "sub_topics": [ { ... same structure recursively ... } ]
}
Important: Use Hebrew for text. Ensure math is wrapped in single dollar signs for inline and double for blocks.`
    },
    quiz: {
      title: "פרומפט ליצירת בוחן",
      icon: <BrainCircuit size={20} />,
      color: "text-purple-600",
      text: `Generate a challenging academic quiz based on lecture materials.
Return ONLY a JSON array of objects.
Each object must follow this structure:
{
  "question_text": "The question using LaTeX for math (e.g. $\\sum_{i=1}^{n} i$)",
  "correct_answer": "The correct answer string",
  "explanation": "Detailed explanation of why the correct answer is right",
  "distractors": [
    {
      "answer_text": "Wrong option 1",
      "explanation": "Specific feedback on why this specific mistake might occur"
    }
  ]
}
Important: Use Hebrew for text. Ensure math is wrapped in single dollar signs for inline and double for blocks.`
    }
  };

  const currentPrompt = prompts[type] || prompts.summary;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(currentPrompt.text);
    alert("הפרומפט הועתק!");
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div className={`flex items-center gap-2 ${currentPrompt.color}`}>
            {currentPrompt.icon}
            <h2 className="font-black text-xl">{currentPrompt.title}</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={24} />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-8">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={16} className="text-amber-500" />
            <p className="text-slate-600 font-medium">העתק את הפרומפט הבא ל-ChatGPT/Claude:</p>
          </div>

          <div className="bg-slate-900 text-slate-300 p-6 rounded-2xl font-mono text-sm leading-relaxed relative group border-4 border-slate-800 shadow-inner">
            <div className="max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
               <pre className="whitespace-pre-wrap">{currentPrompt.text}</pre>
            </div>
            
            <button 
              onClick={copyToClipboard}
              className="absolute top-4 left-4 p-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-all text-white border border-white/10 shadow-xl backdrop-blur-md"
              title="העתק פרומפט"
            >
              <Copy size={20} />
            </button>
          </div>

          <div className="mt-6 p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-3">
             <div className="text-amber-500">💡</div>
             <p className="text-xs text-amber-700 leading-relaxed">
               שים לב: המערכת מצפה לפורמט ה-JSON המדויק שמופיע למעלה. 
               אם ה-AI מחזיר טקסט נוסף לפני או אחרי ה-JSON, וודא שאתה מעתיק רק את הבלוק שמתחיל ב-<code>[</code> ומסתיים ב-<code>]</code>.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIPromptModal;
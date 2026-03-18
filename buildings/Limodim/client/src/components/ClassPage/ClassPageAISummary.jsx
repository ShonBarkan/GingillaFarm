import React, { useState } from 'react';
import ClassPageAISubjectItem from './ClassPageAISubjectItem';

const SUMMARY_PROMPT = `You are an academic expert. Analyze the provided lesson content and generate a Hierarchical Summary in JSON format.

Strict Requirements:
1. Language: Use Hebrew for all explanations. 
2. Technical Terms: Keep technical concepts, complexity notations, and industry terms in English (e.g., "B-Tree", "Worst-case", "Amortized Analysis") if they are more clear that way.
3. Format: Return ONLY a valid JSON array of objects.
4. Structure: Each object must have:
   - "title": Topic name.
   - "description": Detailed explanation in Markdown.
   - "sub_topics": A recursive list of the same structure.
5. Math: Use LaTeX for all mathematical notations (e.g., $O(n \\log n)$, $\\sum$).
6. Citations & References: Strictly FORBIDDEN to include any citations, reference numbers, or tags like "", "[1]", or "(p. 45)". Clean all such markers from the text.
7. Rich Content & Formatting: 
   - The "description" field must be well-structured using Markdown. 
   - Use "\\n" for line breaks between paragraphs.
   - Use Markdown bullets (- or *) for lists and bolding (**) for key terms.
   - Ensure the content is organized visually so that ReactMarkdown can render it clearly.
8. Output: Strictly JSON, no extra text.`;

const ClassPageAISummary = ({ aiSummary, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [jsonBuffer, setJsonBuffer] = useState(JSON.stringify(aiSummary, null, 2));

  const handleSave = () => {
    try {
      const parsed = JSON.parse(jsonBuffer);
      onUpdate(parsed);
      setIsEditing(false);
    } catch (e) {
      alert("פורמט JSON לא תקין. אנא בדוק את התחביר שלך.");
    }
  };

  const copyPrompt = () => {
    navigator.clipboard.writeText(SUMMARY_PROMPT);
    alert("הפרומפט הועתק ללוח!");
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-10 animate-fadeIn" dir="rtl">
      
      {/* Header Section */}
      <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-xl font-black text-slate-800">סיכום שיעור AI</h2>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">מבנה ידע היררכי ומאורגן</p>
        </div>
        
        <button 
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          className={`px-6 py-2 rounded-xl font-black text-xs transition-all active:scale-95 ${
            isEditing ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          {isEditing ? 'שמור שינויים' : 'עריכת JSON'}
        </button>
      </div>

      {isEditing ? (
        <div className="space-y-4">
          
          {/* AI Helper Bar */}
          <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
            <div className="flex items-center gap-2">
              <span className="text-lg">🤖</span>
              <span className="text-xs font-bold text-slate-500">עורך ה-JSON של הסיכום</span>
            </div>
            <button 
              onClick={copyPrompt}
              className="flex items-center gap-2 bg-slate-800 text-white px-3 py-1.5 rounded-lg text-[10px] font-black hover:bg-slate-700 transition-colors"
            >
              📋 העתק פרומפט למערכת
            </button>
          </div>

          <textarea
            dir="ltr"
            className="w-full h-[600px] p-6 font-mono text-sm bg-slate-900 text-emerald-400 rounded-2xl outline-none focus:ring-4 focus:ring-blue-100 transition-all border-none shadow-inner"
            value={jsonBuffer}
            onChange={(e) => setJsonBuffer(e.target.value)}
            placeholder="הדבק כאן את ה-JSON של הסיכום..."
          />

          <div className="flex justify-end gap-3">
            <button 
              onClick={() => {
                setIsEditing(false);
                setJsonBuffer(JSON.stringify(aiSummary, null, 2));
              }}
              className="px-6 py-2 text-slate-400 font-bold text-xs hover:text-slate-600 transition-colors"
            >
              ביטול
            </button>
            <button 
              onClick={handleSave}
              className="bg-blue-600 text-white px-8 py-2 rounded-xl font-black text-xs shadow-lg shadow-blue-100 active:scale-95 transition-all"
            >
              עדכן סיכום
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {aiSummary && aiSummary.length > 0 ? (
            aiSummary.map((subject, idx) => (
              <ClassPageAISubjectItem key={idx} subject={subject} />
            ))
          ) : (
            <div className="py-20 text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">✨</span>
              </div>
              <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">עדיין לא נוצר סיכום AI לשיעור זה</p>
              <button 
                onClick={() => setIsEditing(true)}
                className="mt-4 text-blue-600 font-black text-xs hover:underline flex items-center gap-2 mx-auto"
              >
                + הוסף סיכום ראשון
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ClassPageAISummary;
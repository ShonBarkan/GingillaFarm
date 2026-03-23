import React, { useState, useMemo } from 'react';
import { 
  BrainCircuit, 
  Play, 
  Code, 
  History, 
  Sparkles, 
  Search, 
  Loader2,
  PlusCircle,
  HelpCircle,
} from 'lucide-react';
import * as api from '../../../api/api';

import AIQuizQuestionEdit from './AIQuizQuestionEdit';
import AIQuizSession from './AIQuizSession';
import QuizEmptyState from './QuizEmptyState';
import QuizBulkEditor from './QuizBulkEditor';
import AIPromptModal from '../AIPromptModal';

const ClassPageAIQuiz = ({ classId, data, isLoading, onRefresh }) => {
  const [view, setView] = useState('list'); 
  const [showPrompt, setShowPrompt] = useState(false);
  const [jsonInput, setJsonInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredQuestions = useMemo(() => {
    if (!data?.questions) return [];
    if (!searchQuery.trim()) return data.questions;
    const q = searchQuery.toLowerCase();
    return data.questions.filter(item => 
      item.question_text?.toLowerCase().includes(q)
    );
  }, [data, searchQuery]);

  const handleCreateQuiz = async () => {
    setIsSaving(true);
    try {
      await api.upsertQuiz({ class_id: parseInt(classId) });
      onRefresh();
      alert("השאלון נוצר! כעת ניתן להוסיף שאלות.");
    } catch (err) {
      alert("שגיאה ביצירת השאלון");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddManualQuestion = async () => {
    if (!data?.id) return;
    setIsSaving(true);
    try {
      const template = {
        quiz_id: data.id,
        class_id: parseInt(classId),
        question_text: "שאלה חדשה (לחץ על העיפרון לעריכה)",
        correct_answer: "תשובה נכונה",
        explanation: "הסבר למה התשובה נכונה...",
        distractors: [
          { answer_text: "מסיח 1", explanation: "הסבר למה זה שגוי" },
          { answer_text: "מסיח 2", explanation: "הסבר למה זה שגוי" }
        ]
      };
      await api.saveQuizQuestion(template);
      onRefresh();
    } catch (err) {
      alert("שגיאה בהוספת שאלה");
    } finally {
      setIsSaving(false);
    }
  };

  const handleBulkUpdate = async () => {
    if (!data?.id) {
      alert("שגיאה: אין מזהה שאלון. צור שאלון תחילה.");
      return;
    }

    try {
      let cleanInput = jsonInput.trim();
      cleanInput = cleanInput.replace(/^```json\s*/, "").replace(/```\s*$/, "");
      const parsed = JSON.parse(cleanInput);
      const questionsArray = Array.isArray(parsed) ? parsed : (parsed.questions || []);

      setIsSaving(true);
      for (const q of questionsArray) {
        await api.saveQuizQuestion({ 
          ...q, 
          quiz_id: data.id,
          class_id: parseInt(classId) 
        });
      }
      alert("השאלון עודכן בהצלחה!");
      setView('list');
      onRefresh();
      setJsonInput("");
    } catch (e) {
      alert(`שגיאת פורמט: ${e.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return (
    <div className="py-20 text-center flex flex-col items-center gap-4">
      <Loader2 className="animate-spin text-purple-500" size={32} />
      <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">טוען תרגול...</p>
    </div>
  );

  if (!data || !data.id) {
    return <QuizEmptyState onCreate={handleCreateQuiz} isSaving={isSaving} />;
  }

  if (view === 'session') {
    return (
      <AIQuizSession 
        quiz={data} 
        onExit={() => {
          setView('list');
          onRefresh();
        }} 
        onRefresh={onRefresh} 
      />
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <AIPromptModal isOpen={showPrompt} onClose={() => setShowPrompt(false)} type="quiz" />

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-6 pr-2">
            <button 
              onClick={() => setView(view === 'bulk' ? 'list' : 'bulk')}
              className={`flex items-center gap-2 text-sm font-bold transition-colors ${view === 'bulk' ? 'text-purple-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <Code size={18} /> עריכת JSON
            </button>
            
            <button 
              onClick={handleAddManualQuestion}
              disabled={isSaving}
              className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-purple-500 transition-colors disabled:opacity-50"
            >
              <PlusCircle size={18} /> הוספת שאלה
            </button>

            <button 
              onClick={() => setShowPrompt(true)}
              className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-purple-500 transition-colors"
            >
              <Sparkles size={18} /> פרומפט
            </button>
          </div>

          <button 
            onClick={() => setView('session')}
            disabled={!data?.questions?.length}
            className="bg-purple-600 text-white px-8 py-3 rounded-2xl font-black flex items-center gap-2 shadow-lg shadow-purple-200 hover:bg-purple-700 transition-all disabled:opacity-50 disabled:grayscale"
          >
            <Play size={18} fill="currentColor" /> התחל תרגול
          </button>
        </div>

        {view === 'list' && (
          <div className="relative group">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-500 transition-colors" size={18} />
            <input 
              type="text"
              placeholder="חיפוש שאלה מהיר..."
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 pr-12 pl-4 text-sm outline-none focus:bg-white focus:border-purple-200 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        )}
      </div>

      {/* History Section */}
      {data?.attempts?.length > 0 && (
        <div className="mt-12">
          <div className="flex items-center gap-2 mb-6 text-slate-400 px-2">
            <History size={18} />
            <h3 className="font-black uppercase tracking-widest text-[10px]">היסטוריית תרגול</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
            {data.attempts.map((att, i) => (
              <div key={i} className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col items-center shadow-sm hover:border-purple-200 transition-colors">
                <span className="text-[10px] font-bold text-slate-400 mb-1">{att.attempt_date?.split('T')[0]}</span>
                <span className={`text-xl font-black ${att.score >= 80 ? 'text-green-500' : 'text-purple-600'}`}>
                  {att.score}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="flex items-center gap-2 mb-6 text-slate-400 px-2">
        <HelpCircle size={18} />
        <h3 className="font-black uppercase tracking-widest text-[10px]">שאלות</h3>
      </div>
      {view === 'bulk' ? (
        <QuizBulkEditor 
          jsonInput={jsonInput} 
          setJsonInput={setJsonInput} 
          onSave={handleBulkUpdate} 
          onCancel={() => setView('list')}
          isSaving={isSaving}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredQuestions.length > 0 ? (
            filteredQuestions.map(q => (
              <AIQuizQuestionEdit key={q.id} question={q} onRefresh={onRefresh} />
            ))
          ) : (
            <div className="py-20 text-center bg-white rounded-[40px] border-2 border-dashed border-slate-200">
               <BrainCircuit size={48} className="mx-auto text-slate-100 mb-4" />
               <p className="text-slate-400 font-bold">אין עדיין שאלות בשאלון.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ClassPageAIQuiz;
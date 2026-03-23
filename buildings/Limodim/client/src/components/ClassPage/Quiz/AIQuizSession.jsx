import React, { useState, useMemo } from 'react';
import { X, CheckCircle2, XCircle, ChevronLeft, Trophy, MessageSquare, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import * as api from '../../../api/api';

const AIQuizSession = ({ quiz, onExit }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const currentQuestion = quiz.questions[currentIndex];

  // ערבוב תשובות - מחושב מחדש רק כשהשאלה משתנה
  const allOptions = useMemo(() => {
    const options = [
      { 
        text: currentQuestion.correct_answer, 
        isCorrect: true, 
        explanation: currentQuestion.explanation 
      },
      ...currentQuestion.distractors.map(d => ({ 
        text: d.answer_text, 
        isCorrect: false, 
        explanation: d.explanation 
      }))
    ];
    return options.sort(() => Math.random() - 0.5);
  }, [currentIndex, currentQuestion]);

  const handleAnswer = async (option) => {
    if (isAnswered) return;
    setSelectedAnswer(option);
    setIsAnswered(true);
    
    if (option.isCorrect) setScore(prev => prev + 1);

    // עדכון סטטיסטיקה בשרת בזמן אמת
    try {
      await api.updateQuestionStats(currentQuestion.id, option.isCorrect);
    } catch (err) {
      console.error("Failed to update stats", err);
    }
  };

  const handleNext = () => {
    if (currentIndex < quiz.questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = async () => {
    setIsSaving(true);
    const finalScore = Math.round((score / quiz.questions.length) * 100);
    try {
      // שמירת ניסיון המבחן בבסיס הנתונים
      await api.submitQuizAttempt(quiz.id, {
        attempt_date: new Date().toISOString(),
        score: finalScore
      });
      
      // עוברים למסך סיכום (Trophy) בלי לבצע רענון גלובלי עדיין
      setIsFinished(true);
    } catch (err) {
      console.error("Failed to save attempt", err);
      setIsFinished(true); // עדיין מראים מסך סיום גם אם השמירה נכשלה
    } finally {
      setIsSaving(false);
    }
  };

  const renderMathContent = (content) => (
    <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
      {content}
    </ReactMarkdown>
  );

  // מסך סיכום / הצלחה
  if (isFinished) {
    const finalScore = Math.round((score / quiz.questions.length) * 100);
    return (
      <div className="max-w-xl mx-auto py-20 text-center animate-in zoom-in-95 duration-500">
        <div className="w-24 h-24 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-yellow-100">
          <Trophy size={48} className="text-white" />
        </div>
        <h2 className="text-3xl font-black text-slate-800 mb-2">כל הכבוד!</h2>
        <p className="text-slate-500 mb-8 text-lg">סיימת את התרגול לשיעור זה.</p>
        
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm mb-8">
          <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">הציון שלך</div>
          <div className="text-6xl font-black text-purple-600">{finalScore}%</div>
          <div className="mt-4 text-slate-500 font-medium">
            ענית נכון על {score} מתוך {quiz.questions.length} שאלות
          </div>
        </div>

        <button 
          onClick={onExit} // הפונקציה באבא שסוגרת את ה-session ומרעננת
          className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black hover:bg-slate-800 transition-all shadow-lg active:scale-95"
        >
          חזרה לעמוד השאלון
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-500" dir="rtl">
      {/* Session Header */}
      <div className="flex items-center justify-between mb-8">
        <button onClick={onExit} className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl transition-colors">
          <X size={24} />
        </button>
        <div className="flex items-center gap-4">
          <div className="h-2 w-48 bg-slate-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-purple-600 transition-all duration-500" 
              style={{ width: `${((currentIndex + 1) / quiz.questions.length) * 100}%` }}
            ></div>
          </div>
          <span className="text-xs font-black text-slate-400 uppercase tracking-tighter">
            שאלה {currentIndex + 1} מתוך {quiz.questions.length}
          </span>
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-[40px] p-8 md:p-12 border border-slate-200 shadow-sm mb-6">
        <div className="text-xl md:text-2xl font-bold text-slate-800 mb-10 leading-relaxed prose prose-slate max-w-none">
          {renderMathContent(currentQuestion.question_text)}
        </div>

        <div className="space-y-4">
          {allOptions.map((option, idx) => (
            <button
              key={idx}
              onClick={() => handleAnswer(option)}
              disabled={isAnswered}
              className={`
                w-full p-5 rounded-2xl border-2 text-right transition-all flex items-center justify-between gap-4
                ${!isAnswered ? 'border-slate-100 hover:border-purple-200 hover:bg-purple-50/30 shadow-sm' : ''}
                ${isAnswered && option.isCorrect ? 'border-green-500 bg-green-50 text-green-700 shadow-md shadow-green-100' : ''}
                ${isAnswered && selectedAnswer === option && !option.isCorrect ? 'border-red-500 bg-red-50 text-red-700' : ''}
                ${isAnswered && selectedAnswer !== option && !option.isCorrect ? 'border-slate-50 opacity-50 grayscale-[0.5]' : ''}
              `}
            >
              <div className="font-bold flex-1 prose prose-slate max-w-none">
                {renderMathContent(option.text)}
              </div>
              <div className="shrink-0">
                {isAnswered && option.isCorrect && <CheckCircle2 size={24} className="text-green-500" />}
                {isAnswered && selectedAnswer === option && !option.isCorrect && <XCircle size={24} className="text-red-500" />}
              </div>
            </button>
          ))}
        </div>

        {/* Feedback Section */}
        {isAnswered && (
          <div className="mt-10 p-6 bg-slate-50 rounded-3xl border border-slate-100 animate-in slide-in-from-top-4 duration-300">
            <div className="flex items-center gap-2 mb-3 text-slate-800 font-black text-[10px] uppercase tracking-widest">
              <MessageSquare size={16} className="text-purple-500" /> הסבר לפתרון
            </div>
            <div className="text-slate-600 text-sm leading-relaxed prose prose-slate max-w-none">
              {renderMathContent(selectedAnswer.explanation || "אין הסבר זמין לשאלה זו.")}
            </div>
          </div>
        )}
      </div>

      {/* Footer Controls */}
      <div className="flex justify-end">
        {isAnswered && (
          <button 
            onClick={handleNext}
            disabled={isSaving}
            className="bg-purple-600 text-white px-10 py-4 rounded-2xl font-black flex items-center gap-2 hover:bg-purple-700 transition-all shadow-lg shadow-purple-200 scale-100 active:scale-95 disabled:opacity-50"
          >
            {isSaving ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                {currentIndex === quiz.questions.length - 1 ? 'סיום בוחן' : 'לשאלה הבאה'}
                <ChevronLeft size={20} />
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default AIQuizSession;
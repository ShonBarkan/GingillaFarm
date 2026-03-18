import React, { useState } from 'react';
import ClassPageAIQuizQuestion from './ClassPageAIQuizQuestion';

// The system prompt for the Quiz
const QUIZ_PROMPT = `You are an educational specialist. Analyze the lesson content and generate a Self-Study Quiz in JSON format.

Strict Requirements:
1. Language: Hebrew for the questions and explanations.
2. Technical Terms: Use English for specific technical terms or variable names where appropriate.
3. Format: Return ONLY a valid JSON object.
4. Structure: 
   - "questions": A list of objects with:
     - "question": The question text ($LaTeX$ supported).
     - "question_type": "multiple_choice" or "boolean".
     - "correct_answer": The right answer string.
     - "distractors": List of wrong answers.
     - "explanation": Brief reasoning for the correct answer.
     - "mapped_topic": The name of the related topic.
   - "history": Keep as empty list [].
5. Output: Strictly JSON, no extra text.`;

const ClassPageAIQuiz = ({ aiQuiz, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [jsonBuffer, setJsonBuffer] = useState(JSON.stringify(aiQuiz, null, 2));
  
  const [currentStep, setCurrentStep] = useState('landing'); // 'landing' | 'quiz' | 'result'
  const [activeQuestionIdx, setActiveQuestionIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [finalScore, setFinalScore] = useState(0);

  const questions = aiQuiz?.questions || [];
  const history = aiQuiz?.history || [];

  const handleSaveJson = () => {
    try {
      const parsed = JSON.parse(jsonBuffer);
      onUpdate(parsed);
      setIsEditing(false);
    } catch (e) {
      alert("פורמט JSON לא תקין. אנא בדוק את התחביר שלך.");
    }
  };

  const copyPrompt = () => {
    navigator.clipboard.writeText(QUIZ_PROMPT);
    alert("הפרומפט להרכבת השאלון הועתק!");
  };

  const startQuiz = () => {
    setUserAnswers({});
    setActiveQuestionIdx(0);
    setCurrentStep('quiz');
  };

  const submitQuiz = () => {
    let correctCount = 0;
    questions.forEach((q, idx) => {
      if (userAnswers[idx] === q.correct_answer) correctCount++;
    });
    
    const score = Math.round((correctCount / questions.length) * 100);
    setFinalScore(score);

    const newAttempt = {
      attempt_date: new Date().toISOString(),
      score: score,
      total_questions: questions.length
    };

    onUpdate({
      ...aiQuiz,
      history: [newAttempt, ...history]
    });

    setCurrentStep('result');
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-10 animate-fadeIn" dir="rtl">
      
      {/* Header Area */}
      <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-xl font-black text-slate-800">בוחן תרגול AI</h2>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">בחינת הבנה וייזום למידה</p>
        </div>
        <button 
          onClick={() => setIsEditing(!isEditing)}
          className={`px-4 py-2 rounded-xl font-bold text-xs transition-all ${
            isEditing ? 'text-blue-600 bg-blue-50' : 'text-slate-400 hover:text-blue-600'
          }`}
        >
          {isEditing ? 'חזור לשאלון' : 'עריכת JSON'}
        </button>
      </div>

      {isEditing ? (
        <div className="space-y-4">
          
          {/* AI Prompt Helper Bar */}
          <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
            <div className="flex items-center gap-2">
              <span className="text-lg">🎯</span>
              <span className="text-xs font-bold text-slate-500">עורך בנק השאלות</span>
            </div>
            <button 
              onClick={copyPrompt}
              className="flex items-center gap-2 bg-slate-800 text-white px-3 py-1.5 rounded-lg text-[10px] font-black hover:bg-slate-700 transition-colors"
            >
              📋 העתק פרומפט ליצירת שאלות
            </button>
          </div>

          <textarea
            dir="ltr"
            className="w-full h-[500px] p-6 font-mono text-sm bg-slate-900 text-emerald-400 rounded-2xl border-none outline-none focus:ring-4 focus:ring-blue-100 shadow-inner"
            value={jsonBuffer}
            onChange={(e) => setJsonBuffer(e.target.value)}
          />
          
          <div className="flex justify-end gap-3">
            <button 
              onClick={() => {
                setIsEditing(false);
                setJsonBuffer(JSON.stringify(aiQuiz, null, 2));
              }}
              className="px-6 py-2 text-slate-400 font-bold text-xs"
            >
              ביטול
            </button>
            <button 
              onClick={handleSaveJson} 
              className="bg-blue-600 text-white px-10 py-3 rounded-xl font-black shadow-lg shadow-blue-100 active:scale-95 transition-all"
            >
              שמור בנק שאלות
            </button>
          </div>
        </div>
      ) : (
        <>
          {currentStep === 'landing' && (
            <div className="text-center py-10">
              <div className="mb-8">
                <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                   <span className="text-5xl">🎯</span>
                </div>
                <h3 className="text-2xl font-black text-slate-800">מוכן לאתגר?</h3>
                <p className="text-slate-500 mt-2 font-bold">{questions.length} שאלות המבוססות על חומר השיעור</p>
              </div>
              
              <button 
                onClick={startQuiz} 
                disabled={questions.length === 0}
                className="bg-blue-600 text-white px-12 py-4 rounded-2xl font-black shadow-xl hover:bg-blue-700 transition-all active:scale-95 disabled:bg-slate-200 disabled:shadow-none"
              >
                {questions.length > 0 ? 'התחל בוחן' : 'אין שאלות זמינות'}
              </button>

              {history.length > 0 && (
                <div className="mt-12 max-w-md mx-auto">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-4 tracking-widest text-center">ניסיונות קודמים</p>
                  <div className="space-y-2">
                    {history.slice(0, 3).map((h, i) => (
                      <div key={i} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-xs font-bold text-slate-500">
                          {new Date(h.attempt_date).toLocaleDateString('he-IL')}
                        </span>
                        <span className={`font-black ${h.score >= 80 ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {h.score}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {currentStep === 'quiz' && (
            <div className="max-w-2xl mx-auto">
              <div className="flex justify-between items-center mb-6">
                 <span className="text-xs font-black text-blue-600 bg-blue-50 px-4 py-1.5 rounded-full">
                   שאלה {activeQuestionIdx + 1} מתוך {questions.length}
                 </span>
              </div>

              <ClassPageAIQuizQuestion 
                questionData={questions[activeQuestionIdx]}
                selectedAnswer={userAnswers[activeQuestionIdx]}
                onSelect={(val) => setUserAnswers({...userAnswers, [activeQuestionIdx]: val})}
                showResult={false}
              />

              <div className="flex justify-between mt-10 pt-6 border-t border-slate-100">
                <button 
                  disabled={activeQuestionIdx === 0}
                  onClick={() => setActiveQuestionIdx(prev => prev - 1)}
                  className="text-slate-400 font-bold disabled:opacity-0 transition-opacity"
                >
                  הקודם
                </button>
                
                {activeQuestionIdx === questions.length - 1 ? (
                  <button 
                    onClick={submitQuiz} 
                    className="bg-emerald-500 text-white px-10 py-3 rounded-xl font-black shadow-lg shadow-emerald-100 active:scale-95"
                  >
                    סיום והגשה
                  </button>
                ) : (
                  <button 
                    onClick={() => setActiveQuestionIdx(prev => prev + 1)} 
                    className="bg-blue-600 text-white px-10 py-3 rounded-xl font-black shadow-lg shadow-blue-100 active:scale-95"
                  >
                    הבא
                  </button>
                )}
              </div>
            </div>
          )}

          {currentStep === 'result' && (
            <div className="text-center py-10">
              <div className="w-32 h-32 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-emerald-100">
                <span className="text-4xl font-black">{finalScore}%</span>
              </div>
              <h3 className="text-2xl font-black text-slate-800">הבוחן הושלם!</h3>
              <p className="text-slate-500 font-bold mt-2">התוצאה שלך נשמרה בהיסטוריית השיעור.</p>
              
              <div className="flex gap-4 justify-center mt-10">
                 <button 
                    onClick={() => setCurrentStep('landing')} 
                    className="text-slate-500 font-bold px-8 py-3 hover:bg-slate-50 rounded-xl transition-colors"
                  >
                    סגור
                  </button>
                 <button 
                    onClick={startQuiz} 
                    className="bg-blue-600 text-white px-10 py-3 rounded-xl font-black shadow-lg shadow-blue-100 active:scale-95"
                  >
                    נסה שוב
                  </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ClassPageAIQuiz;
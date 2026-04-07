import React, { useState, useEffect } from 'react';
import { iconService } from '../services/iconService';
import DisplaySvg from '../components/common/DisplaySvg';

const AddIconPage = () => {
  const [mode, setMode] = useState('manual');
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [jsonInput, setJsonInput] = useState('');

  // מצב טופס ידני
  const [formData, setFormData] = useState({ 
    name: '', 
    subject: '', 
    sub_subject: '',
    svg_content: '' 
  });

  useEffect(() => {
    loadMetadata();
  }, []);

  const loadMetadata = async () => {
    try {
      const subs = await iconService.getSubjects();
      setSubjects(subs);
    } catch (err) {
      console.error("Failed to load metadata", err);
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!formData.svg_content.includes('<svg')) {
        return alert("נא להדביק קוד SVG תקין (חייב לכלול תגית <svg)");
    }

    setLoading(true);
    try {
      await iconService.uploadIcon(formData);
      alert("ערך האייקון נשתל בהצלחה!");
      setFormData({ name: '', subject: '', sub_subject: '', svg_content: '' });
      loadMetadata();
    } catch (err) {
      alert("שגיאה: " + (err.response?.data?.detail || "השתילה נכשלה"));
    } finally {
      setLoading(false);
    }
  };

  const handleBulkSubmit = async () => {
    if (!jsonInput.trim()) return;
    setLoading(true);
    try {
      const parsed = JSON.parse(jsonInput);
      const iconsToUpload = parsed.icons || parsed;
      
      if (!Array.isArray(iconsToUpload)) throw new Error("הקלט חייב להיות מערך או אובייקט עם שדה icons");

      for (const icon of iconsToUpload) {
        await iconService.uploadIcon(icon);
      }
      
      alert(`נקצרו בהצלחה ${iconsToUpload.length} אייקונים!`);
      setJsonInput('');
      loadMetadata();
    } catch (err) {
      alert("קציר קבוצתי נכשל: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-16" dir="rtl">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-black text-white tracking-tight uppercase mb-2">מעבדת אייקונים</h1>
        <p className="text-slate-500 font-medium">קצירת ערכי SVG ישירות למסד הנתונים של החווה.</p>
      </div>

      {/* בורר מצבים */}
      <div className="flex justify-center mb-10">
        <div className="bg-slate-900 p-1.5 rounded-2xl border border-slate-800 inline-flex shadow-xl">
          <button 
            onClick={() => setMode('manual')}
            className={`px-8 py-2.5 rounded-xl font-bold text-sm transition-all ${mode === 'manual' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
          >
            הדבקת ערך בודד
          </button>
          <button 
            onClick={() => setMode('bulk')}
            className={`px-8 py-2.5 rounded-xl font-bold text-sm transition-all ${mode === 'bulk' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
          >
            ייבוא JSON קבוצתי
          </button>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden">
        {mode === 'manual' ? (
          <form onSubmit={handleManualSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
            
            {/* צד ימין (היה שמאל): מטא-דאטה */}
            <div className="md:col-span-1 space-y-6">
                <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 uppercase mr-1">שם האייקון</label>
                    <input 
                    className="w-full bg-slate-950 border border-slate-800 p-4 rounded-2xl outline-none focus:ring-2 ring-emerald-500 transition-all text-white text-right"
                    placeholder="לדוגמה: farm-gate"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 uppercase mr-1">נושא (Subject)</label>
                    <input 
                    list="subjects-list"
                    className="w-full bg-slate-950 border border-slate-800 p-4 rounded-2xl outline-none focus:ring-2 ring-emerald-500 transition-all text-white text-right"
                    placeholder="בחר או הקלד נושא"
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    required
                    />
                    <datalist id="subjects-list">
                    {subjects.map(s => <option key={s} value={s} />)}
                    </datalist>
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 uppercase mr-1">תת-נושא (Sub-Subject)</label>
                    <input 
                    className="w-full bg-slate-950 border border-slate-800 p-4 rounded-2xl outline-none focus:ring-2 ring-emerald-500 transition-all text-white text-right"
                    placeholder="תת-נושא"
                    value={formData.sub_subject}
                    onChange={(e) => setFormData({...formData, sub_subject: e.target.value})}
                    required
                    />
                </div>

                {/* תיבת תצוגה מקדימה */}
                <div className="pt-4">
                    <div className="w-full h-32 bg-slate-950 border border-slate-800 rounded-3xl flex items-center justify-center relative group overflow-hidden">
                        {formData.svg_content ? (
                            <DisplaySvg 
                                svgContent={formData.svg_content}
                                className="w-full h-full group-hover:scale-110"
                            />
                        ) : (
                            <span className="text-slate-700 font-bold text-xs uppercase tracking-widest">אין תצוגה מקדימה</span>
                        )}
                        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-500 animate-pulse z-20" />
                    </div>
                </div>
            </div>

            {/* צד שמאל (היה ימין): אזור קוד SVG */}
            <div className="md:col-span-2 space-y-6">
                <div className="space-y-2 h-full flex flex-col">
                    <label className="text-xs font-black text-slate-500 uppercase mr-1">הדבק קוד SVG כאן</label>
                    <textarea 
                        className="flex-grow w-full bg-slate-950 border border-slate-800 p-6 rounded-3xl outline-none focus:ring-2 ring-emerald-500 transition-all font-mono text-xs text-emerald-400/70 min-h-[300px] text-left"
                        dir="ltr"
                        placeholder="<svg xmlns='http://www.w3.org/2000/svg' ... > </svg>"
                        value={formData.svg_content}
                        onChange={(e) => setFormData({...formData, svg_content: e.target.value})}
                        required
                    />
                </div>
            </div>

            <div className="md:col-span-3">
                <button 
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-500 py-5 rounded-2xl font-black text-lg transition-all disabled:opacity-50 shadow-lg shadow-emerald-900/20 active:scale-[0.98]"
                >
                {loading ? "מבצע שתילה..." : "לשתול ערך אייקון"}
                </button>
            </div>
          </form>
        ) : (
          /* מצב קבוצתי */
          <div className="space-y-6">
             <textarea 
                className="w-full h-80 bg-slate-950 border border-slate-800 p-6 rounded-3xl outline-none focus:ring-2 ring-emerald-500 transition-all font-mono text-sm text-emerald-400/80 text-left"
                dir="ltr"
                placeholder='{ "icons": [...] }'
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
              />
              <button 
                disabled={loading || !jsonInput}
                onClick={handleBulkSubmit} 
                className="w-full bg-emerald-600 hover:bg-emerald-500 py-5 rounded-2xl font-black transition-all disabled:opacity-50"
              >
                {loading ? "מעבד קבוצה..." : "ייבוא קבוצתי"}
              </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddIconPage;
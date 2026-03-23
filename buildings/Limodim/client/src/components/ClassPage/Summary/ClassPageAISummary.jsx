import React, { useState, useMemo } from 'react';
import AISummaryNode from './AISummaryNode';
import AIPromptModal from '../AIPromptModal';
import SummaryToolbar from './SummaryToolbar';
import SummaryBulkEditor from './SummaryBulkEditor';
import { Database, Loader2 } from 'lucide-react';
import api from '../../../api/api';

const ClassPageAISummary = ({ classId, data, isLoading, onRefresh }) => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isBulkEdit, setIsBulkEdit] = useState(false);
  const [jsonInput, setJsonInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Recursive search logic
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data;
    const query = searchQuery.toLowerCase();

    const filterNodes = (nodes) => {
      return nodes.reduce((acc, node) => {
        const matchesCurrent = 
          node.title?.toLowerCase().includes(query) || 
          node.content?.toLowerCase().includes(query);

        const filteredChildren = node.sub_topics ? filterNodes(node.sub_topics) : [];

        if (matchesCurrent || filteredChildren.length > 0) {
          acc.push({ ...node, sub_topics: filteredChildren });
        }
        return acc;
      }, []);
    };
    return filterNodes(data);
  }, [data, searchQuery]);

  const handleAddMainTopic = async () => {
    try {
      const newTopic = {
        class_id: parseInt(classId),
        title: "נושא חדש",
        content: "",
        summary_type: "definition",
        order_index: data.length,
        visual: { type: "none", value: "" },
        parent_id: null
      };
      await api.upsertSummaryTopic(newTopic);
      onRefresh();
    } catch (err) {
      alert("שגיאה בהוספת נושא");
    }
  };

  const handleBulkUpdate = async () => {
    try {
      let cleanInput = jsonInput.trim();
      cleanInput = cleanInput.replace(/^```json\s*/, "").replace(/```\s*$/, "").replace(/\/\/.*$/gm, "");
      cleanInput = cleanInput.replace(/[\u201C\u201D]/g, '"').replace(/,\s*([\]}])/g, "$1");

      if (!cleanInput) return;
      const parsed = JSON.parse(cleanInput);
      const finalData = Array.isArray(parsed) ? parsed : [parsed];

      setIsSaving(true);
      for (const item of finalData) {
        await api.upsertSummaryTopic({ ...item, class_id: parseInt(classId) });
      }
      setIsBulkEdit(false);
      onRefresh();
      setJsonInput("");
    } catch (e) {
      alert(`שגיאת JSON: ${e.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <AIPromptModal isOpen={showPrompt} onClose={() => setShowPrompt(false)} type="summary" />

      <SummaryToolbar 
        isBulkEdit={isBulkEdit}
        setIsBulkEdit={setIsBulkEdit}
        setShowPrompt={setShowPrompt}
        handleAddMainTopic={handleAddMainTopic}
        isSaving={isSaving}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {isBulkEdit ? (
        <SummaryBulkEditor 
          jsonInput={jsonInput}
          setJsonInput={setJsonInput}
          onSave={handleBulkUpdate}
          onCancel={() => setIsBulkEdit(false)}
          isSaving={isSaving}
        />
      ) : (
        <div className="pb-20">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Loader2 className="animate-spin mb-2" />
              <p className="text-xs font-bold uppercase tracking-widest">טוען נתונים...</p>
            </div>
          ) : filteredData.length > 0 ? (
            filteredData.map(topic => (
              <AISummaryNode key={topic.id} item={topic} onRefresh={onRefresh} />
            ))
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
              <Database size={40} className="mx-auto text-slate-200 mb-4" />
              <p className="text-slate-400 font-bold">
                {searchQuery ? "לא נמצאו תוצאות לחיפוש שלך" : "אין עדיין תוכן בסיכום"}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ClassPageAISummary;
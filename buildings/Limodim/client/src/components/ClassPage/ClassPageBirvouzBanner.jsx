import React, { useState, useEffect } from 'react';
import { Pencil, Check, X } from 'lucide-react';

const ClassPageBirvouzBanner = ({ birvouz, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(birvouz);

  // Sync local state if the prop changes from outside
  useEffect(() => {
    setEditedText(birvouz);
  }, [birvouz]);

  const handleSave = async () => {
    if (editedText === birvouz) {
      setIsEditing(false);
      return;
    }
    await onUpdate(editedText);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedText(birvouz);
    setIsEditing(false);
  };

  // If there's no quote and we aren't editing, keep it hidden
  if (!birvouz && !isEditing) return null;

  return (
    <div className="bg-amber-50/50 border-y border-amber-100 py-10 px-6 my-6 shadow-sm group relative">
      <div className="max-w-3xl mx-auto flex flex-col items-center text-center gap-4">
        
        {/* Header Section */}
        <div className="flex items-center gap-4">
          <div className="h-[1px] w-12 bg-amber-200"></div>
          <h2 className="text-amber-600 text-[12px] font-black uppercase tracking-[0.4em] flex items-center gap-2">
            BIROVOUZ 🦆
          </h2>
          <div className="h-[1px] w-12 bg-amber-200"></div>
        </div>

        {isEditing ? (
          /* --- Edit Mode --- */
          <div className="w-full flex flex-col items-center gap-4 animate-fadeIn">
            <textarea
              autoFocus
              className="w-full bg-white border-2 border-amber-200 rounded-2xl p-4 text-xl md:text-2xl font-bold text-amber-900 text-center outline-none focus:ring-4 focus:ring-amber-100 transition-all min-h-[120px] resize-none"
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              placeholder="What was said in class?"
            />
            <div className="flex gap-3">
              <button
                onClick={handleSave}
                className="flex items-center gap-2 bg-amber-600 text-white px-6 py-2 rounded-xl font-bold shadow-md hover:bg-amber-700 transition-all active:scale-95"
              >
                <Check size={18} strokeWidth={3} />
                Save Changes
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center gap-2 bg-white text-amber-600 border border-amber-200 px-6 py-2 rounded-xl font-bold hover:bg-amber-100 transition-all active:scale-95"
              >
                <X size={18} strokeWidth={3} />
                Cancel
              </button>
            </div>
          </div>
        ) : (
          /* --- Display Mode --- */
          <div className="relative">
            <p className="text-xl md:text-2xl font-bold text-amber-900 leading-relaxed italic">
              "{birvouz}"
            </p>
            
            {/* Edit Trigger - Visible on hover (desktop) or always (mobile) */}
            <button
              onClick={() => setIsEditing(true)}
              className="md:opacity-0 group-hover:opacity-100 absolute -top-2 -right-8 p-2 text-amber-400 hover:text-amber-600 transition-all"
              title="Edit Quote"
            >
              <Pencil size={18} />
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default ClassPageBirvouzBanner;
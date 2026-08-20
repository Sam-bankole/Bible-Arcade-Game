import React from 'react';
import type { GameType, GameRound } from '../types/game';
import { PRESET_QUESTIONS } from '../data/presetQuestions';
import { X, BookOpen, Check } from 'lucide-react';

interface PresetQuestionModalProps {
  gameType: GameType;
  isOpen: boolean;
  onClose: () => void;
  onSelectPreset: (presetData: Partial<GameRound>) => void;
}

export const PresetQuestionModal: React.FC<PresetQuestionModalProps> = ({
  gameType,
  isOpen,
  onClose,
  onSelectPreset
}) => {
  if (!isOpen) return null;

  const filteredPresets = PRESET_QUESTIONS.filter(q => q.gameType === gameType);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
      <div className="tactics-card w-full max-w-lg p-5 relative max-h-[85vh] flex flex-col border border-[#272d42] space-y-3.5 shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1c2130] pb-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#ccff00]" />
            <h3 className="font-display text-sm font-black uppercase tracking-wider text-white">
              Preset Question Vault
            </h3>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* List */}
        <div className="overflow-y-auto space-y-2 pr-1 flex-1">
          {filteredPresets.length === 0 ? (
            <div className="text-center py-10 text-slate-500 bg-[#0c0e15] rounded-xl">
              <p className="text-sm font-bold text-slate-300">No presets found for this format</p>
              <p className="text-xs text-slate-500 mt-1">Enter your custom question directly into the form.</p>
            </div>
          ) : (
            filteredPresets.map((preset) => (
              <div
                key={preset.id}
                onClick={() => {
                  onSelectPreset({
                    ...preset.data,
                    questionText: preset.questionText,
                    correctAnswerText: preset.correctAnswerText
                  });
                  onClose();
                }}
                className="p-3 rounded-xl bg-[#0c0e15] border border-[#1c2130] hover:border-[#ccff00]/40 hover:bg-[#171b26] cursor-pointer transition-all flex items-start justify-between gap-3 group"
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <h4 className="font-bold text-white text-xs group-hover:text-[#ccff00] transition-colors">
                    {preset.title}
                  </h4>
                  <p className="text-xs text-slate-400 font-medium leading-normal">
                    {preset.questionText}
                  </p>
                  <div className="text-xs font-mono text-slate-300 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5 text-[#ccff00]" />
                    <span>Answer: <strong className="text-white">{preset.correctAnswerText}</strong></span>
                  </div>
                </div>

                <button
                  type="button"
                  className="tactics-btn tactics-btn-secondary text-xs py-1 px-2.5 shrink-0 group-hover:tactics-btn-primary"
                >
                  LOAD
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-[#1c2130] text-right">
          <button
            onClick={onClose}
            className="tactics-btn tactics-btn-secondary text-xs py-1.5 px-4 font-bold"
          >
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
};

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
      <div className="ctrl-card w-full max-w-xl p-5 relative max-h-[85vh] flex flex-col border border-[#2e354a] space-y-3">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#232838] pb-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-amber-500" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-100">
              Preset Questions
            </h3>
          </div>

          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-300 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* List */}
        <div className="overflow-y-auto space-y-2 pr-1 flex-1">
          {filteredPresets.length === 0 ? (
            <div className="text-center py-10 text-zinc-500 bg-[#0e1017] rounded">
              <p className="text-xs font-medium text-zinc-300">No preset questions for this format</p>
              <p className="text-[11px] text-zinc-500 mt-1">Enter your custom question directly into the form.</p>
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
                className="p-3 rounded-lg bg-[#0e1017] border border-[#232838] hover:border-[#2f364a] cursor-pointer transition-colors flex items-start justify-between gap-3 group"
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <h4 className="font-bold text-zinc-100 text-xs group-hover:text-amber-400 transition-colors">
                    {preset.title}
                  </h4>
                  <p className="text-xs text-zinc-400 font-medium">
                    {preset.questionText}
                  </p>
                  <div className="text-[11px] font-mono font-semibold text-emerald-400 flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    <span>Answer: {preset.correctAnswerText}</span>
                  </div>
                </div>

                <button
                  type="button"
                  className="ctrl-btn ctrl-btn-secondary text-xs py-1 px-2.5 shrink-0 group-hover:ctrl-btn-primary"
                >
                  Load
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-[#232838] text-right">
          <button
            onClick={onClose}
            className="ctrl-btn ctrl-btn-secondary text-xs py-1.5 px-3"
          >
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
};

import React from 'react';
import type { GameType, GameRound } from '../types/game';
import { PRESET_QUESTIONS } from '../data/presetQuestions';
import { X, HelpCircle } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="arcade-card arcade-card-gold w-full max-w-2xl p-6 relative max-h-[85vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
          <h3 className="font-arcade text-lg font-bold text-white">
            SELECT PRESET QUESTION
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List */}
        <div className="overflow-y-auto space-y-3 pr-1 flex-1">
          {filteredPresets.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <HelpCircle className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p>No presets found for this game mode. Enter custom questions below!</p>
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
                className="p-4 rounded-xl bg-slate-900/80 border border-white/10 hover:border-amber-500/50 hover:bg-slate-850 cursor-pointer transition-all flex items-start justify-between gap-4 group"
              >
                <div>
                  <h4 className="font-bold text-white text-sm group-hover:text-amber-400 transition-colors">
                    {preset.title}
                  </h4>
                  <p className="text-xs text-slate-300 mt-1">
                    {preset.questionText}
                  </p>
                  <div className="mt-2 text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
                    <span>ANSWER:</span>
                    <span>{preset.correctAnswerText}</span>
                  </div>
                </div>

                <button
                  type="button"
                  className="arcade-btn arcade-btn-secondary text-xs py-1.5 px-3 shrink-0 group-hover:arcade-btn-primary"
                >
                  LOAD
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-white/10 text-right">
          <button
            onClick={onClose}
            className="arcade-btn arcade-btn-secondary text-xs"
          >
            CANCEL
          </button>
        </div>

      </div>
    </div>
  );
};

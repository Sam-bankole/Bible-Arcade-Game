import React, { useState } from 'react';
import type { AnswerItem, GameRound } from '../types/game';
import { Edit2, Check, X, Crown, Search } from 'lucide-react';
import { formatElapsedRoundTime } from '../utils/timestamp';

interface AnswerQueueProps {
  currentRound: GameRound | null;
  answers: AnswerItem[];
  onUpdateTimestamp: (answerId: string, newTimestamp: string) => void;
  onEvaluateAnswer: (answerId: string, status: 'CORRECT' | 'WRONG' | 'PENDING', points: number, isWinner?: boolean) => void;
}

export const AnswerQueue: React.FC<AnswerQueueProps> = ({
  currentRound,
  answers,
  onUpdateTimestamp,
  onEvaluateAnswer
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTimestampValue, setEditTimestampValue] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [customPointId, setCustomPointId] = useState<string | null>(null);
  const [customPointsVal, setCustomPointsVal] = useState<number>(1);

  if (!currentRound) {
    return (
      <div className="tactics-card p-10 text-center border border-[#1c2438]">
        <p className="text-sm font-black text-white uppercase tracking-wider">Awaiting Active Round</p>
        <p className="text-xs text-slate-400 mt-1">Start a round to begin receiving live submissions.</p>
      </div>
    );
  }

  const handleStartEdit = (ans: AnswerItem) => {
    setEditingId(ans.id);
    setEditTimestampValue(ans.officialTimestamp);
  };

  const handleSaveEdit = (ansId: string) => {
    if (editTimestampValue.trim()) {
      onUpdateTimestamp(ansId, editTimestampValue.trim());
    }
    setEditingId(null);
  };

  const handleKeyDownEdit = (e: React.KeyboardEvent, ansId: string) => {
    if (e.key === 'Enter') handleSaveEdit(ansId);
    else if (e.key === 'Escape') setEditingId(null);
  };

  const hasWinner = answers.some(a => a.isWinner);

  const filteredAnswers = answers.filter(ans => {
    const matchesSearch =
      ans.playerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ans.username && ans.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
      ans.answerText.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const pendingCount = answers.filter(a => a.status === 'PENDING').length;

  return (
    <div className="tactics-card p-4 sm:p-5 space-y-4">

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-[#1c2438]">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-display text-sm font-black uppercase tracking-wider text-white">
              Live Answer Queue
            </h3>
            <span className="font-mono-tabular text-xs font-black px-2.5 py-0.5 rounded-full bg-[#151a28] text-[#ccff00] border border-[#28334e]">
              {answers.length} {answers.length === 1 ? 'Entry' : 'Entries'}
            </span>
            {pendingCount > 0 && !hasWinner && (
              <span className="font-mono-tabular text-xs font-black px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 animate-pulse">
                {pendingCount} awaiting
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {hasWinner ? '🏆 Winner declared — round complete' : 'Tap WINNER on the correct answer to close the round'}
          </p>
        </div>

        {currentRound && (
          <div className="text-xs px-3 py-1.5 rounded-lg bg-[#090c14] border border-[#28334e] flex items-center gap-2">
            <span className="text-slate-400 font-black uppercase text-[10px] tracking-wider">EXPECTED:</span>
            <span className="font-mono-tabular font-black text-[#ccff00]">
              {currentRound.correctAnswerText || 'Manual Grading'}
            </span>
          </div>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search contestant or answer..."
          className="tactics-input py-1.5 text-xs pl-8 pr-7 bg-[#090c14] w-full"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Answers Feed */}
      {filteredAnswers.length === 0 ? (
        <div className="text-center py-12 text-slate-500 bg-[#090c14] rounded-xl border border-dashed border-[#1c2130]">
          <p className="text-sm font-bold text-slate-300">
            {answers.length === 0 ? 'Awaiting incoming contestant submissions...' : 'No entries match search'}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {answers.length === 0
              ? 'Players submitting answers on their phones will appear here instantly.'
              : 'Try clearing your search term.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAnswers.map((ans) => {
            const isEditing = editingId === ans.id;
            const arrivalRank = answers.findIndex(a => a.id === ans.id) + 1;
            const formattedRank = String(arrivalRank).padStart(2, '0');
            const isCustomPointsOpen = customPointId === ans.id;
            const isLost = hasWinner && !ans.isWinner;

            return (
              <div
                key={ans.id}
                className={`rounded-xl border transition-all duration-200 p-3.5 sm:p-4 space-y-3 ${
                  ans.isWinner
                    ? 'bg-[#1a2210] border-[#ccff00]/70 border-l-4 border-l-[#ccff00] shadow-[0_0_28px_rgba(204,255,0,0.2)]'
                    : isLost
                      ? 'bg-[#090c14] border-[#1c2130] opacity-45'
                      : 'bg-[#101420] border-[#28334e]'
                }`}
              >
                {/* ROW 1: Rank + Name + Status + Timestamp */}
                <div className="flex items-center justify-between gap-2 flex-wrap">

                  <div className="flex items-center gap-2.5 flex-wrap">
                    {/* Rank Badge */}
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#090c14] border border-[#28334e]">
                      <span className={`font-mono-tabular font-black text-sm ${ans.isWinner ? 'text-[#ccff00]' : 'text-slate-400'}`}>
                        #{formattedRank}
                      </span>
                      {arrivalRank === 1 && !hasWinner && (
                        <span className="text-[8px] font-black uppercase text-[#ccff00] bg-[#ccff00]/15 px-1 py-0.5 rounded border border-[#ccff00]/30">
                          1ST IN
                        </span>
                      )}
                    </div>

                    {/* Player Name */}
                    <span className="font-display font-black text-white text-sm sm:text-base">
                      {ans.playerName}
                    </span>
                    {ans.username && (
                      <span className="font-mono text-xs text-slate-400">@{ans.username}</span>
                    )}

                    {/* Status Badges */}
                    {ans.isWinner && (
                      <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-[#ccff00] text-black shadow-sm">
                        <Crown className="w-2.5 h-2.5" /> WINNER +{ans.pointsAwarded}pts
                      </span>
                    )}
                    {isLost && (
                      <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        LOST
                      </span>
                    )}
                  </div>

                  {/* Buzzer Speed + Editable Timestamp */}
                  <div className="flex items-center gap-2">
                    <span className="font-mono-tabular text-xs font-black text-[#ccff00] bg-[#ccff00]/10 px-2 py-0.5 rounded border border-[#ccff00]/25 flex items-center gap-1">
                      <span>{formatElapsedRoundTime(ans.rawSystemMs, currentRound?.startTime)}</span>
                      <span className="text-[9px] text-slate-400 font-bold uppercase ml-0.5">SPEED</span>
                    </span>

                    {isEditing ? (
                      <div className="inline-flex items-center gap-1">
                        <input
                          type="text"
                          value={editTimestampValue}
                          onChange={(e) => setEditTimestampValue(e.target.value)}
                          onKeyDown={(e) => handleKeyDownEdit(e, ans.id)}
                          className="tactics-input font-mono-tabular text-xs py-0.5 px-1.5 w-24 text-center"
                          placeholder="HH:mm:ss.SSS"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSaveEdit(ans.id)}
                          className="p-1 rounded bg-[#ccff00] text-black font-bold"
                        >
                          <Check className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleStartEdit(ans)}
                        className="font-mono-tabular text-[11px] text-slate-400 hover:text-white inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#090c14] border border-[#28334e]"
                        title="Click to edit timestamp"
                      >
                        <span>{ans.officialTimestamp}</span>
                        <Edit2 className="w-2.5 h-2.5 opacity-40" />
                      </button>
                    )}
                  </div>
                </div>

                {/* ROW 2: Answer Text + WINNER Button */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-[#1c2438]">

                  <div className="min-w-0 flex-1">
                    <span className="font-mono-tabular text-base sm:text-lg font-black text-white block break-words">
                      "{ans.answerText}"
                    </span>
                  </div>

                  {/* Only show WINNER button if no winner yet, or this IS the winner */}
                  {!hasWinner && (
                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* Custom points control */}
                      {isCustomPointsOpen ? (
                        <div className="inline-flex items-center gap-1 bg-[#090c14] p-1 rounded-lg border border-[#28334e]">
                          <input
                            type="number"
                            min={1}
                            max={100}
                            value={customPointsVal}
                            onChange={(e) => setCustomPointsVal(Number(e.target.value))}
                            className="w-10 text-center text-xs py-0.5 rounded bg-[#151a28] text-white font-mono"
                          />
                          <button
                            onClick={() => {
                              onEvaluateAnswer(ans.id, 'CORRECT', customPointsVal, true);
                              setCustomPointId(null);
                            }}
                            className="px-2 py-0.5 bg-[#ccff00] text-black text-[10px] font-black rounded"
                          >
                            SET
                          </button>
                          <button
                            onClick={() => setCustomPointId(null)}
                            className="p-0.5 text-slate-400 hover:text-white"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setCustomPointId(ans.id);
                            setCustomPointsVal(1);
                          }}
                          className="tactics-btn tactics-btn-secondary text-[10px] py-1.5 px-2 font-mono text-slate-400 hover:text-white"
                          title="Award custom points"
                        >
                          +PTS
                        </button>
                      )}

                      {/* Main WINNER Button */}
                      <button
                        onClick={() => onEvaluateAnswer(ans.id, 'CORRECT', 1, true)}
                        className="tactics-btn text-xs py-2 px-4 rounded-lg bg-[#ccff00]/10 border border-[#ccff00]/40 text-[#ccff00] font-black hover:bg-[#ccff00] hover:text-black hover:shadow-[0_0_20px_rgba(204,255,0,0.5)] transition-all duration-150 flex items-center gap-1.5 cursor-pointer"
                        title="Declare this answer the round winner"
                      >
                        <Crown className="w-3.5 h-3.5" />
                        <span>WINNER</span>
                      </button>
                    </div>
                  )}

                  {/* Winner crown decoration (no button after declared) */}
                  {ans.isWinner && (
                    <span className="text-2xl select-none">🏆</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};

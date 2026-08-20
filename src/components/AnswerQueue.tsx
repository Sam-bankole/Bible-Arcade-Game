import React, { useState } from 'react';
import type { AnswerItem, GameRound } from '../types/game';
import { Edit2, Check, X } from 'lucide-react';
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
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'CORRECT' | 'WRONG'>('ALL');
  const [customPointId, setCustomPointId] = useState<string | null>(null);
  const [customPointsVal, setCustomPointsVal] = useState<number>(1);

  if (!currentRound) {
    return (
      <div className="tactics-card p-10 text-center border border-[#1c2438]">
        <p className="text-sm font-black text-white uppercase tracking-wider">Awaiting Active Round</p>
        <p className="text-xs text-slate-400 mt-1">Start a round in the form on the left to begin receiving live submissions.</p>
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
    if (e.key === 'Enter') {
      handleSaveEdit(ansId);
    } else if (e.key === 'Escape') {
      setEditingId(null);
    }
  };

  // Filter logic
  const filteredAnswers = answers.filter(ans => {
    const matchesSearch = 
      ans.playerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ans.username && ans.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
      ans.answerText.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'ALL' || ans.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingCount = answers.filter(a => a.status === 'PENDING').length;
  const correctCount = answers.filter(a => a.status === 'CORRECT').length;
  const wrongCount = answers.filter(a => a.status === 'WRONG').length;

  return (
    <div className="tactics-card p-4 sm:p-5 space-y-4">
      
      {/* Header Strip */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-[#1c2438]">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-display text-sm font-black uppercase tracking-wider text-white">
              Live Answer Queue
            </h3>
            <span className="font-mono-tabular text-xs font-black px-2.5 py-0.5 rounded-full bg-[#151a28] text-[#ccff00] border border-[#28334e]">
              {answers.length} {answers.length === 1 ? 'Entry' : 'Entries'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Ranked in real-time by millisecond buzzer speed
          </p>
        </div>

        {/* Expected Answer Badge */}
        {currentRound && (
          <div className="text-xs px-3 py-1.5 rounded-lg bg-[#090c14] border border-[#28334e] flex items-center gap-2">
            <span className="text-slate-400 font-black uppercase text-[10px] tracking-wider">EXPECTED:</span>
            <span className="font-mono-tabular font-black text-[#ccff00]">
              {currentRound.correctAnswerText || 'Manual Grading'}
            </span>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 bg-[#090c14] p-2 rounded-xl border border-[#1c2438]">
        
        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              statusFilter === 'ALL' 
                ? 'bg-[#151a28] text-white border border-[#3e4e76] font-black' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>All</span>
            <span className="font-mono-tabular text-[10px] opacity-70">({answers.length})</span>
          </button>

          <button
            onClick={() => setStatusFilter('PENDING')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              statusFilter === 'PENDING' 
                ? 'bg-[#151a28] text-amber-300 border border-amber-500/40 font-black' 
                : 'text-slate-400 hover:text-amber-300'
            }`}
          >
            <span>Pending</span>
            <span className="font-mono-tabular text-[10px] opacity-70">({pendingCount})</span>
          </button>

          <button
            onClick={() => setStatusFilter('CORRECT')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              statusFilter === 'CORRECT' 
                ? 'bg-[#151a28] text-[#ccff00] border border-[#ccff00]/40 font-black' 
                : 'text-slate-400 hover:text-[#ccff00]'
            }`}
          >
            <span>Correct</span>
            <span className="font-mono-tabular text-[10px] opacity-70">({correctCount})</span>
          </button>

          <button
            onClick={() => setStatusFilter('WRONG')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              statusFilter === 'WRONG' 
                ? 'bg-[#151a28] text-rose-400 border border-rose-500/40 font-black' 
                : 'text-slate-400 hover:text-rose-400'
            }`}
          >
            <span>Rejected</span>
            <span className="font-mono-tabular text-[10px] opacity-70">({wrongCount})</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[190px]">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search contestant or answer..."
            className="tactics-input py-1 text-xs pl-2.5 pr-7 bg-[#151a28]"
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
      </div>

      {/* Answers Scoreboard Feed */}
      {filteredAnswers.length === 0 ? (
        <div className="text-center py-12 text-slate-500 bg-[#090c14] rounded-xl border border-dashed border-[#1c2130]">
          <p className="text-sm font-bold text-slate-300">
            {answers.length === 0 ? 'Awaiting incoming contestant submissions...' : 'No entries match filter'}
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
            const isHeroSpot = arrivalRank === 1 || ans.isWinner;
            const isCustomPointsOpen = customPointId === ans.id;

            return (
              <div 
                key={ans.id}
                className={`rounded-xl border transition-all duration-150 p-3.5 sm:p-4 space-y-3 ${
                  isHeroSpot
                    ? 'bg-[#151a28] border-[#ccff00]/60 border-l-4 border-l-[#ccff00] shadow-[0_0_24px_rgba(204,255,0,0.16)]' 
                    : ans.status === 'CORRECT' 
                      ? 'bg-[#101420] border-[#28334e] opacity-100' 
                      : ans.status === 'WRONG'
                        ? 'bg-[#090c14] border-[#1c2130] opacity-40'
                        : 'bg-[#101420] border-[#28334e] opacity-90'
                }`}
              >
                {/* ── ROW 1: HEADER (Rank + Contestant + Speed & Timestamp) ── */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  
                  {/* Left: Rank + Name + Badges */}
                  <div className="flex items-center gap-2.5 flex-wrap">
                    
                    {/* Rank Badge */}
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#090c14] border border-[#28334e]">
                      <span className={`font-mono-tabular font-black text-sm ${
                        isHeroSpot ? 'text-[#ccff00]' : 'text-slate-400'
                      }`}>
                        #{formattedRank}
                      </span>
                      {arrivalRank === 1 && (
                        <span className="text-[8px] font-black uppercase text-[#ccff00] bg-[#ccff00]/15 px-1 py-0.5 rounded border border-[#ccff00]/30">
                          1ST IN
                        </span>
                      )}
                    </div>

                    {/* Player Name & Username */}
                    <span className="font-display font-black text-white text-sm sm:text-base">
                      {ans.playerName}
                    </span>
                    {ans.username && (
                      <span className="font-mono text-xs text-slate-400">
                        @{ans.username}
                      </span>
                    )}

                    {/* Status Badges */}
                    {ans.isWinner && (
                      <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-[#ccff00] text-black shadow-sm font-mono">
                        WINNER (+{ans.pointsAwarded})
                      </span>
                    )}
                    {ans.status === 'CORRECT' && !ans.isWinner && (
                      <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono">
                        CORRECT (+{ans.pointsAwarded})
                      </span>
                    )}
                    {ans.status === 'WRONG' && (
                      <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 font-mono">
                        REJECTED
                      </span>
                    )}
                  </div>

                  {/* Right: Buzzer Speed & Editable Wall Clock Timestamp */}
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
                          title="Save timestamp"
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

                {/* ── ROW 2: ANSWER TEXT + GRADING CONTROLS ── */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-[#1c2438]">
                  
                  {/* Big Beautiful Answer Text (100% Horizontal Space) */}
                  <div className="min-w-0 flex-1">
                    <span className="font-mono-tabular text-base sm:text-lg font-black text-white block break-words">
                      "{ans.answerText}"
                    </span>
                  </div>

                  {/* Operational Action Buttons */}
                  <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                    
                    {/* Winner Button */}
                    <button
                      onClick={() => onEvaluateAnswer(ans.id, 'CORRECT', 1, true)}
                      className={`tactics-btn text-xs py-1.5 px-3 rounded-lg ${
                        ans.isWinner 
                          ? 'bg-[#ccff00] text-black font-black border-[#ccff00] shadow-[0_0_16px_rgba(204,255,0,0.4)]' 
                          : 'tactics-btn-secondary hover:border-[#ccff00]/50 hover:text-[#ccff00]'
                      }`}
                      title="Declare Round Winner (+1 Point)"
                    >
                      <span>WINNER (+1)</span>
                    </button>

                    {/* Correct Button */}
                    <button
                      onClick={() => onEvaluateAnswer(ans.id, 'CORRECT', 1, false)}
                      className={`tactics-btn text-xs py-1.5 px-2.5 rounded-lg ${
                        ans.status === 'CORRECT' && !ans.isWinner
                          ? 'bg-emerald-600 text-white font-bold border-emerald-500'
                          : 'tactics-btn-secondary'
                      }`}
                      title="Mark Correct (+1 Point)"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>CORRECT</span>
                    </button>

                    {/* Reject Button */}
                    <button
                      onClick={() => onEvaluateAnswer(ans.id, 'WRONG', 0, false)}
                      className={`tactics-btn text-xs py-1.5 px-2.5 rounded-lg ${
                        ans.status === 'WRONG'
                          ? 'bg-rose-950 text-rose-300 border-rose-800'
                          : 'tactics-btn-secondary opacity-70 hover:opacity-100 hover:text-rose-400'
                      }`}
                      title="Reject Submission"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>REJECT</span>
                    </button>

                    {/* Custom Points */}
                    {isCustomPointsOpen ? (
                      <div className="inline-flex items-center gap-1 bg-[#090c14] p-1 rounded-lg border border-[#28334e]">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={customPointsVal}
                          onChange={(e) => setCustomPointsVal(Number(e.target.value))}
                          className="w-10 text-center text-xs py-0.5 rounded bg-[#151a28] text-white font-mono"
                        />
                        <button
                          onClick={() => {
                            onEvaluateAnswer(ans.id, 'CORRECT', customPointsVal, false);
                            setCustomPointId(null);
                          }}
                          className="px-2 py-0.5 bg-[#ccff00] text-black text-[10px] font-black rounded"
                        >
                          SET
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setCustomPointId(ans.id);
                          setCustomPointsVal(ans.pointsAwarded || 2);
                        }}
                        className="tactics-btn tactics-btn-secondary text-[10px] py-1.5 px-2 font-mono text-slate-400 hover:text-white"
                        title="Award custom points"
                      >
                        +PTS
                      </button>
                    )}

                  </div>

                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};

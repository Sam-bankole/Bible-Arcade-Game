import React, { useState } from 'react';
import type { AnswerItem, GameRound } from '../types/game';
import { Edit2, Check, X } from 'lucide-react';

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
      <div className="ctrl-card p-10 text-center">
        <p className="text-sm font-semibold text-zinc-300">No round currently active</p>
        <p className="text-xs text-zinc-500 mt-1">Start a round to begin receiving and scoring contestant submissions.</p>
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
    <div className="ctrl-card p-4 sm:p-5 space-y-4">
      
      {/* Header Strip */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[#232838]">
        <div>
          <div className="flex items-center gap-2.5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-100">
              Live Submissions
            </h3>
            <span className="font-mono-tabular text-xs font-semibold px-2 py-0.5 rounded bg-[#1c202d] text-zinc-300 border border-[#2e354a]">
              {answers.length} {answers.length === 1 ? 'entry' : 'entries'}
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Ranked strictly by arrival timestamp (fastest buzzer first)
          </p>
        </div>

        {/* Expected Answer / Reference Indicator */}
        {currentRound && (
          <div className="text-xs px-3 py-1.5 rounded bg-[#10121a] border border-[#2e354a] flex items-center gap-2">
            <span className="text-zinc-500 font-bold uppercase text-[10px] tracking-wider">EXPECTED:</span>
            <span className="font-mono-tabular font-bold text-amber-400">
              {currentRound.correctAnswerText || 'Manual Evaluation'}
            </span>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 bg-[#10121a] p-2 rounded-lg border border-[#232838]">
        
        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1 overflow-x-auto">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              statusFilter === 'ALL' 
                ? 'bg-zinc-200 text-zinc-900 font-bold' 
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#1a1e2a]'
            }`}
          >
            <span>All</span>
            <span className="font-mono-tabular text-[11px] opacity-75">{answers.length}</span>
          </button>

          <button
            onClick={() => setStatusFilter('PENDING')}
            className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              statusFilter === 'PENDING' 
                ? 'bg-amber-500 text-zinc-950 font-bold' 
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#1a1e2a]'
            }`}
          >
            <span>Pending</span>
            <span className="font-mono-tabular text-[11px] opacity-75">{pendingCount}</span>
          </button>

          <button
            onClick={() => setStatusFilter('CORRECT')}
            className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              statusFilter === 'CORRECT' 
                ? 'bg-emerald-600 text-white font-bold' 
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#1a1e2a]'
            }`}
          >
            <span>Correct</span>
            <span className="font-mono-tabular text-[11px] opacity-75">{correctCount}</span>
          </button>

          <button
            onClick={() => setStatusFilter('WRONG')}
            className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              statusFilter === 'WRONG' 
                ? 'bg-rose-600 text-white font-bold' 
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#1a1e2a]'
            }`}
          >
            <span>Rejected</span>
            <span className="font-mono-tabular text-[11px] opacity-75">{wrongCount}</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[200px]">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filter contestant or text..."
            className="ctrl-input py-1 text-xs pl-3 pr-7"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Answers Scoreboard Strip Feed */}
      {filteredAnswers.length === 0 ? (
        <div className="text-center py-12 text-zinc-500 bg-[#10121a] rounded-lg border border-dashed border-[#232838]">
          <p className="text-sm font-medium text-zinc-300">
            {answers.length === 0 ? 'Awaiting incoming contestant submissions...' : 'No entries match current filter'}
          </p>
          <p className="text-xs text-zinc-500 mt-1">
            {answers.length === 0 
              ? 'Answers submitted by players will appear immediately in exact arrival order.' 
              : 'Try clearing the search or switching filter tabs.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredAnswers.map((ans) => {
            const isEditing = editingId === ans.id;
            const arrivalRank = answers.findIndex(a => a.id === ans.id) + 1;
            const formattedRank = String(arrivalRank).padStart(2, '0');
            const isCustomPointsOpen = customPointId === ans.id;

            return (
              <div 
                key={ans.id}
                className={`rounded-lg border transition-colors ${
                  ans.isWinner 
                    ? 'bg-[#1c1a14] border-amber-500/50 border-l-4 border-l-amber-500' 
                    : ans.status === 'CORRECT' 
                      ? 'bg-[#121c17] border-emerald-500/30 border-l-4 border-l-emerald-500' 
                      : ans.status === 'WRONG'
                        ? 'bg-[#1c1214] border-rose-500/30 border-l-4 border-l-rose-500 opacity-80'
                        : 'bg-[#141720] border-[#232838] hover:border-[#2f364a]'
                }`}
              >
                <div className="p-3 sm:p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
                  
                  {/* Left: Scoreboard Rank + Player + Answer */}
                  <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
                    
                    {/* Big Hero Arrival Order Rank */}
                    <div className="shrink-0 text-center">
                      <span className={`font-mono-tabular text-xl sm:text-2xl font-black block leading-none ${
                        ans.isWinner ? 'text-amber-400' : arrivalRank === 1 ? 'text-amber-400' : 'text-zinc-400'
                      }`}>
                        #{formattedRank}
                      </span>
                      <span className="text-[9px] font-bold tracking-widest text-zinc-500 uppercase block mt-0.5">
                        ORDER
                      </span>
                    </div>

                    {/* Divider Hairline */}
                    <div className="w-[1px] h-8 bg-[#282d3d] shrink-0 hidden sm:block" />

                    {/* Player Details & Answer Body */}
                    <div className="min-w-0 flex-1 space-y-1">
                      
                      {/* Name + Username + Status Tag */}
                      <div className="flex items-center gap-2 flex-wrap text-xs">
                        <span className="font-bold text-zinc-100 text-sm">
                          {ans.playerName}
                        </span>
                        {ans.username && (
                          <span className="font-mono-tabular text-[11px] text-zinc-400 font-medium">
                            @{ans.username}
                          </span>
                        )}
                        {ans.isWinner && (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-500 text-zinc-950">
                            WINNER (+{ans.pointsAwarded})
                          </span>
                        )}
                        {ans.status === 'CORRECT' && !ans.isWinner && (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                            CORRECT (+{ans.pointsAwarded})
                          </span>
                        )}
                        {ans.status === 'WRONG' && (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40">
                            REJECTED
                          </span>
                        )}
                      </div>

                      {/* Submitted Answer Text */}
                      <div className="font-mono-tabular text-sm sm:text-base font-semibold text-zinc-100 break-words">
                        "{ans.answerText}"
                      </div>
                    </div>
                  </div>

                  {/* Middle: Precise Timestamp Display */}
                  <div className="flex items-center gap-3 text-xs shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[#232838]">
                    <div className="text-left md:text-right">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase block tracking-wider">
                        TIMESTAMP
                      </span>
                      {isEditing ? (
                        <div className="inline-flex items-center gap-1 mt-0.5">
                          <input
                            type="text"
                            value={editTimestampValue}
                            onChange={(e) => setEditTimestampValue(e.target.value)}
                            onKeyDown={(e) => handleKeyDownEdit(e, ans.id)}
                            className="ctrl-input font-mono-tabular text-xs py-0.5 px-2 w-28 text-center"
                            placeholder="HH:mm:ss.SSS"
                            autoFocus
                          />
                          <button
                            onClick={() => handleSaveEdit(ans.id)}
                            className="p-1 rounded bg-emerald-600 text-white hover:bg-emerald-500"
                            title="Save timestamp"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleStartEdit(ans)}
                          className="font-mono-tabular text-xs font-semibold text-zinc-300 hover:text-amber-400 inline-flex items-center gap-1 mt-0.5 p-1 rounded hover:bg-[#1f2433]"
                          title="Click to edit arrival timestamp"
                        >
                          <span>{ans.officialTimestamp}</span>
                          <Edit2 className="w-2.5 h-2.5 opacity-50" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Right: Operational Grading Action Buttons */}
                  <div className="flex items-center gap-1.5 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[#232838] flex-wrap justify-end">
                    
                    {/* Winner (+1 Pt) */}
                    <button
                      onClick={() => onEvaluateAnswer(ans.id, 'CORRECT', 1, true)}
                      className={`ctrl-btn text-xs py-1 px-2.5 ${
                        ans.isWinner 
                          ? 'bg-amber-500 text-zinc-950 font-bold' 
                          : 'bg-[#1e2330] hover:bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                      title="Declare Round Winner (+1 Point)"
                    >
                      WINNER (+1)
                    </button>

                    {/* Correct (+1 Pt) */}
                    <button
                      onClick={() => onEvaluateAnswer(ans.id, 'CORRECT', 1, false)}
                      className={`ctrl-btn text-xs py-1 px-2.5 ${
                        ans.status === 'CORRECT' && !ans.isWinner
                          ? 'bg-emerald-600 text-white font-bold'
                          : 'bg-[#1e2330] hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}
                      title="Mark Correct (+1 Point)"
                    >
                      CORRECT
                    </button>

                    {/* Reject (0 Pt) */}
                    <button
                      onClick={() => onEvaluateAnswer(ans.id, 'WRONG', 0, false)}
                      className={`ctrl-btn text-xs py-1 px-2.5 ${
                        ans.status === 'WRONG'
                          ? 'bg-rose-600 text-white font-bold'
                          : 'bg-[#1e2330] hover:bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}
                      title="Reject Submission (0 Points)"
                    >
                      REJECT
                    </button>

                    {/* Custom Point Adjustment */}
                    {isCustomPointsOpen ? (
                      <div className="inline-flex items-center gap-1 bg-[#10121a] p-1 rounded border border-[#2e354a]">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={customPointsVal}
                          onChange={(e) => setCustomPointsVal(Number(e.target.value))}
                          className="w-10 text-center text-xs py-0.5 rounded bg-[#181a24] text-zinc-200 font-mono font-bold"
                        />
                        <button
                          onClick={() => {
                            onEvaluateAnswer(ans.id, 'CORRECT', customPointsVal, false);
                            setCustomPointId(null);
                          }}
                          className="px-1.5 py-0.5 bg-zinc-200 text-zinc-950 text-[10px] font-bold rounded"
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
                        className="ctrl-btn ctrl-btn-ghost text-[11px] py-1 px-2 font-mono"
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

import React, { useState } from 'react';
import type { AnswerItem, GameRound } from '../types/game';
import { 
  Trophy, CheckCircle, XCircle, Clock, Edit2, Check, Award, Flame, 
  Search 
} from 'lucide-react';

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
      <div className="arcade-card p-8 text-center text-slate-400">
        <Clock className="w-10 h-10 mx-auto mb-2 opacity-40 text-amber-400" />
        <p className="font-arcade text-sm">NO ACTIVE ROUND</p>
        <p className="text-xs text-slate-500 mt-1">Start a round to begin accepting and reviewing player answers in real-time.</p>
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
    <div className="arcade-card arcade-card-gold p-4 sm:p-6 space-y-4">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2.5">
            <h3 className="font-arcade text-base sm:text-lg font-bold text-white tracking-wide flex items-center gap-2">
              <span>LIVE ANSWER QUEUE</span>
            </h3>
            <span className="arcade-badge badge-gold font-mono font-bold">
              {answers.length} {answers.length === 1 ? 'ANSWER' : 'ANSWERS'}
            </span>
          </div>
          <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
            Ranked by <strong className="text-amber-400">Official Timestamp (HH:mm:ss.SSS)</strong>. Click timestamp to modify order.
          </p>
        </div>

        {/* Expected Answer Badge */}
        {currentRound && (
          <div className="text-xs bg-slate-950/90 px-3 py-1.5 rounded-lg border border-amber-500/30 flex items-center gap-2 max-w-full truncate">
            <span className="text-slate-400 font-semibold text-[10px] uppercase">EXPECTED:</span>
            <span className="text-emerald-400 font-mono font-bold truncate">
              {currentRound.correctAnswerText || 'Manual Evaluation'}
            </span>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 bg-slate-900/60 p-2.5 rounded-xl border border-white/10">
        
        {/* Status Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-bold transition-all ${
              statusFilter === 'ALL' 
                ? 'bg-amber-500 text-black shadow-sm' 
                : 'text-slate-400 hover:text-white bg-slate-800/60'
            }`}
          >
            ALL ({answers.length})
          </button>
          <button
            onClick={() => setStatusFilter('PENDING')}
            className={`px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-bold transition-all ${
              statusFilter === 'PENDING' 
                ? 'bg-amber-400 text-black shadow-sm' 
                : 'text-amber-300/80 hover:text-amber-200 bg-amber-500/10'
            }`}
          >
            PENDING ({pendingCount})
          </button>
          <button
            onClick={() => setStatusFilter('CORRECT')}
            className={`px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-bold transition-all ${
              statusFilter === 'CORRECT' 
                ? 'bg-emerald-500 text-black shadow-sm' 
                : 'text-emerald-400/80 hover:text-emerald-300 bg-emerald-500/10'
            }`}
          >
            CORRECT ({correctCount})
          </button>
          <button
            onClick={() => setStatusFilter('WRONG')}
            className={`px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-bold transition-all ${
              statusFilter === 'WRONG' 
                ? 'bg-red-500 text-white shadow-sm' 
                : 'text-red-400/80 hover:text-red-300 bg-red-500/10'
            }`}
          >
            REJECTED ({wrongCount})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[180px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search contestant or answer..."
            className="arcade-input py-1 pl-8 pr-2.5 text-xs w-full bg-slate-950/80"
          />
        </div>
      </div>

      {/* Answers Feed / Table */}
      {filteredAnswers.length === 0 ? (
        <div className="text-center py-10 text-slate-400 bg-slate-950/40 rounded-xl border border-dashed border-white/10">
          <Flame className="w-8 h-8 mx-auto mb-2 opacity-50 text-amber-500" />
          <p className="font-arcade text-xs sm:text-sm text-slate-300">
            {answers.length === 0 ? 'WAITING FOR PLAYER SUBMISSIONS...' : 'NO MATCHING ANSWERS FOUND'}
          </p>
          <p className="text-[10px] sm:text-xs text-slate-500 mt-1">
            {answers.length === 0 ? 'Submissions from contestants will arrive here instantly with exact timestamps.' : 'Try adjusting the search filter above.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredAnswers.map((ans) => {
            const isEditing = editingId === ans.id;
            const originalRank = answers.findIndex(a => a.id === ans.id) + 1;
            const isCustomPointsOpen = customPointId === ans.id;

            return (
              <div 
                key={ans.id}
                className={`p-3 sm:p-4 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                  ans.isWinner 
                    ? 'bg-gradient-to-r from-amber-500/20 via-slate-900 to-slate-900 border-amber-500/60 shadow-md shadow-amber-500/10 ring-1 ring-amber-500/30' 
                    : ans.status === 'CORRECT' 
                      ? 'bg-gradient-to-r from-emerald-500/15 via-slate-900 to-slate-900 border-emerald-500/40' 
                      : ans.status === 'WRONG'
                        ? 'bg-gradient-to-r from-red-500/10 via-slate-900 to-slate-900 border-red-500/30 opacity-80'
                        : 'bg-slate-900/80 border-white/10 hover:border-amber-500/30'
                }`}
              >
                {/* Left: Rank, Player Details & Answer */}
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  
                  {/* Rank Badge */}
                  <div className="flex-shrink-0 text-center pt-0.5">
                    {originalRank === 1 ? (
                      <span className="flex flex-col items-center justify-center w-8 h-8 rounded-lg bg-amber-400 text-black font-arcade font-black text-xs shadow-md">
                        <Trophy className="w-3.5 h-3.5 fill-black" />
                        <span className="text-[9px] leading-none">#1</span>
                      </span>
                    ) : (
                      <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-800 border border-white/10 font-arcade font-bold text-xs text-slate-300">
                        #{originalRank}
                      </span>
                    )}
                  </div>

                  {/* Player Name & Answer Block */}
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-white text-xs sm:text-sm font-arcade tracking-wide">
                        {ans.playerName}
                      </span>
                      {ans.username && (
                        <span className="text-[10px] text-amber-300 font-mono bg-amber-500/15 px-1.5 py-0.2 rounded border border-amber-500/30">
                          @{ans.username}
                        </span>
                      )}
                      {ans.isWinner && (
                        <span className="text-[9px] font-arcade font-extrabold bg-amber-400 text-black px-1.5 py-0.5 rounded shadow-sm flex items-center gap-1">
                          <Award className="w-2.5 h-2.5" /> ROUND WINNER
                        </span>
                      )}
                      {ans.status === 'CORRECT' && !ans.isWinner && (
                        <span className="text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-1.5 py-0.5 rounded flex items-center gap-1">
                          <CheckCircle className="w-2.5 h-2.5" /> CORRECT (+{ans.pointsAwarded})
                        </span>
                      )}
                      {ans.status === 'WRONG' && (
                        <span className="text-[9px] font-bold bg-red-500/20 text-red-400 border border-red-500/40 px-1.5 py-0.5 rounded flex items-center gap-1">
                          <XCircle className="w-2.5 h-2.5" /> REJECTED
                        </span>
                      )}
                    </div>

                    {/* Answer Bubble */}
                    <div className="pt-0.5">
                      <span className="inline-block font-mono font-bold text-amber-200 bg-black/50 px-3 py-1.5 rounded-lg border border-white/10 text-xs sm:text-sm break-words max-w-full">
                        {ans.answerText}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Middle: High-precision Timestamps */}
                <div className="flex items-center gap-2.5 text-xs justify-between md:justify-start border-t md:border-t-0 pt-2 md:pt-0 border-white/5">
                  
                  {/* System Timestamp */}
                  <div className="text-left md:text-center">
                    <span className="block text-[9px] font-bold text-slate-500 uppercase">SYS ARRIVAL</span>
                    <span className="font-mono text-slate-400 text-[11px]">
                      {ans.systemTimestamp}
                    </span>
                  </div>

                  {/* Official Editable Timestamp */}
                  <div className="text-right md:text-center">
                    <span className="block text-[9px] font-bold text-amber-400/80 uppercase">OFFICIAL ORDER</span>
                    {isEditing ? (
                      <div className="flex items-center gap-1 mt-0.5">
                        <input
                          type="text"
                          value={editTimestampValue}
                          onChange={(e) => setEditTimestampValue(e.target.value)}
                          onKeyDown={(e) => handleKeyDownEdit(e, ans.id)}
                          className="arcade-input font-mono text-[11px] py-0.5 px-1.5 text-center w-28"
                          placeholder="14:32:07.184"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSaveEdit(ans.id)}
                          className="p-1 rounded bg-emerald-500 text-black hover:bg-emerald-400"
                          title="Save timestamp"
                        >
                          <Check className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => handleStartEdit(ans)}
                        className="inline-flex items-center gap-1 px-2 py-0.5 mt-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 font-mono font-bold text-[11px] transition-colors"
                        title="Click to edit timestamp ranking"
                      >
                        <span>{ans.officialTimestamp}</span>
                        <Edit2 className="w-2.5 h-2.5 text-amber-400/70" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Right: Quick Action & Point Awarding Buttons */}
                <div className="flex flex-wrap items-center justify-end gap-1.5 pt-2 md:pt-0 border-t md:border-t-0 border-white/5">
                  
                  {/* Primary 1-Click Winner (+1 Pt) */}
                  <button
                    onClick={() => onEvaluateAnswer(ans.id, 'CORRECT', 1, true)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-arcade font-bold flex items-center gap-1 transition-all ${
                      ans.isWinner 
                        ? 'bg-amber-400 text-black ring-2 ring-amber-300 font-extrabold shadow-md' 
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500 hover:text-black'
                    }`}
                    title="Declare Round Winner & Award +1 Point"
                  >
                    <Trophy className="w-3 h-3" />
                    <span>WINNER (+1)</span>
                  </button>

                  {/* Standard Correct (+1 Pt) */}
                  <button
                    onClick={() => onEvaluateAnswer(ans.id, 'CORRECT', 1, false)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-arcade font-bold flex items-center gap-1 transition-all ${
                      ans.status === 'CORRECT' && !ans.isWinner
                        ? 'bg-emerald-500 text-black font-extrabold shadow-md'
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500 hover:text-black'
                    }`}
                    title="Mark Answer Correct (+1 Point)"
                  >
                    <Check className="w-3 h-3" />
                    <span>CORRECT (+1)</span>
                  </button>

                  {/* Reject / 0 Pt */}
                  <button
                    onClick={() => onEvaluateAnswer(ans.id, 'WRONG', 0, false)}
                    className={`px-2 py-1.5 rounded-lg text-xs font-arcade font-bold transition-all ${
                      ans.status === 'WRONG'
                        ? 'bg-red-500 text-white font-extrabold shadow-md'
                        : 'bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500 hover:text-white'
                    }`}
                    title="Reject Answer (0 Points)"
                  >
                    REJECT
                  </button>

                  {/* Optional Custom Points toggle */}
                  {isCustomPointsOpen ? (
                    <div className="inline-flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-cyan-500/50">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={customPointsVal}
                        onChange={(e) => setCustomPointsVal(Number(e.target.value))}
                        className="w-12 text-center text-xs py-0.5 px-1 rounded bg-slate-900 text-cyan-300 font-bold font-mono border border-cyan-500/30"
                      />
                      <button
                        onClick={() => {
                          onEvaluateAnswer(ans.id, 'CORRECT', customPointsVal, false);
                          setCustomPointId(null);
                        }}
                        className="px-1.5 py-0.5 bg-cyan-500 text-black text-[10px] font-bold rounded"
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
                      className="p-1.5 text-slate-400 hover:text-cyan-300 rounded bg-slate-800/80 hover:bg-slate-700 text-[10px] font-mono border border-white/10"
                      title="Custom points value"
                    >
                      +PTS
                    </button>
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

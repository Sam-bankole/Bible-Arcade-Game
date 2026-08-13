import React, { useState } from 'react';
import type { AnswerItem, GameRound } from '../types/game';
import { Trophy, CheckCircle, XCircle, Clock, Edit2, Check, Award, Flame } from 'lucide-react';

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

  if (!currentRound) {
    return (
      <div className="arcade-card p-8 text-center text-slate-400">
        <Clock className="w-10 h-10 mx-auto mb-2 opacity-40 text-amber-400" />
        <p className="font-arcade text-sm">NO ACTIVE ROUND</p>
        <p className="text-xs text-slate-500 mt-1">Start a round above to begin accepting player answers.</p>
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

  return (
    <div className="arcade-card p-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-white/10 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-arcade text-lg font-bold text-white tracking-wide">
              LIVE ANSWER QUEUE
            </h3>
            <span className="arcade-badge badge-gold">
              {answers.length} SUBMITTED
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Answers ordered by <span className="text-amber-400 font-bold">Official Timestamp (HH:mm:ss.SSS)</span>. Edit timestamps to adjust ranking.
          </p>
        </div>

        {currentRound && (
          <div className="text-xs bg-slate-900 px-3 py-1.5 rounded-lg border border-white/10 flex items-center gap-2">
            <span className="text-slate-400 font-semibold">EXPECTED:</span>
            <span className="text-emerald-400 font-mono font-bold">{currentRound.correctAnswerText || 'Manual Review'}</span>
          </div>
        )}
      </div>

      {answers.length === 0 ? (
        <div className="text-center py-12 text-slate-400 bg-slate-950/40 rounded-xl border border-dashed border-white/10">
          <Flame className="w-8 h-8 mx-auto mb-2 opacity-50 text-amber-500" />
          <p className="font-arcade text-sm text-slate-300">WAITING FOR PLAYER SUBMISSIONS...</p>
          <p className="text-xs text-slate-500 mt-1">Player submissions will appear here instantly with high-precision timestamps.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-[11px] font-arcade text-slate-400 uppercase">
                <th className="py-3 px-3">RANK</th>
                <th className="py-3 px-3">PLAYER</th>
                <th className="py-3 px-3">SUBMITTED ANSWER</th>
                <th className="py-3 px-3 text-center">SYSTEM TIME</th>
                <th className="py-3 px-3 text-center">OFFICIAL TIME (EDITABLE)</th>
                <th className="py-3 px-3 text-center">STATUS</th>
                <th className="py-3 px-3 text-right">ACTIONS & POINTS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {answers.map((ans, idx) => {
                const isEditing = editingId === ans.id;
                const isFirst = idx === 0;

                return (
                  <tr 
                    key={ans.id}
                    className={`transition-colors ${
                      ans.isWinner 
                        ? 'bg-amber-500/10 border-l-4 border-l-amber-500' 
                        : ans.status === 'CORRECT' 
                          ? 'bg-emerald-500/5' 
                          : ans.status === 'WRONG'
                            ? 'bg-red-500/5'
                            : 'hover:bg-white/5'
                    }`}
                  >
                    {/* Rank */}
                    <td className="py-3 px-3 font-arcade font-extrabold text-slate-300">
                      {isFirst ? (
                        <span className="flex items-center gap-1 text-amber-400 text-base">
                          <Trophy className="w-4 h-4 fill-amber-400" /> #1
                        </span>
                      ) : (
                        `#${idx + 1}`
                      )}
                    </td>

                    {/* Player */}
                    <td className="py-3 px-3 font-bold text-white">
                      {ans.playerName}
                    </td>

                    {/* Submitted Answer */}
                    <td className="py-3 px-3">
                      <span className="font-semibold text-amber-200 bg-slate-900/90 px-3 py-1.5 rounded-lg border border-white/10 inline-block font-mono text-sm">
                        {ans.answerText}
                      </span>
                    </td>

                    {/* System Timestamp */}
                    <td className="py-3 px-3 text-center font-mono-time text-xs text-slate-400">
                      {ans.systemTimestamp}
                    </td>

                    {/* Official Timestamp (Editable) */}
                    <td className="py-3 px-3 text-center font-mono-time text-xs">
                      {isEditing ? (
                        <div className="flex items-center justify-center gap-1">
                          <input
                            type="text"
                            value={editTimestampValue}
                            onChange={(e) => setEditTimestampValue(e.target.value)}
                            className="arcade-input font-mono text-xs py-1 px-2 text-center w-32"
                            placeholder="14:32:07.184"
                            autoFocus
                          />
                          <button
                            onClick={() => handleSaveEdit(ans.id)}
                            className="p-1 rounded bg-emerald-500 text-black hover:bg-emerald-400"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div 
                          onClick={() => handleStartEdit(ans)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-300 cursor-pointer hover:bg-amber-500/20 transition-colors"
                          title="Click to edit official timestamp"
                        >
                          <span className="font-bold">{ans.officialTimestamp}</span>
                          <Edit2 className="w-3 h-3 text-amber-400/70" />
                        </div>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3 text-center">
                      {ans.status === 'CORRECT' && (
                        <span className="arcade-badge badge-green">
                          <CheckCircle className="w-3 h-3" /> CORRECT ({ans.pointsAwarded > 0 ? `+${ans.pointsAwarded}` : '0'})
                        </span>
                      )}
                      {ans.status === 'WRONG' && (
                        <span className="arcade-badge badge-red">
                          <XCircle className="w-3 h-3" /> REJECTED
                        </span>
                      )}
                      {ans.status === 'PENDING' && (
                        <span className="arcade-badge badge-gold">
                          PENDING
                        </span>
                      )}
                    </td>

                    {/* Actions & Point Buttons */}
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5 flex-wrap">
                        
                        {/* Quick Accept Buttons */}
                        <button
                          onClick={() => onEvaluateAnswer(ans.id, 'CORRECT', 10, isFirst)}
                          className="px-2 py-1 rounded-md text-[11px] font-arcade font-bold bg-emerald-500 text-black hover:bg-emerald-400"
                          title="Accept +10 Pts"
                        >
                          +10
                        </button>
                        <button
                          onClick={() => onEvaluateAnswer(ans.id, 'CORRECT', 7)}
                          className="px-2 py-1 rounded-md text-[11px] font-arcade font-bold bg-emerald-600/80 text-white hover:bg-emerald-500"
                          title="Accept +7 Pts"
                        >
                          +7
                        </button>
                        <button
                          onClick={() => onEvaluateAnswer(ans.id, 'CORRECT', 5)}
                          className="px-2 py-1 rounded-md text-[11px] font-arcade font-bold bg-emerald-700/80 text-white hover:bg-emerald-600"
                          title="Accept +5 Pts"
                        >
                          +5
                        </button>

                        {/* Reject Button */}
                        <button
                          onClick={() => onEvaluateAnswer(ans.id, 'WRONG', 0)}
                          className="px-2 py-1 rounded-md text-[11px] font-arcade font-bold bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500 hover:text-white"
                          title="Reject Answer"
                        >
                          REJECT
                        </button>

                        {/* Mark Winner Button */}
                        <button
                          onClick={() => onEvaluateAnswer(ans.id, 'CORRECT', 10, true)}
                          className={`p-1 rounded-md transition-colors ${
                            ans.isWinner 
                              ? 'bg-amber-400 text-black font-bold' 
                              : 'bg-amber-500/20 text-amber-300 hover:bg-amber-500 hover:text-black'
                          }`}
                          title="Mark Official Winner"
                        >
                          <Award className="w-4 h-4" />
                        </button>
                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
};

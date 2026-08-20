import React, { useState } from 'react';
import type { Player } from '../types/game';
import { Plus, Minus, X } from 'lucide-react';

interface LeaderboardViewProps {
  players: Record<string, Player>;
  isAdmin?: boolean;
  onUpdateScore?: (playerId: string, newScore: number) => void;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  players,
  isAdmin = false,
  onUpdateScore
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const sortedPlayers = Object.values(players).sort((a, b) => b.score - a.score);

  const filteredPlayers = sortedPlayers.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.username && p.username.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="tactics-card p-4 sm:p-5 space-y-4">
      
      {/* Header Strip */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[#1c2130]">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-display text-sm font-black uppercase tracking-wider text-white">
              Tournament Standings
            </h3>
            <span className="font-mono-tabular text-xs font-black px-2.5 py-0.5 rounded-full bg-[#171b26] text-[#ccff00] border border-[#272d42]">
              {sortedPlayers.length} {sortedPlayers.length === 1 ? 'Contestant' : 'Contestants'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Cumulative leaderboard scores across all tournament rounds
          </p>
        </div>

        {/* Search */}
        <div className="relative min-w-[200px] w-full sm:w-auto">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search contestant name..."
            className="tactics-input py-1 text-xs pl-3 pr-7 w-full bg-[#0c0e15]"
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

      {/* Standings List */}
      {sortedPlayers.length === 0 ? (
        <div className="text-center py-12 text-slate-500 bg-[#0c0e15] rounded-xl border border-dashed border-[#1c2130]">
          <p className="text-sm font-bold text-slate-300">No contestants registered yet</p>
          <p className="text-xs text-slate-500 mt-1">Players joining via the Room Code will appear on this board.</p>
        </div>
      ) : filteredPlayers.length === 0 ? (
        <div className="text-center py-8 text-slate-500 bg-[#0c0e15] rounded-xl">
          <p className="text-xs">No contestant matching "{searchTerm}"</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {filteredPlayers.map((player) => {
            const rank = sortedPlayers.findIndex(p => p.id === player.id) + 1;
            const formattedRank = String(rank).padStart(2, '0');
            const isLeader = rank === 1;

            return (
              <div
                key={player.id}
                className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                  isLeader
                    ? 'bg-[#171b26] border-[#ccff00]/50 border-l-4 border-l-[#ccff00] shadow-[0_0_16px_rgba(204,255,0,0.1)]'
                    : 'bg-[#141824] border-[#272d42]'
                }`}
              >
                {/* Left: Rank & Contestant Info */}
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  
                  {/* Rank Number */}
                  <div className="w-8 text-center shrink-0">
                    <span className={`font-mono-tabular text-base sm:text-lg font-black ${
                      isLeader ? 'text-[#ccff00]' : 'text-slate-500'
                    }`}>
                      #{formattedRank}
                    </span>
                  </div>

                  {/* Contestant Name + Username */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-black text-white text-sm sm:text-base truncate">
                        {player.name}
                      </span>
                      {player.username && (
                        <span className="font-mono text-xs text-slate-400 font-medium">
                          @{player.username}
                        </span>
                      )}
                      {isLeader && (
                        <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-[#ccff00] text-black shadow-sm font-mono">
                          LEADER
                        </span>
                      )}
                    </div>
                    <span className="font-mono text-[10px] text-slate-500 block">
                      PLAYER ID: {player.id.slice(-6).toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Right: Score + Manual Modifiers */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <span className={`font-mono-tabular text-xl sm:text-2xl font-black block leading-none ${
                      isLeader ? 'text-[#ccff00]' : 'text-white'
                    }`}>
                      {player.score}
                    </span>
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mt-0.5">
                      POINTS
                    </span>
                  </div>

                  {/* Admin Manual Score Correction */}
                  {isAdmin && onUpdateScore && (
                    <div className="flex items-center gap-1 border-l border-[#272d42] pl-2.5">
                      <button
                        onClick={() => onUpdateScore(player.id, player.score + 1)}
                        className="w-7 h-7 rounded-lg bg-[#171b26] hover:bg-[#1e2332] border border-[#272d42] flex items-center justify-center text-slate-300 hover:text-[#ccff00] transition-colors"
                        title="Add +1 point"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onUpdateScore(player.id, Math.max(0, player.score - 1))}
                        className="w-7 h-7 rounded-lg bg-[#171b26] hover:bg-[#1e2332] border border-[#272d42] flex items-center justify-center text-slate-400 hover:text-rose-400 transition-colors"
                        title="Deduct -1 point"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                    </div>
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

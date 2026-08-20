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
    <div className="ctrl-card p-4 sm:p-5 space-y-4">
      
      {/* Header Strip */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[#232838]">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-100">
              Tournament Standings
            </h3>
            <span className="font-mono-tabular text-xs font-semibold px-2 py-0.5 rounded bg-[#1c202d] text-zinc-300 border border-[#2e354a]">
              {sortedPlayers.length} {sortedPlayers.length === 1 ? 'player' : 'players'}
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Cumulative scores across all rounds in this session
          </p>
        </div>

        {/* Search */}
        <div className="relative min-w-[200px] w-full sm:w-auto">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search contestant..."
            className="ctrl-input py-1 text-xs pl-3 pr-7 w-full"
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

      {/* Standings List */}
      {sortedPlayers.length === 0 ? (
        <div className="text-center py-12 text-zinc-500 bg-[#10121a] rounded-lg border border-dashed border-[#232838]">
          <p className="text-sm font-medium text-zinc-300">No contestants registered</p>
          <p className="text-xs text-zinc-500 mt-1">Players will be listed here as they join using the session code.</p>
        </div>
      ) : filteredPlayers.length === 0 ? (
        <div className="text-center py-8 text-zinc-500 bg-[#10121a] rounded-lg">
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
                className={`p-2.5 sm:p-3 rounded-lg border transition-colors flex items-center justify-between gap-3 ${
                  isLeader
                    ? 'bg-[#18160f] border-amber-500/40 border-l-4 border-l-amber-500'
                    : 'bg-[#10121a] border-[#232838] hover:border-[#2f364a]'
                }`}
              >
                {/* Left: Rank & Player info */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  
                  {/* Rank Number */}
                  <div className="w-7 text-center shrink-0">
                    <span className={`font-mono-tabular text-sm sm:text-base font-bold ${
                      isLeader ? 'text-amber-400 font-black' : 'text-zinc-500'
                    }`}>
                      #{formattedRank}
                    </span>
                  </div>

                  {/* Player Name + Username */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-zinc-100 text-sm truncate">
                        {player.name}
                      </span>
                      {player.username && (
                        <span className="font-mono-tabular text-xs text-zinc-400 font-medium">
                          @{player.username}
                        </span>
                      )}
                      {isLeader && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-amber-500 text-zinc-950">
                          Leader
                        </span>
                      )}
                    </div>
                    <span className="font-mono-tabular text-[10px] text-zinc-600 block">
                      ID: {player.id.slice(-6).toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Right: Score + Manual score overrides */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <span className={`font-mono-tabular text-lg sm:text-xl font-bold block leading-none ${
                      isLeader ? 'text-amber-400 font-black' : 'text-zinc-100'
                    }`}>
                      {player.score}
                    </span>
                    <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block mt-0.5">
                      PTS
                    </span>
                  </div>

                  {/* Admin score correction */}
                  {isAdmin && onUpdateScore && (
                    <div className="flex items-center gap-1 border-l border-[#232838] pl-2.5">
                      <button
                        onClick={() => onUpdateScore(player.id, player.score + 1)}
                        className="ctrl-btn ctrl-btn-secondary text-xs p-1 h-6 w-6 flex items-center justify-center text-zinc-300 hover:text-emerald-400"
                        title="Add +1 point"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => onUpdateScore(player.id, Math.max(0, player.score - 1))}
                        className="ctrl-btn ctrl-btn-secondary text-xs p-1 h-6 w-6 flex items-center justify-center text-zinc-300 hover:text-rose-400"
                        title="Deduct -1 point"
                      >
                        <Minus className="w-3 h-3" />
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

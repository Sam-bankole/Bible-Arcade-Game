import React, { useState } from 'react';
import type { Player } from '../types/game';
import { Trophy, Medal, Crown, Flame, Award, Search, Plus, Minus } from 'lucide-react';

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
    <div className="arcade-card arcade-card-gold p-3 sm:p-6 max-w-full overflow-x-hidden space-y-4">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 sm:pb-4 border-b border-white/10">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center flex-shrink-0">
            <Trophy className="w-4 h-4 sm:w-6 sm:h-6 text-amber-400" />
          </div>
          <div>
            <h3 className="font-arcade text-base sm:text-xl font-extrabold gold-gradient-text leading-tight">
              SESSION LEADERBOARD
            </h3>
            <p className="text-[10px] sm:text-xs text-slate-400 font-semibold uppercase">
              CUMULATIVE EVENT STANDINGS
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <div className="relative min-w-[140px] sm:min-w-[180px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search player..."
              className="arcade-input py-1 pl-8 pr-2 text-xs w-full bg-slate-950/80"
            />
          </div>

          <div className="arcade-badge badge-gold flex items-center gap-1 text-[10px] sm:text-xs py-1 px-2.5 flex-shrink-0">
            <Flame className="w-3 h-3 text-amber-400" />
            <span>{sortedPlayers.length} PLAYERS</span>
          </div>
        </div>
      </div>

      {sortedPlayers.length === 0 ? (
        <div className="text-center py-10 text-slate-400 bg-slate-950/30 rounded-xl border border-dashed border-white/10">
          <Award className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2 opacity-40 text-amber-400" />
          <p className="font-arcade text-xs sm:text-sm">NO PLAYERS JOINED YET</p>
          <p className="text-[10px] sm:text-xs text-slate-500 mt-1">Players join using the 6-digit session entrance code.</p>
        </div>
      ) : filteredPlayers.length === 0 ? (
        <div className="text-center py-8 text-slate-400">
          <p className="text-xs">No player found matching "{searchTerm}"</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredPlayers.map((player) => {
            const rank = sortedPlayers.findIndex(p => p.id === player.id) + 1;
            let rankBadge = null;
            let cardBg = 'bg-slate-900/70 border-white/10';

            if (rank === 1) {
              cardBg = 'bg-gradient-to-r from-amber-500/20 via-slate-900 to-slate-900 border-amber-500/50 shadow-md shadow-amber-500/10';
              rankBadge = <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 fill-amber-400" />;
            } else if (rank === 2) {
              cardBg = 'bg-gradient-to-r from-slate-300/10 via-slate-900 to-slate-900 border-slate-400/40';
              rankBadge = <Medal className="w-4 h-4 sm:w-5 sm:h-5 text-slate-300" />;
            } else if (rank === 3) {
              cardBg = 'bg-gradient-to-r from-amber-700/10 via-slate-900 to-slate-900 border-amber-700/40';
              rankBadge = <Medal className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />;
            }

            return (
              <div
                key={player.id}
                className={`p-2.5 sm:p-4 rounded-xl border transition-all flex items-center justify-between gap-2 sm:gap-4 max-w-full ${cardBg}`}
              >
                {/* Rank & Name */}
                <div className="flex items-center gap-2.5 sm:gap-4 min-w-0 flex-1">
                  <div className="w-7 sm:w-9 text-center font-arcade font-black text-xs sm:text-base text-slate-300 flex items-center justify-center flex-shrink-0">
                    {rankBadge || `#${rank}`}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-white text-xs sm:text-base font-arcade tracking-wide flex items-center gap-1.5 flex-wrap truncate">
                      <span className="truncate">{player.name}</span>
                      {player.username && (
                        <span className="text-[10px] text-amber-300 font-mono bg-amber-500/15 px-1.5 py-0.2 rounded border border-amber-500/30">
                          @{player.username}
                        </span>
                      )}
                      {rank === 1 && (
                        <span className="text-[8px] sm:text-[10px] bg-amber-400/20 text-amber-300 border border-amber-400/40 px-1.5 py-0.5 rounded-full font-sans font-semibold uppercase flex-shrink-0">
                          LEADER
                        </span>
                      )}
                    </h4>
                    <span className="text-[9px] sm:text-[11px] text-slate-400 font-mono block truncate">
                      ID: {player.id.slice(-4).toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Score & Adjustments */}
                <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                  <div className="text-right">
                    <span className="font-arcade text-base sm:text-2xl font-black gold-gradient-text block leading-none">
                      {player.score}
                    </span>
                    <span className="text-[8px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider block mt-0.5">
                      PTS
                    </span>
                  </div>

                  {/* Admin manual score edit buttons */}
                  {isAdmin && onUpdateScore && (
                    <div className="flex flex-col gap-1 border-l border-white/10 pl-2 sm:pl-3">
                      <button
                        onClick={() => onUpdateScore(player.id, player.score + 1)}
                        className="px-1.5 py-0.5 text-[9px] sm:text-[10px] font-bold rounded bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-black transition-colors flex items-center gap-0.5"
                        title="Add +1 pt"
                      >
                        <Plus className="w-2.5 h-2.5" /> 1
                      </button>
                      <button
                        onClick={() => onUpdateScore(player.id, Math.max(0, player.score - 1))}
                        className="px-1.5 py-0.5 text-[9px] sm:text-[10px] font-bold rounded bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-colors flex items-center gap-0.5"
                        title="Deduct -1 pt"
                      >
                        <Minus className="w-2.5 h-2.5" /> 1
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

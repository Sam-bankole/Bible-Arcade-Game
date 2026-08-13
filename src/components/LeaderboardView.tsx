import React from 'react';
import type { Player } from '../types/game';
import { Trophy, Medal, Crown, Flame, Award } from 'lucide-react';

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
  const sortedPlayers = Object.values(players).sort((a, b) => b.score - a.score);

  return (
    <div className="arcade-card arcade-card-gold p-6">
      
      {/* Title Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
            <Trophy className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h3 className="font-arcade text-xl font-extrabold gold-gradient-text">
              ARCADE LEADERBOARD
            </h3>
            <p className="text-xs text-slate-400 font-semibold uppercase">
              LIVE EVENT STANDINGS
            </p>
          </div>
        </div>

        <div className="arcade-badge badge-gold flex items-center gap-1">
          <Flame className="w-3.5 h-3.5 text-amber-400" />
          <span>{sortedPlayers.length} PLAYERS</span>
        </div>
      </div>

      {sortedPlayers.length === 0 ? (
        <div className="text-center py-10 text-slate-400">
          <Award className="w-10 h-10 mx-auto mb-2 opacity-40 text-amber-400" />
          <p className="font-arcade text-sm">NO PLAYERS JOINED YET</p>
          <p className="text-xs text-slate-500 mt-1">Players join using the session code.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedPlayers.map((player, idx) => {
            const rank = idx + 1;
            let rankBadge = null;
            let cardBg = 'bg-slate-900/70 border-white/10';

            if (rank === 1) {
              cardBg = 'bg-gradient-to-r from-amber-500/20 via-slate-900 to-slate-900 border-amber-500/50 shadow-lg shadow-amber-500/10';
              rankBadge = <Crown className="w-5 h-5 text-amber-400 fill-amber-400 animate-bounce-subtle" />;
            } else if (rank === 2) {
              cardBg = 'bg-gradient-to-r from-slate-300/10 via-slate-900 to-slate-900 border-slate-400/40';
              rankBadge = <Medal className="w-5 h-5 text-slate-300" />;
            } else if (rank === 3) {
              cardBg = 'bg-gradient-to-r from-amber-700/10 via-slate-900 to-slate-900 border-amber-700/40';
              rankBadge = <Medal className="w-5 h-5 text-amber-600" />;
            }

            return (
              <div
                key={player.id}
                className={`p-4 rounded-xl border transition-all flex items-center justify-between gap-4 ${cardBg}`}
              >
                {/* Rank & Name */}
                <div className="flex items-center gap-4">
                  <div className="w-8 text-center font-arcade font-black text-lg text-slate-300 flex items-center justify-center">
                    {rankBadge || `#${rank}`}
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-base font-arcade tracking-wide flex items-center gap-2">
                      {player.name}
                      {rank === 1 && (
                        <span className="text-[10px] bg-amber-400/20 text-amber-300 border border-amber-400/40 px-2 py-0.5 rounded-full font-sans font-semibold uppercase">
                          LEADER
                        </span>
                      )}
                    </h4>
                    <span className="text-[11px] text-slate-400 font-mono">
                      ID: {player.id.slice(-4).toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Score */}
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="font-arcade text-2xl font-black gold-gradient-text block">
                      {player.score}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                      POINTS
                    </span>
                  </div>

                  {/* Admin score edit buttons */}
                  {isAdmin && onUpdateScore && (
                    <div className="flex flex-col gap-1 border-l border-white/10 pl-3">
                      <button
                        onClick={() => onUpdateScore(player.id, player.score + 5)}
                        className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-black"
                        title="Add +5 pts"
                      >
                        +5
                      </button>
                      <button
                        onClick={() => onUpdateScore(player.id, Math.max(0, player.score - 5))}
                        className="px-2 py-0.5 text-[10px] font-bold rounded bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white"
                        title="Deduct -5 pts"
                      >
                        -5
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

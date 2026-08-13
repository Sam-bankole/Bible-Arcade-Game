import React, { useState } from 'react';
import type { GameType } from '../types/game';
import { BIBLE_GAMES } from '../data/games';
import { Play } from 'lucide-react';

interface LandingPageProps {
  sessionCode: string;
  onJoinPlayer: (code: string, name: string) => void;
  onNavigateAdmin?: () => void;
  onNavigateProjector?: () => void;
  onSelectGame: (gameType: GameType) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  sessionCode,
  onJoinPlayer
}) => {
  const [joinCodeInput, setJoinCodeInput] = useState<string>(sessionCode || '');
  const [playerNameInput, setPlayerNameInput] = useState<string>('');

  const handlePlayerJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCodeInput.trim() || !playerNameInput.trim()) {
      alert('Please enter a session code and your display name.');
      return;
    }
    onJoinPlayer(joinCodeInput.trim().toUpperCase(), playerNameInput.trim());
  };

  return (
    <div className="py-4 sm:py-8 space-y-8 sm:space-y-12">
      
      {/* HERO BANNER & PLAYER JOIN HUB */}
      <div className="relative rounded-2xl sm:rounded-3xl p-4 sm:p-8 md:p-12 overflow-hidden border border-amber-500/30 bg-gradient-to-b from-[#16182c] via-[#0d0f1e] to-[#090a12] shadow-2xl">
        
        {/* Glow Effects */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 sm:w-96 h-64 sm:h-96 bg-amber-500/15 rounded-full blur-[90px] sm:blur-[120px] pointer-events-none" />

        <div className="relative z-10 text-center max-w-3xl mx-auto space-y-4 sm:space-y-6">

          <h1 className="font-arcade text-3xl sm:text-5xl md:text-6xl font-black tracking-wide leading-tight gold-gradient-text">
            BIBLE GAME ARCADE
          </h1>

          <p className="text-slate-300 text-xs sm:text-sm md:text-base leading-relaxed max-w-2xl mx-auto font-normal px-2">
            Multiplayer live competition platform for youth rallies, church events, Bible quizzes, and conferences.
          </p>

          {/* Centered Player Join Card */}
          <div className="max-w-md mx-auto pt-2 text-left">
            <div className="arcade-card arcade-card-gold p-4 sm:p-6 space-y-4 shadow-2xl">
              <div className="flex items-center gap-2 border-b border-white/10 pb-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                  <Play className="w-4 h-4 fill-amber-400" />
                </div>
                <div>
                  <h3 className="font-arcade text-sm sm:text-base font-bold text-white">
                    ENTER ARENA
                  </h3>
                  <p className="text-[10px] sm:text-xs text-amber-300">
                    Join live session with code
                  </p>
                </div>
              </div>

              <form onSubmit={handlePlayerJoin} className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-[10px] sm:text-xs font-bold uppercase text-amber-400 mb-1">
                    SESSION CODE
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={joinCodeInput}
                    onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                    placeholder="e.g. ABC123"
                    className="arcade-input font-arcade text-center font-bold text-lg sm:text-xl py-2.5 sm:py-3 uppercase tracking-widest"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] sm:text-xs font-bold uppercase text-slate-300 mb-1">
                    YOUR DISPLAY NAME
                  </label>
                  <input
                    type="text"
                    maxLength={20}
                    value={playerNameInput}
                    onChange={(e) => setPlayerNameInput(e.target.value)}
                    placeholder="e.g. Samuel"
                    className="arcade-input font-bold py-2.5 sm:py-3 text-sm sm:text-base"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="arcade-btn arcade-btn-primary w-full py-3 sm:py-3.5 text-xs sm:text-sm font-arcade tracking-wider shadow-lg shadow-amber-500/30"
                >
                  JOIN GAME NOW ⚡
                </button>
              </form>
            </div>
          </div>

        </div>

      </div>

      {/* FEATURED 5 GAMES SHOWCASE */}
      <div>
        <div className="text-center mb-6 sm:mb-8">
          <span className="arcade-badge badge-gold mb-2 text-xs">5 ARCADE MODULES</span>
          <h2 className="font-arcade text-xl sm:text-3xl font-extrabold text-white tracking-wide">
            AVAILABLE BIBLE GAMES
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {BIBLE_GAMES.map((game) => (
            <div
              key={game.id}
              className="arcade-card p-4 sm:p-6 flex flex-col justify-between group hover:border-amber-500/40 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span 
                    className="font-arcade text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-full border"
                    style={{ color: game.accentColor, borderColor: `${game.accentColor}40`, backgroundColor: `${game.accentColor}10` }}
                  >
                    GAME {game.number}
                  </span>
                  <span className="text-2xl">{game.icon}</span>
                </div>

                <h3 className="font-arcade text-base sm:text-lg font-bold text-white group-hover:text-amber-400 transition-colors">
                  {game.title}
                </h3>
                <p 
                  className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider mb-2"
                  style={{ color: game.accentColor }}
                >
                  {game.subtitle}
                </p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {game.description}
                </p>
              </div>

              <div className="pt-3 mt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-arcade text-slate-400">
                <span>LIVE SCORE ACCUMULATION</span>
                <span className="text-amber-400 font-mono">1 PT / WINNER</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

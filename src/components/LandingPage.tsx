import React, { useState } from 'react';
import type { GameType } from '../types/game';
import { BIBLE_GAMES } from '../data/games';
import { Play, Shield, Tv, ArrowRight } from 'lucide-react';

interface LandingPageProps {
  sessionCode: string;
  onJoinPlayer: (code: string, name: string) => void;
  onNavigateAdmin: () => void;
  onNavigateProjector: () => void;
  onSelectGame: (gameType: GameType) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  sessionCode,
  onJoinPlayer,
  onNavigateAdmin,
  onNavigateProjector,
  onSelectGame
}) => {
  const [joinCodeInput, setJoinCodeInput] = useState<string>(sessionCode || '');
  const [playerNameInput, setPlayerNameInput] = useState<string>('');

  const handlePlayerJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCodeInput.trim() || !playerNameInput.trim()) {
      alert('Please enter a session code and your name.');
      return;
    }
    onJoinPlayer(joinCodeInput.trim().toUpperCase(), playerNameInput.trim());
  };

  return (
    <div className="py-8 space-y-12">
      
      {/* HERO BANNER */}
      <div className="relative rounded-3xl p-8 sm:p-14 overflow-hidden border border-amber-500/30 bg-gradient-to-b from-[#16182c] via-[#0d0f1e] to-[#090a12] shadow-2xl">
        
        {/* Glow Effects */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/15 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 text-center max-w-3xl mx-auto space-y-6">

          <h1 className="font-arcade text-4xl sm:text-6xl font-black tracking-wide leading-none gold-gradient-text">
            BIBLE GAME ARCADE
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto font-normal">
            Five thrilling live multiplayer Bible games engineered for youth rallies, church conferences, Bible competitions, and live gatherings. Powered by millisecond precision admin timestamps.
          </p>

          {/* Action Hub Box */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-4 text-left">
            
            {/* Quick Player Join Card (7 Cols) */}
            <div className="md:col-span-7 arcade-card arcade-card-gold p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Play className="w-5 h-5 text-amber-400 fill-amber-400" />
                <h3 className="font-arcade text-base font-bold text-white">
                  JOIN GAME AS PLAYER
                </h3>
              </div>

              <form onSubmit={handlePlayerJoin} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-amber-400 mb-1">
                      SESSION CODE
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={joinCodeInput}
                      onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                      placeholder="e.g. ABC123"
                      className="arcade-input font-arcade text-center font-bold text-lg py-2.5 uppercase"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-300 mb-1">
                      DISPLAY NAME
                    </label>
                    <input
                      type="text"
                      maxLength={20}
                      value={playerNameInput}
                      onChange={(e) => setPlayerNameInput(e.target.value)}
                      placeholder="e.g. Samuel"
                      className="arcade-input font-bold py-2.5"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="arcade-btn arcade-btn-primary w-full py-3 text-sm shadow-lg shadow-amber-500/30"
                >
                  JOIN ARENA NOW
                </button>
              </form>
            </div>

            {/* Quick Admin & Display Launch Card (5 Cols) */}
            <div className="md:col-span-5 arcade-card p-6 space-y-4 flex flex-col justify-between border-cyan-500/30">
              <div>
                <h3 className="font-arcade text-base font-bold text-white mb-1 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-cyan-400" /> EVENT CONTROLS
                </h3>
                <p className="text-xs text-slate-400">
                  Manage sessions, review timestamps, award points, or launch projector display.
                </p>
              </div>

              <div className="space-y-2.5 pt-2">
                <button
                  onClick={onNavigateAdmin}
                  className="arcade-btn arcade-btn-cyan w-full py-3 text-xs justify-between"
                >
                  <span className="flex items-center gap-2">
                    <Shield className="w-4 h-4" /> ADMIN DASHBOARD
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={onNavigateProjector}
                  className="arcade-btn arcade-btn-purple w-full py-3 text-xs justify-between"
                >
                  <span className="flex items-center gap-2">
                    <Tv className="w-4 h-4" /> PROJECTOR DISPLAY
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* FEATURED 5 GAMES SHOWCASE */}
      <div>
        <div className="text-center mb-8">
          <span className="arcade-badge badge-gold mb-2">5 SEPARATE GAMES</span>
          <h2 className="font-arcade text-3xl font-extrabold text-white tracking-wide">
            EXPLORE THE BIBLE GAMES
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {BIBLE_GAMES.map((game) => (
            <div
              key={game.id}
              onClick={() => {
                onSelectGame(game.id);
                onNavigateAdmin();
              }}
              className="arcade-card p-6 cursor-pointer hover:border-amber-500/50 hover:bg-slate-900/80 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span 
                    className="font-arcade text-xs font-bold px-2.5 py-1 rounded-full border"
                    style={{ color: game.accentColor, borderColor: `${game.accentColor}40`, backgroundColor: `${game.accentColor}10` }}
                  >
                    GAME {game.number}
                  </span>
                  <span className="text-2xl">{game.icon}</span>
                </div>

                <h3 className="font-arcade text-lg font-bold text-white group-hover:text-amber-400 transition-colors">
                  {game.title}
                </h3>
                <p 
                  className="text-xs font-semibold uppercase tracking-wider mb-2"
                  style={{ color: game.accentColor }}
                >
                  {game.subtitle}
                </p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {game.description}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between text-xs font-arcade text-slate-300 group-hover:text-amber-400">
                <span>LAUNCH GAME</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

import React from 'react';
import type { GameType } from '../types/game';
import { BIBLE_GAMES } from '../data/games';
import { Play, CheckCircle2 } from 'lucide-react';

interface GameSelectorProps {
  selectedGame: GameType;
  onSelectGame: (gameType: GameType) => void;
  onLaunchGame?: () => void;
  isAdmin?: boolean;
}

export const GameSelector: React.FC<GameSelectorProps> = ({
  selectedGame,
  onSelectGame,
  onLaunchGame,
  isAdmin = false
}) => {
  return (
    <div className="py-6">
      <div className="text-center mb-8">
        <span className="arcade-badge badge-gold mb-3">ARCADE ARENA</span>
        <h2 className="text-3xl sm:text-4xl font-arcade font-extrabold gold-gradient-text tracking-wide mb-2">
          CHOOSE YOUR GAME
        </h2>
        <p className="text-slate-400 text-sm max-w-xl mx-auto">
          Select from 5 real-time Bible arcade competitions designed for youth rallies, live events, and church challenges.
        </p>
      </div>

      {/* 5 Arcade Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
        {BIBLE_GAMES.map((game) => {
          const isSelected = selectedGame === game.id;

          return (
            <div
              key={game.id}
              onClick={() => onSelectGame(game.id)}
              className={`relative cursor-pointer rounded-2xl p-6 transition-all duration-300 flex flex-col justify-between overflow-hidden border ${
                isSelected
                  ? 'bg-slate-900/90 border-amber-500 shadow-2xl shadow-amber-500/20 scale-[1.02]'
                  : 'bg-slate-950/60 border-white/10 hover:border-white/25 hover:bg-slate-900/70'
              }`}
            >
              {/* Background Glow Accent */}
              <div 
                className="absolute -top-12 -right-12 w-32 h-32 rounded-full blur-3xl opacity-20 pointer-events-none"
                style={{ backgroundColor: game.accentColor }}
              />

              <div>
                {/* Header Row: Game Number & Selected Indicator */}
                <div className="flex items-center justify-between mb-4">
                  <span 
                    className="font-arcade text-xs font-black px-3 py-1 rounded-full border border-white/10"
                    style={{ color: game.accentColor, borderColor: `${game.accentColor}40` }}
                  >
                    GAME {game.number}
                  </span>

                  {isSelected && (
                    <span className="flex items-center gap-1 text-xs font-bold text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-full border border-amber-400/30">
                      <CheckCircle2 className="w-3.5 h-3.5" /> SELECTED
                    </span>
                  )}
                </div>

                {/* Game Title & Icon */}
                <div className="flex items-start gap-3 mb-3">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 border border-white/10 shadow-inner"
                    style={{ backgroundColor: `${game.accentColor}15` }}
                  >
                    {game.icon}
                  </div>
                  <div>
                    <h3 className="font-arcade text-lg font-bold text-white tracking-wide">
                      {game.title}
                    </h3>
                    <p 
                      className="text-xs font-bold uppercase tracking-wider mt-0.5"
                      style={{ color: game.accentColor }}
                    >
                      {game.subtitle}
                    </p>
                  </div>
                </div>

                {/* Description */}
                <p className="text-slate-400 text-xs leading-relaxed mb-4">
                  {game.description}
                </p>
              </div>

              {/* Action Button */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
                  {isAdmin ? 'ADMIN CONTROL READY' : 'SELECT GAME'}
                </span>

                <button
                  type="button"
                  className={`arcade-btn text-xs py-2 px-4 ${
                    isSelected ? 'arcade-btn-primary' : 'arcade-btn-secondary'
                  }`}
                >
                  {isSelected ? 'ACTIVE' : 'SELECT'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Launch Action */}
      {isAdmin && onLaunchGame && (
        <div className="text-center pt-2">
          <button
            onClick={onLaunchGame}
            className="arcade-btn arcade-btn-primary px-8 py-4 text-base shadow-xl shadow-amber-500/25 animate-pulse-glow"
          >
            <Play className="w-5 h-5" /> CONFIGURE & START ROUND
          </button>
        </div>
      )}
    </div>
  );
};

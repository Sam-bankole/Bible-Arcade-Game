import React from 'react';
import type { GameType } from '../types/game';
import { BIBLE_GAMES } from '../data/games';
import { Play, Check } from 'lucide-react';

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
    <div className="py-2 space-y-4">
      
      {/* Header */}
      <div className="pb-3 border-b border-[#1c2130] flex items-center justify-between">
        <div>
          <h2 className="font-display text-sm font-black uppercase tracking-wider text-white">
            Available Competition Formats
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Switch between 5 supported live tournament formats
          </p>
        </div>
      </div>

      {/* Game Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {BIBLE_GAMES.map((game) => {
          const isSelected = selectedGame === game.id;

          return (
            <div
              key={game.id}
              onClick={() => onSelectGame(game.id)}
              className={`cursor-pointer rounded-xl p-4 transition-all flex flex-col justify-between border ${
                isSelected
                  ? 'bg-[#171b26] border-[#ccff00]/50 border-l-4 border-l-[#ccff00] shadow-[0_0_20px_rgba(204,255,0,0.12)]'
                  : 'bg-[#11141d] border-[#1c2130] hover:border-[#272d42] hover:bg-[#141824]'
              }`}
            >
              <div>
                {/* Header Tag */}
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono-tabular text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    FORMAT #{game.number}
                  </span>

                  {isSelected && (
                    <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-[#ccff00] text-black shadow-sm flex items-center gap-1 font-mono">
                      <Check className="w-3 h-3" />
                      ACTIVE
                    </span>
                  )}
                </div>

                {/* Title */}
                <div className="mb-2">
                  <h3 className="font-display font-black text-base text-white">
                    {game.title}
                  </h3>
                  <p className="text-xs text-[#ccff00] font-semibold">
                    {game.subtitle}
                  </p>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-400 leading-relaxed mb-3">
                  {game.description}
                </p>
              </div>

              {/* Select Button */}
              <div className="pt-3 border-t border-[#1c2130] flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-500">
                  {isAdmin ? 'Ready for next round' : 'Selected format'}
                </span>

                <button
                  type="button"
                  className={`tactics-btn text-xs py-1 px-3 rounded-lg ${
                    isSelected ? 'tactics-btn-primary' : 'tactics-btn-secondary'
                  }`}
                >
                  {isSelected ? 'SELECTED' : 'SELECT'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Launch Action */}
      {isAdmin && onLaunchGame && (
        <div className="text-center pt-3">
          <button
            onClick={onLaunchGame}
            className="tactics-btn tactics-btn-primary px-6 py-2.5 text-xs font-black inline-flex items-center gap-2 rounded-xl shadow-lg hover:shadow-[0_0_24px_rgba(204,255,0,0.35)]"
          >
            <Play className="w-4 h-4 fill-black" />
            <span>CONFIGURE & START ROUND</span>
          </button>
        </div>
      )}
    </div>
  );
};

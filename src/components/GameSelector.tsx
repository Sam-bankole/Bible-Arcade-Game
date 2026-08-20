import React from 'react';
import type { GameType } from '../types/game';
import { BIBLE_GAMES } from '../data/games';
import { Play } from 'lucide-react';

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
    <div className="py-4 space-y-4">
      
      {/* Header */}
      <div className="pb-2 border-b border-[#232838] flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-100">
            Game Mode Selection
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Switch between 5 supported live competition formats
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
              className={`cursor-pointer rounded-lg p-4 transition-colors flex flex-col justify-between border ${
                isSelected
                  ? 'bg-[#18160f] border-amber-500/50 border-l-4 border-l-amber-500'
                  : 'bg-[#10121a] border-[#232838] hover:border-[#2e354a]'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono-tabular text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                    FORMAT #{game.number}
                  </span>

                  {isSelected && (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-amber-500 text-zinc-950">
                      Active
                    </span>
                  )}
                </div>

                {/* Title */}
                <div className="flex items-start gap-2.5 mb-2">
                  <span className="text-xl shrink-0">{game.icon}</span>
                  <div>
                    <h3 className="text-sm font-bold text-zinc-100">
                      {game.title}
                    </h3>
                    <p className="text-xs text-zinc-400 font-medium">
                      {game.subtitle}
                    </p>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-zinc-400 leading-relaxed mb-3">
                  {game.description}
                </p>
              </div>

              {/* Select Button */}
              <div className="pt-2 border-t border-[#232838] flex items-center justify-between">
                <span className="text-[10px] font-mono text-zinc-500">
                  {isAdmin ? 'Ready for next round' : 'Selected mode'}
                </span>

                <button
                  type="button"
                  className={`ctrl-btn text-xs py-1 px-3 ${
                    isSelected ? 'ctrl-btn-primary' : 'ctrl-btn-secondary'
                  }`}
                >
                  {isSelected ? 'Selected' : 'Choose'}
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
            className="ctrl-btn ctrl-btn-primary px-6 py-2.5 text-xs font-bold inline-flex items-center gap-2"
          >
            <Play className="w-3.5 h-3.5 fill-zinc-950" />
            <span>Configure & Start Round</span>
          </button>
        </div>
      )}
    </div>
  );
};

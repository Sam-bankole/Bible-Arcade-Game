import React, { useState } from 'react';
import type { GameType, UserIdentity } from '../types/game';
import { BIBLE_GAMES } from '../data/games';
import {
  Zap,
  BookOpen,
  ArrowRight,
  LogOut,
  Cross,
  Search,
  Heart,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { clearLocalIdentity } from '../utils/userIdentity';

interface LandingPageProps {
  sessionCode: string;
  identity: UserIdentity;
  onJoinPlayer: (code: string) => void;
  onNavigateAdmin?: () => void;
  onNavigateProjector?: () => void;
  onSelectGame: (gameType: GameType) => void;
  onSignOut: () => void;
  sessionError?: string;
}

// Lucide icon mapping for the 5 games
const GAME_ICONS: Record<string, React.ElementType> = {
  LETTER_RUSH:       Zap,
  SCRIPTURE_OR_SPAM: BookOpen,
  OT_OR_NT:          Cross,
  WHO_AM_I:          Search,
  BIBLE_COUPLES:     Heart,
};

export const LandingPage: React.FC<LandingPageProps> = ({
  identity,
  onJoinPlayer,
  onSignOut,
  sessionError: externalError = ''
}) => {
  const [joinCode, setJoinCode] = useState(() => {
    if (typeof window !== 'undefined') {
      const codeParam = new URLSearchParams(window.location.search).get('code');
      if (codeParam) return codeParam.toUpperCase().replace(/[^A-Z0-9]/g, '');
    }
    return '';
  });
  const [localError, setLocalError] = useState('');

  const displayError = externalError || localError;

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = joinCode.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (!clean || clean.length < 6) {
      setLocalError('Please enter a valid 6-character session code.');
      return;
    }
    setLocalError('');
    onJoinPlayer(clean);
  };

  const handleSignOut = () => {
    clearLocalIdentity();
    onSignOut();
  };

  return (
    <div className="w-full max-w-xl mx-auto px-3.5 sm:px-6 py-3 sm:py-6 space-y-4 sm:space-y-6">

      {/* ── 1. COMPACT PLAYER PROFILE STRIP ─────────────────────── */}
      <div className="flex items-center justify-between bg-[#0e131f] border border-[#1d2538] rounded-xl px-3 py-2.5 sm:px-4 sm:py-3 shadow-md">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-full bg-[#ccff00]/10 border border-[#ccff00]/30 flex items-center justify-center text-[#ccff00] font-mono font-bold text-xs shrink-0">
            {identity.username[0]?.toUpperCase() || 'U'}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-xs sm:text-sm font-bold text-white truncate">
                @{identity.username}
              </span>
              <span className="text-[10px] text-slate-400 font-medium hidden xs:inline truncate">
                ({identity.displayName})
              </span>
            </div>
            <span className="text-[10px] text-[#ccff00] font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ccff00] animate-pulse" />
              Ready to play
            </span>
          </div>
        </div>

        <button
          id="btn-sign-out"
          onClick={handleSignOut}
          className="flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-rose-400 bg-[#161c2c] hover:bg-[#20273c] border border-[#242e46] px-2.5 py-1.5 rounded-lg transition-colors shrink-0 cursor-pointer"
          title="Sign out or switch identity"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Sign out</span>
        </button>
      </div>

      {/* ── 2. PRIMARY JOIN SESSION CARD (IMMEDIATELY IN VIEW) ───── */}
      <div className="bg-[#0f1422] border-2 border-[#ccff00]/35 hover:border-[#ccff00]/60 rounded-2xl p-5 sm:p-7 shadow-2xl relative overflow-hidden transition-all duration-300">
        
        {/* Subtle top ambient accent */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-56 h-36 bg-[#ccff00]/12 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          
          <div className="text-center space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#ccff00]/10 border border-[#ccff00]/30 text-[10px] font-mono font-bold text-[#ccff00] uppercase tracking-wider">
              <Sparkles className="w-3 h-3 text-[#ccff00]" /> Live Multiplayer
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-white tracking-wide">
              ENTER ARENA
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Type the 6-character code shared by your host
            </p>
          </div>

          <form onSubmit={handleJoin} className="space-y-3.5" noValidate>
            
            {/* Session Code Input */}
            <div>
              <div className="relative">
                <input
                  id="input-session-code"
                  type="text"
                  inputMode="text"
                  maxLength={6}
                  value={joinCode}
                  onChange={(e) => {
                    setJoinCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''));
                    setLocalError('');
                  }}
                  placeholder="ENTER ROOM CODE"
                  className="w-full bg-[#07090f] border-2 border-[#263148] focus:border-[#ccff00] focus:shadow-[0_0_20px_rgba(204,255,0,0.25)] rounded-xl py-3.5 sm:py-4 px-4 font-mono text-center text-2xl sm:text-3xl font-extrabold tracking-[0.25em] text-white uppercase placeholder:text-slate-600 placeholder:tracking-normal placeholder:text-sm outline-none transition-all duration-200"
                  autoComplete="off"
                  autoCapitalize="characters"
                  spellCheck={false}
                  autoFocus
                  required
                />
              </div>

              {/* Error display */}
              {displayError && (
                <div className="flex items-center gap-2 bg-rose-500/15 border border-rose-500/40 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-rose-300 mt-2.5 animate-fadeIn">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{displayError}</span>
                </div>
              )}
            </div>

            {/* Big Premium Join CTA Button */}
            <button
              id="btn-join-game"
              type="submit"
              className="group w-full py-4 px-5 bg-gradient-to-r from-[#ccff00] to-[#b3e600] hover:from-[#d4ff1a] hover:to-[#b8e600] active:scale-[0.98] text-[#060902] font-display font-black text-base sm:text-lg tracking-wider uppercase rounded-xl shadow-[0_4px_25px_rgba(204,255,0,0.3)] hover:shadow-[0_0_32px_rgba(204,255,0,0.6)] flex items-center justify-center gap-2.5 cursor-pointer transition-all duration-200"
            >
              <span>JOIN GAME NOW</span>
              <ArrowRight className="w-5 h-5 stroke-[3] group-hover:translate-x-1 transition-transform duration-200" />
            </button>
          </form>

        </div>
      </div>

      {/* ── 3. 5 BIBLE GAME FORMATS SHOWCASE ─────────────────────── */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between px-1">
          <div className="space-y-0.5">
            <h3 className="font-display font-bold text-sm sm:text-base text-white tracking-wide">
              5 GAME FORMATS
            </h3>
            <p className="text-[11px] text-slate-400">
              Host selects the format for each live round
            </p>
          </div>
          <span className="text-[10px] font-mono font-bold text-slate-400 bg-[#121724] border border-[#20293d] px-2 py-0.5 rounded">
            ALL-IN-ONE
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {BIBLE_GAMES.map((game, idx) => {
            const Icon = GAME_ICONS[game.id] || Zap;
            return (
              <div
                key={game.id}
                className="bg-[#0e121d] border border-[#1c2438] hover:border-[#2b3754] rounded-xl p-3 sm:p-3.5 flex items-start gap-3 transition-colors"
              >
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border"
                  style={{
                    color: game.accentColor,
                    backgroundColor: `${game.accentColor}12`,
                    borderColor: `${game.accentColor}35`
                  }}
                >
                  <Icon className="w-4 h-4" />
                </div>

                <div className="min-w-0 flex-1 space-y-0.5">
                  <div className="flex items-center justify-between gap-1">
                    <h4 className="font-display font-bold text-xs sm:text-sm text-white truncate">
                      {game.title}
                    </h4>
                    <span className="font-mono text-[9px] font-bold text-slate-500">
                      0{idx + 1}
                    </span>
                  </div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: game.accentColor }}>
                    {game.subtitle}
                  </p>
                  <p className="text-[11px] text-slate-400 leading-snug line-clamp-2">
                    {game.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 4. CLEAN FOOTER ──────────────────────────────────────── */}
      <footer className="text-center pt-2 pb-6 border-t border-[#161c2c] space-y-1">
        <p className="text-[11px] text-slate-500 font-medium">
          Bible Game Arcade · Real-time Multiplayer Competition
        </p>
      </footer>

    </div>
  );
};

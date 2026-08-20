import React, { useState } from 'react';
import { soundFx } from '../utils/audio';
import { Volume2, VolumeX, Shield, Play, Tv, RefreshCw } from 'lucide-react';

interface NavbarProps {
  currentView: 'LANDING' | 'ADMIN' | 'PLAYER' | 'PROJECTOR';
  sessionCode?: string;
  onNavigate: (view: 'LANDING' | 'ADMIN' | 'PLAYER' | 'PROJECTOR') => void;
  onResetSession?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  sessionCode,
  onNavigate,
  onResetSession
}) => {
  const [soundEnabled, setSoundEnabled] = useState(soundFx.isEnabled());

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundFx.setEnabled(next);
  };

  return (
    <header className="sticky top-0 z-50 bg-[#0e1015] border-b border-[#232838] px-2 sm:px-4 py-2 sm:py-2.5">
      <div className={`${currentView === 'ADMIN' ? 'arcade-admin-container' : 'arcade-container'} flex items-center justify-between gap-2 sm:gap-4`}>
        
        {/* Brand / Logo */}
        <div 
          onClick={() => onNavigate('LANDING')}
          className="flex items-center gap-2.5 cursor-pointer group shrink-0"
        >
          <div className="w-8 h-8 rounded-lg bg-[#1a1e2b] border border-[#2e354a] flex items-center justify-center text-base group-hover:border-amber-500/50 transition-colors">
            <span>📜</span>
          </div>
          <div>
            <div className="font-display font-bold text-sm sm:text-base text-zinc-100 tracking-wide leading-tight">
              Letter Rush
            </div>
            <div className="text-[10px] uppercase tracking-wider text-green-500 font-semibold hidden sm:block">
              Live Competition
            </div>
          </div>
        </div>

        {/* Session Code & Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          
          {sessionCode && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#141720] border border-[#2e354a]">
              <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">CODE</span>
              <span className="font-mono-tabular font-bold text-amber-400 tracking-wider text-xs sm:text-sm">
                {sessionCode}
              </span>
            </div>
          )}

          {/* Mode Context Badge */}
          {currentView === 'ADMIN' ? (
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded bg-[#1e1c14] border border-amber-500/30 text-amber-400">
                <Shield className="w-3 h-3" />
                <span className="hidden sm:inline">CONSOLE</span>
              </span>
              <button
                onClick={() => onNavigate('PROJECTOR')}
                className="ctrl-btn ctrl-btn-secondary text-xs py-1 px-2.5 flex items-center gap-1"
                title="Launch Projector View"
              >
                <Tv className="w-3 h-3 text-zinc-400" />
                <span className="hidden sm:inline">Stage</span>
              </button>
            </div>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded bg-[#10121a] border border-[#2e354a] text-zinc-300">
              <Play className="w-3 h-3 text-amber-400" />
              <span className="hidden sm:inline">ARENA</span>
            </span>
          )}

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            title={soundEnabled ? 'Mute Sound FX' : 'Enable Sound FX'}
            className="w-8 h-8 rounded-lg bg-[#141720] hover:bg-[#1f2433] border border-[#2e354a] flex items-center justify-center text-zinc-300 hover:text-amber-400 transition-colors shrink-0"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-zinc-200 shrink-0" />
            ) : (
              <VolumeX className="w-4 h-4 text-zinc-500 shrink-0" />
            )}
          </button>

          {/* Reset Session */}
          {currentView === 'ADMIN' && onResetSession && (
            <button
              onClick={() => {
                if (confirm('Reset the current game session and clear scores?')) {
                  onResetSession();
                }
              }}
              title="Reset Session"
              className="w-8 h-8 rounded-lg bg-[#141720] hover:bg-[#1f2433] border border-[#2e354a] flex items-center justify-center text-zinc-400 hover:text-rose-400 transition-colors shrink-0"
            >
              <RefreshCw className="w-4 h-4 shrink-0" />
            </button>
          )}

        </div>

      </div>
    </header>
  );
};

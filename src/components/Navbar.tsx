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
    <header className="sticky top-0 z-50 bg-[#0c0e18]/98 backdrop-blur-xl border-b border-amber-500/25 px-2 sm:px-4 py-2 sm:py-3 shadow-lg shadow-black/60 max-w-full">
      <div className="arcade-container flex items-center justify-between gap-1.5 sm:gap-3 max-w-full">
        
        {/* Brand / Logo */}
        <div 
          onClick={() => onNavigate('LANDING')}
          className="flex items-center gap-1.5 sm:gap-2.5 cursor-pointer group flex-shrink-0"
        >
          <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 flex items-center justify-center shadow-md shadow-amber-500/30 group-hover:scale-105 transition-transform flex-shrink-0">
            <span className="text-xs sm:text-xl">📜</span>
          </div>
          <div>
            <div className="font-arcade text-[11px] sm:text-base md:text-lg font-black tracking-wide gold-gradient-text leading-none">
              BIBLE ARCADE
            </div>
            <div className="text-[8px] sm:text-[10px] uppercase tracking-widest text-amber-400 font-bold hidden sm:block mt-0.5">
              Live Competition
            </div>
          </div>
        </div>

        {/* Session Code & Controls */}
        <div className="flex items-center gap-1 sm:gap-2.5 flex-shrink-0">
          
          {sessionCode && (
            <div className="flex items-center gap-1 px-1.5 sm:px-2.5 py-1 rounded-md sm:rounded-lg bg-amber-500/15 border border-amber-500/40">
              <span className="text-[8px] sm:text-xs text-amber-400 font-bold uppercase">CODE:</span>
              <span className="font-mono font-black text-amber-300 tracking-wider text-[10px] sm:text-sm">{sessionCode}</span>
            </div>
          )}

          {/* Mode Context Badge */}
          {currentView === 'ADMIN' ? (
            <div className="flex items-center gap-1 sm:gap-1.5">
              <span className="arcade-badge badge-gold border-amber-500/50 text-amber-300 text-[9px] sm:text-xs py-1 px-1.5 sm:px-2">
                <Shield className="w-3 h-3 text-amber-400" /> <span className="hidden sm:inline">ADMIN</span>
              </span>
              <button
                onClick={() => onNavigate('PROJECTOR')}
                className="arcade-btn arcade-btn-purple text-[9px] sm:text-xs py-1 px-1.5 sm:px-2.5 flex items-center gap-1"
                title="Launch Big Screen Projector Display"
              >
                <Tv className="w-3 h-3" /> <span className="hidden sm:inline">STAGE</span>
              </button>
            </div>
          ) : (
            <span className="arcade-badge badge-cyan text-[9px] sm:text-xs py-1 px-1.5 sm:px-2">
              <Play className="w-3 h-3 text-cyan-400" /> <span className="hidden sm:inline">ARENA</span>
            </span>
          )}

          {/* Mute Sound Button */}
          <button
            onClick={toggleSound}
            title={soundEnabled ? 'Mute Sound FX' : 'Enable Sound FX'}
            className="p-1 sm:p-2 rounded-lg bg-slate-800/90 hover:bg-slate-700/90 border border-white/15 text-slate-200 hover:text-amber-400 transition-colors flex-shrink-0"
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" /> : <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-500" />}
          </button>

          {/* Reset Session button for admin */}
          {currentView === 'ADMIN' && onResetSession && (
            <button
              onClick={() => {
                if (confirm('Are you sure you want to reset the current game session? All player scores will be cleared.')) {
                  onResetSession();
                }
              }}
              title="Reset Session"
              className="p-1 sm:p-2 rounded-lg bg-red-500/15 hover:bg-red-500/25 border border-red-500/40 text-red-400 transition-colors flex-shrink-0"
            >
              <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          )}

        </div>

      </div>
    </header>
  );
};

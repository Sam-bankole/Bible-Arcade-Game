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
    <header className="sticky top-0 z-50 bg-[#0c0e18]/90 backdrop-blur-md border-b border-white/10 px-4 py-3">
      <div className="arcade-container flex items-center justify-between">
        
        {/* Brand / Logo */}
        <div 
          onClick={() => onNavigate('LANDING')}
          className="flex items-center gap-2 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
            <span className="text-xl">📜</span>
          </div>
          <div>
            <div className="font-arcade text-lg font-extrabold tracking-wider gold-gradient-text">
              BIBLE ARCADE
            </div>
            <div className="text-[10px] uppercase tracking-widest text-slate-400 font-medium">
              Live Competition
            </div>
          </div>
        </div>

        {/* Session Code & Controls */}
        <div className="flex items-center gap-2 md:gap-4">
          
          {sessionCode && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30">
              <span className="text-xs text-amber-400 font-semibold uppercase">CODE:</span>
              <span className="font-mono font-bold text-amber-300 tracking-wider text-sm">{sessionCode}</span>
            </div>
          )}

          {/* Mode Context Badge */}
          {currentView === 'ADMIN' ? (
            <div className="flex items-center gap-2">
              <span className="arcade-badge badge-gold border-amber-500/40 text-amber-300">
                <Shield className="w-3.5 h-3.5 text-amber-400" /> ADMIN PORTAL
              </span>
              <button
                onClick={() => onNavigate('PROJECTOR')}
                className="arcade-btn arcade-btn-purple text-xs py-1.5 px-3 flex items-center gap-1.5"
                title="Launch Big Screen Projector Display"
              >
                <Tv className="w-3.5 h-3.5" /> PROJECTOR
              </button>
            </div>
          ) : (
            <span className="arcade-badge badge-cyan">
              <Play className="w-3.5 h-3.5 text-cyan-400" /> CONTESTANT ARENA
            </span>
          )}

          {/* Mute Sound Button */}
          <button
            onClick={toggleSound}
            title={soundEnabled ? 'Mute Sound FX' : 'Enable Sound FX'}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-white/10 text-slate-300 hover:text-amber-400 transition-colors"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          {/* Optional Reset Session button for admin */}
          {currentView === 'ADMIN' && onResetSession && (
            <button
              onClick={() => {
                if (confirm('Are you sure you want to reset the current game session? All player scores will be cleared.')) {
                  onResetSession();
                }
              }}
              title="Reset Session"
              className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}

        </div>

      </div>
    </header>
  );
};

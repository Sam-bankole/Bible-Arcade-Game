import React, { useState } from 'react';
import { soundFx } from '../utils/audio';
import { Volume2, VolumeX, Tv, RefreshCw, Copy, Check } from 'lucide-react';

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
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundFx.setEnabled(next);
  };

  const handleCopyCode = () => {
    if (!sessionCode) return;
    navigator.clipboard.writeText(sessionCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <header className="sticky top-0 z-50 bg-[#0c0e15]/95 backdrop-blur border-b border-[#1c2130] px-3 sm:px-4 py-2.5">
      <div className={`${currentView === 'ADMIN' ? 'arcade-admin-container' : 'arcade-container'} flex items-center justify-between gap-3`}>
        
        {/* Left: Brand with Electric Lime Tag */}
        <div 
          onClick={() => onNavigate('LANDING')}
          className="flex items-center gap-3 cursor-pointer shrink-0 group"
        >
          {/* Logo Mark */}
          <div className="w-8 h-8 rounded-full bg-[#171b26] border-2 border-[#ccff00] flex items-center justify-center text-sm shadow-[0_0_12px_rgba(204,255,0,0.3)] transition-transform group-hover:scale-105">
            <span className="text-xs font-black text-[#ccff00] font-mono">LR</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="font-display font-black text-base sm:text-lg text-white tracking-wide leading-none">
              Letter Rush
            </div>
            <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#ccff00]/15 text-[#ccff00] border border-[#ccff00]/30 hidden sm:inline-block">
              LIVE
            </span>
          </div>
        </div>

        {/* Right: Stage Controls & Status */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          
          {/* Session Code & Quick Copy Pill */}
          {sessionCode && (
            <div className="flex items-center rounded-full bg-[#11141d] border border-[#272d42] pl-3 pr-1 py-1 gap-2">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ccff00]" />
                ROOM
              </span>
              <span className="font-mono-tabular font-black text-[#ccff00] text-xs sm:text-sm tracking-widest">
                {sessionCode}
              </span>
              <button
                onClick={handleCopyCode}
                className="tactics-btn-primary rounded-full px-2.5 py-0.5 text-[11px] font-black flex items-center gap-1 shadow-sm"
                title="Copy Room Code"
              >
                {copiedCode ? <Check className="w-3 h-3 text-black" /> : <Copy className="w-3 h-3 text-black" />}
                <span className="hidden sm:inline">{copiedCode ? 'COPIED' : 'COPY'}</span>
              </button>
            </div>
          )}

          {/* Context Badge */}
          {currentView === 'ADMIN' ? (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onNavigate('PROJECTOR')}
                className="tactics-btn tactics-btn-secondary text-xs py-1 px-2.5 rounded-lg flex items-center gap-1.5"
                title="Launch Projector Stage"
              >
                <Tv className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden md:inline">Projector</span>
              </button>
            </div>
          ) : (
            <span className="tactics-pill-lime">
              PLAYER
            </span>
          )}

          {/* Sound Toggle Button */}
          <button
            onClick={toggleSound}
            title={soundEnabled ? 'Mute Sound FX' : 'Enable Sound FX'}
            className="w-8 h-8 rounded-lg bg-[#171b26] hover:bg-[#1e2332] border border-[#272d42] flex items-center justify-center text-slate-300 hover:text-white transition-colors"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-slate-200" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-500" />
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
              className="w-8 h-8 rounded-lg bg-[#171b26] hover:bg-[#1e2332] border border-[#272d42] flex items-center justify-center text-slate-400 hover:text-rose-400 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Host Badge */}
          <div className="hidden lg:flex items-center gap-2 pl-2 border-l border-[#1c2130]">
            <div className="w-7 h-7 rounded-full bg-[#1c2335] border border-[#3e4e76] flex items-center justify-center text-xs font-mono font-bold text-white shadow-sm">
              SH
            </div>
            <div className="text-left leading-tight">
              <div className="text-xs font-bold text-white">Stage Host</div>
              <div className="text-[9px] font-semibold text-[#ccff00]">Console</div>
            </div>
          </div>

        </div>

      </div>
    </header>
  );
};

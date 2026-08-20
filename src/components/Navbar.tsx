import React, { useState } from 'react';
import { soundFx } from '../utils/audio';
import { Volume2, VolumeX, Tv, RefreshCw, Copy, Check, Gamepad2 } from 'lucide-react';

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
    <header className="sticky top-0 z-50 bg-[#090b11]/95 backdrop-blur border-b border-[#181e2c] px-3 sm:px-4 py-2">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-2">
        
        {/* Brand */}
        <div 
          onClick={() => onNavigate('LANDING')}
          className="flex items-center gap-2.5 cursor-pointer shrink-0"
        >
          <div className="w-8 h-8 rounded-lg bg-[#141926] border border-[#263148] flex items-center justify-center text-[#ccff00]">
            <Gamepad2 className="w-4 h-4" />
          </div>

          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-sm sm:text-base text-white tracking-wide leading-none">
              Bible Arcade
            </span>
            {currentView === 'PLAYER' && sessionCode && (
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#ccff00]/10 text-[#ccff00] border border-[#ccff00]/25">
                {sessionCode}
              </span>
            )}
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2 shrink-0">
          
          {/* Admin Room Code Pill */}
          {currentView === 'ADMIN' && sessionCode && (
            <div className="flex items-center rounded-full bg-[#111622] border border-[#232d42] pl-2.5 pr-1 py-0.5 gap-1.5">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                CODE:
              </span>
              <span className="font-mono font-bold text-[#ccff00] text-xs tracking-wider">
                {sessionCode}
              </span>
              <button
                onClick={handleCopyCode}
                className="bg-[#ccff00] text-[#060902] hover:bg-[#b8e600] rounded-full px-2 py-0.5 text-[10px] font-bold flex items-center gap-1"
                title="Copy Room Code"
              >
                {copiedCode ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
          )}

          {/* Admin Projector Shortcut */}
          {currentView === 'ADMIN' && (
            <button
              onClick={() => onNavigate('PROJECTOR')}
              className="px-2.5 py-1 rounded-lg bg-[#141926] border border-[#232d42] text-xs font-semibold text-cyan-400 hover:bg-[#1b2233] flex items-center gap-1.5 transition-colors"
              title="Launch Projector Stage"
            >
              <Tv className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Projector</span>
            </button>
          )}

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            title={soundEnabled ? 'Mute Sound FX' : 'Enable Sound FX'}
            className="w-8 h-8 rounded-lg bg-[#141926] hover:bg-[#1c2335] border border-[#232d42] flex items-center justify-center text-slate-300 hover:text-white transition-colors"
            aria-label="Toggle Sound"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-[#ccff00]" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-500" />
            )}
          </button>

          {/* Reset Session (Admin only) */}
          {currentView === 'ADMIN' && onResetSession && (
            <button
              onClick={() => {
                if (confirm('Reset the current game session and clear scores?')) {
                  onResetSession();
                }
              }}
              title="Reset Session"
              className="w-8 h-8 rounded-lg bg-[#141926] hover:bg-[#1c2335] border border-[#232d42] flex items-center justify-center text-slate-400 hover:text-rose-400 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}

        </div>

      </div>
    </header>
  );
};

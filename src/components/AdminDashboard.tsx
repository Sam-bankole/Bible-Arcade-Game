import React, { useState } from 'react';
import type { GameSession, GameType, GameRound, AnswerItem } from '../types/game';
import { GameSelector } from './GameSelector';
import { AdminQuestionForm } from './AdminQuestionForm';
import { AnswerQueue } from './AnswerQueue';
import { LeaderboardView } from './LeaderboardView';
import { 
  XCircle, Eye, EyeOff, 
  ShieldCheck, Lock, Unlock, Zap, Trophy, Award, Radio, Tv, RefreshCw
} from 'lucide-react';

interface AdminDashboardProps {
  session: GameSession;
  onUpdateGameType: (gameType: GameType) => void;
  onStartRound: (roundData: Partial<GameRound>) => void;
  onSetRoundState: (status: 'WAITING' | 'LIVE' | 'CLOSED' | 'REVIEW' | 'RESULTS') => void;
  onUpdateOfficialTimestamp: (answerId: string, timestamp: string) => void;
  onEvaluateAnswer: (answerId: string, status: 'CORRECT' | 'WRONG' | 'PENDING', points: number, isWinner?: boolean) => void;
  onToggleLeaderboard: (visible: boolean) => void;
  onUpdatePlayerScore: (playerId: string, newScore: number) => void;
  onResetSession: () => void;
  onOpenProjector: () => void;
}

import { syncEngine, DEFAULT_ADMIN_PASSWORD } from '../utils/syncEngine';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  session,
  onUpdateGameType,
  onStartRound,
  onSetRoundState,
  onUpdateOfficialTimestamp,
  onEvaluateAnswer,
  onToggleLeaderboard,
  onUpdatePlayerScore,
  onResetSession,
  onOpenProjector
}) => {
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => syncEngine.isAdminAuthenticated());
  const [activeTab, setActiveTab] = useState<'CONTROL' | 'SELECTOR' | 'LEADERBOARD'>('CONTROL');
  const [authError, setAuthError] = useState<string>('');
  const [showPasswordChange, setShowPasswordChange] = useState<boolean>(false);
  const [newPasswordInput, setNewPasswordInput] = useState<string>('');

  const handlePasswordAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (syncEngine.authenticateAdmin(passwordInput.trim())) {
      setIsAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError(`Invalid Admin Password. Default is '${DEFAULT_ADMIN_PASSWORD}'`);
    }
  };

  const handleLockSession = () => {
    syncEngine.lockAdminSession();
    setIsAuthenticated(false);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPasswordInput.trim().length < 4) {
      alert('Password must be at least 4 characters long.');
      return;
    }
    syncEngine.setAdminPassword(newPasswordInput.trim());
    alert('Admin password successfully updated!');
    setShowPasswordChange(false);
    setNewPasswordInput('');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="arcade-card arcade-card-gold p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mx-auto mb-4 text-amber-400">
            <Lock className="w-8 h-8" />
          </div>
          
          <h2 className="font-arcade text-2xl font-black gold-gradient-text mb-1">
            STRICT ADMIN ACCESS
          </h2>
          <p className="text-slate-400 text-xs mb-6">
            Enter administrator password to unlock the event control desk.
          </p>

          <form onSubmit={handlePasswordAuth} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold uppercase text-amber-400 mb-1 text-left">
                ADMIN SECURITY PASSWORD
              </label>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  setAuthError('');
                }}
                placeholder={`Default: ${DEFAULT_ADMIN_PASSWORD}`}
                className="arcade-input text-center text-lg font-mono font-bold tracking-wider"
                autoFocus
                required
              />
            </div>

            {authError && (
              <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/40 text-red-300 text-xs font-semibold">
                {authError}
              </div>
            )}

            <button
              type="submit"
              className="arcade-btn arcade-btn-primary w-full py-3.5 text-sm shadow-xl shadow-amber-500/30"
            >
              <Unlock className="w-4 h-4" /> UNLOCK CONTROL CENTER
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-white/10 text-[11px] text-slate-500">
            Default Password: <strong className="text-amber-400 font-mono">{DEFAULT_ADMIN_PASSWORD}</strong>
          </div>
        </div>
      </div>
    );
  }

  const currentRound = session.currentRound;
  const currentAnswers: AnswerItem[] = (currentRound && session.answers[currentRound.id]) || [];

  return (
    <div className="py-6 space-y-6">
      
      {/* Top Banner Control Bar */}
      <div className="arcade-card p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-amber-500/30 bg-slate-900/90">
        
        {/* Left Info */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <h2 className="font-arcade text-xl font-extrabold gold-gradient-text tracking-wide">
              ADMIN CONTROL CENTER
            </h2>
            <div className="text-xs text-slate-400 font-medium flex items-center gap-2 mt-0.5">
              <span>SESSION: <strong className="text-amber-300 font-mono">{session.code}</strong></span>
              <span>•</span>
              <span>PLAYERS: <strong className="text-cyan-400 font-mono">{Object.keys(session.players).length}</strong></span>
              <span>•</span>
              <span className="text-slate-400 font-mono bg-slate-800 px-2 py-0.5 rounded border border-white/10 text-[10px]">DIRECT URL: /admin</span>
            </div>
          </div>
        </div>

        {/* State & Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          
          {/* Current State Indicator */}
          <span className={`arcade-badge ${
            session.status === 'LIVE' 
              ? 'badge-green' 
              : session.status === 'CLOSED' 
                ? 'badge-red' 
                : session.status === 'REVIEW'
                  ? 'badge-purple'
                  : 'badge-gold'
          }`}>
            STATE: {session.status}
          </span>

          {/* Quick Round State Actions */}
          {session.status === 'LIVE' && (
            <button
              onClick={() => onSetRoundState('CLOSED')}
              className="arcade-btn arcade-btn-red text-xs py-2 px-3 flex items-center gap-1.5"
            >
              <XCircle className="w-3.5 h-3.5" /> CLOSE SUBMISSIONS
            </button>
          )}

          {session.status === 'CLOSED' && (
            <button
              onClick={() => onSetRoundState('REVIEW')}
              className="arcade-btn arcade-btn-purple text-xs py-2 px-3 flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5" /> REVIEW ANSWERS
            </button>
          )}

          {session.status === 'REVIEW' && (
            <button
              onClick={() => onSetRoundState('RESULTS')}
              className="arcade-btn arcade-btn-green text-xs py-2 px-3 flex items-center gap-1.5"
            >
              <Award className="w-3.5 h-3.5" /> REVEAL WINNER & RESULTS
            </button>
          )}

          {/* Lock Admin Session */}
          <button
            onClick={handleLockSession}
            className="arcade-btn arcade-btn-secondary text-xs py-2 px-3 flex items-center gap-1.5"
            title="Lock Admin Control Desk"
          >
            <Lock className="w-3.5 h-3.5 text-amber-400" /> LOCK DESK
          </button>

          {/* Change Admin Password */}
          <button
            onClick={() => setShowPasswordChange(true)}
            className="arcade-btn arcade-btn-secondary text-xs py-2 px-3 flex items-center gap-1.5"
            title="Change Admin Password"
          >
            <span>CHANGE PASSWORD</span>
          </button>

          {/* Leaderboard visibility toggle */}
          <button
            onClick={() => onToggleLeaderboard(!session.showLeaderboardToPlayers)}
            className={`arcade-btn text-xs py-2 px-3 flex items-center gap-1.5 ${
              session.showLeaderboardToPlayers ? 'arcade-btn-cyan' : 'arcade-btn-secondary'
            }`}
            title="Toggle player leaderboard access"
          >
            {session.showLeaderboardToPlayers ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>LEADERBOARD: {session.showLeaderboardToPlayers ? 'VISIBLE' : 'HIDDEN'}</span>
          </button>

          {/* Reset Session button */}
          <button
            onClick={() => {
              if (confirm('Are you sure you want to reset all scores and round data for this session?')) {
                onResetSession();
              }
            }}
            className="arcade-btn arcade-btn-red text-xs py-2 px-3 flex items-center gap-1.5"
            title="Reset Game Session"
          >
            <RefreshCw className="w-3.5 h-3.5" /> RESET SESSION
          </button>

          {/* Projector launcher */}
          <button
            onClick={onOpenProjector}
            className="arcade-btn arcade-btn-purple text-xs py-2 px-3 flex items-center gap-1.5"
          >
            <Tv className="w-3.5 h-3.5" /> LAUNCH DISPLAY MODE
          </button>

        </div>

      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2">
        <button
          onClick={() => setActiveTab('CONTROL')}
          className={`px-4 py-2 rounded-xl text-xs font-arcade font-bold transition-all flex items-center gap-2 ${
            activeTab === 'CONTROL' 
              ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' 
              : 'text-slate-400 hover:text-white bg-slate-900/50'
          }`}
        >
          <Radio className="w-4 h-4" /> ACTIVE ROUND CONTROL
        </button>

        <button
          onClick={() => setActiveTab('SELECTOR')}
          className={`px-4 py-2 rounded-xl text-xs font-arcade font-bold transition-all flex items-center gap-2 ${
            activeTab === 'SELECTOR' 
              ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' 
              : 'text-slate-400 hover:text-white bg-slate-900/50'
          }`}
        >
          <Zap className="w-4 h-4" /> SWITCH GAME MODE
        </button>

        <button
          onClick={() => setActiveTab('LEADERBOARD')}
          className={`px-4 py-2 rounded-xl text-xs font-arcade font-bold transition-all flex items-center gap-2 ${
            activeTab === 'LEADERBOARD' 
              ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' 
              : 'text-slate-400 hover:text-white bg-slate-900/50'
          }`}
        >
          <Trophy className="w-4 h-4" /> LEADERBOARD STANDINGS
        </button>
      </div>

      {/* TAB 1: ACTIVE ROUND CONTROL */}
      {activeTab === 'CONTROL' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Question Entry Form (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            <AdminQuestionForm
              gameType={session.currentGame}
              onStartRound={onStartRound}
            />
          </div>

          {/* Right Column: Live Answer Queue & Timestamp Controls (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            <AnswerQueue
              currentRound={currentRound}
              answers={currentAnswers}
              onUpdateTimestamp={onUpdateOfficialTimestamp}
              onEvaluateAnswer={onEvaluateAnswer}
            />
          </div>

        </div>
      )}

      {/* TAB 2: GAME SELECTOR */}
      {activeTab === 'SELECTOR' && (
        <GameSelector
          selectedGame={session.currentGame}
          onSelectGame={(g) => {
            onUpdateGameType(g);
            setActiveTab('CONTROL');
          }}
          onLaunchGame={() => setActiveTab('CONTROL')}
          isAdmin={true}
        />
      )}

      {/* TAB 3: LEADERBOARD */}
      {activeTab === 'LEADERBOARD' && (
        <LeaderboardView
          players={session.players}
          isAdmin={true}
          onUpdateScore={onUpdatePlayerScore}
        />
      )}

      {/* CHANGE PASSWORD MODAL */}
      {showPasswordChange && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="arcade-card arcade-card-gold p-6 max-w-md w-full relative">
            <h3 className="font-arcade text-lg font-bold text-white mb-2">
              UPDATE ADMIN PASSWORD
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Set a custom strict password for your admin control desk.
            </p>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-amber-400 mb-1">
                  NEW ADMIN PASSWORD
                </label>
                <input
                  type="password"
                  value={newPasswordInput}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                  placeholder="Enter new admin password"
                  className="arcade-input font-mono"
                  required
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  className="arcade-btn arcade-btn-primary flex-1 py-2.5 text-xs"
                >
                  SAVE NEW PASSWORD
                </button>
                <button
                  type="button"
                  onClick={() => setShowPasswordChange(false)}
                  className="arcade-btn arcade-btn-secondary py-2.5 text-xs"
                >
                  CANCEL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

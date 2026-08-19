import React, { useState, useEffect } from 'react';
import type { GameSession, GameType, GameRound, AnswerItem } from '../types/game';
import { GameSelector } from './GameSelector';
import { AdminQuestionForm } from './AdminQuestionForm';
import { AnswerQueue } from './AnswerQueue';
import { LeaderboardView } from './LeaderboardView';
import { 
  XCircle, Eye, EyeOff, ShieldCheck, Lock, Unlock, Zap, Trophy, Award, 
  Radio, Tv, RefreshCw, Copy, Check, Plus, Layers, ArrowRight, Play,
  Users, History, LogOut
} from 'lucide-react';
import { syncEngine, generate6DigitCode } from '../utils/syncEngine';

interface AdminDashboardProps {
  session: GameSession;
  onCreateNewSession?: (customCode?: string) => void;
  onSwitchSession?: (sessionCode: string) => void;
  onEndSession?: () => void;
  onAdvanceToNextRound?: () => void;
  onUpdateSessionCode: (newCode: string) => void;
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

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  session,
  onCreateNewSession,
  onSwitchSession,
  onEndSession,
  onAdvanceToNextRound,
  onUpdateSessionCode,
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
  const [activeTab, setActiveTab] = useState<'CONTROL' | 'SELECTOR' | 'LEADERBOARD' | 'HISTORY'>('CONTROL');
  const [authError, setAuthError] = useState<string>('');
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Session Manager Modal
  const [isSessionModalOpen, setIsSessionModalOpen] = useState<boolean>(false);
  const [newCodeInput, setNewCodeInput] = useState<string>('');
  const [knownSessions, setKnownSessions] = useState<string[]>([]);

  useEffect(() => {
    setKnownSessions(syncEngine.getAdminSessions());
  }, [session.code, isSessionModalOpen]);

  const handlePasswordAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (syncEngine.authenticateAdmin(passwordInput.trim())) {
      setIsAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError('Invalid Admin Password. Access Denied.');
    }
  };

  const handleLockSession = () => {
    syncEngine.lockAdminSession();
    setIsAuthenticated(false);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(session.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const joinUrl = `${origin}/play?code=${session.code}`;
    navigator.clipboard.writeText(joinUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCreateNewSession = () => {
    const code = newCodeInput.trim() ? newCodeInput.trim().toUpperCase() : generate6DigitCode();
    if (onCreateNewSession) {
      onCreateNewSession(code);
    } else {
      onUpdateSessionCode(code);
    }
    setIsSessionModalOpen(false);
    setNewCodeInput('');
  };

  const handleSwitchSession = (code: string) => {
    if (onSwitchSession) {
      onSwitchSession(code);
    } else {
      onUpdateSessionCode(code);
    }
    setIsSessionModalOpen(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="arcade-card arcade-card-gold p-6 sm:p-8 max-w-md w-full text-center">
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
                placeholder="Enter Admin Password"
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
        </div>
      </div>
    );
  }

  const currentRound = session?.currentRound || null;
  const answersObj = session?.answers || {};
  const currentAnswers: AnswerItem[] = (currentRound && answersObj[currentRound.id]) || [];
  const playersObj = session?.players || {};
  const playerCount = Object.keys(playersObj).length;
  const roundHistory = session?.roundHistory || [];

  return (
    <div className="py-4 sm:py-6 space-y-5 sm:space-y-6 max-w-full">
      
      {/* 1. TOP HEADER & SESSION CONTROL BAR */}
      <div className="arcade-card p-4 sm:p-5 border-amber-500/30 bg-slate-900/95 space-y-4">
        
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          
          {/* Left Info & 6-Digit Session Badge */}
          <div className="flex items-center gap-3 sm:gap-4 flex-wrap sm:flex-nowrap">
            <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 flex-shrink-0">
              <ShieldCheck className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-arcade text-lg sm:text-xl font-extrabold gold-gradient-text tracking-wide">
                  ADMIN CONTROL CENTER
                </h2>
                {session.isEnded && (
                  <span className="text-[10px] font-arcade font-bold px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/40">
                    SESSION ENDED
                  </span>
                )}
              </div>

              {/* Session Code & Copy Actions */}
              <div className="flex items-center gap-2 mt-1 flex-wrap text-xs">
                
                {/* 6-Digit Code Badge */}
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/40">
                  <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">ENTRANCE CODE:</span>
                  <span className="font-mono font-black text-amber-300 text-sm tracking-wider">{session.code}</span>
                  
                  {/* Quick Copy Code Button */}
                  <button
                    onClick={handleCopyCode}
                    className="p-1 text-slate-400 hover:text-white rounded hover:bg-white/10 transition-colors ml-0.5"
                    title="Copy 6-Digit Code"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {/* Copy Player Join Link */}
                <button
                  onClick={handleCopyLink}
                  className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-white/10 text-slate-300 text-[11px] font-bold flex items-center gap-1 transition-colors"
                  title="Copy Direct Join URL"
                >
                  {copiedLink ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-amber-400" />}
                  <span>{copiedLink ? 'LINK COPIED!' : 'COPY PLAYER LINK'}</span>
                </button>

                {/* Session Switcher Button */}
                <button
                  onClick={() => setIsSessionModalOpen(true)}
                  className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-[11px] font-bold flex items-center gap-1 transition-colors"
                >
                  <Layers className="w-3 h-3 text-amber-400" />
                  <span>SESSIONS ({knownSessions.length || 1})</span>
                </button>

                {/* Player count */}
                <span className="text-slate-400 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-cyan-400" />
                  <span>PLAYERS: <strong className="text-cyan-300 font-mono font-bold">{playerCount}</strong></span>
                </span>

              </div>
            </div>
          </div>

          {/* Right Action Icons & Toggles */}
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-start lg:justify-end">
            
            {/* Leaderboard visibility toggle */}
            <button
              onClick={() => onToggleLeaderboard(!session.showLeaderboardToPlayers)}
              className={`arcade-btn text-[10px] sm:text-xs py-1.5 px-2.5 flex items-center gap-1.5 ${
                session.showLeaderboardToPlayers ? 'arcade-btn-cyan' : 'arcade-btn-secondary'
              }`}
              title="Toggle player leaderboard access"
            >
              {session.showLeaderboardToPlayers ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-slate-500" />}
              <span>LEADERBOARD: {session.showLeaderboardToPlayers ? 'VISIBLE' : 'HIDDEN'}</span>
            </button>

            {/* Projector / Stage Display */}
            <button
              onClick={onOpenProjector}
              className="arcade-btn arcade-btn-purple text-[10px] sm:text-xs py-1.5 px-2.5 flex items-center gap-1.5"
              title="Launch Big Screen Projector View"
            >
              <Tv className="w-3.5 h-3.5" /> STAGE DISPLAY
            </button>

            {/* Lock Control Desk */}
            <button
              onClick={handleLockSession}
              className="arcade-btn arcade-btn-secondary text-[10px] sm:text-xs py-1.5 px-2.5 flex items-center gap-1.5"
              title="Lock Admin Control Desk"
            >
              <Lock className="w-3.5 h-3.5 text-amber-400" /> LOCK
            </button>

            {/* Reset Session */}
            <button
              onClick={() => {
                if (confirm('Are you sure you want to reset all scores and round data for this session?')) {
                  onResetSession();
                }
              }}
              className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 transition-colors"
              title="Reset Current Session"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>

          </div>

        </div>

        {/* 2. THE EVENT CONDUCTOR (Workflow Step-by-Step Bar) */}
        <div className="bg-slate-950/80 p-3 sm:p-4 rounded-xl border border-amber-500/30 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          <div className="flex items-center gap-3">
            <span className={`arcade-badge font-bold ${
              session.status === 'LIVE' 
                ? 'badge-green animate-pulse' 
                : session.status === 'CLOSED' 
                  ? 'badge-red' 
                  : session.status === 'REVIEW'
                    ? 'badge-purple'
                    : session.status === 'RESULTS'
                      ? 'badge-gold'
                      : 'badge-gold'
            }`}>
              STATUS: {session.status}
            </span>

            {currentRound ? (
              <div className="text-xs text-slate-300 flex items-center gap-1.5 font-medium">
                <span className="font-arcade text-amber-400">ROUND #{currentRound.roundNumber}</span>
                <span>•</span>
                <span className="text-slate-400 truncate max-w-[200px] sm:max-w-[300px]">
                  {currentRound.questionText}
                </span>
                {currentRound.status === 'LIVE' && currentRound.timerDuration > 0 && (
                  <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono font-bold border border-cyan-500/30">
                    ⏱️ {currentRound.remainingSeconds}s
                  </span>
                )}
              </div>
            ) : (
              <span className="text-xs text-slate-400">
                Ready for Round #{(roundHistory.length || 0) + 1}
              </span>
            )}
          </div>

          {/* Dynamic Workflow Actions Based on State */}
          <div className="flex items-center gap-2 flex-wrap justify-end">
            
            {/* When WAITING: Prompt to prepare & start */}
            {session.status === 'WAITING' && (
              <button
                onClick={() => setActiveTab('CONTROL')}
                className="arcade-btn arcade-btn-primary text-xs py-2 px-3.5 flex items-center gap-1.5 shadow-md"
              >
                <Play className="w-3.5 h-3.5" /> PREPARE & START ROUND
              </button>
            )}

            {/* When LIVE: Close Submissions */}
            {session.status === 'LIVE' && (
              <button
                onClick={() => onSetRoundState('CLOSED')}
                className="arcade-btn arcade-btn-red text-xs py-2 px-4 flex items-center gap-1.5 font-bold shadow-lg shadow-red-500/20"
              >
                <XCircle className="w-4 h-4" /> CLOSE SUBMISSIONS
              </button>
            )}

            {/* When CLOSED: Proceed to Review */}
            {session.status === 'CLOSED' && (
              <button
                onClick={() => onSetRoundState('REVIEW')}
                className="arcade-btn arcade-btn-purple text-xs py-2 px-4 flex items-center gap-1.5 font-bold shadow-lg shadow-purple-500/20"
              >
                <Zap className="w-4 h-4" /> REVIEW ANSWERS ({currentAnswers.length})
              </button>
            )}

            {/* When REVIEW: Reveal Results */}
            {session.status === 'REVIEW' && (
              <button
                onClick={() => onSetRoundState('RESULTS')}
                className="arcade-btn arcade-btn-green text-xs py-2 px-4 flex items-center gap-1.5 font-bold shadow-lg shadow-emerald-500/20"
              >
                <Award className="w-4 h-4" /> REVEAL WINNER & RESULTS
              </button>
            )}

            {/* When RESULTS: Next Round or End Session */}
            {session.status === 'RESULTS' && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (onAdvanceToNextRound) {
                      onAdvanceToNextRound();
                    } else {
                      onSetRoundState('WAITING');
                    }
                    setActiveTab('CONTROL');
                  }}
                  className="arcade-btn arcade-btn-primary text-xs py-2 px-4 flex items-center gap-1.5 font-bold shadow-lg shadow-amber-500/20"
                >
                  <ArrowRight className="w-4 h-4" /> NEXT ROUND (KEEP SCORES)
                </button>

                {onEndSession && !session.isEnded && (
                  <button
                    onClick={() => {
                      if (confirm('End this game session and finalize global tournament standings?')) {
                        onEndSession();
                      }
                    }}
                    className="arcade-btn arcade-btn-secondary text-xs py-2 px-3 flex items-center gap-1.5 text-slate-300 hover:text-red-400"
                    title="End Session"
                  >
                    <LogOut className="w-3.5 h-3.5" /> END SESSION
                  </button>
                )}
              </div>
            )}

          </div>

        </div>

      </div>

      {/* 3. NAVIGATION TABS */}
      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 border-b border-white/10 pb-2">
        
        <button
          onClick={() => setActiveTab('CONTROL')}
          className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-arcade font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'CONTROL' 
              ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' 
              : 'text-slate-400 hover:text-white bg-slate-900/50'
          }`}
        >
          <Radio className="w-3.5 h-3.5" /> ACTIVE ROUND & LIVE QUEUE
        </button>

        <button
          onClick={() => setActiveTab('SELECTOR')}
          className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-arcade font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'SELECTOR' 
              ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' 
              : 'text-slate-400 hover:text-white bg-slate-900/50'
          }`}
        >
          <Zap className="w-3.5 h-3.5" /> SWITCH GAME MODE
        </button>

        <button
          onClick={() => setActiveTab('LEADERBOARD')}
          className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-arcade font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'LEADERBOARD' 
              ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' 
              : 'text-slate-400 hover:text-white bg-slate-900/50'
          }`}
        >
          <Trophy className="w-3.5 h-3.5" /> LEADERBOARD STANDINGS
        </button>

        <button
          onClick={() => setActiveTab('HISTORY')}
          className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-arcade font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'HISTORY' 
              ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' 
              : 'text-slate-400 hover:text-white bg-slate-900/50'
          }`}
        >
          <History className="w-3.5 h-3.5" /> ROUND HISTORY ({roundHistory.length})
        </button>

      </div>

      {/* 4. TAB CONTENTS */}

      {/* TAB 1: ACTIVE ROUND CONTROL & ANSWER QUEUE */}
      {activeTab === 'CONTROL' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Question Entry Form (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            <AdminQuestionForm
              gameType={session.currentGame}
              onStartRound={onStartRound}
            />
          </div>

          {/* Right Column: Live Answer Queue (7 Cols) */}
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

      {/* TAB 2: GAME MODE SELECTOR */}
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

      {/* TAB 3: SESSION LEADERBOARD */}
      {activeTab === 'LEADERBOARD' && (
        <LeaderboardView
          players={session.players}
          isAdmin={true}
          onUpdateScore={onUpdatePlayerScore}
        />
      )}

      {/* TAB 4: ROUND HISTORY */}
      {activeTab === 'HISTORY' && (
        <div className="arcade-card arcade-card-gold p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h3 className="font-arcade text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <History className="w-4 h-4 text-amber-400" />
              <span>ROUND HISTORY SUMMARY</span>
            </h3>
            <span className="arcade-badge badge-gold">
              {roundHistory.length} ROUNDS COMPLETED
            </span>
          </div>

          {roundHistory.length === 0 ? (
            <div className="text-center py-10 text-slate-400">
              <p className="text-xs font-arcade">NO ROUNDS COMPLETED YET</p>
              <p className="text-[11px] text-slate-500 mt-1">Completed rounds will be recorded here for review.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {roundHistory.map((rd, idx) => {
                const rdAnswers = (answersObj[rd.id] || []);
                const winner = rdAnswers.find(a => a.isWinner);
                const correctCount = rdAnswers.filter(a => a.status === 'CORRECT').length;

                return (
                  <div key={rd.id || idx} className="p-3.5 rounded-xl bg-slate-900/80 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-arcade font-bold text-xs text-amber-400">ROUND #{rd.roundNumber}</span>
                        <span className="text-[10px] uppercase font-bold text-slate-400 bg-white/5 px-2 py-0.5 rounded">
                          {rd.gameType.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-white">
                        {rd.questionText}
                      </p>
                      <p className="text-[11px] text-emerald-400 font-mono">
                        Answer: {rd.correctAnswerText || 'Evaluated'}
                      </p>
                    </div>

                    <div className="text-left sm:text-right flex-shrink-0 text-xs">
                      {winner ? (
                        <div className="flex items-center gap-1 text-amber-300 font-bold bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/30">
                          <Trophy className="w-3 h-3 text-amber-400" />
                          <span>Winner: {winner.playerName}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px]">
                          {correctCount} correct {correctCount === 1 ? 'answer' : 'answers'}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 5. SESSION SWITCHER / CREATOR MODAL */}
      {isSessionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="arcade-card arcade-card-gold p-6 max-w-md w-full space-y-5 animate-in fade-in zoom-in-95 duration-150">
            
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-amber-400" />
                <h3 className="font-arcade text-lg font-bold text-white">
                  SESSION MANAGER
                </h3>
              </div>
              <button
                onClick={() => setIsSessionModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded"
              >
                ✕
              </button>
            </div>

            {/* Create New Session Option */}
            <div className="space-y-3 bg-slate-900/90 p-4 rounded-xl border border-amber-500/30">
              <label className="block text-xs font-bold uppercase text-amber-400">
                CREATE NEW 6-DIGIT GAME SESSION
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  maxLength={6}
                  value={newCodeInput}
                  onChange={(e) => setNewCodeInput(e.target.value.toUpperCase())}
                  placeholder="Auto 6-Digit (e.g. 4L27B1)"
                  className="arcade-input text-xs font-mono font-bold uppercase text-center flex-1"
                />
                <button
                  type="button"
                  onClick={handleCreateNewSession}
                  className="arcade-btn arcade-btn-primary text-xs py-2 px-3 flex items-center gap-1 flex-shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" /> CREATE
                </button>
              </div>
              <p className="text-[10px] text-slate-400">
                Leave empty to automatically generate a unique 6-character entrance code.
              </p>
            </div>

            {/* Switch to Existing Session List */}
            {knownSessions.length > 0 && (
              <div className="space-y-2">
                <label className="block text-[11px] font-bold uppercase text-slate-400">
                  OR SWITCH TO ACTIVE SESSION
                </label>
                <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin">
                  {knownSessions.map((code) => {
                    const isCurrent = code === session.code;
                    return (
                      <div
                        key={code}
                        onClick={() => !isCurrent && handleSwitchSession(code)}
                        className={`p-2.5 rounded-lg border text-xs font-mono font-bold flex items-center justify-between transition-colors ${
                          isCurrent
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 cursor-default'
                            : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-white/10 cursor-pointer'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span className="text-amber-400">#</span>
                          <span>{code}</span>
                        </span>
                        {isCurrent ? (
                          <span className="text-[9px] font-arcade text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded">
                            ACTIVE
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 hover:text-white">
                            SWITCH →
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setIsSessionModalOpen(false)}
                className="arcade-btn arcade-btn-secondary w-full py-2 text-xs"
              >
                CLOSE
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

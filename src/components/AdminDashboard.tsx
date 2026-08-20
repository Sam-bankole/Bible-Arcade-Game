import React, { useState, useEffect } from 'react';
import type { GameSession, GameType, GameRound, AnswerItem } from '../types/game';
import { GameSelector } from './GameSelector';
import { AdminQuestionForm } from './AdminQuestionForm';
import { AnswerQueue } from './AnswerQueue';
import { LeaderboardView } from './LeaderboardView';
import { 
  Lock, Unlock, Play, XCircle, Zap, Award, ArrowRight, 
  Copy, Check, Plus, Layers, Tv, RefreshCw, LogOut, Hash, Globe, X,
  Users, Timer, ChevronRight
} from 'lucide-react';
import { syncEngine, generate6DigitCode } from '../utils/syncEngine';
import { formatElapsedRoundTime } from '../utils/timestamp';

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
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'TACTICS' | 'LEADERBOARD' | 'HISTORY'>('DASHBOARD');
  const [authError, setAuthError] = useState<string>('');
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
      setAuthError('Invalid administrator password');
    }
  };

  const handleLockSession = () => {
    syncEngine.lockAdminSession();
    setIsAuthenticated(false);
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

  // ─── AUTH GATE ───────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center p-4">
        <div className="tactics-card p-6 sm:p-8 max-w-sm w-full space-y-4 border border-[#272d42]">
          <div className="flex items-center gap-3 pb-3 border-b border-[#1c2130]">
            <div className="w-9 h-9 rounded-full bg-[#171b26] border-2 border-[#ccff00] flex items-center justify-center text-[#ccff00] shadow-[0_0_12px_rgba(204,255,0,0.25)]">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-display text-sm font-black text-white uppercase tracking-wider">
                Host Control Room
              </h2>
              <p className="text-xs text-slate-400">Authentication Required</p>
            </div>
          </div>

          <form onSubmit={handlePasswordAuth} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1 uppercase tracking-wider">
                Admin Password
              </label>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  setAuthError('');
                }}
                placeholder="Enter password"
                className="tactics-input font-mono"
                autoFocus
                required
              />
            </div>

            {authError && (
              <div className="p-2 rounded bg-rose-950/40 border border-rose-800/50 text-rose-300 text-xs font-medium">
                {authError}
              </div>
            )}

            <button
              type="submit"
              className="tactics-btn tactics-btn-primary w-full py-2.5 text-xs font-black shadow-lg"
            >
              <Unlock className="w-3.5 h-3.5" /> UNLOCK STAGE CONSOLE
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ─── DATA RESOLUTION ─────────────────────────────────────────
  const currentRound = session?.currentRound || null;
  const answersObj = session?.answers || {};
  const currentAnswers: AnswerItem[] = (currentRound && answersObj[currentRound.id]) || [];
  const playersObj = session?.players || {};
  const playerCount = Object.keys(playersObj).length;
  const roundHistory = session?.roundHistory || [];
  const winnerAnswer = currentAnswers.find(a => a.isWinner);
  const fastestAnswer = currentAnswers.length > 0 ? currentAnswers[0] : null;

  return (
    <div className="py-4 space-y-4 max-w-full">
      
      {/* ═══════════════════════════════════════════════════════════
          1. SUB-NAVIGATION TABS BAR
          ═══════════════════════════════════════════════════════════ */}
      <div className="flex items-center justify-between gap-2 border-b border-[#1c2130] pb-2 flex-wrap">
        
        {/* Clean Text Navigation Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {[
            { id: 'DASHBOARD' as const, label: 'Dashboard & Live Queue' },
            { id: 'TACTICS' as const, label: 'Game Formats' },
            { id: 'LEADERBOARD' as const, label: 'Leaderboard & Scores' },
            { id: 'HISTORY' as const, label: `Round History (${roundHistory.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-[#171b26] text-[#ccff00] border border-[#ccff00]/40 shadow-[0_0_12px_rgba(204,255,0,0.15)] font-black'
                  : 'text-slate-400 hover:text-white hover:bg-[#11141d]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Quick Utilities */}
        <div className="flex items-center gap-2">
          {/* Join link */}
          <button
            onClick={handleCopyLink}
            className="tactics-btn tactics-btn-secondary text-xs py-1 px-2.5 rounded-lg flex items-center gap-1.5"
            title="Copy Direct Join Link"
          >
            <Globe className="w-3.5 h-3.5 text-[#ccff00]" />
            <span>{copiedLink ? 'Link Copied!' : 'Contestant Link'}</span>
          </button>

          {/* Session Switcher */}
          <button
            onClick={() => setIsSessionModalOpen(true)}
            className="tactics-btn tactics-btn-secondary text-xs py-1 px-2.5 rounded-lg flex items-center gap-1.5"
          >
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>Sessions ({knownSessions.length || 1})</span>
          </button>

          {/* Scoreboard visibility toggle */}
          <button
            onClick={() => onToggleLeaderboard(!session.showLeaderboardToPlayers)}
            className={`tactics-btn text-xs py-1 px-2.5 rounded-lg ${
              session.showLeaderboardToPlayers
                ? 'bg-[#171b26] text-white border border-[#38415e]'
                : 'tactics-btn-secondary text-slate-400'
            }`}
          >
            <span>Scoreboard: {session.showLeaderboardToPlayers ? 'ON' : 'OFF'}</span>
          </button>

          {/* Lock */}
          <button
            onClick={handleLockSession}
            className="w-7 h-7 rounded-lg bg-[#171b26] hover:bg-[#1e2332] border border-[#272d42] flex items-center justify-center text-slate-400 hover:text-white"
            title="Lock Console"
          >
            <Lock className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

      {/* ═══════════════════════════════════════════════════════════
          2. HERO SHOWCASE & 6 STAT CARDS ROW
          ═══════════════════════════════════════════════════════════ */}
      <div className="tactics-card p-4 sm:p-5 space-y-4 relative overflow-hidden">
        
        {/* Top Breadcrumb & Status Ribbon */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[#1c2130]">
          
          {/* Breadcrumb Tag */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="px-2 py-0.5 rounded bg-[#171b26] text-slate-400 font-bold">
              Letter Rush
            </span>
            <ChevronRight className="w-3 h-3 text-slate-600" />
            <span className="px-2 py-0.5 rounded bg-[#171b26] text-slate-400 font-bold">
              Tournament
            </span>
            <ChevronRight className="w-3 h-3 text-slate-600" />
            <span className="px-2.5 py-0.5 rounded bg-[#ccff00]/15 text-[#ccff00] font-black border border-[#ccff00]/30 font-mono">
              ROUND #{currentRound ? currentRound.roundNumber : (roundHistory.length || 0) + 1}
            </span>
          </div>

          {/* Round State Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            
            {session.status === 'WAITING' && (
              <button
                onClick={() => setActiveTab('DASHBOARD')}
                className="tactics-btn tactics-btn-primary py-1.5 px-4 text-xs font-black flex items-center gap-1.5 shadow-md"
              >
                <Play className="w-3.5 h-3.5 fill-black" />
                <span>START LIVE ROUND</span>
              </button>
            )}

            {session.status === 'LIVE' && (
              <button
                onClick={() => onSetRoundState('CLOSED')}
                className="tactics-btn bg-rose-600 hover:bg-rose-500 text-white py-1.5 px-3 text-xs font-black flex items-center gap-1.5"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>CLOSE SUBMISSIONS</span>
              </button>
            )}

            {session.status === 'CLOSED' && (
              <button
                onClick={() => onSetRoundState('REVIEW')}
                className="tactics-btn tactics-btn-primary py-1.5 px-4 text-xs font-black flex items-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>EVALUATE ANSWERS ({currentAnswers.length})</span>
              </button>
            )}

            {session.status === 'REVIEW' && (
              <button
                onClick={() => onSetRoundState('RESULTS')}
                className="tactics-btn tactics-btn-primary py-1.5 px-4 text-xs font-black flex items-center gap-1.5 shadow-md"
              >
                <Award className="w-3.5 h-3.5" />
                <span>REVEAL ROUND WINNER</span>
              </button>
            )}

            {session.status === 'RESULTS' && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (onAdvanceToNextRound) {
                      onAdvanceToNextRound();
                    } else {
                      onSetRoundState('WAITING');
                    }
                    setActiveTab('DASHBOARD');
                  }}
                  className="tactics-btn tactics-btn-primary py-1.5 px-4 text-xs font-black flex items-center gap-1.5 shadow-md"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span>NEXT ROUND</span>
                </button>

                {onEndSession && !session.isEnded && (
                  <button
                    onClick={() => {
                      if (confirm('End this tournament session and finalize standings?')) {
                        onEndSession();
                      }
                    }}
                    className="tactics-btn tactics-btn-secondary py-1.5 px-2.5 text-xs text-slate-400"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>End</span>
                  </button>
                )}
              </div>
            )}
          </div>

        </div>

        {/* Hero Round Header & Tags */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="tactics-pill-lime">
                ACTIVE COMPETITION
              </span>
              <span className="tactics-pill-violet">
                {session.currentGame.replace(/_/g, ' ')}
              </span>
            </div>

            <h1 className="font-display font-black text-xl sm:text-2xl text-white tracking-tight">
              {currentRound ? currentRound.questionText : 'Ready for New Round'}
            </h1>
            
            {/* Tag Pills */}
            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#171b26] text-slate-400 border border-[#272d42]">
                Target: {currentRound?.letter ? `Letter "${currentRound.letter}"` : 'Bible Trivia'}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#171b26] text-slate-400 border border-[#272d42]">
                Fastest Buzzer Order
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#171b26] text-slate-400 border border-[#272d42]">
                Sub-Millisecond Sync
              </span>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════
            3. ROW OF 6 STAT BOXES
            ═══════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-1">
          
          {/* Box 1: Round # */}
          <div className="tactics-stat-box">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ROUND</span>
              <span className="text-[10px] font-mono text-slate-500 font-bold">#</span>
            </div>
            <div className="font-mono-tabular font-black text-xl text-white leading-none">
              #{currentRound ? currentRound.roundNumber : 1}
            </div>
            <div className="text-[10px] font-semibold text-slate-500 uppercase mt-1">
              {session.currentGame.replace(/_/g, ' ')}
            </div>
          </div>

          {/* Box 2: Contestants */}
          <div className="tactics-stat-box">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">CONTESTANTS</span>
              <Users className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div className="font-mono-tabular font-black text-xl text-white leading-none">
              {playerCount}
            </div>
            <div className="text-[10px] font-semibold text-slate-500 uppercase mt-1">
              Connected
            </div>
          </div>

          {/* Box 3: LIVE STATUS / TIMER */}
          <div className={session.status === 'LIVE' ? 'tactics-stat-box-hero shadow-[0_0_20px_rgba(204,255,0,0.35)] animate-pulse' : 'tactics-stat-box'}>
            <div className="flex items-center justify-between mb-1">
              <span className={`text-[10px] font-bold uppercase tracking-wider ${session.status === 'LIVE' ? 'text-black' : 'text-slate-400'}`}>
                STATUS
              </span>
              <Timer className={`w-3.5 h-3.5 ${session.status === 'LIVE' ? 'text-black' : 'text-[#ccff00]'}`} />
            </div>
            <div className={`font-mono-tabular font-black text-xl leading-none ${session.status === 'LIVE' ? 'text-black' : 'text-white'}`}>
              {session.status === 'LIVE' 
                ? (currentRound && currentRound.timerDuration > 0 ? `${currentRound.remainingSeconds}s LIVE` : 'LIVE') 
                : session.status}
            </div>
            <div className={`text-[10px] font-bold uppercase mt-1 ${session.status === 'LIVE' ? 'text-black/80' : 'text-slate-500'}`}>
              {session.status === 'LIVE' ? 'Accepting Answers' : 'Round Status'}
            </div>
          </div>

          {/* Box 4: Submissions */}
          <div className="tactics-stat-box">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">SUBMISSIONS</span>
              <span className="text-[10px] font-mono text-violet-400 font-bold">QTY</span>
            </div>
            <div className="font-mono-tabular font-black text-xl text-white leading-none">
              {currentAnswers.length}
            </div>
            <div className="text-[10px] font-semibold text-slate-500 uppercase mt-1">
              Arrivals
            </div>
          </div>

          {/* Box 5: Fastest Buzzer Speed */}
          <div className="tactics-stat-box">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">FASTEST</span>
              <span className="text-[9px] font-mono text-[#ccff00] font-bold">SEC</span>
            </div>
            <div className="font-mono-tabular font-black text-lg text-[#ccff00] leading-none">
              {fastestAnswer ? formatElapsedRoundTime(fastestAnswer.rawSystemMs, currentRound?.startTime) : '--'}
            </div>
            <div className="text-[10px] font-semibold text-slate-500 uppercase mt-1 truncate">
              {fastestAnswer ? fastestAnswer.playerName : 'No entries'}
            </div>
          </div>

          {/* Box 6: Round Winner */}
          <div className="tactics-stat-box">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">WINNER</span>
              <span className="text-[9px] font-mono text-[#ccff00] font-bold">TOP</span>
            </div>
            <div className="font-mono-tabular font-black text-base text-white leading-none truncate">
              {winnerAnswer ? winnerAnswer.playerName : '--'}
            </div>
            <div className="text-[10px] font-semibold text-slate-500 uppercase mt-1">
              {winnerAnswer ? '+1 Point Awarded' : 'Awaiting Award'}
            </div>
          </div>

        </div>

      </div>

      {/* ═══════════════════════════════════════════════════════════
          4. TAB CONTENT PANELS
          ═══════════════════════════════════════════════════════════ */}

      {/* TAB 1: DASHBOARD & LIVE QUEUE */}
      {activeTab === 'DASHBOARD' && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
          
          {/* Left: Question Setup Form (5 Cols) */}
          <div className="xl:col-span-5">
            <AdminQuestionForm
              gameType={session.currentGame}
              onStartRound={onStartRound}
            />
          </div>

          {/* Right: Scoreboard Answer Queue Strip (7 Cols) */}
          <div className="xl:col-span-7">
            <AnswerQueue
              currentRound={currentRound}
              answers={currentAnswers}
              onUpdateTimestamp={onUpdateOfficialTimestamp}
              onEvaluateAnswer={onEvaluateAnswer}
            />
          </div>

        </div>
      )}

      {/* TAB 2: GAME FORMATS */}
      {activeTab === 'TACTICS' && (
        <GameSelector
          selectedGame={session.currentGame}
          onSelectGame={(g) => {
            onUpdateGameType(g);
            setActiveTab('DASHBOARD');
          }}
          onLaunchGame={() => setActiveTab('DASHBOARD')}
          isAdmin={true}
        />
      )}

      {/* TAB 3: LEADERBOARD & SCORES */}
      {activeTab === 'LEADERBOARD' && (
        <LeaderboardView
          players={session.players}
          isAdmin={true}
          onUpdateScore={onUpdatePlayerScore}
        />
      )}

      {/* TAB 4: ROUND HISTORY */}
      {activeTab === 'HISTORY' && (
        <div className="tactics-card p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#1c2130]">
            <div>
              <h3 className="font-display text-sm font-black uppercase tracking-wider text-white">
                Completed Tournament Rounds
              </h3>
              <p className="text-xs text-slate-400">Historical performance and winner logs</p>
            </div>
            <span className="font-mono-tabular text-xs font-black px-2.5 py-1 rounded bg-[#171b26] text-[#ccff00] border border-[#272d42]">
              {roundHistory.length} {roundHistory.length === 1 ? 'Round' : 'Rounds'}
            </span>
          </div>

          {roundHistory.length === 0 ? (
            <div className="text-center py-12 text-slate-500 bg-[#0c0e15] rounded-xl border border-dashed border-[#1c2130]">
              <p className="text-sm font-bold text-slate-300">No rounds recorded yet</p>
              <p className="text-xs text-slate-500 mt-1">Completed round results and buzzer rankings will be archived here.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {roundHistory.map((rd, idx) => {
                const rdAnswers = (answersObj[rd.id] || []);
                const winner = rdAnswers.find(a => a.isWinner);
                const correctCount = rdAnswers.filter(a => a.status === 'CORRECT').length;

                return (
                  <div 
                    key={rd.id || idx}
                    className="p-3.5 rounded-xl bg-[#171b26] border border-[#272d42] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono-tabular font-black text-xs text-[#ccff00]">
                          ROUND #{rd.roundNumber}
                        </span>
                        <span className="text-[10px] uppercase font-bold text-slate-400 px-2 py-0.5 rounded bg-[#0c0e15] border border-[#1c2130]">
                          {rd.gameType.replace(/_/g, ' ')}
                        </span>
                        <span className="font-mono-tabular text-xs text-slate-400">
                          {rdAnswers.length} submissions
                        </span>
                      </div>
                      <p className="text-sm font-bold text-white">
                        {rd.questionText}
                      </p>
                      <p className="text-xs text-slate-400 font-mono">
                        Correct Answer: {rd.correctAnswerText || 'Evaluated'}
                      </p>
                    </div>

                    <div className="shrink-0 text-xs">
                      {winner ? (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#ccff00]/15 border border-[#ccff00]/40 text-[#ccff00] font-black">
                          <Award className="w-4 h-4 text-[#ccff00]" />
                          <span>Winner: {winner.playerName}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs font-semibold px-2 py-1 rounded bg-[#0c0e15]">
                          {correctCount} correct
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

      {/* ═══════════════════════════════════════════════════════════
          5. SESSION MANAGER MODAL
          ═══════════════════════════════════════════════════════════ */}
      {isSessionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="tactics-card p-5 max-w-sm w-full space-y-4 border border-[#272d42] shadow-2xl">
            
            <div className="flex items-center justify-between pb-3 border-b border-[#1c2130]">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#ccff00]" />
                <h3 className="font-display text-sm font-black uppercase tracking-wider text-white">
                  Tournament Sessions
                </h3>
              </div>
              <button
                onClick={() => setIsSessionModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Create New Session */}
            <div className="space-y-2 bg-[#0c0e15] p-3 rounded-xl border border-[#1c2130]">
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
                Create Room (6-Digit Code)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  maxLength={6}
                  value={newCodeInput}
                  onChange={(e) => setNewCodeInput(e.target.value.toUpperCase())}
                  placeholder="Auto (e.g. 4L27B1)"
                  className="tactics-input text-xs font-mono font-black uppercase text-center flex-1"
                />
                <button
                  type="button"
                  onClick={handleCreateNewSession}
                  className="tactics-btn tactics-btn-primary text-xs py-1.5 px-3 shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" /> CREATE
                </button>
              </div>
              <p className="text-[10px] text-slate-500">
                Leave blank to generate an automatic random code.
              </p>
            </div>

            {/* Switch to Active Sessions */}
            {knownSessions.length > 0 && (
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Active Rooms
                </label>
                <div className="max-h-40 overflow-y-auto space-y-1 pr-1">
                  {knownSessions.map((code) => {
                    const isCurrent = code === session.code;
                    return (
                      <div
                        key={code}
                        onClick={() => !isCurrent && handleSwitchSession(code)}
                        className={`p-2.5 rounded-lg text-xs font-mono font-black flex items-center justify-between transition-colors ${
                          isCurrent
                            ? 'bg-[#171b26] text-[#ccff00] border border-[#ccff00]/40'
                            : 'bg-[#0c0e15] hover:bg-[#171b26] text-slate-300 border border-[#1c2130] cursor-pointer'
                        }`}
                      >
                        <span className="flex items-center gap-1.5">
                          <Hash className="w-3.5 h-3.5 opacity-50" />
                          <span>{code}</span>
                        </span>
                        {isCurrent ? (
                          <span className="text-[9px] uppercase px-2 py-0.5 rounded bg-[#ccff00] text-black font-black">
                            Current
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 hover:text-[#ccff00]">
                            Switch →
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="pt-1">
              <button
                type="button"
                onClick={() => setIsSessionModalOpen(false)}
                className="tactics-btn tactics-btn-secondary w-full text-xs py-2 font-bold"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

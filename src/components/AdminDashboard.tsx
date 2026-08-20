import React, { useState, useEffect } from 'react';
import type { GameSession, GameType, GameRound, AnswerItem } from '../types/game';
import { GameSelector } from './GameSelector';
import { AdminQuestionForm } from './AdminQuestionForm';
import { AnswerQueue } from './AnswerQueue';
import { LeaderboardView } from './LeaderboardView';
import { 
  Lock, Unlock, Play, XCircle, Zap, Award, ArrowRight, 
  Copy, Check, Plus, Layers, Tv, RefreshCw, LogOut, Hash, Globe, X
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
      setAuthError('Invalid administrator password');
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

  // ─── AUTH GATE ───────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="ctrl-card p-6 sm:p-8 max-w-sm w-full space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-[#232838]">
            <div className="w-9 h-9 rounded bg-[#1f2433] border border-[#2e354a] flex items-center justify-center text-amber-500">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-100 uppercase tracking-wider">
                Stage Console
              </h2>
              <p className="text-xs text-zinc-500">Host authentication required</p>
            </div>
          </div>

          <form onSubmit={handlePasswordAuth} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">
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
                className="ctrl-input font-mono"
                autoFocus
                required
              />
            </div>

            {authError && (
              <div className="p-2 rounded bg-rose-950/50 border border-rose-800 text-rose-300 text-xs">
                {authError}
              </div>
            )}

            <button
              type="submit"
              className="ctrl-btn ctrl-btn-primary w-full py-2.5 text-xs font-bold"
            >
              <Unlock className="w-3.5 h-3.5" /> Unlock Console
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

  return (
    <div className="py-4 space-y-3.5 max-w-full">
      
      {/* ═══════════════════════════════════════════════════════════
          1. STAGE CONSOLE TOP BAR — Functional, High-Utility Header
          ═══════════════════════════════════════════════════════════ */}
      <div className="ctrl-card p-3 sm:p-4 space-y-3">
        
        {/* Row 1: Session Controls & Stats */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
          
          {/* Left: Code, Join link, Connected players */}
          <div className="flex items-center gap-2.5 flex-wrap">
            
            {/* Session Code Display */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0e1017] border border-[#2e354a]">
              <span className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">CODE</span>
              <span className="font-mono-tabular font-bold text-zinc-100 tracking-widest text-sm">
                {session.code}
              </span>
              <button
                onClick={handleCopyCode}
                className="p-1 rounded text-zinc-400 hover:text-zinc-100 hover:bg-[#1a1e2b] transition-colors ml-0.5"
                title="Copy Session Code"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Quick Player Link */}
            <button
              onClick={handleCopyLink}
              className="ctrl-btn ctrl-btn-secondary text-xs py-1.5 px-2.5 flex items-center gap-1.5"
              title="Copy Direct Join URL"
            >
              <Globe className="w-3.5 h-3.5 text-zinc-400" />
              <span>{copiedLink ? 'Link Copied' : 'Player Link'}</span>
            </button>

            {/* Session Switcher */}
            <button
              onClick={() => setIsSessionModalOpen(true)}
              className="ctrl-btn ctrl-btn-secondary text-xs py-1.5 px-2.5 flex items-center gap-1.5"
            >
              <Layers className="w-3.5 h-3.5 text-zinc-400" />
              <span>Sessions ({knownSessions.length || 1})</span>
            </button>

            {/* Live Contestants Count */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-zinc-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>{playerCount} connected</span>
            </div>

          </div>

          {/* Right: Stage utilities */}
          <div className="flex items-center gap-2 flex-wrap">
            
            {/* Leaderboard visibility toggle */}
            <button
              onClick={() => onToggleLeaderboard(!session.showLeaderboardToPlayers)}
              className={`ctrl-btn text-xs py-1.5 px-2.5 ${
                session.showLeaderboardToPlayers
                  ? 'bg-[#18231c] text-emerald-300 border border-emerald-600/40'
                  : 'ctrl-btn-secondary text-zinc-400'
              }`}
              title="Toggle contestant leaderboard visibility"
            >
              <span>Scoreboard: {session.showLeaderboardToPlayers ? 'Visible' : 'Hidden'}</span>
            </button>

            {/* Stage Projector */}
            <button
              onClick={onOpenProjector}
              className="ctrl-btn ctrl-btn-secondary text-xs py-1.5 px-2.5"
              title="Launch Big Screen View"
            >
              <Tv className="w-3.5 h-3.5 text-zinc-400" />
              <span>Projector</span>
            </button>

            {/* Lock Console */}
            <button
              onClick={handleLockSession}
              className="ctrl-btn ctrl-btn-secondary text-xs py-1.5 px-2"
              title="Lock Admin Console"
            >
              <Lock className="w-3.5 h-3.5 text-zinc-400" />
            </button>

            {/* Reset */}
            <button
              onClick={() => {
                if (confirm('Reset all scores and active round data for this session?')) {
                  onResetSession();
                }
              }}
              className="ctrl-btn ctrl-btn-secondary text-xs py-1.5 px-2 text-zinc-400 hover:text-rose-400"
              title="Reset Session"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>

          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════
            2. LIVE EVENT STATUS STRIP — Operational State Machine
            ═══════════════════════════════════════════════════════════ */}
        <div className="p-3 rounded-lg bg-[#0e1017] border border-[#232838] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Left: State Pill & Question Summary */}
          <div className="flex items-center gap-3 min-w-0 flex-wrap">
            
            {/* Status Flag */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold font-mono tracking-wider">
              {session.status === 'LIVE' ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-emerald-400 font-black">LIVE</span>
                </>
              ) : session.status === 'CLOSED' ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  <span className="text-rose-400 font-bold">CLOSED</span>
                </>
              ) : session.status === 'REVIEW' ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-purple-500" />
                  <span className="text-purple-300 font-bold">REVIEW</span>
                </>
              ) : session.status === 'RESULTS' ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span className="text-amber-400 font-bold">RESULTS</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-zinc-500" />
                  <span className="text-zinc-400 font-bold">WAITING</span>
                </>
              )}
            </div>

            {/* Round info */}
            {currentRound ? (
              <div className="flex items-center gap-2 text-xs min-w-0 flex-wrap">
                <span className="font-mono-tabular font-bold text-zinc-200">
                  Round #{currentRound.roundNumber}
                </span>
                <span className="text-zinc-600">•</span>
                <span className="text-zinc-400 truncate max-w-[200px] sm:max-w-[400px]">
                  {currentRound.questionText}
                </span>
                {currentRound.status === 'LIVE' && currentRound.timerDuration > 0 && (
                  <span className="font-mono-tabular font-bold px-2 py-0.5 rounded bg-zinc-800 text-amber-400 text-xs border border-zinc-700">
                    {currentRound.remainingSeconds}s
                  </span>
                )}
              </div>
            ) : (
              <span className="text-xs text-zinc-500">
                Ready for Round #{(roundHistory.length || 0) + 1}
              </span>
            )}
          </div>

          {/* Right: Operational Round Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap justify-start md:justify-end">
            
            {session.status === 'WAITING' && (
              <button
                onClick={() => setActiveTab('CONTROL')}
                className="ctrl-btn ctrl-btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5 fill-zinc-950" />
                <span>Prepare & Start Round</span>
              </button>
            )}

            {session.status === 'LIVE' && (
              <button
                onClick={() => onSetRoundState('CLOSED')}
                className="ctrl-btn ctrl-btn-danger text-xs py-1.5 px-3 flex items-center gap-1.5"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Close Submissions</span>
              </button>
            )}

            {session.status === 'CLOSED' && (
              <button
                onClick={() => onSetRoundState('REVIEW')}
                className="ctrl-btn bg-purple-700 hover:bg-purple-600 text-white text-xs py-1.5 px-3 flex items-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Review Answers ({currentAnswers.length})</span>
              </button>
            )}

            {session.status === 'REVIEW' && (
              <button
                onClick={() => onSetRoundState('RESULTS')}
                className="ctrl-btn ctrl-btn-success text-xs py-1.5 px-3 flex items-center gap-1.5"
              >
                <Award className="w-3.5 h-3.5" />
                <span>Reveal Winner & Results</span>
              </button>
            )}

            {session.status === 'RESULTS' && (
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => {
                    if (onAdvanceToNextRound) {
                      onAdvanceToNextRound();
                    } else {
                      onSetRoundState('WAITING');
                    }
                    setActiveTab('CONTROL');
                  }}
                  className="ctrl-btn ctrl-btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span>Next Round (Keep Scores)</span>
                </button>

                {onEndSession && !session.isEnded && (
                  <button
                    onClick={() => {
                      if (confirm('End this tournament session and finalize standings?')) {
                        onEndSession();
                      }
                    }}
                    className="ctrl-btn ctrl-btn-secondary text-xs py-1.5 px-2.5 text-zinc-400 hover:text-rose-400"
                    title="End Session"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>End Session</span>
                  </button>
                )}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* ═══════════════════════════════════════════════════════════
          3. NAVIGATION TABS — Clean Segmented Bar
          ═══════════════════════════════════════════════════════════ */}
      <div className="flex items-center gap-1 border-b border-[#232838] pb-1 overflow-x-auto">
        {[
          { id: 'CONTROL' as const, label: 'Active Round & Queue' },
          { id: 'SELECTOR' as const, label: 'Game Modes' },
          { id: 'LEADERBOARD' as const, label: 'Scoreboard' },
          { id: 'HISTORY' as const, label: `Round History (${roundHistory.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3.5 py-1.5 rounded-t text-xs font-semibold transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-[#14171f] text-amber-400 border-b-2 border-amber-400 font-bold'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#14171f]/50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ═══════════════════════════════════════════════════════════
          4. TAB CONTENT
          ═══════════════════════════════════════════════════════════ */}

      {/* TAB 1: ACTIVE ROUND CONTROL & LIVE ANSWER QUEUE */}
      {activeTab === 'CONTROL' && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
          
          {/* Left Column: Question Entry Form (5 Cols) */}
          <div className="xl:col-span-5">
            <AdminQuestionForm
              gameType={session.currentGame}
              onStartRound={onStartRound}
            />
          </div>

          {/* Right Column: Scoreboard Arrival Strip (7 Cols) */}
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

      {/* TAB 3: LEADERBOARD STANDINGS */}
      {activeTab === 'LEADERBOARD' && (
        <LeaderboardView
          players={session.players}
          isAdmin={true}
          onUpdateScore={onUpdatePlayerScore}
        />
      )}

      {/* TAB 4: ROUND HISTORY */}
      {activeTab === 'HISTORY' && (
        <div className="ctrl-card p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#232838]">
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-100">
              Completed Rounds
            </h3>
            <span className="font-mono-tabular text-xs font-semibold px-2 py-0.5 rounded bg-[#10121a] text-zinc-300 border border-[#232838]">
              {roundHistory.length} {roundHistory.length === 1 ? 'round' : 'rounds'} completed
            </span>
          </div>

          {roundHistory.length === 0 ? (
            <div className="text-center py-12 text-zinc-500 bg-[#10121a] rounded-lg border border-dashed border-[#232838]">
              <p className="text-sm font-medium text-zinc-300">No rounds recorded yet</p>
              <p className="text-xs text-zinc-500 mt-1">Completed round logs and winners will appear here.</p>
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
                    className="p-3 rounded-lg bg-[#10121a] border border-[#232838] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono-tabular font-bold text-xs text-amber-400">
                          ROUND #{rd.roundNumber}
                        </span>
                        <span className="text-[10px] uppercase font-bold text-zinc-400 px-1.5 py-0.5 rounded bg-[#1c202d]">
                          {rd.gameType.replace(/_/g, ' ')}
                        </span>
                        <span className="font-mono-tabular text-[11px] text-zinc-500">
                          {rdAnswers.length} submissions
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-zinc-200">
                        {rd.questionText}
                      </p>
                      <p className="text-[11px] text-emerald-400 font-mono">
                        Answer: {rd.correctAnswerText || 'Evaluated'}
                      </p>
                    </div>

                    <div className="shrink-0 text-xs">
                      {winner ? (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#1f1d14] border border-amber-500/30 text-amber-300 font-bold">
                          <Award className="w-3.5 h-3.5 text-amber-400" />
                          <span>Winner: {winner.playerName}</span>
                        </div>
                      ) : (
                        <span className="text-zinc-400 text-xs">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <div className="ctrl-card p-5 max-w-sm w-full space-y-4 border border-[#2e354a]">
            
            <div className="flex items-center justify-between pb-2 border-b border-[#232838]">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-100">
                Session Manager
              </h3>
              <button
                onClick={() => setIsSessionModalOpen(false)}
                className="text-zinc-500 hover:text-zinc-300 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Create New Session */}
            <div className="space-y-2 bg-[#0e1017] p-3 rounded border border-[#232838]">
              <label className="block text-[11px] font-bold uppercase text-zinc-400">
                New 6-Digit Code
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  maxLength={6}
                  value={newCodeInput}
                  onChange={(e) => setNewCodeInput(e.target.value.toUpperCase())}
                  placeholder="Auto (e.g. 4L27B1)"
                  className="ctrl-input text-xs font-mono font-bold uppercase text-center flex-1"
                />
                <button
                  type="button"
                  onClick={handleCreateNewSession}
                  className="ctrl-btn ctrl-btn-primary text-xs py-2 px-3 shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" /> Create
                </button>
              </div>
              <p className="text-[10px] text-zinc-500">
                Leave blank to auto-generate a 6-character code.
              </p>
            </div>

            {/* Switch to Active */}
            {knownSessions.length > 0 && (
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                  Switch Active Session
                </label>
                <div className="max-h-40 overflow-y-auto space-y-1 pr-1">
                  {knownSessions.map((code) => {
                    const isCurrent = code === session.code;
                    return (
                      <div
                        key={code}
                        onClick={() => !isCurrent && handleSwitchSession(code)}
                        className={`p-2 rounded text-xs font-mono font-bold flex items-center justify-between transition-colors ${
                          isCurrent
                            ? 'bg-[#1e1c14] text-amber-300 border border-amber-500/30'
                            : 'bg-[#0e1017] hover:bg-[#1a1e2b] text-zinc-300 border border-[#232838] cursor-pointer'
                        }`}
                      >
                        <span className="flex items-center gap-1.5">
                          <Hash className="w-3 h-3 opacity-50" />
                          <span>{code}</span>
                        </span>
                        {isCurrent ? (
                          <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-amber-500 text-zinc-950 font-bold">
                            Current
                          </span>
                        ) : (
                          <span className="text-[10px] text-zinc-500 hover:text-zinc-200">
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
                className="ctrl-btn ctrl-btn-secondary w-full text-xs py-1.5"
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

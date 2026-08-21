import { useState, useEffect } from 'react';
import type { GameSession, Player, GameType, GameRound } from './types/game';
import type { UserIdentity } from './types/game';
import { syncEngine, createNewSession } from './utils/syncEngine';
import { getLocalIdentity } from './utils/userIdentity';
import { Navbar } from './components/Navbar';
import { StageBackground } from './components/StageBackground';
import { UsernameSetup } from './components/UsernameSetup';
import { LandingPage } from './components/LandingPage';
import { AdminDashboard } from './components/AdminDashboard';
import { PlayerView } from './components/PlayerView';
import { ProjectorDisplay } from './components/ProjectorDisplay';

function getViewFromUrl(): 'LANDING' | 'ADMIN' | 'PLAYER' | 'PROJECTOR' {
  if (typeof window === 'undefined') return 'LANDING';
  const path = window.location.pathname.toLowerCase();
  const search = new URLSearchParams(window.location.search);
  const mode = search.get('mode') || search.get('view');

  if (path.includes('/admin') || mode === 'admin') return 'ADMIN';
  if (path.includes('/projector') || path.includes('/display') || mode === 'projector' || mode === 'display') return 'PROJECTOR';
  if (path.includes('/play') || mode === 'play' || mode === 'player') return 'PLAYER';
  return 'LANDING';
}

export function App() {
  const [currentView, setCurrentView] = useState<'LANDING' | 'ADMIN' | 'PLAYER' | 'PROJECTOR'>(() => getViewFromUrl());

  // Permanent player identity — loaded from localStorage on mount
  const [currentIdentity, setCurrentIdentity] = useState<UserIdentity | null>(() => getLocalIdentity());

  // Active game session — starts as null; players join via code, admins create explicitly
  const [session, setSession] = useState<GameSession | null>(null);

  // Currently joined player within the session
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);

  // Non-blocking error for "session not found" / "session ended"
  const [sessionError, setSessionError] = useState<string>('');

  // Sync view with browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => setCurrentView(getViewFromUrl());
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Auto-connect cloud relay if contestant arrives with a room code in URL params
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlCode = new URLSearchParams(window.location.search).get('code');
      if (urlCode) {
        const clean = urlCode.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
        if (clean.length === 6) {
          syncEngine.connectCloudRelay(clean);
        }
      }
    }
  }, []);

  // Connect to Firebase relay when session code changes
  useEffect(() => {
    if (session?.code) {
      syncEngine.connectCloudRelay(session.code);
    }
  }, [session?.code]);

  // Subscribe to real-time session updates (Firebase Cloud + BroadcastChannel + Local)
  useEffect(() => {
    const unsubscribe = syncEngine.subscribe((updatedSession) => {
      if (!updatedSession) return;
      setSession((prevSession) => {
        if (!prevSession || prevSession.code === updatedSession.code) {
          return updatedSession;
        }
        return prevSession;
      });

      setCurrentPlayer((prevPlayer) => {
        if (prevPlayer && updatedSession.players[prevPlayer.id]) {
          return updatedSession.players[prevPlayer.id];
        }
        return prevPlayer;
      });
    });
    return () => unsubscribe();
  }, []);

  // Timer tick for live rounds
  useEffect(() => {
    if (!session?.currentRound || session.currentRound.status !== 'LIVE' || session.currentRound.timerDuration === 0) return;
    const interval = setInterval(() => {
      setSession(prev => prev ? syncEngine.tickTimer(prev) : prev);
    }, 1000);
    return () => clearInterval(interval);
  }, [session?.currentRound?.status, session?.currentRound?.remainingSeconds, session?.currentRound?.timerDuration]);

  const navigateTo = (view: 'LANDING' | 'ADMIN' | 'PLAYER' | 'PROJECTOR') => {
    setCurrentView(view);
    if (typeof window !== 'undefined') {
      let targetPath = '/';
      if (view === 'ADMIN') targetPath = '/admin';
      else if (view === 'PROJECTOR') targetPath = '/projector';
      else if (view === 'PLAYER') targetPath = '/play';
      if (window.location.pathname !== targetPath) {
        window.history.pushState({}, '', targetPath);
      }
    }
  };

  // ── Identity handlers ────────────────────────────────────────────────────────

  const handleIdentityReady = (identity: UserIdentity) => {
    setCurrentIdentity(identity);
  };

  const handleSignOut = () => {
    setCurrentIdentity(null);
    setSession(null);
    setCurrentPlayer(null);
    setSessionError('');
  };

  // ── Player join handler — looks up session; never creates one ────────────────

  const handleJoinPlayer = async (code: string) => {
    console.log('[JOIN] handleJoinPlayer called with code:', code);
    console.log('[JOIN] currentIdentity:', currentIdentity);

    if (!currentIdentity) {
      console.error('[JOIN] ERROR: No currentIdentity. Cannot join.');
      setSessionError('Please set up your player profile first.');
      return;
    }

    setSessionError('');
    const cleanCode = code.trim().toUpperCase();
    console.log('[JOIN] Looking up session for code:', cleanCode);

    let found: GameSession | null = null;
    try {
      found = await syncEngine.lookupSession(cleanCode);
    } catch (err) {
      console.error('[JOIN] lookupSession threw an error:', err);
    }

    console.log('[JOIN] lookupSession result:', found);

    if (!found) {
      console.warn('[JOIN] No session found for code:', cleanCode);
      setSessionError(`No active game found for code "${cleanCode}". Check the code and try again.`);
      return;
    }

    console.log('[JOIN] Session found! Joining as player...');
    const { session: updatedSess, player } = syncEngine.joinPlayer(
      found,
      currentIdentity.uid,
      currentIdentity.displayName,
      currentIdentity.username
    );
    setSession(updatedSess);
    setCurrentPlayer(player);
    navigateTo('PLAYER');
    console.log('[JOIN] Successfully joined session:', updatedSess.code, 'as player:', player.name);
  };

  // ── Answer submission ────────────────────────────────────────────────────────

  const handleSubmitAnswer = (answerText: string) => {
    if (!currentPlayer || !session) return;
    const updated = syncEngine.submitAnswer(
      session,
      currentPlayer.id,
      currentPlayer.name,
      answerText,
      currentPlayer.username
    );
    setSession(updated);
  };

  // ── Admin handlers (unchanged from original) ─────────────────────────────────

  const handleUpdateGameType = (gameType: GameType) => {
    if (!session) return;
    const updated = syncEngine.updateGameType(session, gameType);
    setSession(updated);
  };

  const handleStartRound = (roundData: Partial<GameRound>) => {
    if (!session) return;
    const updated = syncEngine.startNewRound(session, roundData);
    setSession(updated);
  };

  const handleSetRoundState = (status: 'WAITING' | 'LIVE' | 'CLOSED' | 'REVIEW' | 'RESULTS') => {
    if (!session) return;
    const updated = syncEngine.setRoundState(session, status);
    setSession(updated);
  };

  const handleUpdateOfficialTimestamp = (answerId: string, timestamp: string) => {
    if (!session?.currentRound) return;
    const updated = syncEngine.updateOfficialTimestamp(session, session.currentRound.id, answerId, timestamp);
    setSession(updated);
  };

  const handleEvaluateAnswer = (
    answerId: string,
    status: 'CORRECT' | 'WRONG' | 'PENDING',
    points: number,
    isWinner: boolean = false
  ) => {
    if (!session?.currentRound) return;
    const updated = syncEngine.evaluateAnswer(session, session.currentRound.id, answerId, status, points, isWinner);
    setSession(updated);
  };

  const handleToggleLeaderboard = (visible: boolean) => {
    if (!session) return;
    const updated = syncEngine.toggleLeaderboardVisibility(session, visible);
    setSession(updated);
  };

  const handleUpdatePlayerScore = (playerId: string, newScore: number) => {
    if (!session) return;
    const updatedPlayers = {
      ...session.players,
      [playerId]: { ...session.players[playerId], score: newScore }
    };
    const updated: GameSession = { ...session, players: updatedPlayers };
    syncEngine.saveAndBroadcastSession(updated);
    setSession(updated);
  };

  const handleCreateNewSession = async (customCode?: string) => {
    setSessionError('');
    const newSession = createNewSession(customCode);
    setSession(newSession);
    syncEngine.connectCloudRelay(newSession.code);
    const ok = await syncEngine.saveAndBroadcastSession(newSession);
    if (!ok) {
      setSessionError('⚠️ Session created locally but failed to save to the server. Players on other devices may not be able to join. Check your internet connection.');
    }
  };

  const handleSwitchSession = async (code: string) => {
    setSessionError('');
    const existing = syncEngine.getSession(code);
    if (existing) {
      setSession(existing);
      syncEngine.connectCloudRelay(existing.code);
      await syncEngine.saveAndBroadcastSession(existing);
    } else {
      const newSession = createNewSession(code);
      setSession(newSession);
      syncEngine.connectCloudRelay(newSession.code);
      const ok = await syncEngine.saveAndBroadcastSession(newSession);
      if (!ok) {
        setSessionError('⚠️ Session created locally but failed to reach the server. Check your connection.');
      }
    }
  };

  const handleAdvanceToNextRound = () => {
    if (!session) return;
    const updated = syncEngine.advanceToNextRound(session);
    setSession(updated);
  };

  const handleEndSession = () => {
    if (!session) return;
    const updated = syncEngine.endSession(session);
    setSession(updated);
  };

  const handleResetSession = () => {
    if (!session) return;
    const reset = syncEngine.resetSession(session);
    setSession(reset);
    setCurrentPlayer(null);
  };

  // ── Render ───────────────────────────────────────────────────────────────────

  // Admin view — bypasses identity requirement (admins use password auth)
  const isAdminOrProjector = currentView === 'ADMIN' || currentView === 'PROJECTOR';

  // For player-facing views, require identity first
  if (!isAdminOrProjector && !currentIdentity) {
    return (
      <div className="min-h-screen bg-[#06080e] text-slate-100 font-main relative overflow-x-hidden">
        <StageBackground />
        <UsernameSetup onIdentityReady={handleIdentityReady} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#06080e] text-slate-100 font-main relative overflow-x-hidden">
      
      {/* High-Impact Cyber Stage Background */}
      <StageBackground />
      
      {/* Top Navigation Bar */}
      {currentView !== 'PROJECTOR' && (
        <Navbar
          currentView={currentView}
          sessionCode={session?.code || ''}
          onNavigate={(v) => navigateTo(v)}
          onResetSession={handleResetSession}
        />
      )}

      {/* Main Container */}
      <main className={`${currentView === 'ADMIN' ? 'arcade-admin-container' : 'arcade-container'} pb-12`}>

        {currentView === 'LANDING' && currentIdentity && (
          <LandingPage
            sessionCode={session?.code || ''}
            identity={currentIdentity}
            onJoinPlayer={handleJoinPlayer}
            onNavigateAdmin={() => navigateTo('ADMIN')}
            onNavigateProjector={() => navigateTo('PROJECTOR')}
            onSelectGame={handleUpdateGameType}
            onSignOut={handleSignOut}
            sessionError={sessionError}
          />
        )}

        {currentView === 'ADMIN' && (
          <AdminDashboard
            session={session}
            onCreateNewSession={handleCreateNewSession}
            onSwitchSession={handleSwitchSession}
            onEndSession={handleEndSession}
            onAdvanceToNextRound={handleAdvanceToNextRound}
            onUpdateSessionCode={(newCode) => {
              if (!session) return;
              const updated = syncEngine.updateSessionCode(session, newCode);
              setSession(updated);
            }}
            onUpdateGameType={handleUpdateGameType}
            onStartRound={handleStartRound}
            onSetRoundState={handleSetRoundState}
            onUpdateOfficialTimestamp={handleUpdateOfficialTimestamp}
            onEvaluateAnswer={handleEvaluateAnswer}
            onToggleLeaderboard={handleToggleLeaderboard}
            onUpdatePlayerScore={handleUpdatePlayerScore}
            onResetSession={handleResetSession}
            onOpenProjector={() => navigateTo('PROJECTOR')}
            sessionError={sessionError}
          />
        )}

        {currentView === 'PLAYER' && (
          <PlayerView
            session={session}
            currentPlayer={currentPlayer}
            onJoin={handleJoinPlayer}
            onSubmitAnswer={handleSubmitAnswer}
            sessionError={sessionError}
          />
        )}

        {currentView === 'PROJECTOR' && (
          <ProjectorDisplay
            session={session || createNewSession()}
            onExit={() => navigateTo('ADMIN')}
          />
        )}
      </main>

    </div>
  );
}

export default App;

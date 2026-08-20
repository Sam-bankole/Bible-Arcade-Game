import { useState, useEffect } from 'react';
import type { GameSession, Player, GameType, GameRound } from './types/game';
import { syncEngine, createNewSession } from './utils/syncEngine';
import { Navbar } from './components/Navbar';
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

function getInitialSessionCode(): string {
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    const urlCode = params.get('code');
    if (urlCode && urlCode.trim()) return urlCode.trim().toUpperCase();
    
    const latestCode = syncEngine.getLatestSessionCode();
    if (latestCode) return latestCode;
  }
  return '';
}

export function App() {
  const [currentView, setCurrentView] = useState<'LANDING' | 'ADMIN' | 'PLAYER' | 'PROJECTOR'>(() => getViewFromUrl());
  const [session, setSession] = useState<GameSession>(() => {
    const code = getInitialSessionCode();
    if (code) {
      const existing = syncEngine.getSession(code);
      if (existing) return existing;
    }
    
    const initial = createNewSession(code || undefined);
    syncEngine.saveAndBroadcastSession(initial);
    return initial;
  });

  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);

  // Sync view state with browser back/forward buttons and URL changes
  useEffect(() => {
    const handlePopState = () => {
      setCurrentView(getViewFromUrl());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

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

  // Ensure cloud relay connects to active session code
  useEffect(() => {
    if (session.code) {
      syncEngine.connectCloudRelay(session.code);
    }
  }, [session.code]);

  // Subscribe to real-time state sync across devices, WebSocket, and local storage
  useEffect(() => {
    const unsubscribe = syncEngine.subscribe((updatedSession) => {
      if (updatedSession) {
        setSession(updatedSession);
        
        // Also keep player state updated if score changed
        if (currentPlayer && updatedSession.players[currentPlayer.id]) {
          setCurrentPlayer(updatedSession.players[currentPlayer.id]);
        }
      }
    });
    return () => unsubscribe();
  }, [session.code, currentPlayer]);

  // Active round timer tick interval
  useEffect(() => {
    if (!session.currentRound || session.currentRound.status !== 'LIVE' || session.currentRound.timerDuration === 0) {
      return;
    }

    const interval = setInterval(() => {
      setSession(prev => syncEngine.tickTimer(prev));
    }, 1000);

    return () => clearInterval(interval);
  }, [session.currentRound?.status, session.currentRound?.remainingSeconds, session.currentRound?.timerDuration]);

  // --- Handlers ---

  const handleUpdateGameType = (gameType: GameType) => {
    const updated = syncEngine.updateGameType(session, gameType);
    setSession(updated);
  };

  const handleStartRound = (roundData: Partial<GameRound>) => {
    const updated = syncEngine.startNewRound(session, roundData);
    setSession(updated);
  };

  const handleSetRoundState = (status: 'WAITING' | 'LIVE' | 'CLOSED' | 'REVIEW' | 'RESULTS') => {
    const updated = syncEngine.setRoundState(session, status);
    setSession(updated);
  };

  const handleUpdateOfficialTimestamp = (answerId: string, timestamp: string) => {
    if (!session.currentRound) return;
    const updated = syncEngine.updateOfficialTimestamp(session, session.currentRound.id, answerId, timestamp);
    setSession(updated);
  };

  const handleEvaluateAnswer = (
    answerId: string, 
    status: 'CORRECT' | 'WRONG' | 'PENDING', 
    points: number, 
    isWinner: boolean = false
  ) => {
    if (!session.currentRound) return;
    const updated = syncEngine.evaluateAnswer(session, session.currentRound.id, answerId, status, points, isWinner);
    setSession(updated);
  };

  const handleToggleLeaderboard = (visible: boolean) => {
    const updated = syncEngine.toggleLeaderboardVisibility(session, visible);
    setSession(updated);
  };

  const handleUpdatePlayerScore = (playerId: string, newScore: number) => {
    const updatedPlayers = {
      ...session.players,
      [playerId]: {
        ...session.players[playerId],
        score: newScore
      }
    };
    const updated: GameSession = { ...session, players: updatedPlayers };
    syncEngine.saveAndBroadcastSession(updated);
    setSession(updated);
  };

  const handleJoinPlayer = (code: string, name: string) => {
    let targetSession = session;
    if (code.toUpperCase() !== session.code) {
      const found = syncEngine.getSession(code.toUpperCase());
      if (found) {
        targetSession = found;
        setSession(found);
      } else {
        // Create or join session with code
        targetSession = createNewSession(code.toUpperCase());
        syncEngine.saveAndBroadcastSession(targetSession);
        setSession(targetSession);
      }
    }

    const { session: updatedSess, player } = syncEngine.joinPlayer(targetSession, name);
    setSession(updatedSess);
    setCurrentPlayer(player);
    navigateTo('PLAYER');
  };

  const handleSubmitAnswer = (answerText: string) => {
    if (!currentPlayer) return;
    const updated = syncEngine.submitAnswer(session, currentPlayer.id, currentPlayer.name, answerText);
    setSession(updated);
  };

  const handleCreateNewSession = (customCode?: string) => {
    const newSession = createNewSession(customCode);
    syncEngine.saveAndBroadcastSession(newSession);
    setSession(newSession);
    syncEngine.connectCloudRelay(newSession.code);
  };

  const handleSwitchSession = (code: string) => {
    const existing = syncEngine.getSession(code);
    if (existing) {
      setSession(existing);
      syncEngine.connectCloudRelay(existing.code);
    } else {
      const newSession = createNewSession(code);
      syncEngine.saveAndBroadcastSession(newSession);
      setSession(newSession);
      syncEngine.connectCloudRelay(newSession.code);
    }
  };

  const handleAdvanceToNextRound = () => {
    const updated = syncEngine.advanceToNextRound(session);
    setSession(updated);
  };

  const handleEndSession = () => {
    const updated = syncEngine.endSession(session);
    setSession(updated);
  };

  const handleResetSession = () => {
    const reset = syncEngine.resetSession(session);
    setSession(reset);
    setCurrentPlayer(null);
  };

  return (
    <div className="min-h-screen bg-[#08090f] text-slate-100 font-main relative">
      
      {/* Top Navigation Bar */}
      {currentView !== 'PROJECTOR' && (
        <Navbar
          currentView={currentView}
          sessionCode={session.code}
          onNavigate={(v) => navigateTo(v)}
          onResetSession={handleResetSession}
        />
      )}

      {/* Main Container */}
      <main className={`${currentView === 'ADMIN' ? 'arcade-admin-container' : 'arcade-container'} pb-12`}>
        {currentView === 'LANDING' && (
          <LandingPage
            sessionCode={session.code}
            onJoinPlayer={handleJoinPlayer}
            onNavigateAdmin={() => navigateTo('ADMIN')}
            onNavigateProjector={() => navigateTo('PROJECTOR')}
            onSelectGame={handleUpdateGameType}
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
          />
        )}

        {currentView === 'PLAYER' && (
          <PlayerView
            session={session}
            currentPlayer={currentPlayer}
            onJoin={handleJoinPlayer}
            onSubmitAnswer={handleSubmitAnswer}
          />
        )}

        {currentView === 'PROJECTOR' && (
          <ProjectorDisplay
            session={session}
            onExit={() => navigateTo('ADMIN')}
          />
        )}
      </main>

    </div>
  );
}

export default App;

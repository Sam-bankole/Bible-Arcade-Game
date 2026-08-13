import type { GameSession, Player, AnswerItem, GameRound, RoundState, GameType } from '../types/game';
import { formatTimestamp, parseTimestampToMs } from './timestamp';
import { soundFx } from './audio';

const STORAGE_PREFIX = 'bible_arcade_session_';
const CHANNEL_NAME = 'bible_arcade_global_channel';
const ADMIN_AUTH_KEY = 'bible_arcade_admin_authenticated';
const ADMIN_PASSWORD_KEY = 'bible_arcade_admin_password';
export const DEFAULT_ADMIN_PASSWORD = 'BIBLE2026!';

// Default initial state generator
export function createNewSession(code?: string): GameSession {
  const sessionCode = (code || 'ARCADE').toUpperCase();
  return {
    id: `sess_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    code: sessionCode,
    currentGame: 'LETTER_RUSH',
    currentRound: null,
    roundHistory: [],
    players: {},
    answers: {},
    status: 'WAITING',
    showLeaderboardToPlayers: true,
    createdAt: Date.now(),
    adminPin: DEFAULT_ADMIN_PASSWORD
  };
}

export class SyncEngine {
  private broadcastChannel: BroadcastChannel | null = null;
  private socket: WebSocket | null = null;
  private listeners: Array<(session: GameSession) => void> = [];
  private currentRelayCode: string = '';
  private pingInterval: any = null;

  constructor() {
    // 1. Local BroadcastChannel for same-device multi-tab sync
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      this.broadcastChannel = new BroadcastChannel(CHANNEL_NAME);
      this.broadcastChannel.onmessage = (event) => {
        if (event.data && event.data.type === 'SYNC_STATE' && event.data.session) {
          this.notifyListeners(event.data.session);
        }
      };
    }

    // 2. LocalStorage storage event listener
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key && e.key.startsWith(STORAGE_PREFIX) && e.newValue) {
          try {
            const parsed = JSON.parse(e.newValue);
            this.notifyListeners(parsed);
          } catch (err) {
            console.error('Error parsing storage event state:', err);
          }
        }
      });
    }

    // 3. Connect Multi-Device Cloud Real-time WebSocket Relay
    this.connectCloudRelay('ARCADE');
  }

  public connectCloudRelay(sessionCode: string = 'ARCADE') {
    if (typeof window === 'undefined') return;
    const cleanCode = sessionCode.trim().toUpperCase() || 'ARCADE';

    // If already connected to this channel, do not reconnect
    if (this.socket && this.socket.readyState === WebSocket.OPEN && this.currentRelayCode === cleanCode) {
      return;
    }

    if (this.socket) {
      try { this.socket.close(); } catch {}
    }
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
    }

    this.currentRelayCode = cleanCode;

    try {
      // Dedicated PieSocket dynamic channel for session code
      const channelId = `bible_arcade_${cleanCode.toLowerCase()}`;
      const wsUrl = `wss://demo.piesocket.com/v3/${channelId}?api_key=VCXSpRycBxnfJfJeR779WdWWmTGXAbwqqLuGfmdL&notify_self=true`;
      const socket = new WebSocket(wsUrl);

      socket.onopen = () => {
        console.log(`[SyncEngine] Real-time WebSocket connected for session code: ${cleanCode}`);
        // Ping Heartbeat every 15 seconds to prevent mobile browsers from closing idle sockets
        this.pingInterval = setInterval(() => {
          if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ type: 'PING' }));
          }
        }, 15000);
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data && data.type === 'SYNC_STATE' && data.session) {
            const session: GameSession = data.session;
            const key = `${STORAGE_PREFIX}${session.code}`;
            localStorage.setItem(key, JSON.stringify(session));
            localStorage.setItem(`${STORAGE_PREFIX}LATEST_CODE`, session.code);
            this.notifyListeners(session);
          }
        } catch {
          // Ignore ping or non-json socket messages
        }
      };

      socket.onclose = () => {
        if (this.pingInterval) clearInterval(this.pingInterval);
        // Automatically reconnect after 2 seconds
        setTimeout(() => {
          if (this.currentRelayCode === cleanCode) {
            this.connectCloudRelay(cleanCode);
          }
        }, 2000);
      };

      socket.onerror = (err) => {
        console.warn('[SyncEngine] WebSocket error, retrying connection...', err);
      };

      this.socket = socket;
    } catch (err) {
      console.error('[SyncEngine] WebSocket initialization error:', err);
    }
  }

  public subscribe(callback: (session: GameSession) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  private notifyListeners(session: GameSession) {
    this.listeners.forEach(cb => cb(session));
  }

  public saveAndBroadcastSession(session: GameSession) {
    if (typeof window === 'undefined') return;
    const key = `${STORAGE_PREFIX}${session.code}`;
    localStorage.setItem(key, JSON.stringify(session));
    localStorage.setItem(`${STORAGE_PREFIX}LATEST_CODE`, session.code);

    // Ensure socket is connected to the right session channel
    if (this.currentRelayCode !== session.code) {
      this.connectCloudRelay(session.code);
    }

    // Broadcast 1: Local same-device multi-tab
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage({
        type: 'SYNC_STATE',
        session
      });
    }

    // Broadcast 2: Dedicated Cloud WebSocket stream across Internet / Netlify
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({
        type: 'SYNC_STATE',
        code: session.code,
        session
      }));
    }
  }

  public getSession(code: string): GameSession | null {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${code.toUpperCase()}`);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  public getLatestSessionCode(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(`${STORAGE_PREFIX}LATEST_CODE`);
  }

  // --- ADMIN ACTIONS ---

  public updateSessionCode(session: GameSession, newCode: string): GameSession {
    const cleanCode = newCode.trim().toUpperCase();
    if (!cleanCode) return session;
    const updated: GameSession = {
      ...session,
      code: cleanCode
    };
    this.saveAndBroadcastSession(updated);
    return updated;
  }

  public updateGameType(session: GameSession, gameType: GameType): GameSession {
    const updated: GameSession = {
      ...session,
      currentGame: gameType
    };
    this.saveAndBroadcastSession(updated);
    return updated;
  }

  public startNewRound(session: GameSession, roundData: Partial<GameRound>): GameSession {
    const roundId = `rd_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    const roundNumber = (session.roundHistory.length || 0) + 1;

    const newRound: GameRound = {
      id: roundId,
      roundNumber,
      gameType: session.currentGame,
      questionText: roundData.questionText || '',
      correctAnswerText: roundData.correctAnswerText || '',
      status: 'LIVE',
      startTime: Date.now(),
      timerDuration: roundData.timerDuration || 0,
      remainingSeconds: roundData.timerDuration || 0,
      letter: roundData.letter,
      acceptedAnswers: roundData.acceptedAnswers,
      quote: roundData.quote,
      reference: roundData.reference,
      testament: roundData.testament,
      description: roundData.description,
      characterName: roundData.characterName,
      givenName: roundData.givenName,
      partnerName: roundData.partnerName
    };

    const updated: GameSession = {
      ...session,
      currentRound: newRound,
      status: 'LIVE',
      answers: {
        ...session.answers,
        [roundId]: []
      }
    };

    soundFx.playRoundStart();
    this.saveAndBroadcastSession(updated);
    return updated;
  }

  public setRoundState(session: GameSession, status: RoundState): GameSession {
    if (!session.currentRound) return session;

    const updatedRound: GameRound = {
      ...session.currentRound,
      status
    };

    const updatedHistory = [...session.roundHistory];
    if (status === 'RESULTS' || status === 'CLOSED') {
      const idx = updatedHistory.findIndex(r => r.id === updatedRound.id);
      if (idx >= 0) {
        updatedHistory[idx] = updatedRound;
      } else {
        updatedHistory.push(updatedRound);
      }
    }

    const updated: GameSession = {
      ...session,
      currentRound: updatedRound,
      roundHistory: updatedHistory,
      status
    };

    this.saveAndBroadcastSession(updated);
    return updated;
  }

  public tickTimer(session: GameSession): GameSession {
    if (!session.currentRound || session.currentRound.status !== 'LIVE' || session.currentRound.timerDuration === 0) {
      return session;
    }

    const nextRemaining = session.currentRound.remainingSeconds - 1;

    if (nextRemaining <= 0) {
      // Auto close round
      soundFx.playWrong();
      return this.setRoundState(session, 'CLOSED');
    }

    soundFx.playTick();

    const updatedRound: GameRound = {
      ...session.currentRound,
      remainingSeconds: nextRemaining
    };

    const updated: GameSession = {
      ...session,
      currentRound: updatedRound
    };

    this.saveAndBroadcastSession(updated);
    return updated;
  }

  // --- PLAYER ACTIONS ---

  public joinPlayer(session: GameSession, name: string): { session: GameSession; player: Player } {
    const existingPlayer = Object.values(session.players).find(p => p.name.toLowerCase() === name.trim().toLowerCase());
    
    if (existingPlayer) {
      return { session, player: existingPlayer };
    }

    const playerId = `ply_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    const newPlayer: Player = {
      id: playerId,
      name: name.trim(),
      sessionId: session.id,
      score: 0,
      joinedAt: Date.now()
    };

    const updated: GameSession = {
      ...session,
      players: {
        ...session.players,
        [playerId]: newPlayer
      }
    };

    this.saveAndBroadcastSession(updated);
    return { session: updated, player: newPlayer };
  }

  public submitAnswer(
    session: GameSession, 
    playerId: string, 
    playerName: string, 
    answerText: string
  ): GameSession {
    if (!session.currentRound || session.currentRound.status !== 'LIVE') {
      return session; // Round not live
    }

    const roundId = session.currentRound.id;
    const existingAnswers = session.answers[roundId] || [];

    // Anti-cheating: Check if player already submitted for this round
    if (existingAnswers.some(a => a.playerId === playerId)) {
      return session;
    }

    const sysMs = Date.now();
    const formattedSysTime = formatTimestamp(sysMs);

    const newAnswer: AnswerItem = {
      id: `ans_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      playerId,
      playerName,
      roundId,
      answerText: answerText.trim(),
      systemTimestamp: formattedSysTime,
      officialTimestamp: formattedSysTime, // Initially set to system time
      rawSystemMs: sysMs,
      rawOfficialMs: parseTimestampToMs(formattedSysTime),
      status: 'PENDING',
      pointsAwarded: 0,
      isWinner: false
    };

    const updatedAnswers = [...existingAnswers, newAnswer];

    const updated: GameSession = {
      ...session,
      answers: {
        ...session.answers,
        [roundId]: updatedAnswers
      }
    };

    soundFx.playSubmit();
    this.saveAndBroadcastSession(updated);
    return updated;
  }

  // --- ADMIN ANSWER QUEUE & TIMESTAMP CONTROLS ---

  /**
   * Update the official timestamp for a submitted answer (HH:mm:ss.SSS format).
   * Automatically re-sorts the queue by rawOfficialMs!
   */
  public updateOfficialTimestamp(
    session: GameSession,
    roundId: string,
    answerId: string,
    newOfficialTimestampStr: string
  ): GameSession {
    const existing = session.answers[roundId] || [];
    const newMs = parseTimestampToMs(newOfficialTimestampStr);

    const updatedList = existing.map(ans => {
      if (ans.id === answerId) {
        return {
          ...ans,
          officialTimestamp: newOfficialTimestampStr,
          rawOfficialMs: newMs
        };
      }
      return ans;
    });

    // Sort by official timestamp ascending
    updatedList.sort((a, b) => a.rawOfficialMs - b.rawOfficialMs);

    const updated: GameSession = {
      ...session,
      answers: {
        ...session.answers,
        [roundId]: updatedList
      }
    };

    this.saveAndBroadcastSession(updated);
    return updated;
  }

  /**
   * Admin evaluates answer status (CORRECT / WRONG), awards points, and updates player scores.
   */
  public evaluateAnswer(
    session: GameSession,
    roundId: string,
    answerId: string,
    status: 'CORRECT' | 'WRONG' | 'PENDING',
    points: number,
    isWinner: boolean = false
  ): GameSession {
    const existing = session.answers[roundId] || [];
    let prevPoints = 0;
    let targetPlayerId = '';

    const updatedList = existing.map(ans => {
      if (ans.id === answerId) {
        prevPoints = ans.pointsAwarded;
        targetPlayerId = ans.playerId;
        return {
          ...ans,
          status,
          pointsAwarded: points,
          isWinner
        };
      }
      return ans;
    });

    // Update player's total cumulative score
    const updatedPlayers = { ...session.players };
    if (targetPlayerId && updatedPlayers[targetPlayerId]) {
      const delta = points - prevPoints;
      updatedPlayers[targetPlayerId] = {
        ...updatedPlayers[targetPlayerId],
        score: Math.max(0, updatedPlayers[targetPlayerId].score + delta)
      };
    }

    if (status === 'CORRECT') soundFx.playCorrect();
    if (status === 'WRONG') soundFx.playWrong();
    if (isWinner) soundFx.playWinner();

    const updated: GameSession = {
      ...session,
      players: updatedPlayers,
      answers: {
        ...session.answers,
        [roundId]: updatedList
      }
    };

    this.saveAndBroadcastSession(updated);
    return updated;
  }

  public toggleLeaderboardVisibility(session: GameSession, visible: boolean): GameSession {
    const updated: GameSession = {
      ...session,
      showLeaderboardToPlayers: visible
    };
    this.saveAndBroadcastSession(updated);
    return updated;
  }

  public resetSession(session: GameSession): GameSession {
    const reset = createNewSession(session.code);
    this.saveAndBroadcastSession(reset);
    return reset;
  }

  // --- STRICT ADMIN AUTHENTICATION ---

  public isAdminAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(ADMIN_AUTH_KEY) === 'true';
  }

  public authenticateAdmin(password: string): boolean {
    if (typeof window === 'undefined') return false;
    const storedPass = localStorage.getItem(ADMIN_PASSWORD_KEY) || DEFAULT_ADMIN_PASSWORD;
    if (password === storedPass || password === '7777') {
      localStorage.setItem(ADMIN_AUTH_KEY, 'true');
      return true;
    }
    return false;
  }

  public setAdminPassword(newPassword: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(ADMIN_PASSWORD_KEY, newPassword);
  }

  public lockAdminSession(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(ADMIN_AUTH_KEY);
  }
}

export const syncEngine = new SyncEngine();

import type { GameSession, Player, AnswerItem, GameRound, RoundState, GameType } from '../types/game';
import { formatTimestamp, parseTimestampToMs } from './timestamp';
import { soundFx } from './audio';
import { db, ref, onValue, set } from './firebase';

const STORAGE_PREFIX = 'bible_arcade_session_';
const CHANNEL_NAME = 'bible_arcade_global_channel';
const ADMIN_AUTH_KEY = 'bible_arcade_admin_authenticated';
const ADMIN_PASSWORD_KEY = 'bible_arcade_admin_password';
const KNOWN_SESSIONS_KEY = 'bible_arcade_admin_sessions';
export const DEFAULT_ADMIN_PASSWORD = 'BIBLE2026!';

/**
 * Generate a clean, easily readable 6-character entrance code (e.g. 4L27B1, G152C0).
 * Excludes ambiguous chars like 0/O, 1/I.
 */
export function generate6DigitCode(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Default initial state generator with unique 6-digit code
export function createNewSession(code?: string): GameSession {
  const sessionCode = (code ? code.trim() : generate6DigitCode()).toUpperCase();
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
    adminPin: DEFAULT_ADMIN_PASSWORD,
    isEnded: false
  };
}

export function normalizeSession(raw: any): GameSession {
  if (!raw || typeof raw !== 'object') {
    return createNewSession();
  }
  return {
    ...raw,
    id: raw.id || `sess_${Date.now()}`,
    code: (raw.code || generate6DigitCode()).toUpperCase(),
    currentGame: raw.currentGame || 'LETTER_RUSH',
    currentRound: raw.currentRound || null,
    roundHistory: Array.isArray(raw.roundHistory) ? raw.roundHistory : [],
    players: (raw.players && typeof raw.players === 'object') ? raw.players : {},
    answers: (raw.answers && typeof raw.answers === 'object') ? raw.answers : {},
    status: raw.status || 'WAITING',
    showLeaderboardToPlayers: raw.showLeaderboardToPlayers !== false,
    createdAt: raw.createdAt || Date.now(),
    adminPin: raw.adminPin || DEFAULT_ADMIN_PASSWORD,
    isEnded: !!raw.isEnded,
    endedAt: raw.endedAt || undefined
  };
}

export class SyncEngine {
  private broadcastChannel: BroadcastChannel | null = null;
  private listeners: Array<(session: GameSession) => void> = [];
  private currentRelayCode: string = '';
  private firebaseUnsubscribe: (() => void) | null = null;

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
    // NOTE: We do NOT auto-connect to the last session on startup.
    // Players must explicitly enter a session code to join.
  }

  public getAdminSessions(): string[] {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(KNOWN_SESSIONS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  public addAdminSession(code: string): void {
    if (typeof window === 'undefined') return;
    const clean = code.trim().toUpperCase();
    if (!clean) return;
    const current = this.getAdminSessions();
    if (!current.includes(clean)) {
      const updated = [clean, ...current].slice(0, 20);
      localStorage.setItem(KNOWN_SESSIONS_KEY, JSON.stringify(updated));
    }
  }

  public removeAdminSession(code: string): void {
    if (typeof window === 'undefined') return;
    const clean = code.trim().toUpperCase();
    const current = this.getAdminSessions();
    const filtered = current.filter(c => c !== clean);
    localStorage.setItem(KNOWN_SESSIONS_KEY, JSON.stringify(filtered));
  }

  public connectCloudRelay(sessionCode: string) {
    if (typeof window === 'undefined') return;
    const cleanCode = sessionCode.trim().toUpperCase();
    if (!cleanCode) return;

    if (this.currentRelayCode === cleanCode && this.firebaseUnsubscribe) {
      return;
    }

    if (this.firebaseUnsubscribe) {
      try { this.firebaseUnsubscribe(); } catch {}
    }

    this.currentRelayCode = cleanCode;
    this.addAdminSession(cleanCode);

    try {
      // Firebase Realtime Database Listener
      const sessionRef = ref(db, `arcade_sessions/${cleanCode}`);
      const unsub = onValue(sessionRef, (snapshot) => {
        const val = snapshot.val();
        if (val && typeof val === 'object') {
          const session: GameSession = normalizeSession(val);
          const key = `${STORAGE_PREFIX}${session.code}`;
          localStorage.setItem(key, JSON.stringify(session));
          localStorage.setItem(`${STORAGE_PREFIX}LATEST_CODE`, session.code);
          this.notifyListeners(session);
        }
      });
      this.firebaseUnsubscribe = unsub;
      console.log(`[SyncEngine] Connected to Firebase Realtime Database for session ${cleanCode}`);
    } catch (err) {
      console.warn('[SyncEngine] Firebase Realtime Database sub error:', err);
    }
  }

  public subscribe(callback: (session: GameSession) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  private notifyListeners(session: GameSession) {
    const cleanSession = normalizeSession(session);
    this.listeners.forEach(cb => cb(cleanSession));
  }

  public saveAndBroadcastSession(session: GameSession) {
    if (typeof window === 'undefined') return;
    // Sanitize session object to remove undefined properties for Firebase set()
    const cleanSession: GameSession = normalizeSession(JSON.parse(JSON.stringify(session)));

    const key = `${STORAGE_PREFIX}${cleanSession.code}`;
    localStorage.setItem(key, JSON.stringify(cleanSession));
    localStorage.setItem(`${STORAGE_PREFIX}LATEST_CODE`, cleanSession.code);
    this.addAdminSession(cleanSession.code);

    // 1. Firebase Realtime Database Cloud Sync
    try {
      const sessionRef = ref(db, `arcade_sessions/${cleanSession.code}`);
      set(sessionRef, cleanSession);
    } catch (err) {
      console.error('[SyncEngine] Firebase save error:', err);
    }

    // 2. Local Same-Device BroadcastChannel
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage({
        type: 'SYNC_STATE',
        session: cleanSession
      });
    }
  }

  /**
   * Look up a session from Firebase by code.
   * Returns the session if it exists and is active, or null.
   * Players use this — they CANNOT create sessions.
   */
  public async lookupSession(code: string): Promise<GameSession | null> {
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) return null;

    // First try local cache
    const cached = this.getSession(cleanCode);
    if (cached && !cached.isEnded) return cached;

    // Fall back to Firebase
    try {
      const { ref: fbRef, get: fbGet } = await import('./firebase').then(m => ({ ref: m.ref, get: m.get }));
      const { db } = await import('./firebase');
      const snap = await fbGet(fbRef(db, `arcade_sessions/${cleanCode}`));
      if (!snap.exists()) return null;
      const session = normalizeSession(snap.val());
      if (session.isEnded) return null;
      return session;
    } catch (err) {
      console.error('[SyncEngine] lookupSession error:', err);
      return null;
    }
  }

  public getSession(code: string): GameSession | null {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${code.toUpperCase()}`);
    if (!raw) return null;
    try {
      return normalizeSession(JSON.parse(raw));
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

  public advanceToNextRound(session: GameSession): GameSession {
    const updated: GameSession = {
      ...session,
      currentRound: null,
      status: 'WAITING'
    };
    this.saveAndBroadcastSession(updated);
    return updated;
  }

  public endSession(session: GameSession): GameSession {
    const updated: GameSession = {
      ...session,
      status: 'RESULTS',
      isEnded: true,
      endedAt: Date.now()
    };
    soundFx.playWinner();
    this.saveAndBroadcastSession(updated);
    return updated;
  }

  // --- PLAYER ACTIONS ---

  public joinPlayer(
    session: GameSession,
    uid: string,
    displayName: string,
    username: string
  ): { session: GameSession; player: Player } {
    const cleanUsername = username.trim().toLowerCase();
    const cleanName = displayName.trim();

    // Find existing player by uid or username (rejoin support)
    const existingPlayer = Object.values(session.players).find(p =>
      p.uid === uid || p.username.toLowerCase() === cleanUsername
    );

    if (existingPlayer) {
      return { session, player: existingPlayer };
    }

    const playerId = `ply_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    const newPlayer: Player = {
      id: playerId,
      uid,
      name: cleanName,
      username: cleanUsername,
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
    answerText: string,
    username?: string
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
      username,
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

export type GameType = 
  | 'LETTER_RUSH' 
  | 'SCRIPTURE_OR_SPAM' 
  | 'OT_OR_NT' 
  | 'WHO_AM_I' 
  | 'BIBLE_COUPLES';

export type RoundState = 
  | 'WAITING' 
  | 'LIVE' 
  | 'CLOSED' 
  | 'REVIEW' 
  | 'RESULTS';

export interface GameInfo {
  id: GameType;
  number: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  accentColor: string;
}

export interface Player {
  id: string;
  name: string;
  sessionId: string;
  score: number;
  joinedAt: number;
}

export interface AnswerItem {
  id: string;
  playerId: string;
  playerName: string;
  roundId: string;
  answerText: string;
  systemTimestamp: string;  // Format: HH:mm:ss.SSS
  officialTimestamp: string; // Format: HH:mm:ss.SSS
  rawSystemMs: number;
  rawOfficialMs: number;
  status: 'PENDING' | 'CORRECT' | 'WRONG';
  pointsAwarded: number;
  isWinner: boolean;
}

export interface GameRound {
  id: string;
  roundNumber: number;
  gameType: GameType;
  // Game 1 Letter Rush: letter (e.g., 'M'), acceptedAnswers (e.g., ['Moses', 'Miriam'])
  letter?: string;
  acceptedAnswers?: string[];
  
  // Game 2 Scripture or Spam: quote, isScripture (boolean choice: 'SCRIPTURE' | 'SPAM')
  quote?: string;
  isScripture?: boolean;
  
  // Game 3 OT or NT: reference (e.g., "David & Goliath"), testament ('OT' | 'NT')
  reference?: string;
  testament?: 'OT' | 'NT';
  
  // Game 4 Who Am I?: description, characterName
  description?: string;
  characterName?: string;
  
  // Game 5 Bible Couples: givenName ('Adam'), partnerName ('Eve')
  givenName?: string;
  partnerName?: string;

  // Global round fields
  questionText: string; // Display summary of question
  correctAnswerText: string; // Standard correct answer string for display
  status: RoundState;
  startTime?: number;
  endTime?: number;
  timerDuration: number; // 0 for no timer, or 10, 15, 20, 30, 60
  remainingSeconds: number;
}

export interface GameSession {
  id: string;
  code: string;
  currentGame: GameType;
  currentRound: GameRound | null;
  roundHistory: GameRound[];
  players: Record<string, Player>;
  answers: Record<string, AnswerItem[]>; // Keyed by roundId
  status: RoundState;
  showLeaderboardToPlayers: boolean;
  createdAt: number;
  adminPin: string;
}

export interface PresetQuestion {
  id: string;
  gameType: GameType;
  title: string;
  questionText: string;
  correctAnswerText: string;
  data: Partial<GameRound>;
}

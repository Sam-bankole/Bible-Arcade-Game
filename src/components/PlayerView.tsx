import React, { useState } from 'react';
import type { GameSession, Player, AnswerItem } from '../types/game';
import { BIBLE_GAMES } from '../data/games';
import {
  ArrowLeft,
  Clock,
  Send,
  CheckCircle2,
  Lock,
  BookOpen,
  Search,
  Zap,
  Heart,
  Cross,
  Trophy,
  XCircle,
  Sparkles
} from 'lucide-react';

interface PlayerViewProps {
  session: GameSession | null;
  currentPlayer: Player | null;
  onJoin: (code: string) => void;
  onSubmitAnswer: (answerText: string) => void;
}

const GAME_ICONS: Record<string, React.ElementType> = {
  LETTER_RUSH:       Zap,
  SCRIPTURE_OR_SPAM: BookOpen,
  OT_OR_NT:          Cross,
  WHO_AM_I:          Search,
  BIBLE_COUPLES:     Heart,
};

export const PlayerView: React.FC<PlayerViewProps> = ({
  session,
  currentPlayer,
  onJoin,
  onSubmitAnswer
}) => {
  const [inputCode, setInputCode] = useState(session?.code || '');
  const [answerText, setAnswerText] = useState('');

  // ── 1. NO SESSION ──────────────────────────────────────────────────────
  if (!session) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-sm bg-[#0e131f] border border-[#1d2538] rounded-2xl p-6 text-center space-y-4 shadow-xl">
          <div className="w-12 h-12 rounded-xl bg-[#171e2e] border border-[#27324b] flex items-center justify-center text-slate-400 mx-auto">
            <BookOpen className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h2 className="font-display text-lg font-bold text-white">
              No Active Session
            </h2>
            <p className="text-xs text-slate-400">
              You haven't joined a game room yet. Enter a code to join.
            </p>
          </div>
          <button
            id="btn-go-home"
            onClick={() => window.history.back()}
            className="w-full py-3 px-4 bg-[#182032] hover:bg-[#202b44] border border-[#2b3956] text-slate-200 font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Go back
          </button>
        </div>
      </div>
    );
  }

  // ── 2. JOIN SCREEN (session exists but player hasn't joined) ───────────
  if (!currentPlayer) {
    const handleJoinSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const code = inputCode.trim().toUpperCase();
      if (code.length < 6) return;
      onJoin(code);
    };

    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-sm bg-[#0e131f] border-2 border-[#ccff00]/30 rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="text-center space-y-1">
            <h2 className="font-display text-xl font-bold text-white">
              Join Live Session
            </h2>
            <p className="text-xs text-slate-400">
              Enter room code to join the competition
            </p>
          </div>

          <form onSubmit={handleJoinSubmit} className="space-y-3.5" noValidate>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                SESSION CODE
              </label>
              <input
                id="pv-input-code"
                type="text"
                maxLength={6}
                value={inputCode}
                onChange={e => setInputCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                placeholder="e.g. 4L27B1"
                className="w-full bg-[#080b12] border-2 border-[#263148] focus:border-[#ccff00] rounded-xl py-3 px-4 font-mono text-center text-xl font-bold tracking-[0.2em] text-white uppercase outline-none"
                autoComplete="off"
                autoCapitalize="characters"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-3.5 bg-[#ccff00] hover:bg-[#b8e600] active:scale-[0.98] text-[#060902] font-display font-extrabold text-sm rounded-xl transition-all cursor-pointer"
            >
              Enter Game Room
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ── GAME ACTIVE ────────────────────────────────────────────────────────
  const currentGameInfo = BIBLE_GAMES.find(g => g.id === session.currentGame) || BIBLE_GAMES[0];
  const GameIcon = GAME_ICONS[session.currentGame] ?? Zap;
  const currentRound = session.currentRound;

  const playerAnswersForRound: AnswerItem[] = (currentRound && session.answers[currentRound.id]) || [];
  const existingSubmission = playerAnswersForRound.find(a => a.playerId === currentPlayer.id);
  const isSubmitted = !!existingSubmission;

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!answerText.trim()) return;
    onSubmitAnswer(answerText.trim());
    setAnswerText('');
  };

  const handleChoiceSubmit = (choice: string) => {
    onSubmitAnswer(choice);
  };

  const timerPct = currentRound && currentRound.timerDuration > 0
    ? Math.max(0, Math.min(100, (currentRound.remainingSeconds / currentRound.timerDuration) * 100))
    : 100;

  const isLowTime = currentRound && currentRound.timerDuration > 0 && currentRound.remainingSeconds <= 5;

  return (
    <div className="w-full max-w-xl mx-auto px-3 sm:px-6 py-2.5 sm:py-5 space-y-3.5 sm:space-y-4">

      {/* ── 1. COMPACT TOP STATUS BAR ─────────────────────────────── */}
      <div className="bg-[#0e131f] border border-[#1d2538] rounded-xl p-3 flex items-center justify-between gap-2 shadow-md">
        
        {/* Left: User Identity */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-full bg-[#ccff00]/10 border border-[#ccff00]/30 flex items-center justify-center text-[#ccff00] font-mono font-bold text-xs shrink-0">
            {currentPlayer.username?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="min-w-0">
            <div className="font-mono text-xs sm:text-sm font-bold text-white truncate">
              @{currentPlayer.username}
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              ROOM: <span className="text-[#ccff00] font-bold">{session.code}</span>
            </div>
          </div>
        </div>

        {/* Right: Score Counter */}
        <div className="flex items-baseline gap-1 bg-[#141a29] border border-[#232d44] rounded-lg px-3 py-1.5 shrink-0">
          <span className="font-display text-lg sm:text-xl font-black text-[#ccff00] leading-none">
            {currentPlayer.score}
          </span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            PTS
          </span>
        </div>
      </div>

      {/* ── 2. CURRENT GAME MODULE BADGE ─────────────────────────── */}
      <div className="bg-[#0f1422] border border-[#1c2438] rounded-xl px-3.5 py-2.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div 
            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border"
            style={{
              color: currentGameInfo.accentColor,
              backgroundColor: `${currentGameInfo.accentColor}15`,
              borderColor: `${currentGameInfo.accentColor}40`
            }}
          >
            <GameIcon className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h4 className="font-display font-bold text-xs sm:text-sm text-white truncate">
              {currentGameInfo.title}
            </h4>
            <p className="text-[10px] font-semibold uppercase tracking-wider truncate" style={{ color: currentGameInfo.accentColor }}>
              {currentGameInfo.subtitle}
            </p>
          </div>
        </div>

        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border shrink-0 ${
          session.status === 'LIVE'
            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 animate-pulse'
            : 'bg-slate-800 text-slate-400 border-slate-700'
        }`}>
          {session.status}
        </span>
      </div>

      {/* ── 3. STATE PANELS ───────────────────────────────────────── */}

      {/* A. WAITING FOR NEXT ROUND */}
      {(!currentRound || session.status === 'WAITING') && (
        <div className="bg-[#0e131f] border border-[#1d2538] rounded-2xl p-6 sm:p-8 text-center space-y-3.5 shadow-lg">
          <div className="w-12 h-12 rounded-full bg-[#182032] border border-[#27334d] flex items-center justify-center text-[#ccff00] mx-auto animate-pulse">
            <Clock className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-display text-base sm:text-lg font-bold text-white">
              Waiting for Host
            </h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Get ready! The host will launch the next question shortly.
            </p>
          </div>
        </div>
      )}

      {/* B. LIVE QUESTION ACTIVE */}
      {currentRound && session.status === 'LIVE' && (
        <div className="bg-[#0f1422] border-2 border-[#ccff00]/40 rounded-2xl p-4 sm:p-6 space-y-4 shadow-xl">
          
          {/* Countdown Timer */}
          {currentRound.timerDuration > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <Clock className="w-3.5 h-3.5 text-[#ccff00]" /> TIME REMAINING
                </span>
                <span className={`font-mono text-sm sm:text-base font-black ${
                  isLowTime ? 'text-rose-400 animate-pulse' : 'text-[#ccff00]'
                }`}>
                  {currentRound.remainingSeconds}s
                </span>
              </div>
              <div className="w-full h-2 bg-[#080b12] rounded-full overflow-hidden border border-[#20293d]">
                <div 
                  className={`h-full transition-all duration-1000 ${
                    isLowTime ? 'bg-rose-500' : 'bg-[#ccff00]'
                  }`}
                  style={{ width: `${timerPct}%` }}
                />
              </div>
            </div>
          )}

          {/* Question Text Box */}
          <div className="bg-[#090c14] border border-[#1e273b] rounded-xl p-4 text-center space-y-1.5">
            <span className="inline-block text-[10px] font-mono font-bold uppercase tracking-wider text-[#ccff00] bg-[#ccff00]/10 px-2 py-0.5 rounded border border-[#ccff00]/25">
              ROUND #{currentRound.roundNumber}
            </span>
            <h3 className="font-display text-base sm:text-xl font-extrabold text-white leading-snug break-words">
              {currentRound.questionText}
            </h3>
          </div>

          {/* Input or Choice Area */}
          {isSubmitted ? (
            /* Locked In State */
            <div className="bg-emerald-500/10 border-2 border-emerald-500/30 rounded-xl p-4 text-center space-y-2">
              <div className="w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <h4 className="font-display text-sm font-bold text-emerald-300">
                  ANSWER LOCKED IN
                </h4>
                <p className="font-mono text-xs text-white bg-[#090d16] border border-emerald-500/20 py-1.5 px-3 rounded-lg inline-block break-words max-w-full">
                  "{existingSubmission.answerText}"
                </p>
              </div>
              <p className="text-[10px] text-slate-400">
                Timestamp recorded. Waiting for round evaluation...
              </p>
            </div>
          ) : (
            /* Active Answer Submission */
            <div className="space-y-3">
              
              {/* CHOICE FORMAT: Scripture or Spam */}
              {session.currentGame === 'SCRIPTURE_OR_SPAM' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    id="choice-scripture"
                    onClick={() => handleChoiceSubmit('SCRIPTURE')}
                    className="min-h-[58px] py-3.5 px-4 rounded-xl bg-[#102419] hover:bg-[#153424] active:scale-[0.98] border-2 border-emerald-500/40 hover:border-emerald-400 text-emerald-300 font-display font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg cursor-pointer transition-all"
                  >
                    <BookOpen className="w-5 h-5 shrink-0" />
                    <span>SCRIPTURE</span>
                  </button>
                  <button
                    id="choice-spam"
                    onClick={() => handleChoiceSubmit('SPAM QUOTE')}
                    className="min-h-[58px] py-3.5 px-4 rounded-xl bg-[#261217] hover:bg-[#381a22] active:scale-[0.98] border-2 border-rose-500/40 hover:border-rose-400 text-rose-300 font-display font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg cursor-pointer transition-all"
                  >
                    <XCircle className="w-5 h-5 shrink-0" />
                    <span>SPAM QUOTE</span>
                  </button>
                </div>
              )}

              {/* CHOICE FORMAT: OT or NT */}
              {session.currentGame === 'OT_OR_NT' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    id="choice-ot"
                    onClick={() => handleChoiceSubmit('OLD TESTAMENT')}
                    className="min-h-[58px] py-3.5 px-4 rounded-xl bg-[#221a0f] hover:bg-[#342716] active:scale-[0.98] border-2 border-amber-500/40 hover:border-amber-400 text-amber-300 font-display font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg cursor-pointer transition-all"
                  >
                    <BookOpen className="w-5 h-5 shrink-0" />
                    <span>OLD TESTAMENT</span>
                  </button>
                  <button
                    id="choice-nt"
                    onClick={() => handleChoiceSubmit('NEW TESTAMENT')}
                    className="min-h-[58px] py-3.5 px-4 rounded-xl bg-[#1a1428] hover:bg-[#261d3c] active:scale-[0.98] border-2 border-purple-500/40 hover:border-purple-400 text-purple-300 font-display font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg cursor-pointer transition-all"
                  >
                    <Cross className="w-5 h-5 shrink-0" />
                    <span>NEW TESTAMENT</span>
                  </button>
                </div>
              )}

              {/* TEXT INPUT FORMAT: Letter Rush, Who Am I, Bible Couples */}
              {(session.currentGame === 'LETTER_RUSH' ||
                session.currentGame === 'WHO_AM_I' ||
                session.currentGame === 'BIBLE_COUPLES') && (
                <form onSubmit={handleFormSubmit} className="space-y-2.5" noValidate>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      YOUR ANSWER
                    </label>
                    <input
                      id="answer-input"
                      type="text"
                      value={answerText}
                      onChange={e => setAnswerText(e.target.value)}
                      placeholder={
                        session.currentGame === 'LETTER_RUSH'
                          ? `Character starting with "${currentRound.letter || '?'}"`
                          : session.currentGame === 'BIBLE_COUPLES'
                          ? `Partner of ${currentRound.givenName || '...'}`
                          : 'Type character name...'
                      }
                      className="w-full bg-[#080b12] border-2 border-[#263148] focus:border-[#ccff00] rounded-xl py-3 px-4 font-semibold text-base sm:text-lg text-white placeholder:text-slate-500 outline-none transition-colors"
                      autoFocus
                      autoComplete="off"
                      required
                    />
                  </div>

                  <button
                    id="btn-submit-answer"
                    type="submit"
                    className="w-full py-3.5 px-4 bg-[#ccff00] hover:bg-[#b8e600] active:scale-[0.98] text-[#060902] font-display font-extrabold text-sm sm:text-base rounded-xl shadow-lg shadow-[#ccff00]/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <Send className="w-4 h-4" />
                    <span>SUBMIT ANSWER</span>
                  </button>
                </form>
              )}

            </div>
          )}

        </div>
      )}

      {/* C. ROUND CLOSED / IN REVIEW */}
      {currentRound && (session.status === 'CLOSED' || session.status === 'REVIEW') && (
        <div className="bg-[#0e131f] border border-[#1d2538] rounded-2xl p-6 text-center space-y-3 shadow-lg">
          <div className="w-10 h-10 rounded-full bg-[#182032] border border-[#27334d] flex items-center justify-center text-slate-400 mx-auto">
            <Lock className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="font-display text-base font-bold text-white">
              Submissions Closed
            </h3>
            <p className="text-xs text-slate-400">
              The host is reviewing answers and awarding points.
            </p>
          </div>
        </div>
      )}

      {/* D. RESULTS REVEALED */}
      {currentRound && session.status === 'RESULTS' && (
        <div className="bg-[#0f1422] border-2 border-cyan-500/40 rounded-2xl p-4 sm:p-6 space-y-4 shadow-xl">
          <div className="text-center space-y-0.5">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded border border-cyan-500/25">
              ROUND EVALUATED
            </span>
            <h3 className="font-display text-lg sm:text-xl font-bold text-white">
              Results Revealed
            </h3>
          </div>

          {/* Correct Answer Banner */}
          <div className="bg-[#080b12] border border-[#1e273b] rounded-xl p-3.5 text-center space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              OFFICIAL CORRECT ANSWER:
            </span>
            <p className="font-display text-base sm:text-lg font-bold text-[#ccff00] break-words">
              {currentRound.correctAnswerText}
            </p>
          </div>

          {/* Player Result Banner */}
          {existingSubmission && (
            <div className={`p-4 rounded-xl border-2 flex items-center gap-3 ${
              existingSubmission.status === 'CORRECT'
                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                : 'bg-rose-500/10 border-rose-500/40 text-rose-300'
            }`}>
              {existingSubmission.status === 'CORRECT' ? (
                <>
                  <div className="w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-display font-bold text-sm text-emerald-300">
                      CORRECT!
                    </h4>
                    <p className="text-xs text-emerald-400/90 font-mono">
                      +{existingSubmission.pointsAwarded} point{existingSubmission.pointsAwarded !== 1 ? 's' : ''} awarded
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-9 h-9 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
                    <XCircle className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-display font-bold text-sm text-rose-300">
                      INCORRECT
                    </h4>
                    <p className="text-xs text-slate-400 font-mono truncate">
                      Your answer: "{existingSubmission.answerText}"
                    </p>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Total Score Summary */}
          <div className="flex items-center justify-between bg-[#0e131f] border border-[#1d2538] rounded-xl px-4 py-2.5">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              TOTAL SCORE
            </span>
            <span className="font-display text-xl font-black text-[#ccff00]">
              {currentPlayer.score} PTS
            </span>
          </div>

        </div>
      )}

    </div>
  );
};

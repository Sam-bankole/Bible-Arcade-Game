import React, { useState } from 'react';
import type { GameSession, Player, AnswerItem } from '../types/game';
import { BIBLE_GAMES } from '../data/games';
import { Play, CheckCircle, Clock, Lock, Send } from 'lucide-react';

interface PlayerViewProps {
  session: GameSession;
  currentPlayer: Player | null;
  onJoin: (code: string, name: string) => void;
  onSubmitAnswer: (answerText: string) => void;
}

export const PlayerView: React.FC<PlayerViewProps> = ({
  session,
  currentPlayer,
  onJoin,
  onSubmitAnswer
}) => {
  const [inputCode, setInputCode] = useState<string>(session.code || '');
  const [displayName, setDisplayName] = useState<string>('');
  const [answerText, setAnswerText] = useState<string>('');

  // 1. JOIN SCREEN
  if (!currentPlayer) {
    const handleJoinSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!inputCode.trim() || !displayName.trim()) {
        alert('Please enter a valid session code and display name.');
        return;
      }
      onJoin(inputCode.trim().toUpperCase(), displayName.trim());
    };

    return (
      <div className="min-h-[75vh] flex items-center justify-center p-2.5 sm:p-4 max-w-full">
        <div className="arcade-card arcade-card-gold p-4 sm:p-8 max-w-md w-full relative">
          
          <div className="text-center mb-4 sm:mb-6">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-2xl sm:text-3xl mx-auto mb-2 sm:mb-3 shadow-lg shadow-amber-500/20">
              📜
            </div>
            <h2 className="font-arcade text-lg sm:text-2xl font-black gold-gradient-text">
              JOIN THE ARENA
            </h2>
            <p className="text-slate-400 text-[11px] sm:text-xs mt-1">
              Enter session code and your name to join live competition.
            </p>
          </div>

          <form onSubmit={handleJoinSubmit} className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-amber-400 mb-1">
                GAME SESSION CODE
              </label>
              <input
                type="text"
                maxLength={6}
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                placeholder="e.g. ABC123"
                className="arcade-input font-arcade text-center text-xl sm:text-2xl font-black tracking-widest text-amber-300 uppercase py-2.5 sm:py-3"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                YOUR DISPLAY NAME
              </label>
              <input
                type="text"
                maxLength={20}
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. Samuel, Deborah"
                className="arcade-input font-semibold text-sm sm:text-lg py-2.5 sm:py-3"
                required
              />
            </div>

            <button
              type="submit"
              className="arcade-btn arcade-btn-primary w-full py-3 sm:py-4 text-xs sm:text-base shadow-xl shadow-amber-500/30 mt-1"
            >
              <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current" /> ENTER GAME SESSION
            </button>
          </form>

        </div>
      </div>
    );
  }

  // Current game info & current round
  const currentGameInfo = BIBLE_GAMES.find(g => g.id === session.currentGame) || BIBLE_GAMES[0];
  const currentRound = session.currentRound;
  
  // Check if player has already submitted for this active round
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

  return (
    <div className="max-w-xl mx-auto py-2 sm:py-6 space-y-3 sm:space-y-6 px-1.5 sm:px-4 max-w-full overflow-x-hidden">
      
      {/* Player Header Banner */}
      <div className="arcade-card p-3 sm:p-4 flex items-center justify-between border-amber-500/30 bg-slate-900/90 gap-2">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center font-arcade font-extrabold text-amber-400 flex-shrink-0 text-sm sm:text-base">
            👤
          </div>
          <div className="min-w-0">
            <h3 className="font-arcade font-bold text-white text-xs sm:text-base truncate">
              {currentPlayer.name}
            </h3>
            <span className="text-[9px] sm:text-[11px] font-semibold text-amber-400 font-mono block">
              CODE: {session.code}
            </span>
          </div>
        </div>

        <div className="text-right flex-shrink-0">
          <span className="font-arcade text-lg sm:text-2xl font-black gold-gradient-text block leading-none">
            {currentPlayer.score}
          </span>
          <span className="text-[8px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest block mt-0.5">
            POINTS
          </span>
        </div>
      </div>

      {/* Game Header Badge */}
      <div className="arcade-card p-2.5 sm:p-4 border-cyan-500/30 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <span className="text-xl sm:text-2xl flex-shrink-0">{currentGameInfo.icon}</span>
          <div className="min-w-0">
            <h4 className="font-arcade text-xs sm:text-sm font-bold text-white truncate">
              {currentGameInfo.title}
            </h4>
            <p className="text-[9px] sm:text-[11px] text-cyan-400 font-semibold uppercase truncate">
              {currentGameInfo.subtitle}
            </p>
          </div>
        </div>

        <span className={`arcade-badge text-[9px] sm:text-xs py-0.5 sm:py-1 px-1.5 sm:px-2.5 flex-shrink-0 ${
          session.status === 'LIVE' ? 'badge-green' : 'badge-gold'
        }`}>
          {session.status}
        </span>
      </div>

      {/* 2. WAITING FOR NEXT ROUND */}
      {(!currentRound || session.status === 'WAITING') && (
        <div className="arcade-card p-6 sm:p-8 text-center space-y-3 sm:space-y-4">
          <Clock className="w-8 h-8 sm:w-12 sm:h-12 text-amber-400 mx-auto" />
          <h3 className="font-arcade text-base sm:text-xl font-extrabold gold-gradient-text">
            WAITING FOR ADMIN...
          </h3>
          <p className="text-slate-400 text-[11px] sm:text-xs max-w-sm mx-auto">
            Get ready! The administrator will start the next question shortly.
          </p>
        </div>
      )}

      {/* 3. LIVE QUESTION VIEW */}
      {currentRound && session.status === 'LIVE' && (
        <div className="arcade-card arcade-card-gold p-3.5 sm:p-6 space-y-4 sm:space-y-6">
          
          {/* Timer bar if active */}
          {currentRound.timerDuration > 0 && (
            <div className="space-y-1 sm:space-y-1.5">
              <div className="flex items-center justify-between text-[10px] sm:text-xs font-arcade font-bold text-amber-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> TIME REMAINING:
                </span>
                <span className="font-mono text-sm sm:text-base">{currentRound.remainingSeconds}s</span>
              </div>
              <div className="timer-bar-container">
                <div 
                  className="timer-bar-fill" 
                  style={{ width: `${(currentRound.remainingSeconds / currentRound.timerDuration) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Question Text */}
          <div className="text-center bg-slate-950/80 rounded-xl p-3.5 sm:p-5 border border-white/10">
            <span className="arcade-badge badge-gold mb-1.5 text-[9px] sm:text-xs py-0.5 px-2">
              ROUND #{currentRound.roundNumber}
            </span>
            <h3 className="font-arcade text-base sm:text-2xl font-black text-white leading-snug break-words">
              {currentRound.questionText}
            </h3>
          </div>

          {/* SUBMISSION INPUT / LOCK STATE */}
          {isSubmitted ? (
            <div className="bg-emerald-500/10 border border-emerald-500/40 rounded-xl p-4 sm:p-6 text-center space-y-2">
              <CheckCircle className="w-8 h-8 sm:w-12 sm:h-12 text-emerald-400 mx-auto" />
              <h4 className="font-arcade text-base sm:text-lg font-bold text-emerald-300">
                ANSWER RECEIVED!
              </h4>
              <p className="text-xs text-slate-300 font-mono bg-slate-900/90 py-1.5 sm:py-2 px-3 sm:px-4 rounded-lg border border-white/10 inline-block max-w-full break-words">
                YOUR ANSWER: "{existingSubmission.answerText}"
              </p>
              <p className="text-[10px] sm:text-[11px] text-slate-400 pt-1">
                Timestamp recorded. Waiting for round evaluation...
              </p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              
              {/* GAME 2: Scripture or Spam Choices */}
              {session.currentGame === 'SCRIPTURE_OR_SPAM' && (
                <div className="grid grid-cols-1 xs:grid-cols-2 gap-2.5 sm:gap-4">
                  <button
                    onClick={() => handleChoiceSubmit('SCRIPTURE')}
                    className="arcade-choice-btn py-3.5 sm:py-5 text-xs sm:text-base font-arcade font-extrabold shadow-lg shadow-emerald-500/20 border border-emerald-500/40 hover:border-emerald-400"
                  >
                    📜 SCRIPTURE
                  </button>
                  <button
                    onClick={() => handleChoiceSubmit('SPAM QUOTE')}
                    className="arcade-choice-btn py-3.5 sm:py-5 text-xs sm:text-base font-arcade font-extrabold shadow-lg shadow-red-500/20 border border-red-500/40 hover:border-red-400"
                  >
                    🚫 SPAM QUOTE
                  </button>
                </div>
              )}

              {/* GAME 3: OT or NT Choices */}
              {session.currentGame === 'OT_OR_NT' && (
                <div className="grid grid-cols-1 xs:grid-cols-2 gap-2.5 sm:gap-4">
                  <button
                    onClick={() => handleChoiceSubmit('OLD TESTAMENT')}
                    className="arcade-choice-btn py-3.5 sm:py-5 text-xs sm:text-base font-arcade font-extrabold shadow-lg shadow-amber-500/20 border border-amber-500/40"
                  >
                    📜 OLD TESTAMENT
                  </button>
                  <button
                    onClick={() => handleChoiceSubmit('NEW TESTAMENT')}
                    className="arcade-choice-btn py-3.5 sm:py-5 text-xs sm:text-base font-arcade font-extrabold shadow-lg shadow-purple-500/20 border border-purple-500/40"
                  >
                    ✝️ NEW TESTAMENT
                  </button>
                </div>
              )}

              {/* GAME 1, 4, 5: Free Text Input */}
              {(session.currentGame === 'LETTER_RUSH' || session.currentGame === 'WHO_AM_I' || session.currentGame === 'BIBLE_COUPLES') && (
                <form onSubmit={handleFormSubmit} className="space-y-2.5 sm:space-y-3">
                  <div>
                    <label className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                      ENTER YOUR ANSWER
                    </label>
                    <input
                      type="text"
                      value={answerText}
                      onChange={(e) => setAnswerText(e.target.value)}
                      placeholder={
                        session.currentGame === 'LETTER_RUSH' 
                          ? `Character starting with '${currentRound.letter || 'M'}'` 
                          : session.currentGame === 'BIBLE_COUPLES'
                            ? `Partner for ${currentRound.givenName || 'Adam'}`
                            : 'Type character name...'
                      }
                      className="arcade-input font-bold text-sm sm:text-lg py-3 sm:py-4"
                      autoFocus
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="arcade-btn arcade-btn-primary w-full py-3 sm:py-4 text-xs sm:text-base shadow-xl shadow-amber-500/30"
                  >
                    <Send className="w-4 h-4 sm:w-5 sm:h-5" /> SUBMIT ANSWER NOW
                  </button>
                </form>
              )}

            </div>
          )}

        </div>
      )}

      {/* 4. ROUND CLOSED / REVIEW / RESULTS */}
      {currentRound && (session.status === 'CLOSED' || session.status === 'REVIEW') && (
        <div className="arcade-card p-4 sm:p-6 text-center space-y-2 sm:space-y-3">
          <Lock className="w-8 h-8 sm:w-10 sm:h-10 text-amber-400 mx-auto" />
          <h3 className="font-arcade text-base sm:text-lg font-bold text-white">
            ROUND SUBMISSIONS CLOSED
          </h3>
          <p className="text-[11px] sm:text-xs text-slate-400">
            The administrator is reviewing answers and official timestamps.
          </p>
        </div>
      )}

      {/* 5. RESULTS REVEALED */}
      {currentRound && session.status === 'RESULTS' && (
        <div className="arcade-card arcade-card-cyan p-4 sm:p-6 text-center space-y-3 sm:space-y-4">
          <h3 className="font-arcade text-base sm:text-xl font-extrabold cyan-gradient-text">
            ROUND RESULTS REVEALED
          </h3>
          <div className="bg-slate-900/90 p-3 sm:p-4 rounded-xl border border-white/10">
            <span className="text-[10px] sm:text-xs text-slate-400 block font-semibold">OFFICIAL CORRECT ANSWER:</span>
            <span className="font-arcade text-sm sm:text-lg font-bold text-amber-300 block mt-1 break-words">
              {currentRound.correctAnswerText}
            </span>
          </div>

          {existingSubmission && (
            <div className={`p-3 sm:p-4 rounded-xl border ${
              existingSubmission.status === 'CORRECT' 
                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300' 
                : 'bg-red-500/10 border-red-500/40 text-red-300'
            }`}>
              <span className="font-arcade text-xs sm:text-sm font-bold block">
                {existingSubmission.status === 'CORRECT' ? '🎉 YOU GOT IT RIGHT!' : '❌ INCORRECT'}
              </span>
              <span className="text-[10px] sm:text-xs font-mono block mt-1">
                Points awarded: +{existingSubmission.pointsAwarded}
              </span>
            </div>
          )}
        </div>
      )}

    </div>
  );
};

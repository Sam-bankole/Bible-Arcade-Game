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
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="arcade-card arcade-card-gold p-8 max-w-md w-full relative">
          
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-3xl mx-auto mb-3 shadow-lg shadow-amber-500/20">
              📜
            </div>
            <h2 className="font-arcade text-2xl font-black gold-gradient-text">
              JOIN THE ARENA
            </h2>
            <p className="text-slate-400 text-xs mt-1">
              Enter your session code and display name to enter the live game session.
            </p>
          </div>

          <form onSubmit={handleJoinSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-amber-400 mb-1.5">
                GAME SESSION CODE
              </label>
              <input
                type="text"
                maxLength={6}
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                placeholder="e.g. ABC123"
                className="arcade-input font-arcade text-center text-2xl font-black tracking-widest text-amber-300 uppercase"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                YOUR DISPLAY NAME
              </label>
              <input
                type="text"
                maxLength={20}
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. Samuel, Deborah, Daniel"
                className="arcade-input font-semibold text-lg"
                required
              />
            </div>

            <button
              type="submit"
              className="arcade-btn arcade-btn-primary w-full py-4 text-base shadow-xl shadow-amber-500/30 mt-2"
            >
              <Play className="w-5 h-5 fill-current" /> ENTER GAME SESSION
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
    <div className="max-w-xl mx-auto py-4 space-y-6">
      
      {/* Player Header Banner */}
      <div className="arcade-card p-4 flex items-center justify-between border-amber-500/30 bg-slate-900/90">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center font-arcade font-extrabold text-amber-400">
            👤
          </div>
          <div>
            <h3 className="font-arcade font-bold text-white text-base">
              {currentPlayer.name}
            </h3>
            <span className="text-[11px] font-semibold text-amber-400 font-mono">
              SESSION: {session.code}
            </span>
          </div>
        </div>

        <div className="text-right">
          <span className="font-arcade text-2xl font-black gold-gradient-text block">
            {currentPlayer.score}
          </span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
            POINTS
          </span>
        </div>
      </div>

      {/* Game Header Badge */}
      <div className="arcade-card p-4 border-cyan-500/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{currentGameInfo.icon}</span>
          <div>
            <h4 className="font-arcade text-sm font-bold text-white">
              {currentGameInfo.title}
            </h4>
            <p className="text-[11px] text-cyan-400 font-semibold uppercase">
              {currentGameInfo.subtitle}
            </p>
          </div>
        </div>

        <span className={`arcade-badge ${
          session.status === 'LIVE' ? 'badge-green' : 'badge-gold'
        }`}>
          {session.status}
        </span>
      </div>

      {/* 2. WAITING FOR NEXT ROUND */}
      {(!currentRound || session.status === 'WAITING') && (
        <div className="arcade-card p-8 text-center space-y-4">
          <Clock className="w-12 h-12 text-amber-400 mx-auto" />
          <h3 className="font-arcade text-xl font-extrabold gold-gradient-text">
            WAITING FOR ADMIN...
          </h3>
          <p className="text-slate-400 text-xs max-w-sm mx-auto">
            Get ready! The administrator will start the next question shortly.
          </p>
        </div>
      )}

      {/* 3. LIVE QUESTION VIEW */}
      {currentRound && session.status === 'LIVE' && (
        <div className="arcade-card arcade-card-gold p-6 space-y-6">
          
          {/* Timer bar if active */}
          {currentRound.timerDuration > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-arcade font-bold text-amber-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> TIME REMAINING:
                </span>
                <span className="font-mono text-base">{currentRound.remainingSeconds}s</span>
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
          <div className="text-center py-4 bg-slate-950/70 rounded-xl p-5 border border-white/10">
            <span className="arcade-badge badge-gold mb-2">ROUND #{currentRound.roundNumber}</span>
            <h3 className="font-arcade text-xl sm:text-2xl font-bold text-white leading-snug">
              {currentRound.questionText}
            </h3>
          </div>

          {/* SUBMISSION INPUT / LOCK STATE */}
          {isSubmitted ? (
            <div className="bg-emerald-500/10 border border-emerald-500/40 rounded-xl p-6 text-center space-y-2">
              <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto" />
              <h4 className="font-arcade text-lg font-bold text-emerald-300">
                ANSWER RECEIVED!
              </h4>
              <p className="text-xs text-slate-300 font-mono bg-slate-900/90 py-2 px-4 rounded-lg border border-white/10 inline-block">
                YOUR ANSWER: "{existingSubmission.answerText}"
              </p>
              <p className="text-[11px] text-slate-400 pt-2">
                System timestamp recorded. Waiting for round to close...
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              
              {/* GAME 2: Scripture or Spam Choices */}
              {session.currentGame === 'SCRIPTURE_OR_SPAM' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    onClick={() => handleChoiceSubmit('SCRIPTURE')}
                    className="arcade-choice-btn py-5"
                  >
                    📜 SCRIPTURE
                  </button>
                  <button
                    onClick={() => handleChoiceSubmit('SPAM QUOTE')}
                    className="arcade-choice-btn py-5"
                  >
                    🚫 SPAM QUOTE
                  </button>
                </div>
              )}

              {/* GAME 3: OT or NT Choices */}
              {session.currentGame === 'OT_OR_NT' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    onClick={() => handleChoiceSubmit('OLD TESTAMENT')}
                    className="arcade-choice-btn py-5"
                  >
                    📜 OLD TESTAMENT
                  </button>
                  <button
                    onClick={() => handleChoiceSubmit('NEW TESTAMENT')}
                    className="arcade-choice-btn py-5"
                  >
                    ✝️ NEW TESTAMENT
                  </button>
                </div>
              )}

              {/* GAME 1, 4, 5: Free Text Input */}
              {(session.currentGame === 'LETTER_RUSH' || session.currentGame === 'WHO_AM_I' || session.currentGame === 'BIBLE_COUPLES') && (
                <form onSubmit={handleFormSubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
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
                      className="arcade-input font-bold text-lg py-4"
                      autoFocus
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="arcade-btn arcade-btn-primary w-full py-4 text-base shadow-xl shadow-amber-500/30"
                  >
                    <Send className="w-5 h-5" /> SUBMIT ANSWER NOW
                  </button>
                </form>
              )}

            </div>
          )}

        </div>
      )}

      {/* 4. ROUND CLOSED / REVIEW / RESULTS */}
      {currentRound && (session.status === 'CLOSED' || session.status === 'REVIEW') && (
        <div className="arcade-card p-6 text-center space-y-3">
          <Lock className="w-10 h-10 text-amber-400 mx-auto" />
          <h3 className="font-arcade text-lg font-bold text-white">
            ROUND SUBMISSIONS CLOSED
          </h3>
          <p className="text-xs text-slate-400">
            The administrator is currently reviewing official timestamps and answers.
          </p>
        </div>
      )}

      {/* 5. RESULTS REVEALED */}
      {currentRound && session.status === 'RESULTS' && (
        <div className="arcade-card arcade-card-cyan p-6 text-center space-y-4">
          <h3 className="font-arcade text-xl font-extrabold cyan-gradient-text">
            ROUND RESULTS REVEALED
          </h3>
          <div className="bg-slate-900/90 p-4 rounded-xl border border-white/10">
            <span className="text-xs text-slate-400 block font-semibold">OFFICIAL CORRECT ANSWER:</span>
            <span className="font-arcade text-lg font-bold text-amber-300 block mt-1">
              {currentRound.correctAnswerText}
            </span>
          </div>

          {existingSubmission && (
            <div className={`p-4 rounded-xl border ${
              existingSubmission.status === 'CORRECT' 
                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300' 
                : 'bg-red-500/10 border-red-500/40 text-red-300'
            }`}>
              <span className="font-arcade text-sm font-bold block">
                {existingSubmission.status === 'CORRECT' ? '🎉 YOU GOT IT RIGHT!' : '❌ INCORRECT'}
              </span>
              <span className="text-xs font-mono block mt-1">
                Points awarded: +{existingSubmission.pointsAwarded}
              </span>
            </div>
          )}
        </div>
      )}

    </div>
  );
};

import React from 'react';
import type { GameSession, AnswerItem } from '../types/game';
import { BIBLE_GAMES } from '../data/games';
import { Trophy, Clock, Tv } from 'lucide-react';

interface ProjectorDisplayProps {
  session: GameSession;
  onExit: () => void;
}

export const ProjectorDisplay: React.FC<ProjectorDisplayProps> = ({
  session,
  onExit
}) => {
  const currentGameInfo = BIBLE_GAMES.find(g => g.id === session.currentGame) || BIBLE_GAMES[0];
  const currentRound = session.currentRound;

  // Answers for current round
  const roundAnswers: AnswerItem[] = (currentRound && session.answers[currentRound.id]) || [];
  const sortedAnswers = [...roundAnswers].sort((a, b) => a.rawOfficialMs - b.rawOfficialMs);
  const winners = sortedAnswers.filter(a => a.isWinner || a.status === 'CORRECT');

  // Overall player leaderboard
  const topPlayers = Object.values(session.players)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  return (
    <div className="fixed inset-0 z-50 bg-[#07080d] text-white flex flex-col justify-between p-3 sm:p-6 md:p-8 lg:p-10 overflow-y-auto overflow-x-hidden max-w-full font-main scrollbar-thin">
      
      {/* Background ambient lighting */}
      <div className="absolute -top-32 -left-32 w-64 sm:w-96 h-64 sm:h-96 rounded-full bg-amber-500/10 blur-[100px] sm:blur-[120px] pointer-events-none overflow-hidden" />
      <div className="absolute -bottom-32 -right-32 w-64 sm:w-96 h-64 sm:h-96 rounded-full bg-purple-500/10 blur-[100px] sm:blur-[120px] pointer-events-none overflow-hidden" />

      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-white/10 pb-4 sm:pb-6 relative z-10">
        <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-xl sm:text-3xl shadow-xl shadow-amber-500/20 flex-shrink-0">
              {currentGameInfo.icon}
            </div>
            <div>
              <h1 className="font-arcade text-lg sm:text-2xl md:text-3xl font-black gold-gradient-text tracking-wider leading-tight">
                {currentGameInfo.title}
              </h1>
              <p className="text-[10px] sm:text-xs md:text-sm font-bold uppercase tracking-widest text-amber-400">
                {currentGameInfo.subtitle}
              </p>
            </div>
          </div>

          {/* Mobile Session Join Code */}
          <div className="sm:hidden px-3 py-1.5 rounded-xl bg-slate-900/90 border border-amber-500/40 text-right">
            <div className="text-[9px] font-bold text-slate-400 uppercase">CODE</div>
            <div className="font-arcade text-lg font-black text-amber-300 font-mono tracking-wider">{session.code}</div>
          </div>
        </div>

        {/* Center Desktop: Session Join Code */}
        <div className="hidden sm:flex items-center gap-3 px-4 sm:px-6 py-2 sm:py-3 rounded-2xl bg-slate-900/90 border border-amber-500/40 shadow-2xl">
          <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest">JOIN AT WEBSITE WITH CODE:</span>
          <span className="font-arcade text-xl sm:text-3xl font-black text-amber-300 tracking-widest font-mono">{session.code}</span>
        </div>

        {/* Right: Exit / Fullscreen */}
        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-end">
          <button
            onClick={() => {
              if (document.fullscreenElement) {
                document.exitFullscreen();
              } else {
                document.documentElement.requestFullscreen();
              }
            }}
            className="arcade-btn arcade-btn-secondary text-[11px] sm:text-xs py-1.5 sm:py-2 px-2.5 sm:px-4"
          >
            <Tv className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> <span className="hidden sm:inline">TOGGLE</span> FULLSCREEN
          </button>

          <button
            onClick={onExit}
            className="arcade-btn arcade-btn-secondary text-[11px] sm:text-xs py-1.5 sm:py-2 px-2.5 sm:px-4"
          >
            EXIT
          </button>
        </div>
      </div>

      {/* Main Center Area */}
      <div className="my-4 sm:my-auto py-4 sm:py-8 grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-8 relative z-10 items-stretch sm:items-center">
        
        {/* Left / Main Section (8 Cols): Current Challenge & Live Status */}
        <div className="lg:col-span-8 space-y-4 sm:space-y-6">
          
          {currentRound ? (
            <div className="arcade-card arcade-card-gold p-5 sm:p-8 md:p-12 text-center relative overflow-hidden">
              
              {/* Status Badge */}
              <div className="flex justify-center mb-3 sm:mb-4">
                <span className="arcade-badge badge-gold text-xs sm:text-sm py-1 sm:py-1.5 px-3 sm:px-5">
                  ROUND #{currentRound.roundNumber} • {session.status}
                </span>
              </div>

              {/* Countdown Timer Display */}
              {currentRound.timerDuration > 0 && session.status === 'LIVE' && (
                <div className="mb-4 sm:mb-6 inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-1.5 sm:py-2 rounded-full bg-slate-950/80 border border-amber-500/40 text-amber-400 font-mono text-lg sm:text-2xl font-black shadow-lg">
                  <Clock className="w-4 h-4 sm:w-6 sm:h-6" />
                  <span>{currentRound.remainingSeconds} SECONDS</span>
                </div>
              )}

              {/* Responsive Question Text */}
              <h2 className="font-arcade text-xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white leading-snug sm:leading-tight mb-4 sm:mb-6 break-words">
                {currentRound.questionText}
              </h2>

              {/* Revealed Answer & Winners */}
              {session.status === 'RESULTS' && (
                <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-white/10 space-y-4">
                  <div className="inline-block bg-slate-900/90 px-4 sm:px-8 py-3 sm:py-4 rounded-2xl border border-amber-500/40 max-w-full">
                    <span className="text-[10px] sm:text-xs text-slate-400 font-semibold uppercase block">OFFICIAL ANSWER</span>
                    <span className="font-arcade text-lg sm:text-2xl md:text-3xl font-extrabold text-amber-300 block mt-1 break-words">
                      {currentRound.correctAnswerText}
                    </span>
                  </div>

                  {winners.length > 0 && (
                    <div className="pt-2 sm:pt-4">
                      <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2 sm:mb-3">
                        🏆 APPROVED WINNING SUBMISSIONS
                      </span>
                      <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
                        {winners.slice(0, 3).map((w, idx) => (
                          <div 
                            key={w.id} 
                            className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-amber-500/20 border border-amber-500/40 font-arcade text-xs sm:text-sm font-bold text-amber-300 flex items-center gap-1.5 sm:gap-2"
                          >
                            <span>{idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}</span>
                            <span>{w.playerName}:</span>
                            <span className="text-white font-mono font-bold">"{w.answerText}"</span>
                            <span className="font-mono text-[10px] sm:text-xs opacity-75">({w.officialTimestamp})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>
          ) : (
            <div className="arcade-card p-6 sm:p-12 text-center space-y-3 sm:space-y-4">
              <h2 className="font-arcade text-xl sm:text-3xl font-black gold-gradient-text">
                ARENA READY
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm max-w-md mx-auto">
                Waiting for the administrator to launch the next Bible challenge...
              </p>
            </div>
          )}

        </div>

        {/* Right Section (4 Cols): Live Leaderboard Podium */}
        <div className="lg:col-span-4 space-y-4">
          <div className="arcade-card arcade-card-cyan p-4 sm:p-6">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3 sm:mb-4">
              <h3 className="font-arcade text-base sm:text-lg font-bold cyan-gradient-text flex items-center gap-2">
                <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" /> TOP STANDINGS
              </h3>
              <span className="text-[10px] sm:text-xs font-bold text-slate-400">LIVE SCORE</span>
            </div>

            {topPlayers.length === 0 ? (
              <div className="text-center py-6 sm:py-8 text-slate-500 text-xs">
                No scores recorded yet.
              </div>
            ) : (
              <div className="space-y-2 sm:space-y-2.5">
                {topPlayers.map((p, idx) => (
                  <div
                    key={p.id}
                    className={`p-2.5 sm:p-3 rounded-xl border flex items-center justify-between ${
                      idx === 0 
                        ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 font-bold' 
                        : 'bg-slate-900/80 border-white/10 text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 sm:gap-3 font-arcade min-w-0">
                      <span className="font-black text-xs sm:text-sm flex-shrink-0">#{idx + 1}</span>
                      <span className="text-xs sm:text-sm tracking-wide truncate">{p.name}</span>
                    </div>
                    <span className="font-arcade font-extrabold text-amber-400 text-sm sm:text-lg flex-shrink-0 ml-2">
                      {p.score} PTS
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Bottom Footer Ticker */}
      <div className="border-t border-white/10 pt-3 sm:pt-4 flex flex-col sm:flex-row items-center justify-between gap-1 sm:gap-2 text-[10px] sm:text-xs text-slate-500 relative z-10 text-center sm:text-left">
        <span className="font-arcade uppercase tracking-wider text-slate-400">
          BIBLE GAME ARCADE • LIVE EVENT EDITION
        </span>
        <span className="font-mono text-amber-400">
          OFFICIAL TIMESTAMP DRIVEN ARCHITECTURE
        </span>
      </div>

    </div>
  );
};

import React, { useState } from 'react';
import type { GameType, GameRound } from '../types/game';
import { BIBLE_GAMES } from '../data/games';
import { PresetQuestionModal } from './PresetQuestionModal';
import { Clock, Play } from 'lucide-react';

interface AdminQuestionFormProps {
  gameType: GameType;
  onStartRound: (roundData: Partial<GameRound>) => void;
}

export const AdminQuestionForm: React.FC<AdminQuestionFormProps> = ({
  gameType,
  onStartRound
}) => {
  const currentGameInfo = BIBLE_GAMES.find(g => g.id === gameType) || BIBLE_GAMES[0];

  // Form State
  const [timerSeconds, setTimerSeconds] = useState<number>(30);
  const [isPresetModalOpen, setIsPresetModalOpen] = useState<boolean>(false);

  // Game 1: Letter Rush
  const [letter, setLetter] = useState<string>('M');

  // Game 2: Scripture or Spam
  const [quote, setQuote] = useState<string>('"I can do all things through Christ who strengthens me."');
  const [isScripture, setIsScripture] = useState<boolean>(true);

  // Game 3: OT or NT
  const [reference, setReference] = useState<string>('David and Goliath');
  const [testament, setTestament] = useState<'OT' | 'NT'>('OT');

  // Game 4: Who Am I?
  const [description, setDescription] = useState<string>('I was a shepherd boy who defeated a giant with a sling and later became king of Israel.');
  const [characterName, setCharacterName] = useState<string>('David');

  // Game 5: Bible Couples
  const [givenName, setGivenName] = useState<string>('Adam');
  const [partnerName, setPartnerName] = useState<string>('Eve');

  // Load preset data into form state
  const handleLoadPreset = (data: Partial<GameRound>) => {
    if (data.letter) setLetter(data.letter);
    if (data.quote !== undefined) setQuote(data.quote);
    if (data.isScripture !== undefined) setIsScripture(data.isScripture);
    if (data.reference) setReference(data.reference);
    if (data.testament) setTestament(data.testament);
    if (data.description) setDescription(data.description);
    if (data.characterName) setCharacterName(data.characterName);
    if (data.givenName) setGivenName(data.givenName);
    if (data.partnerName) setPartnerName(data.partnerName);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let roundPayload: Partial<GameRound> = {
      gameType,
      timerDuration: timerSeconds
    };

    switch (gameType) {
      case 'LETTER_RUSH': {
        const targetLetter = letter.trim().toUpperCase().charAt(0) || 'A';
        roundPayload = {
          ...roundPayload,
          letter: targetLetter,
          acceptedAnswers: [],
          questionText: `Letter: ${targetLetter} — Name a Bible character, book, or place starting with this letter.`,
          correctAnswerText: `Manual Admin Evaluation (Answers starting with '${targetLetter}')`
        };
        break;
      }

      case 'SCRIPTURE_OR_SPAM': {
        roundPayload = {
          ...roundPayload,
          quote: quote.trim(),
          isScripture,
          questionText: quote.trim(),
          correctAnswerText: isScripture ? 'SCRIPTURE' : 'SPAM QUOTE'
        };
        break;
      }

      case 'OT_OR_NT': {
        roundPayload = {
          ...roundPayload,
          reference: reference.trim(),
          testament,
          questionText: reference.trim(),
          correctAnswerText: testament === 'OT' ? 'OLD TESTAMENT' : 'NEW TESTAMENT'
        };
        break;
      }

      case 'WHO_AM_I': {
        roundPayload = {
          ...roundPayload,
          description: description.trim(),
          characterName: characterName.trim(),
          questionText: description.trim(),
          correctAnswerText: characterName.trim()
        };
        break;
      }

      case 'BIBLE_COUPLES': {
        roundPayload = {
          ...roundPayload,
          givenName: givenName.trim(),
          partnerName: partnerName.trim(),
          questionText: `Given Name: ${givenName.trim()} — Who is the partner?`,
          correctAnswerText: partnerName.trim()
        };
        break;
      }
    }

    onStartRound(roundPayload);
  };

  return (
    <div className="arcade-card arcade-card-gold p-3.5 sm:p-6 max-w-full overflow-x-hidden">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3.5 sm:pb-4 border-b border-white/10 mb-4 sm:mb-6">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-lg sm:text-xl flex-shrink-0">
            {currentGameInfo.icon}
          </div>
          <div>
            <h3 className="font-arcade text-sm sm:text-lg font-bold text-white tracking-wide leading-tight">
              {currentGameInfo.title}
            </h3>
            <p className="text-[10px] sm:text-xs text-amber-400 font-semibold uppercase">
              {currentGameInfo.subtitle}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsPresetModalOpen(true)}
          className="arcade-btn arcade-btn-secondary text-[10px] sm:text-xs py-1.5 sm:py-2 px-2.5 sm:px-3 flex items-center gap-1.5 w-full sm:w-auto justify-center"
        >
          <span>LOAD PRESET QUESTION</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        
        {/* GAME SPECIFIC INPUTS */}

        {/* 1. LETTER RUSH */}
        {gameType === 'LETTER_RUSH' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-amber-400 mb-2">
                TARGET BIBLE LETTER
              </label>
              <input
                type="text"
                maxLength={1}
                value={letter}
                onChange={(e) => setLetter(e.target.value.toUpperCase())}
                className="arcade-input font-arcade text-3xl font-black text-center text-amber-300 w-24 uppercase"
                required
              />
            </div>

            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
              ℹ️ <strong>Manual Admin Evaluation Mode:</strong> Letter Rush has no fixed official answer. Contestants submit answers starting with letter <strong className="text-white uppercase font-bold font-mono text-sm">{letter || 'A'}</strong>, and the Admin manually evaluates submissions in the live queue to award points (+10, +7, +5) and declare official round winners!
            </div>
          </div>
        )}

        {/* 2. SCRIPTURE OR SPAM */}
        {gameType === 'SCRIPTURE_OR_SPAM' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-amber-400 mb-2">
                QUOTE TO DISPLAY
              </label>
              <textarea
                value={quote}
                onChange={(e) => setQuote(e.target.value)}
                rows={3}
                className="arcade-input font-medium"
                placeholder='Enter quote e.g., "I can do all things through Christ..."'
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                OFFICIAL CORRECT ANSWER
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setIsScripture(true)}
                  className={`arcade-choice-btn py-3 text-sm ${
                    isScripture ? 'selected' : ''
                  }`}
                >
                  📜 SCRIPTURE
                </button>
                <button
                  type="button"
                  onClick={() => setIsScripture(false)}
                  className={`arcade-choice-btn py-3 text-sm ${
                    !isScripture ? 'selected' : ''
                  }`}
                >
                  🚫 SPAM QUOTE
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 3. OT OR NT */}
        {gameType === 'OT_OR_NT' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-amber-400 mb-2">
                BIBLE NAME / EVENT / LOCATION / BOOK
              </label>
              <input
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="e.g. David and Goliath, Pentecost, Noah's Ark"
                className="arcade-input font-semibold text-lg"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                OFFICIAL TESTAMENT
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setTestament('OT')}
                  className={`arcade-choice-btn py-3 text-sm ${
                    testament === 'OT' ? 'selected' : ''
                  }`}
                >
                  📜 OLD TESTAMENT
                </button>
                <button
                  type="button"
                  onClick={() => setTestament('NT')}
                  className={`arcade-choice-btn py-3 text-sm ${
                    testament === 'NT' ? 'selected' : ''
                  }`}
                >
                  ✝️ NEW TESTAMENT
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 4. WHO AM I? */}
        {gameType === 'WHO_AM_I' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-amber-400 mb-2">
                CHARACTER MYSTERY DESCRIPTION
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="I was a shepherd boy who defeated a giant..."
                className="arcade-input"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                CORRECT CHARACTER NAME
              </label>
              <input
                type="text"
                value={characterName}
                onChange={(e) => setCharacterName(e.target.value)}
                placeholder="e.g. David"
                className="arcade-input font-bold"
                required
              />
            </div>
          </div>
        )}

        {/* 5. BIBLE COUPLES */}
        {gameType === 'BIBLE_COUPLES' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-amber-400 mb-2">
                GIVEN NAME (PROMPTED TO PLAYERS)
              </label>
              <input
                type="text"
                value={givenName}
                onChange={(e) => setGivenName(e.target.value)}
                placeholder="e.g. Adam"
                className="arcade-input font-bold"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                CORRECT PARTNER NAME
              </label>
              <input
                type="text"
                value={partnerName}
                onChange={(e) => setPartnerName(e.target.value)}
                placeholder="e.g. Eve"
                className="arcade-input font-bold"
                required
              />
            </div>
          </div>
        )}

        {/* TIMER CONFIGURATION */}
        <div className="pt-4 border-t border-white/10">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-cyan-400" />
            COUNTDOWN TIMER DURATION
          </label>
          <div className="flex flex-wrap gap-2">
            {[0, 10, 15, 20, 30, 60].map((seconds) => (
              <button
                key={seconds}
                type="button"
                onClick={() => setTimerSeconds(seconds)}
                className={`px-4 py-2 rounded-xl text-xs font-bold font-arcade border transition-all ${
                  timerSeconds === seconds
                    ? 'bg-cyan-500 text-black border-cyan-400 shadow-md shadow-cyan-500/20'
                    : 'bg-slate-900 text-slate-300 border-white/10 hover:border-white/20'
                }`}
              >
                {seconds === 0 ? 'NO TIMER' : `${seconds} SEC`}
              </button>
            ))}
          </div>
        </div>

        {/* START ROUND BUTTON */}
        <div className="pt-2">
          <button
            type="submit"
            className="arcade-btn arcade-btn-primary w-full py-4 text-base shadow-lg shadow-amber-500/30"
          >
            <Play className="w-5 h-5" /> START ROUND NOW
          </button>
        </div>

      </form>

      {/* Preset Modal */}
      <PresetQuestionModal
        gameType={gameType}
        isOpen={isPresetModalOpen}
        onClose={() => setIsPresetModalOpen(false)}
        onSelectPreset={handleLoadPreset}
      />
    </div>
  );
};

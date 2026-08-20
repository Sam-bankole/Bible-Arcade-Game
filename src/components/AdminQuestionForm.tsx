import React, { useState } from 'react';
import type { GameType, GameRound } from '../types/game';
import { BIBLE_GAMES } from '../data/games';
import { PresetQuestionModal } from './PresetQuestionModal';
import { Play, BookOpen } from 'lucide-react';

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
          correctAnswerText: `Letter '${targetLetter}'`
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
    <div className="ctrl-card p-4 sm:p-5 space-y-4">
      
      {/* Header: Mode Name & Preset Loader */}
      <div className="flex items-center justify-between pb-3 border-b border-[#232838]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-amber-500 uppercase tracking-wider">
              {currentGameInfo.title}
            </span>
            <span className="text-xs text-zinc-500">•</span>
            <span className="text-xs text-zinc-400 font-medium">
              Round Setup
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsPresetModalOpen(true)}
          className="ctrl-btn ctrl-btn-secondary text-xs py-1 px-2.5 flex items-center gap-1.5"
        >
          <BookOpen className="w-3.5 h-3.5 opacity-70" />
          <span>Presets</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* GAME SPECIFIC INPUTS */}

        {/* 1. LETTER RUSH */}
        {gameType === 'LETTER_RUSH' && (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                Target Bible Letter
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  maxLength={1}
                  value={letter}
                  onChange={(e) => setLetter(e.target.value.toUpperCase())}
                  className="font-mono-tabular text-3xl font-black text-center text-amber-400 w-20 py-2 rounded-lg bg-[#0e1017] border border-[#2e354a] focus:border-amber-500 uppercase outline-none"
                  required
                />
                <div className="text-xs text-zinc-400 leading-relaxed">
                  Contestants race to name characters, books, or places starting with <strong className="text-amber-400 font-mono font-bold">"{letter || 'A'}"</strong>. Fastest arrival gets reviewed first.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. SCRIPTURE OR SPAM */}
        {gameType === 'SCRIPTURE_OR_SPAM' && (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                Quote to Display
              </label>
              <textarea
                value={quote}
                onChange={(e) => setQuote(e.target.value)}
                rows={3}
                className="ctrl-input text-xs"
                placeholder='Enter quote e.g., "I can do all things through Christ..."'
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                Correct Classification
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setIsScripture(true)}
                  className={`py-2 text-xs font-bold rounded-lg border transition-colors ${
                    isScripture 
                      ? 'bg-zinc-200 text-zinc-900 border-zinc-200' 
                      : 'bg-[#10121a] text-zinc-400 border-[#2e354a] hover:text-zinc-200'
                  }`}
                >
                  Scripture
                </button>
                <button
                  type="button"
                  onClick={() => setIsScripture(false)}
                  className={`py-2 text-xs font-bold rounded-lg border transition-colors ${
                    !isScripture 
                      ? 'bg-zinc-200 text-zinc-900 border-zinc-200' 
                      : 'bg-[#10121a] text-zinc-400 border-[#2e354a] hover:text-zinc-200'
                  }`}
                >
                  Spam Quote
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 3. OT OR NT */}
        {gameType === 'OT_OR_NT' && (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                Bible Reference / Character / Event
              </label>
              <input
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="e.g. David and Goliath, Pentecost"
                className="ctrl-input text-xs"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                Official Testament
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTestament('OT')}
                  className={`py-2 text-xs font-bold rounded-lg border transition-colors ${
                    testament === 'OT' 
                      ? 'bg-zinc-200 text-zinc-900 border-zinc-200' 
                      : 'bg-[#10121a] text-zinc-400 border-[#2e354a] hover:text-zinc-200'
                  }`}
                >
                  Old Testament
                </button>
                <button
                  type="button"
                  onClick={() => setTestament('NT')}
                  className={`py-2 text-xs font-bold rounded-lg border transition-colors ${
                    testament === 'NT' 
                      ? 'bg-zinc-200 text-zinc-900 border-zinc-200' 
                      : 'bg-[#10121a] text-zinc-400 border-[#2e354a] hover:text-zinc-200'
                  }`}
                >
                  New Testament
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 4. WHO AM I? */}
        {gameType === 'WHO_AM_I' && (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                Character Clues
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="I was a shepherd boy who defeated a giant..."
                className="ctrl-input text-xs"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                Correct Character Name
              </label>
              <input
                type="text"
                value={characterName}
                onChange={(e) => setCharacterName(e.target.value)}
                placeholder="e.g. David"
                className="ctrl-input text-xs"
                required
              />
            </div>
          </div>
        )}

        {/* 5. BIBLE COUPLES */}
        {gameType === 'BIBLE_COUPLES' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                Given Name (Prompt)
              </label>
              <input
                type="text"
                value={givenName}
                onChange={(e) => setGivenName(e.target.value)}
                placeholder="e.g. Adam"
                className="ctrl-input text-xs"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                Correct Partner
              </label>
              <input
                type="text"
                value={partnerName}
                onChange={(e) => setPartnerName(e.target.value)}
                placeholder="e.g. Eve"
                className="ctrl-input text-xs"
                required
              />
            </div>
          </div>
        )}

        {/* TIMER DURATION SELECTOR */}
        <div className="pt-3 border-t border-[#232838] space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
            Round Timer
          </label>
          <div className="flex flex-wrap gap-1.5">
            {[0, 10, 15, 20, 30, 60].map((seconds) => (
              <button
                key={seconds}
                type="button"
                onClick={() => setTimerSeconds(seconds)}
                className={`px-3 py-1.5 rounded text-xs font-semibold font-mono-tabular border transition-colors ${
                  timerSeconds === seconds
                    ? 'bg-zinc-200 text-zinc-950 font-bold border-zinc-200'
                    : 'bg-[#10121a] text-zinc-400 border-[#2e354a] hover:text-zinc-200'
                }`}
              >
                {seconds === 0 ? 'Off' : `${seconds}s`}
              </button>
            ))}
          </div>
        </div>

        {/* START ROUND ACTION BUTTON */}
        <div className="pt-2">
          <button
            type="submit"
            className="ctrl-btn ctrl-btn-primary w-full py-3 text-sm font-bold flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4 fill-zinc-950" />
            <span>Start Round</span>
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

import React, { useState } from 'react';
import type { GameType, GameRound } from '../types/game';
import { BIBLE_GAMES } from '../data/games';
import { PresetQuestionModal } from './PresetQuestionModal';
import { Play, BookOpen, Target } from 'lucide-react';

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
    <div className="tactics-card p-4 sm:p-5 space-y-4">
      
      {/* Header: Format Name & Preset Loader */}
      <div className="flex items-center justify-between pb-3 border-b border-[#1c2130]">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-[#ccff00]" />
          <div>
            <h3 className="font-display text-sm font-black uppercase tracking-wider text-white">
              {currentGameInfo.title} Setup
            </h3>
            <span className="text-[10px] text-slate-400 font-semibold uppercase">
              Configure Target & Timer
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsPresetModalOpen(true)}
          className="tactics-btn tactics-btn-secondary text-xs py-1 px-3 rounded-lg flex items-center gap-1.5"
        >
          <BookOpen className="w-3.5 h-3.5 text-[#ccff00]" />
          <span>Presets</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* GAME SPECIFIC INPUTS */}

        {/* 1. LETTER RUSH */}
        {gameType === 'LETTER_RUSH' && (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-300 mb-1.5">
                Target Bible Letter
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  maxLength={1}
                  value={letter}
                  onChange={(e) => setLetter(e.target.value.toUpperCase())}
                  className="font-mono-tabular text-3xl font-black text-center text-[#ccff00] w-20 py-2.5 rounded-xl bg-[#0c0e15] border-2 border-[#272d42] focus:border-[#ccff00] shadow-inner uppercase outline-none"
                  required
                />
                <div className="text-xs text-slate-300 leading-relaxed bg-[#0c0e15] p-3 rounded-xl border border-[#1c2130] flex-1">
                  Contestants race to name characters, books, or places starting with <strong className="text-[#ccff00] font-mono text-sm">"{letter || 'A'}"</strong>.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. SCRIPTURE OR SPAM */}
        {gameType === 'SCRIPTURE_OR_SPAM' && (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-300 mb-1.5">
                Quote to Display
              </label>
              <textarea
                value={quote}
                onChange={(e) => setQuote(e.target.value)}
                rows={3}
                className="tactics-input text-xs"
                placeholder='Enter quote e.g., "I can do all things through Christ..."'
                required
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-300 mb-1.5">
                Correct Classification
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setIsScripture(true)}
                  className={`py-2 text-xs font-black rounded-lg border transition-all ${
                    isScripture 
                      ? 'bg-[#ccff00] text-black border-[#ccff00] shadow-[0_0_12px_rgba(204,255,0,0.2)]' 
                      : 'bg-[#0c0e15] text-slate-400 border-[#1c2130]'
                  }`}
                >
                  SCRIPTURE
                </button>
                <button
                  type="button"
                  onClick={() => setIsScripture(false)}
                  className={`py-2 text-xs font-black rounded-lg border transition-all ${
                    !isScripture 
                      ? 'bg-rose-500 text-white border-rose-500 shadow-md' 
                      : 'bg-[#0c0e15] text-slate-400 border-[#1c2130]'
                  }`}
                >
                  SPAM QUOTE
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 3. OT OR NT */}
        {gameType === 'OT_OR_NT' && (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-300 mb-1.5">
                Bible Reference / Character
              </label>
              <input
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="e.g. David and Goliath, Pentecost"
                className="tactics-input text-xs"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-300 mb-1.5">
                Official Testament
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTestament('OT')}
                  className={`py-2 text-xs font-black rounded-lg border transition-all ${
                    testament === 'OT' 
                      ? 'bg-[#ccff00] text-black border-[#ccff00] shadow-[0_0_12px_rgba(204,255,0,0.2)]' 
                      : 'bg-[#0c0e15] text-slate-400 border-[#1c2130]'
                  }`}
                >
                  OLD TESTAMENT
                </button>
                <button
                  type="button"
                  onClick={() => setTestament('NT')}
                  className={`py-2 text-xs font-black rounded-lg border transition-all ${
                    testament === 'NT' 
                      ? 'bg-[#ccff00] text-black border-[#ccff00] shadow-[0_0_12px_rgba(204,255,0,0.2)]' 
                      : 'bg-[#0c0e15] text-slate-400 border-[#1c2130]'
                  }`}
                >
                  NEW TESTAMENT
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 4. WHO AM I? */}
        {gameType === 'WHO_AM_I' && (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-300 mb-1.5">
                Character Clues
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="I was a shepherd boy who defeated a giant..."
                className="tactics-input text-xs"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-300 mb-1.5">
                Correct Character Name
              </label>
              <input
                type="text"
                value={characterName}
                onChange={(e) => setCharacterName(e.target.value)}
                placeholder="e.g. David"
                className="tactics-input text-xs"
                required
              />
            </div>
          </div>
        )}

        {/* 5. BIBLE COUPLES */}
        {gameType === 'BIBLE_COUPLES' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-300 mb-1.5">
                Given Name
              </label>
              <input
                type="text"
                value={givenName}
                onChange={(e) => setGivenName(e.target.value)}
                placeholder="e.g. Adam"
                className="tactics-input text-xs"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-300 mb-1.5">
                Correct Partner
              </label>
              <input
                type="text"
                value={partnerName}
                onChange={(e) => setPartnerName(e.target.value)}
                placeholder="e.g. Eve"
                className="tactics-input text-xs"
                required
              />
            </div>
          </div>
        )}

        {/* TIMER DURATION SELECTOR */}
        <div className="pt-2 border-t border-[#1c2130] space-y-2">
          <label className="block text-xs font-black uppercase tracking-wider text-slate-300">
            Round Timer Duration
          </label>
          <div className="flex flex-wrap gap-1.5">
            {[0, 10, 15, 20, 30, 60].map((seconds) => (
              <button
                key={seconds}
                type="button"
                onClick={() => setTimerSeconds(seconds)}
                className={`px-3 py-1.5 rounded-lg text-xs font-black font-mono-tabular border transition-all ${
                  timerSeconds === seconds
                    ? 'bg-[#ccff00] text-black border-[#ccff00] shadow-[0_0_10px_rgba(204,255,0,0.25)]'
                    : 'bg-[#0c0e15] text-slate-400 border-[#1c2130] hover:text-white'
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
            className="tactics-btn tactics-btn-primary w-full py-3 text-sm font-black flex items-center justify-center gap-2 rounded-xl shadow-lg hover:shadow-[0_0_24px_rgba(204,255,0,0.4)]"
          >
            <Play className="w-4 h-4 fill-black" />
            <span>START LIVE ROUND</span>
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

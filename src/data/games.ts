import type { GameInfo } from '../types/game';

export const BIBLE_GAMES: GameInfo[] = [
  {
    id: 'LETTER_RUSH',
    number: '01',
    title: 'LETTER RUSH',
    subtitle: 'Bible Character Challenge',
    description: 'The admin picks a letter. Players race to type a complete, correctly spelled Bible character starting with that letter.',
    icon: '⚡',
    accentColor: '#f59e0b'
  },
  {
    id: 'SCRIPTURE_OR_SPAM',
    number: '02',
    title: 'SCRIPTURE OR SPAM?',
    subtitle: 'Quote Authenticity Challenge',
    description: 'Is it a real verse from the Bible or a fake inspirational quote? Test your scripture knowledge!',
    icon: '📜',
    accentColor: '#06b6d4'
  },
  {
    id: 'OT_OR_NT',
    number: '03',
    title: 'OT OR NT?',
    subtitle: 'Bible Classification Speed Run',
    description: 'Classify Bible characters, miracles, places, and events into Old Testament or New Testament.',
    icon: '✝️',
    accentColor: '#8b5cf6'
  },
  {
    id: 'WHO_AM_I',
    number: '04',
    title: 'WHO AM I?',
    subtitle: 'Bible Character Mystery',
    description: 'Decipher the clues from a short description and identify the correct biblical figure.',
    icon: '🔍',
    accentColor: '#ec4899'
  },
  {
    id: 'BIBLE_COUPLES',
    number: '05',
    title: 'BIBLE COUPLES',
    subtitle: 'Complete the Biblical Pair',
    description: 'Given one half of a famous biblical couple, type the name of their spouse or partner.',
    icon: '💍',
    accentColor: '#10b981'
  }
];

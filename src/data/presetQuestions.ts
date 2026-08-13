import type { PresetQuestion } from '../types/game';

export const PRESET_QUESTIONS: PresetQuestion[] = [
  // Game 1: Letter Rush
  {
    id: 'lr-1',
    gameType: 'LETTER_RUSH',
    title: 'Letter Rush: M',
    questionText: 'Bible character whose name starts with the letter M',
    correctAnswerText: 'Manual Admin Evaluation (Any valid entry starting with M)',
    data: {
      letter: 'M',
      acceptedAnswers: []
    }
  },
  {
    id: 'lr-2',
    gameType: 'LETTER_RUSH',
    title: 'Letter Rush: D',
    questionText: 'Bible character whose name starts with the letter D',
    correctAnswerText: 'Manual Admin Evaluation (Any valid entry starting with D)',
    data: {
      letter: 'D',
      acceptedAnswers: []
    }
  },
  {
    id: 'lr-3',
    gameType: 'LETTER_RUSH',
    title: 'Letter Rush: S',
    questionText: 'Bible character whose name starts with the letter S',
    correctAnswerText: 'Manual Admin Evaluation (Any valid entry starting with S)',
    data: {
      letter: 'S',
      acceptedAnswers: []
    }
  },

  // Game 2: Scripture or Spam?
  {
    id: 'sos-1',
    gameType: 'SCRIPTURE_OR_SPAM',
    title: 'Scripture or Spam: Philippians 4:13',
    questionText: '"I can do all things through Christ who strengthens me."',
    correctAnswerText: 'SCRIPTURE (Philippians 4:13)',
    data: {
      quote: '"I can do all things through Christ who strengthens me."',
      isScripture: true
    }
  },
  {
    id: 'sos-2',
    gameType: 'SCRIPTURE_OR_SPAM',
    title: 'Scripture or Spam: Cleanliness',
    questionText: '"God helps those who help themselves, and cleanliness is next to godliness."',
    correctAnswerText: 'SPAM QUOTE (Popular saying by Benjamin Franklin / John Wesley, not in the Bible)',
    data: {
      quote: '"God helps those who help themselves, and cleanliness is next to godliness."',
      isScripture: false
    }
  },
  {
    id: 'sos-3',
    gameType: 'SCRIPTURE_OR_SPAM',
    title: 'Scripture or Spam: Psalm 23:1',
    questionText: '"The LORD is my shepherd; I shall not want."',
    correctAnswerText: 'SCRIPTURE (Psalm 23:1)',
    data: {
      quote: '"The LORD is my shepherd; I shall not want."',
      isScripture: true
    }
  },
  {
    id: 'sos-4',
    gameType: 'SCRIPTURE_OR_SPAM',
    title: 'Scripture or Spam: Money Root',
    questionText: '"Money is the root of all evil."',
    correctAnswerText: 'SPAM QUOTE (Misquote! The Bible says "The LOVE of money is a root of all kinds of evil" - 1 Timothy 6:10)',
    data: {
      quote: '"Money is the root of all evil."',
      isScripture: false
    }
  },

  // Game 3: OT or NT
  {
    id: 'otnt-1',
    gameType: 'OT_OR_NT',
    title: 'OT vs NT: David & Goliath',
    questionText: 'David and Goliath',
    correctAnswerText: 'OLD TESTAMENT (1 Samuel 17)',
    data: {
      reference: 'David and Goliath',
      testament: 'OT'
    }
  },
  {
    id: 'otnt-2',
    gameType: 'OT_OR_NT',
    title: 'OT vs NT: Pentecost',
    questionText: 'Day of Pentecost',
    correctAnswerText: 'NEW TESTAMENT (Acts 2)',
    data: {
      reference: 'Day of Pentecost',
      testament: 'NT'
    }
  },
  {
    id: 'otnt-3',
    gameType: 'OT_OR_NT',
    title: 'OT vs NT: Noah\'s Ark',
    questionText: 'Noah\'s Ark & The Flood',
    correctAnswerText: 'OLD TESTAMENT (Genesis 6-9)',
    data: {
      reference: 'Noah\'s Ark & The Flood',
      testament: 'OT'
    }
  },
  {
    id: 'otnt-4',
    gameType: 'OT_OR_NT',
    title: 'OT vs NT: Apostle Paul',
    questionText: 'Apostle Paul\'s Missionary Journeys',
    correctAnswerText: 'NEW TESTAMENT (Acts & Epistles)',
    data: {
      reference: 'Apostle Paul\'s Missionary Journeys',
      testament: 'NT'
    }
  },

  // Game 4: Who Am I?
  {
    id: 'wai-1',
    gameType: 'WHO_AM_I',
    title: 'Who Am I: Shepherd King',
    questionText: 'I was a shepherd boy who defeated a giant with a sling and later became king of Israel.',
    correctAnswerText: 'David',
    data: {
      description: 'I was a shepherd boy who defeated a giant with a sling and later became king of Israel.',
      characterName: 'David'
    }
  },
  {
    id: 'wai-2',
    gameType: 'WHO_AM_I',
    title: 'Who Am I: Coat of Colors',
    questionText: 'I received a coat of many colors from my father, was sold into slavery by my brothers, and became governor of Egypt.',
    correctAnswerText: 'Joseph',
    data: {
      description: 'I received a coat of many colors from my father, was sold into slavery by my brothers, and became governor of Egypt.',
      characterName: 'Joseph'
    }
  },
  {
    id: 'wai-3',
    gameType: 'WHO_AM_I',
    title: 'Who Am I: Queen of Persia',
    questionText: 'I became Queen of Persia and risked my life to save my people from Haman\'s plot.',
    correctAnswerText: 'Esther',
    data: {
      description: 'I became Queen of Persia and risked my life to save my people from Haman\'s plot.',
      characterName: 'Esther'
    }
  },

  // Game 5: Bible Couples
  {
    id: 'bc-1',
    gameType: 'BIBLE_COUPLES',
    title: 'Bible Couples: Adam',
    questionText: 'Given name: ADAM — Who was the partner?',
    correctAnswerText: 'Eve',
    data: {
      givenName: 'Adam',
      partnerName: 'Eve'
    }
  },
  {
    id: 'bc-2',
    gameType: 'BIBLE_COUPLES',
    title: 'Bible Couples: Abraham',
    questionText: 'Given name: ABRAHAM — Who was the partner?',
    correctAnswerText: 'Sarah',
    data: {
      givenName: 'Abraham',
      partnerName: 'Sarah'
    }
  },
  {
    id: 'bc-3',
    gameType: 'BIBLE_COUPLES',
    title: 'Bible Couples: Isaac',
    questionText: 'Given name: ISAAC — Who was the partner?',
    correctAnswerText: 'Rebekah',
    data: {
      givenName: 'Isaac',
      partnerName: 'Rebekah'
    }
  },
  {
    id: 'bc-4',
    gameType: 'BIBLE_COUPLES',
    title: 'Bible Couples: Boaz',
    questionText: 'Given name: BOAZ — Who was the partner?',
    correctAnswerText: 'Ruth',
    data: {
      givenName: 'Boaz',
      partnerName: 'Ruth'
    }
  }
];

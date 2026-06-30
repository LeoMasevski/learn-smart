export type LearningType = 'visual' | 'auditory' | 'kinesthetic';

export interface QuizOption {
  id: string;
  text: string;
  type: LearningType;
  points: number;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: QuizOption[];
}

export interface LearningTypeResult {
  type: LearningType;
  emoji: string;
  label: string;
  description: string;
  strengths: string[];
  tips: string[];
  color: string;
}

export const quizQuestions: QuizQuestion[] = [
  {
    id: 1,
    question: 'Ko se učiš novo snov, ti najbolj pomaga, če ...',
    options: [
      { id: '1a', text: 'prebereš razlago in si ogledaš diagrame ali sheme', type: 'visual', points: 1 },
      { id: '1b', text: 'nekdo razloži snov glasno ali jo sam glasno ponoviš', type: 'auditory', points: 1 },
      { id: '1c', text: 'sam preizkusiš, narediš vajo ali ponoviš postopek', type: 'kinesthetic', points: 1 },
    ],
  },
  {
    id: 2,
    question: 'Ko si zapomniš neko pot ali naslov, si jo zapomnite ...',
    options: [
      { id: '2a', text: 'vizualiziraš v glavi kot zemljevid ali sliko', type: 'visual', points: 1 },
      { id: '2b', text: 'ponavljaš si ime ulic in navodila v mislih', type: 'auditory', points: 1 },
      { id: '2c', text: 'hodil/a po poti in si jo zapomnil/a skozi gibanje', type: 'kinesthetic', points: 1 },
    ],
  },
  {
    id: 3,
    question: 'Pri reševanju težke naloge najpogosteje ...',
    options: [
      { id: '3a', text: 'narišeš diagram, tabelo ali skico problema', type: 'visual', points: 1 },
      { id: '3b', text: 'razmišljaš glasno ali pogovorit se s sošolcem', type: 'auditory', points: 1 },
      { id: '3c', text: 'takoj začneš pisati/delati in med potjo ugotoviš rešitev', type: 'kinesthetic', points: 1 },
    ],
  },
  {
    id: 4,
    question: 'Kateri tip učnega gradiva ti je najljubši?',
    options: [
      { id: '4a', text: 'Infografike, miselni vzorci in barvno označeni zapisi', type: 'visual', points: 1 },
      { id: '4b', text: 'Predavanja, podcasti in razlage v avdio obliki', type: 'auditory', points: 1 },
      { id: '4c', text: 'Praktične naloge, laboratorijske vaje in projekti', type: 'kinesthetic', points: 1 },
    ],
  },
  {
    id: 5,
    question: 'Ko bereš navodila za sestavljanje ali uporabo, ...',
    options: [
      { id: '5a', text: 'najprej pogledaš slike in diagrame', type: 'visual', points: 1 },
      { id: '5b', text: 'prebereš navodila naglas ali jih poprosiš nekoga, da ti jih razloži', type: 'auditory', points: 1 },
      { id: '5c', text: 'kar začneš sestavljati in po potrebi pogledaš navodila', type: 'kinesthetic', points: 1 },
    ],
  },
  {
    id: 6,
    question: 'Ko si zapomniti definicijo ali formulo, jo ...',
    options: [
      { id: '6a', text: 'napišeš in jo gledaš, dokler je ne vizualiziraš', type: 'visual', points: 1 },
      { id: '6b', text: 'ponavljaš glasno ali jo recitiraš v ritmu', type: 'auditory', points: 1 },
      { id: '6c', text: 'zapišeš večkrat z roko ali jo uporabiš v primeru', type: 'kinesthetic', points: 1 },
    ],
  },
  {
    id: 7,
    question: 'Na predavanjih ali v razredu si snov zapomniš najboljše, ko ...',
    options: [
      { id: '7a', text: 'profesor piše na tablo ali kaže prezentacijo', type: 'visual', points: 1 },
      { id: '7b', text: 'profesor razlaga z besedami in pripoveduje primere', type: 'auditory', points: 1 },
      { id: '7c', text: 'aktivno sodeluješ, rešuješ primere ali delaš v skupini', type: 'kinesthetic', points: 1 },
    ],
  },
  {
    id: 8,
    question: 'Ko si vzamete odmor med učenjem, najpogosteje ...',
    options: [
      { id: '8a', text: 'pogledate video ali brskate po slikah', type: 'visual', points: 1 },
      { id: '8b', text: 'poslušate glasbo ali pokličete prijatelja', type: 'auditory', points: 1 },
      { id: '8c', text: 'vstanete in se razgibate ali naredite kaj z rokami', type: 'kinesthetic', points: 1 },
    ],
  },
  {
    id: 9,
    question: 'Katero trditev bi izbral/a za opis svojega idealnega učnega okolja?',
    options: [
      { id: '9a', text: 'Tiho, urejeno, z vizualnimi pomagali na stenah', type: 'visual', points: 1 },
      { id: '9b', text: 'Z možnostjo pogovora, razprave in glasnega razmišljanja', type: 'auditory', points: 1 },
      { id: '9c', text: 'Dinamično, kjer se lahko premikam in preizkušam stvari', type: 'kinesthetic', points: 1 },
    ],
  },
  {
    id: 10,
    question: 'Ko razlagaš snov sošolcu, najpogosteje ...',
    options: [
      { id: '10a', text: 'narišeš skico ali shemo na papir', type: 'visual', points: 1 },
      { id: '10b', text: 'razlagaš z besedami in pripovedovalnim stilom', type: 'auditory', points: 1 },
      { id: '10c', text: 'pokažeš s primerom ali skupaj naredita nalogo', type: 'kinesthetic', points: 1 },
    ],
  },
  {
    id: 11,
    question: 'Ko bereš knjigo ali učbenik, se ti pogosteje ...',
    options: [
      { id: '11a', text: 'v glavi ustvari slika opisanega', type: 'visual', points: 1 },
      { id: '11b', text: 'slišiš glas pripovedovalca', type: 'auditory', points: 1 },
      { id: '11c', text: 'zamisliš kako bi to sam/a naredil/a ali doživel/a', type: 'kinesthetic', points: 1 },
    ],
  },
  {
    id: 12,
    question: 'Ko se učiš za izpit, ti je najlažje, če ...',
    options: [
      { id: '12a', text: 'narediš barvne miselne vzorce in povzetke z oznakami', type: 'visual', points: 1 },
      { id: '12b', text: 'glasno povzameš snov ali jo posneš in predvajaš', type: 'auditory', points: 1 },
      { id: '12c', text: 'rešuješ pretekle izpite in vaje iz prakse', type: 'kinesthetic', points: 1 },
    ],
  },
];

// Logika točkovanja
export function calculateLearningType(answers: Record<number, LearningType>): {
  type: LearningType;
  scores: Record<LearningType, number>;
  percentage: Record<LearningType, number>;
} {
  const scores: Record<LearningType, number> = {
    visual: 0,
    auditory: 0,
    kinesthetic: 0,
  };

  Object.values(answers).forEach((type) => {
    scores[type]++;
  });

  const total = Object.values(scores).reduce((a, b) => a + b, 0);
  const percentage: Record<LearningType, number> = {
    visual: Math.round((scores.visual / total) * 100),
    auditory: Math.round((scores.auditory / total) * 100),
    kinesthetic: Math.round((scores.kinesthetic / total) * 100),
  };

  const type = (Object.keys(scores) as LearningType[]).reduce((a, b) =>
    scores[a] >= scores[b] ? a : b
  );

  return { type, scores, percentage };
}

// Opisi učnih tipov
export const learningTypeResults: Record<LearningType, LearningTypeResult> = {
  visual: {
    type: 'visual',
    emoji: '👁️',
    label: 'Vizualni učenec',
    description:
      'Informacije najlažje sprejemaš skozi slike, diagrame, barve in prostorske odnose. Vizualizacija ti pomaga razumeti kompleksne koncepte hitreje kot besedno razlaganje.',
    strengths: [
      'Hitro razumeš diagrame in infografike',
      'Dobro si zapomniš besedilo, ki ga bereš',
      'Ustvarjaš jasne miselne slike',
    ],
    tips: [
      'Delaj barvne miselne vzorce in sheme',
      'Poudarjaj in barvno označi zapiske',
      'Pretvori besedilo v skice ali tabele',
      'Gledaj izobraževalne videe in animacije',
    ],
    color: '#4F8EF7',
  },
  auditory: {
    type: 'auditory',
    emoji: '🎧',
    label: 'Slušni učenec',
    description:
      'Najlažje se učiš skozi slušne informacije — poslušanje predavanj, pogovor, razpravo ali glasno ponavljanje. Zvok in ritem ti pomagata pri pomnjenju.',
    strengths: [
      'Dobro si zapomniš razlage in predavanja',
      'Enostavno slediš navodilom v ustni obliki',
      'Učinkovito se učiš v skupinah z razpravo',
    ],
    tips: [
      'Snov glasno povzemaj ali jo razlagaj sošolcu',
      'Posnimi lastne razlage in jih poslušaj',
      'Poslušaj podcaste in avdio gradivo',
      'Učiš se z rimami ali ritmičnimi ponavljanji',
    ],
    color: '#10B981',
  },
  kinesthetic: {
    type: 'kinesthetic',
    emoji: '🤲',
    label: 'Kinestetični učenec',
    description:
      'Najlažje se učiš z izkušnjo — z delovanjem, preizkušanjem in praktičnim delom. Abstrakcije ti postanejo jasne šele, ko jih preizkusiš v praksi.',
    strengths: [
      'Hitro usvoji praktične spretnosti',
      'Učinkovit/a pri laboratorijskem in projektnem delu',
      'Dobro si zapomnijo postopke, ki si jih preizkusil/a',
    ],
    tips: [
      'Rešuj čim več vaj in primerov',
      'Deli snov na majhne korake in vsak preizkusi',
      'Med učenjem vstani in se premakni',
      'Aplikuj snov na resnične situacije',
    ],
    color: '#F59E0B',
  },
};

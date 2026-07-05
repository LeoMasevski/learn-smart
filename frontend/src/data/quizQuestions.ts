export type LearningType = "visual" | "auditory" | "kinesthetic";

export const learningTypes: LearningType[] = ["visual", "auditory", "kinesthetic"];

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
  label: string;
  shortLabel: string;
  description: string;
  strengths: string[];
  tips: string[];
  color: string;
  background: string;
}

export type QuizAnswers = Record<number, LearningType[]>;

export interface LearningTypeCalculation {
  type: LearningType;
  scores: Record<LearningType, number>;
  percentage: Record<LearningType, number>;
  dominantTypes: LearningType[];
  isMultimodal: boolean;
  profileLabel: string;
  profileDescription: string;
  totalSelections: number;
}

export const quizQuestions: QuizQuestion[] = [
  {
    id: 1,
    question: "Ko začneš z novo učno temo, kaj ti najprej pomaga ustvariti dober pregled?",
    options: [
      { id: "1a", text: "Skica, miselni vzorec ali diagram povezav med pojmi.", type: "visual", points: 1 },
      { id: "1b", text: "Kratka razlaga na glas in možnost, da takoj postaviš vprašanja.", type: "auditory", points: 1 },
      { id: "1c", text: "Primer naloge, ki jo lahko poskusiš rešiti korak za korakom.", type: "kinesthetic", points: 1 },
    ],
  },
  {
    id: 2,
    question: "Pri težji nalogi se najhitreje premakneš naprej, ko ...",
    options: [
      { id: "2a", text: "problem preurediš v tabelo, sliko ali zaporedje puščic.", type: "visual", points: 1 },
      { id: "2b", text: "razložiš, kje se zatakne, sebi ali sošolcu.", type: "auditory", points: 1 },
      { id: "2c", text: "začneš z majhnim poskusom in sproti popravljaš postopek.", type: "kinesthetic", points: 1 },
    ],
  },
  {
    id: 3,
    question: "Ko se pripravljaš na preverjanje znanja, najraje ...",
    options: [
      { id: "3a", text: "barvno označiš povezave, formule in pomembne razlike.", type: "visual", points: 1 },
      { id: "3b", text: "snov poveš na glas, kot bi jo razlagal/a prijatelju.", type: "auditory", points: 1 },
      { id: "3c", text: "rešuješ primere, stare naloge ali praktične mini izzive.", type: "kinesthetic", points: 1 },
    ],
  },
  {
    id: 4,
    question: "Profesor predstavi nov postopek. Kateri del razlage ti ostane najbolj v spominu?",
    options: [
      { id: "4a", text: "Shema postopka ali primerjava med posameznimi deli.", type: "visual", points: 1 },
      { id: "4b", text: "Besedna razlaga, zgodba ali razprava v razredu.", type: "auditory", points: 1 },
      { id: "4c", text: "Demonstracija, poskus ali naloga, ki jo narediš sam/a.", type: "kinesthetic", points: 1 },
    ],
  },
  {
    id: 5,
    question: "Ko moraš razumeti novo aplikacijo ali orodje, bi najprej ...",
    options: [
      { id: "5a", text: "pogledal/a postavitev zaslona, ikone in zaporedje korakov.", type: "visual", points: 1 },
      { id: "5b", text: "prosil/a nekoga, naj ti razloži potek uporabe.", type: "auditory", points: 1 },
      { id: "5c", text: "odprl/a orodje in preizkusil/a nekaj varnih korakov.", type: "kinesthetic", points: 1 },
    ],
  },
  {
    id: 6,
    question: "Katera oblika zapiskov ti je najbolj uporabna po koncu ure?",
    options: [
      { id: "6a", text: "Miselni vzorci, puščice, okvirji in barvni poudarki.", type: "visual", points: 1 },
      { id: "6b", text: "Zvočni posnetek, glasna obnova ali pogovor o snovi.", type: "auditory", points: 1 },
      { id: "6c", text: "Rešeni primeri, mini vaje in zapiski ob poskusu.", type: "kinesthetic", points: 1 },
    ],
  },
  {
    id: 7,
    question: "Ko si želiš preveriti, ali snov res razumeš, izbereš ...",
    options: [
      { id: "7a", text: "da iz snovi narediš diagram ali primerjalno tabelo.", type: "visual", points: 1 },
      { id: "7b", text: "da jo razložiš na glas brez gledanja v zapiske.", type: "auditory", points: 1 },
      { id: "7c", text: "da jo uporabiš na novem primeru ali nalogi.", type: "kinesthetic", points: 1 },
    ],
  },
  {
    id: 8,
    question: "Pri učenju novega pojma ti največ pove ...",
    options: [
      { id: "8a", text: "kako je pojem povezan z drugimi pojmi v prostoru ali shemi.", type: "visual", points: 1 },
      { id: "8b", text: "kako bi ga nekdo razložil v pogovoru.", type: "auditory", points: 1 },
      { id: "8c", text: "kaj lahko s tem pojmom narediš v resnični situaciji.", type: "kinesthetic", points: 1 },
    ],
  },
  {
    id: 9,
    question: "Če imaš na voljo samo deset minut za ponovitev, najraje ...",
    options: [
      { id: "9a", text: "pogledaš zemljevid snovi, grafe ali označene dele zvezka.", type: "visual", points: 1 },
      { id: "9b", text: "na glas obnoviš glavne ideje.", type: "auditory", points: 1 },
      { id: "9c", text: "rešiš eno kratko nalogo za vsak glavni pojem.", type: "kinesthetic", points: 1 },
    ],
  },
  {
    id: 10,
    question: "Ko delaš v skupini, najpogosteje prispevaš tako, da ...",
    options: [
      { id: "10a", text: "narišeš načrt, strukturo ali razporeditev idej.", type: "visual", points: 1 },
      { id: "10b", text: "vodiš pogovor, sprašuješ in usklajuješ razlage.", type: "auditory", points: 1 },
      { id: "10c", text: "preizkusiš rešitev, narediš prototip ali pokažeš primer.", type: "kinesthetic", points: 1 },
    ],
  },
  {
    id: 11,
    question: "Katera povratna informacija ti najbolj pomaga izboljšati učenje?",
    options: [
      { id: "11a", text: "Označeno, kje v rešitvi so vzorci, napake ali manjkajoče povezave.", type: "visual", points: 1 },
      { id: "11b", text: "Pogovor, v katerem slišiš, kaj je bilo dobro in kaj popraviš.", type: "auditory", points: 1 },
      { id: "11c", text: "Nov podoben primer, kjer lahko takoj uporabiš popravek.", type: "kinesthetic", points: 1 },
    ],
  },
  {
    id: 12,
    question: "Ko si nekaj uspešno zapomniš, je običajno zato, ker si ...",
    options: [
      { id: "12a", text: "si ustvaril/a sliko, vzorec ali razporeditev idej.", type: "visual", points: 1 },
      { id: "12b", text: "slišal/a razlago ali jo večkrat povedal/a na glas.", type: "auditory", points: 1 },
      { id: "12c", text: "naredil/a nalogo, poskus ali primer iz prakse.", type: "kinesthetic", points: 1 },
    ],
  },
];

function emptyScores(): Record<LearningType, number> {
  return {
    visual: 0,
    auditory: 0,
    kinesthetic: 0,
  };
}

export function calculateLearningType(answers: QuizAnswers): LearningTypeCalculation {
  const scores = emptyScores();

  Object.values(answers).forEach((types) => {
    types.forEach((type) => {
      scores[type] += 1;
    });
  });

  const totalSelections = Object.values(scores).reduce((sum, score) => sum + score, 0);
  const percentage = learningTypes.reduce((acc, type) => {
    acc[type] = totalSelections ? Math.round((scores[type] / totalSelections) * 100) : 0;
    return acc;
  }, emptyScores());

  const sortedTypes = [...learningTypes].sort((a, b) => scores[b] - scores[a]);
  const type = sortedTypes[0];
  const topScore = scores[type];
  const secondScore = scores[sortedTypes[1]] ?? 0;
  const dominantTypes = learningTypes.filter(
    (learningType) => topScore > 0 && topScore - scores[learningType] <= 1
  );
  const isMultimodal = dominantTypes.length > 1 || (topScore > 0 && topScore - secondScore <= 1);
  const dominantLabels = dominantTypes.map((learningType) => learningTypeResults[learningType].shortLabel);

  return {
    type,
    scores,
    percentage,
    dominantTypes: dominantTypes.length ? dominantTypes : [type],
    isMultimodal,
    profileLabel: isMultimodal ? "Mešan učni profil" : learningTypeResults[type].label,
    profileDescription: isMultimodal
      ? `Tvoji odgovori kažejo močno kombinacijo pristopov: ${dominantLabels.join(", ")}. LearnSmart bo za prilagoditev uporabil najmočnejši profil, pri učenju pa se ti splača mešati več strategij.`
      : learningTypeResults[type].description,
    totalSelections,
  };
}

export const learningTypeResults: Record<LearningType, LearningTypeResult> = {
  visual: {
    type: "visual",
    label: "Vizualni profil",
    shortLabel: "vizualni",
    description:
      "Najhitreje napreduješ, ko lahko informacije vidiš kot odnose, vzorce, diagrame in urejene celote.",
    strengths: [
      "hitro opaziš povezave med pojmi",
      "dobro uporabljaš sheme, tabele in barvne oznake",
      "lažje razumeš snov, ko ima jasen vizualni red",
    ],
    tips: [
      "pretvori poglavja v miselne vzorce ali primerjalne tabele",
      "pri formulah in definicijah označi, kaj se s čim povezuje",
      "po učenju nariši en sam pregled snovi brez gledanja v zapiske",
    ],
    color: "#2563eb",
    background: "#eff6ff",
  },
  auditory: {
    type: "auditory",
    label: "Slušni profil",
    shortLabel: "slušni",
    description:
      "Dobro razumeš snov, ko jo slišiš, poveš na glas, razložiš nekomu drugemu ali o njej razpravljaš.",
    strengths: [
      "dobro slediš razlagam in pogovorom",
      "hitro najdeš luknje v znanju, ko snov poveš na glas",
      "uporabljaš ritem, primerjave in pripoved za pomnjenje",
    ],
    tips: [
      "po vsakem poglavju naredi 60-sekundno glasno obnovo",
      "uči se z vprašanji in odgovori, tudi če si sam/a",
      "težje definicije razloži kot kratek pogovor ali zgodbo",
    ],
    color: "#059669",
    background: "#ecfdf5",
  },
  kinesthetic: {
    type: "kinesthetic",
    label: "Kinestetični profil",
    shortLabel: "kinestetični",
    description:
      "Snov ti postane jasna, ko jo povežeš s primerom, vajo, poskusom ali resnično uporabo.",
    strengths: [
      "hitro napreduješ skozi konkretne primere",
      "dobro razumeš postopke, ko jih sam/a izvedeš",
      "abstraktne ideje lažje usvojiš prek uporabe",
    ],
    tips: [
      "za vsak nov pojem reši vsaj en primer takoj po razlagi",
      "učenje razdeli na kratke cikle: razlaga, primer, vaja, preverjanje",
      "poveži teorijo z resnično situacijo ali projektom",
    ],
    color: "#d97706",
    background: "#fffbeb",
  },
};

import {
  BookOpen,
  Calculator,
  Atom,
  FlaskConical,
  Dna,
  Code2,
  Landmark,
  Globe2,
  Palette,
  Music,
  Dumbbell,
  Languages,
  Brain,
  LineChart,
  Microscope,
  Telescope,
  Scale,
  Leaf,
  GraduationCap,
  NotebookText,
  Compass,
  Target,
  type LucideIcon,
} from "lucide-react";

const KEYWORD_ICON_MAP: { keywords: string[]; icon: LucideIcon }[] = [
  { keywords: ["matemat", "algebra", "geometrij"], icon: Calculator },
  { keywords: ["fizik"], icon: Atom },
  { keywords: ["kemij"], icon: FlaskConical },
  { keywords: ["biolog", "anatomij"], icon: Dna },
  { keywords: ["program", "informatik", "računaln", "racunaln", "softver", "razvoj"], icon: Code2 },
  { keywords: ["zgodovin"], icon: Landmark },
  { keywords: ["geografij"], icon: Globe2 },
  { keywords: ["umetn", "likovn", "design", "oblikovanj"], icon: Palette },
  { keywords: ["glasb", "music"], icon: Music },
  { keywords: ["šport", "sport", "telovadb", "kineziolog"], icon: Dumbbell },
  { keywords: ["jezik", "anglešč", "nemšč", "španšč", "francošč", "jezikoslov"], icon: Languages },
  { keywords: ["psiholog", "filozofij"], icon: Brain },
  { keywords: ["ekonom", "posel", "poslovn", "financ", "marketing"], icon: LineChart },
  { keywords: ["mikrobiolog", "laboratorij"], icon: Microscope },
  { keywords: ["astronomij", "vesolj"], icon: Telescope },
  { keywords: ["pravo", "prav"], icon: Scale },
  { keywords: ["ekologij", "okolj", "trajnost"], icon: Leaf },
  { keywords: ["literatur", "slovenšč", "knjiž"], icon: BookOpen },
];

const FALLBACK_ICONS: LucideIcon[] = [BookOpen, GraduationCap, NotebookText, Compass, Target];

/**
 * Picks a Lucide icon for a subject based on keywords found in its name.
 * Falls back to a deterministic icon based on the subject's index.
 */
export function getSubjectIcon(name: string | null | undefined, index = 0): LucideIcon {
  const normalized = (name ?? "").toLowerCase();

  for (const entry of KEYWORD_ICON_MAP) {
    if (entry.keywords.some((kw) => normalized.includes(kw))) return entry.icon;
  }

  return FALLBACK_ICONS[index % FALLBACK_ICONS.length];
}

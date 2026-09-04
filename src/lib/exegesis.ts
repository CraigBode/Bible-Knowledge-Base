export type NoteType =
  | "observation"
  | "historical_context"
  | "literary_context"
  | "structure"
  | "grammar"
  | "theology"
  | "application"
  | "question";

export type XrefType =
  | "parallel"
  | "quotation"
  | "allusion"
  | "typology"
  | "fulfillment"
  | "contrast"
  | "thematic";

export type StudyStatus = "draft" | "in_progress" | "complete";
export type Lang = "hebrew" | "aramaic" | "greek";
export type SourceType =
  | "commentary"
  | "lexicon"
  | "grammar"
  | "dictionary"
  | "monograph"
  | "article"
  | "other";

/** The exegetical method, in order. Each note type corresponds to a step. */
export const EXEGETICAL_STEPS: {
  type: NoteType;
  step: number;
  label: string;
  short: string;
  question: string;
  description: string;
}[] = [
  {
    type: "observation",
    step: 1,
    label: "Observation",
    short: "Observe",
    question: "What does the text actually say?",
    description:
      "Read repeatedly and record what is there: repeated words, contrasts, verbs of action, who acts on whom, shifts in tone, and anything surprising. Withhold interpretation.",
  },
  {
    type: "historical_context",
    step: 2,
    label: "Historical Context",
    short: "History",
    question: "What situation stands behind the text?",
    description:
      "Author, audience, date, occasion, geography, and ancient Near Eastern or Greco-Roman background that the first readers would have assumed.",
  },
  {
    type: "literary_context",
    step: 3,
    label: "Literary Context",
    short: "Context",
    question: "How does the passage fit its book?",
    description:
      "Genre, the surrounding argument or narrative, intertextual echoes, and the passage's role in the book's flow. A text without a context is a pretext.",
  },
  {
    type: "structure",
    step: 4,
    label: "Structure",
    short: "Structure",
    question: "How is the passage built?",
    description:
      "Outline, clause flow, parallelism, chiasm, inclusio, discourse markers. Identify the main clause(s) and how subordinate ideas support them.",
  },
  {
    type: "grammar",
    step: 5,
    label: "Grammar & Text",
    short: "Grammar",
    question: "What do the words and syntax mean?",
    description:
      "Textual criticism, lexical analysis, verb aspect and mood, case usage, syntax. Word studies in Hebrew/Aramaic/Greek belong alongside this step.",
  },
  {
    type: "theology",
    step: 6,
    label: "Theological Synthesis",
    short: "Theology",
    question: "What does the passage teach about God and his ways?",
    description:
      "Relate the passage to the canon's storyline and to biblical-theological themes. Read Scripture with Scripture; let clear texts illuminate obscure ones.",
  },
  {
    type: "application",
    step: 7,
    label: "Application",
    short: "Apply",
    question: "So what?",
    description:
      "Move from the original meaning to legitimate significance for the church today, respecting the distance between text and reader.",
  },
  {
    type: "question",
    step: 8,
    label: "Open Questions",
    short: "Questions",
    question: "What remains unresolved?",
    description:
      "Interpretive cruxes, competing views, and matters to revisit. Honest exegesis records uncertainty.",
  },
];

export const NOTE_TYPES = EXEGETICAL_STEPS.map((s) => s.type);
export const noteLabel = (t: NoteType) =>
  EXEGETICAL_STEPS.find((s) => s.type === t)?.label ?? t;

export const XREF_TYPES: { value: XrefType; label: string; hint: string }[] = [
  { value: "parallel", label: "Parallel", hint: "Same idea/event elsewhere" },
  { value: "quotation", label: "Quotation", hint: "Directly cited" },
  { value: "allusion", label: "Allusion", hint: "Deliberate echo" },
  { value: "typology", label: "Typology", hint: "Type / antitype pattern" },
  { value: "fulfillment", label: "Fulfillment", hint: "Promise brought to completion" },
  { value: "contrast", label: "Contrast", hint: "Set in opposition" },
  { value: "thematic", label: "Thematic", hint: "Shared theme" },
];

export const STATUS_META: Record<StudyStatus, { label: string; className: string }> = {
  draft: { label: "Draft", className: "bg-stone-200 text-stone-700" },
  in_progress: { label: "In progress", className: "bg-amber-100 text-amber-800" },
  complete: { label: "Complete", className: "bg-emerald-100 text-emerald-800" },
};

export const LANG_META: Record<Lang, { label: string; className: string; dir: "rtl" | "ltr" }> = {
  hebrew: { label: "Hebrew", className: "bg-sky-100 text-sky-800", dir: "rtl" },
  aramaic: { label: "Aramaic", className: "bg-violet-100 text-violet-800", dir: "rtl" },
  greek: { label: "Greek", className: "bg-rose-100 text-rose-800", dir: "ltr" },
};

export const SOURCE_TYPES: SourceType[] = [
  "commentary",
  "lexicon",
  "grammar",
  "dictionary",
  "monograph",
  "article",
  "other",
];

export function formatReference(
  book: { name: string } | { abbreviation: string },
  cs: number,
  vs: number,
  ce: number,
  ve: number,
  opts: { abbreviate?: boolean } = {}
) {
  const name =
    opts.abbreviate && "abbreviation" in book
      ? book.abbreviation
      : "name" in book
        ? book.name
        : book.abbreviation;
  if (cs === ce) {
    if (vs === ve) return `${name} ${cs}:${vs}`;
    return `${name} ${cs}:${vs}–${ve}`;
  }
  return `${name} ${cs}:${vs}–${ce}:${ve}`;
}

export function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function titleCase(s: string) {
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

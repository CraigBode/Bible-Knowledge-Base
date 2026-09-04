// Canonical data used to bootstrap the knowledge base.

type Testament = "OT" | "NT";
type Lang = "hebrew" | "aramaic" | "greek";

export type BookSeed = {
  name: string;
  abbreviation: string;
  testament: Testament;
  genre: string;
  chapters: number;
  language: Lang;
};

const ot = (
  name: string,
  abbreviation: string,
  genre: string,
  chapters: number
): BookSeed => ({ name, abbreviation, testament: "OT", genre, chapters, language: "hebrew" });
const nt = (
  name: string,
  abbreviation: string,
  genre: string,
  chapters: number
): BookSeed => ({ name, abbreviation, testament: "NT", genre, chapters, language: "greek" });

export const BOOKS: BookSeed[] = [
  ot("Genesis", "Gen", "Pentateuch", 50),
  ot("Exodus", "Exod", "Pentateuch", 40),
  ot("Leviticus", "Lev", "Pentateuch", 27),
  ot("Numbers", "Num", "Pentateuch", 36),
  ot("Deuteronomy", "Deut", "Pentateuch", 34),
  ot("Joshua", "Josh", "Historical", 24),
  ot("Judges", "Judg", "Historical", 21),
  ot("Ruth", "Ruth", "Historical", 4),
  ot("1 Samuel", "1 Sam", "Historical", 31),
  ot("2 Samuel", "2 Sam", "Historical", 24),
  ot("1 Kings", "1 Kgs", "Historical", 22),
  ot("2 Kings", "2 Kgs", "Historical", 25),
  ot("1 Chronicles", "1 Chr", "Historical", 29),
  ot("2 Chronicles", "2 Chr", "Historical", 36),
  ot("Ezra", "Ezra", "Historical", 10),
  ot("Nehemiah", "Neh", "Historical", 13),
  ot("Esther", "Esth", "Historical", 10),
  ot("Job", "Job", "Wisdom", 42),
  ot("Psalms", "Ps", "Poetry", 150),
  ot("Proverbs", "Prov", "Wisdom", 31),
  ot("Ecclesiastes", "Eccl", "Wisdom", 12),
  ot("Song of Songs", "Song", "Poetry", 8),
  ot("Isaiah", "Isa", "Major Prophets", 66),
  ot("Jeremiah", "Jer", "Major Prophets", 52),
  ot("Lamentations", "Lam", "Poetry", 5),
  ot("Ezekiel", "Ezek", "Major Prophets", 48),
  { ...ot("Daniel", "Dan", "Major Prophets", 12), language: "aramaic" },
  ot("Hosea", "Hos", "Minor Prophets", 14),
  ot("Joel", "Joel", "Minor Prophets", 3),
  ot("Amos", "Amos", "Minor Prophets", 9),
  ot("Obadiah", "Obad", "Minor Prophets", 1),
  ot("Jonah", "Jonah", "Minor Prophets", 4),
  ot("Micah", "Mic", "Minor Prophets", 7),
  ot("Nahum", "Nah", "Minor Prophets", 3),
  ot("Habakkuk", "Hab", "Minor Prophets", 3),
  ot("Zephaniah", "Zeph", "Minor Prophets", 3),
  ot("Haggai", "Hag", "Minor Prophets", 2),
  ot("Zechariah", "Zech", "Minor Prophets", 14),
  ot("Malachi", "Mal", "Minor Prophets", 4),
  nt("Matthew", "Matt", "Gospel", 28),
  nt("Mark", "Mark", "Gospel", 16),
  nt("Luke", "Luke", "Gospel", 24),
  nt("John", "John", "Gospel", 21),
  nt("Acts", "Acts", "Historical", 28),
  nt("Romans", "Rom", "Pauline Epistle", 16),
  nt("1 Corinthians", "1 Cor", "Pauline Epistle", 16),
  nt("2 Corinthians", "2 Cor", "Pauline Epistle", 13),
  nt("Galatians", "Gal", "Pauline Epistle", 6),
  nt("Ephesians", "Eph", "Pauline Epistle", 6),
  nt("Philippians", "Phil", "Pauline Epistle", 4),
  nt("Colossians", "Col", "Pauline Epistle", 4),
  nt("1 Thessalonians", "1 Thess", "Pauline Epistle", 5),
  nt("2 Thessalonians", "2 Thess", "Pauline Epistle", 3),
  nt("1 Timothy", "1 Tim", "Pauline Epistle", 6),
  nt("2 Timothy", "2 Tim", "Pauline Epistle", 4),
  nt("Titus", "Titus", "Pauline Epistle", 3),
  nt("Philemon", "Phlm", "Pauline Epistle", 1),
  nt("Hebrews", "Heb", "General Epistle", 13),
  nt("James", "Jas", "General Epistle", 5),
  nt("1 Peter", "1 Pet", "General Epistle", 5),
  nt("2 Peter", "2 Pet", "General Epistle", 3),
  nt("1 John", "1 John", "General Epistle", 5),
  nt("2 John", "2 John", "General Epistle", 1),
  nt("3 John", "3 John", "General Epistle", 1),
  nt("Jude", "Jude", "General Epistle", 1),
  nt("Revelation", "Rev", "Apocalyptic", 22),
];

export const THEMES = [
  { name: "Creation", slug: "creation", color: "#0f766e", description: "God as creator; cosmic order; new creation." },
  { name: "Covenant", slug: "covenant", color: "#b45309", description: "Divine-human covenants: Noahic, Abrahamic, Mosaic, Davidic, New." },
  { name: "Logos / Word of God", slug: "logos", color: "#7c2d12", description: "God's creative and revelatory speech; Christ as the Word." },
  { name: "Kingdom of God", slug: "kingdom-of-god", color: "#4338ca", description: "God's reign inaugurated in Christ, consummated at his return." },
  { name: "Redemption", slug: "redemption", color: "#be123c", description: "Deliverance from bondage, exodus motifs, atonement." },
  { name: "Providence", slug: "providence", color: "#1d4ed8", description: "God's sovereign governance over all events for his purposes." },
  { name: "Shepherd", slug: "shepherd", color: "#15803d", description: "YHWH and Christ as shepherd; leaders as under-shepherds." },
  { name: "Light & Darkness", slug: "light-and-darkness", color: "#a16207", description: "Revelation vs. ignorance, life vs. death, holiness vs. sin." },
  { name: "Justification", slug: "justification", color: "#9333ea", description: "God's forensic declaration of righteousness by faith." },
  { name: "Wisdom", slug: "wisdom", color: "#0369a1", description: "Skill in godly living; the fear of the LORD; Christ as wisdom." },
  { name: "Messiah", slug: "messiah", color: "#c2410c", description: "The anointed Davidic king, suffering servant, and Son of Man." },
  { name: "Holy Spirit", slug: "holy-spirit", color: "#0d9488", description: "The Spirit's work in creation, prophecy, regeneration, and empowerment." },
];

export const SOURCES = [
  { title: "A Greek-English Lexicon of the New Testament and Other Early Christian Literature (BDAG)", author: "Bauer, Danker, Arndt, Gingrich", type: "lexicon" as const, year: 2000, publisher: "University of Chicago Press" },
  { title: "The Hebrew and Aramaic Lexicon of the Old Testament (HALOT)", author: "Koehler & Baumgartner", type: "lexicon" as const, year: 2001, publisher: "Brill" },
  { title: "Genesis 1–15 (Word Biblical Commentary)", author: "Gordon J. Wenham", type: "commentary" as const, year: 1987, publisher: "Word Books" },
  { title: "The Gospel According to John (Pillar NT Commentary)", author: "D. A. Carson", type: "commentary" as const, year: 1991, publisher: "Eerdmans" },
  { title: "The Epistle to the Romans (NICNT)", author: "Douglas J. Moo", type: "commentary" as const, year: 2018, publisher: "Eerdmans" },
  { title: "Psalms 1–72 (Tyndale OT Commentaries)", author: "Derek Kidner", type: "commentary" as const, year: 1973, publisher: "IVP" },
  { title: "Greek Grammar Beyond the Basics", author: "Daniel B. Wallace", type: "grammar" as const, year: 1996, publisher: "Zondervan" },
  { title: "An Introduction to Biblical Hebrew Syntax", author: "Waltke & O'Connor", type: "grammar" as const, year: 1990, publisher: "Eisenbrauns" },
  { title: "Exegetical Fallacies", author: "D. A. Carson", type: "monograph" as const, year: 1996, publisher: "Baker" },
  { title: "New Dictionary of Biblical Theology", author: "Alexander & Rosner (eds.)", type: "dictionary" as const, year: 2000, publisher: "IVP" },
];

type NoteSeed = { type: "observation" | "historical_context" | "literary_context" | "structure" | "grammar" | "theology" | "application" | "question"; title: string; body: string };
type WordSeed = { lemma: string; transliteration: string; language: Lang; strongs: string; gloss: string; semanticRange: string; occurrences?: number; notes: string };
type XrefSeed = { reference: string; type: "parallel" | "quotation" | "allusion" | "typology" | "fulfillment" | "contrast" | "thematic"; note: string };

export type PassageSeed = {
  book: string;
  chapterStart: number;
  verseStart: number;
  chapterEnd: number;
  verseEnd: number;
  title: string;
  translation: string;
  text: string;
  summary: string;
  status: "draft" | "in_progress" | "complete";
  themes: string[];
  sources: { title: string; pages: string; note: string }[];
  notes: NoteSeed[];
  words: WordSeed[];
  xrefs: XrefSeed[];
};

export const PASSAGES: PassageSeed[] = [
  {
    book: "Genesis",
    chapterStart: 1, verseStart: 1, chapterEnd: 1, verseEnd: 3,
    title: "In the Beginning: God Creates by His Word",
    translation: "WEB",
    text: "In the beginning, God created the heavens and the earth. The earth was formless and empty. Darkness was on the surface of the deep and God's Spirit was hovering over the surface of the waters. God said, \"Let there be light,\" and there was light.",
    summary: "The prologue of Scripture establishes God as the sole, sovereign Creator who brings ordered cosmos out of formlessness by the sheer authority of his speech.",
    status: "complete",
    themes: ["creation", "logos", "light-and-darkness", "holy-spirit"],
    sources: [
      { title: "Genesis 1–15 (Word Biblical Commentary)", pages: "11–18", note: "Discussion of v. 1 as independent clause vs. temporal clause." },
      { title: "The Hebrew and Aramaic Lexicon of the Old Testament (HALOT)", pages: "s.v. ברא", note: "Semantic field of bara'." },
    ],
    notes: [
      { type: "observation", title: "Subject is always God", body: "In vv. 1–3 God is the only actor. 'Created', 'hovering', 'said' — every verb of agency belongs to God (or God's Spirit). The earth is merely described, never acting." },
      { type: "grammar", title: "Syntax of v. 1 — independent or dependent?", body: "בְּרֵאשִׁית (bereshit) lacks the article. Some (Rashi, NRSV) read a construct: 'When God began to create...'. However, the Masoretic accentuation (tiphcha on bereshit) and the ancient versions (LXX: Ἐν ἀρχῇ ἐποίησεν) treat v. 1 as an independent clause. Verse 2 then opens with a disjunctive waw + noun (וְהָאָרֶץ), which is circumstantial, describing the state of things before v. 3's first wayyiqtol (וַיֹּאמֶר)." },
      { type: "literary_context", title: "Prologue to the seven-day structure", body: "Vv. 1–2 function as a heading and setting for the six days that follow (1:3–31). The 'formless and empty' (tohu wabohu) of v. 2 is answered chiastically: days 1–3 give form, days 4–6 fill emptiness." },
      { type: "historical_context", title: "Polemic against ANE cosmogonies", body: "Unlike Enuma Elish, there is no theomachy; the deep (tehom) is not a rival deity (Tiamat) but inert matter. The sun and moon are not even named in v. 16. Creation by divine fiat sets Israel's God apart." },
      { type: "theology", title: "Creation ex nihilo and by the Word", body: "While v. 1 does not explicitly teach creatio ex nihilo, the absolute beginning and the pattern of speech-act creation ('God said... and there was') ground later reflection (Ps 33:6; John 1:1–3; Heb 11:3). God's word is effective: what he says, is." },
      { type: "application", title: "Trust in the God who orders chaos", body: "The God who spoke light into darkness is the same God who 'shines in our hearts' (2 Cor 4:6). Formless situations are not beyond his creative word." },
      { type: "question", title: "Is 'ruach elohim' Spirit or wind?", body: "Should רוּחַ אֱלֹהִים be rendered 'Spirit of God' or 'mighty wind' (NEB)? The verb 'hovering' (merachephet, cf. Deut 32:11, eagle over young) favors personal agency." },
    ],
    words: [
      { lemma: "בָּרָא", transliteration: "bara'", language: "hebrew", strongs: "H1254", gloss: "to create", semanticRange: "In the Qal stem, used exclusively with God as subject; denotes bringing about something new, never with an accusative of material.", occurrences: 48, notes: "Distinct from 'asah (make, do) and yatsar (form/fashion). Its restriction to divine activity underscores the uniqueness of God's creative act." },
      { lemma: "תֹּהוּ וָבֹהוּ", transliteration: "tohu wabohu", language: "hebrew", strongs: "H8414 / H922", gloss: "formless and empty", semanticRange: "A hendiadys denoting an uninhabitable, unformed state. Tohu alone: wasteland, worthlessness (Isa 45:18; 1 Sam 12:21).", occurrences: 3, notes: "Appears together only here, Jer 4:23, and Isa 34:11 — the latter two describing de-creation under judgment." },
      { lemma: "רוּחַ", transliteration: "ruach", language: "hebrew", strongs: "H7307", gloss: "spirit, wind, breath", semanticRange: "Wind (Gen 8:1), breath of life (Gen 6:17), human spirit, and the Spirit of God (Isa 63:10–11).", occurrences: 378, notes: "The construct with elohim plus the verb 'hover' suggests the personal Spirit rather than an impersonal wind." },
    ],
    xrefs: [
      { reference: "John 1:1–3", type: "allusion", note: "John's prologue deliberately echoes 'In the beginning' and creation through the Word." },
      { reference: "Psalm 33:6–9", type: "thematic", note: "'By the word of the LORD the heavens were made.' Creation by speech." },
      { reference: "2 Corinthians 4:6", type: "quotation", note: "Paul cites 'Let light shine out of darkness' for the new-creation illumination of believers." },
      { reference: "Jeremiah 4:23", type: "parallel", note: "Tohu wabohu reappears as judgment reverses creation." },
      { reference: "Hebrews 11:3", type: "thematic", note: "The universe was framed by the word of God." },
    ],
  },
  {
    book: "John",
    chapterStart: 1, verseStart: 1, chapterEnd: 1, verseEnd: 5,
    title: "The Prologue: The Word Was God",
    translation: "WEB",
    text: "In the beginning was the Word, and the Word was with God, and the Word was God. The same was in the beginning with God. All things were made through him. Without him, nothing was made that has been made. In him was life, and the life was the light of men. The light shines in the darkness, and the darkness hasn't overcome it.",
    summary: "John identifies Jesus as the eternal, personal, divine Logos — agent of creation, source of life, and light that darkness cannot master.",
    status: "complete",
    themes: ["logos", "creation", "light-and-darkness", "messiah"],
    sources: [
      { title: "The Gospel According to John (Pillar NT Commentary)", pages: "111–120", note: "On θεὸς ἦν ὁ λόγος and the anarthrous predicate." },
      { title: "Greek Grammar Beyond the Basics", pages: "266–269", note: "Colwell's rule and qualitative predicate nominatives." },
    ],
    notes: [
      { type: "observation", title: "Staircase parallelism", body: "Each clause picks up the last term of the previous: Word → Word/God → God/Word. Similarly 'life... life/light... light/darkness'. This chaining (anadiplosis) creates a stately, meditative cadence." },
      { type: "grammar", title: "θεὸς ἦν ὁ λόγος — anarthrous predicate", body: "The predicate nominative θεός precedes the verb and lacks the article. Per Colwell's rule and Wallace's refinement, a pre-verbal anarthrous predicate is most likely qualitative: the Word has the very nature of God. It is neither indefinite ('a god') nor convertible ('the Word = the God', which v. 1b's πρὸς τὸν θεόν forbids)." },
      { type: "grammar", title: "ἦν vs. ἐγένετο", body: "The Word 'was' (ἦν, imperfect — continuous existence) whereas all things 'came into being' (ἐγένετο, aorist). The verbal contrast marks the Creator/creature distinction." },
      { type: "literary_context", title: "Genesis 1 as intertext", body: "Ἐν ἀρχῇ is verbatim LXX Gen 1:1. Creation, life, light, and darkness all evoke Genesis 1. John recasts the creation narrative Christologically." },
      { type: "historical_context", title: "Logos in Jewish and Hellenistic thought", body: "Background candidates: the creative dabar YHWH (Ps 33:6), personified Wisdom (Prov 8:22–31; Sir 24), the Targumic Memra, and Stoic/Philonic Logos. John's usage is primarily rooted in the OT while communicable to a Hellenistic audience." },
      { type: "theology", title: "Distinction and identity", body: "V. 1 holds together personal distinction (πρὸς τὸν θεόν — 'with', face to face) and shared deity (θεὸς ἦν). This is foundational for later Trinitarian confession of the Son as homoousios with the Father." },
      { type: "question", title: "κατέλαβεν — overcome or comprehend?", body: "καταλαμβάνω can mean 'grasp mentally' or 'seize/overtake'. Given 12:35 ('lest darkness overtake you'), 'overcome' is preferable, though John may intend the double sense." },
    ],
    words: [
      { lemma: "λόγος", transliteration: "logos", language: "greek", strongs: "G3056", gloss: "word, message, reason", semanticRange: "Spoken word, statement, account, message (the gospel), reason/principle; in John 1 personified/hypostatized as the pre-existent Son.", occurrences: 330, notes: "In John the personal use is confined to the prologue (1:1, 14) and 1 John 1:1; Rev 19:13." },
      { lemma: "καταλαμβάνω", transliteration: "katalambanō", language: "greek", strongs: "G2638", gloss: "to seize, overtake, grasp, comprehend", semanticRange: "Physical seizing (Mark 9:18), overtaking (John 12:35), mental apprehension (Acts 4:13; Eph 3:18).", occurrences: 15, notes: "Deliberate ambiguity possible in 1:5: darkness neither understood nor extinguished the light." },
      { lemma: "μονογενής", transliteration: "monogenēs", language: "greek", strongs: "G3439", gloss: "only, unique, one of a kind", semanticRange: "Only child (Luke 7:12; Heb 11:17 of Isaac who was not Abraham's only son but his unique son). Not 'only-begotten' etymologically (genos, not gennaō).", occurrences: 9, notes: "Though in v. 14/18, relevant to the prologue's Christology." },
    ],
    xrefs: [
      { reference: "Genesis 1:1–5", type: "allusion", note: "The prologue's opening words and light/darkness imagery draw directly on Genesis 1." },
      { reference: "Proverbs 8:22–31", type: "thematic", note: "Personified Wisdom beside God at creation — a conceptual forerunner of the Logos." },
      { reference: "Colossians 1:15–17", type: "parallel", note: "Christ as agent of creation: 'all things were created through him and for him.'" },
      { reference: "1 John 1:1–2", type: "parallel", note: "'That which was from the beginning... the Word of life.'" },
      { reference: "John 12:35–36", type: "thematic", note: "Darkness 'overtaking' clarifies the sense of katalambanō in 1:5." },
    ],
  },
  {
    book: "Romans",
    chapterStart: 8, verseStart: 28, chapterEnd: 8, verseEnd: 30,
    title: "The Golden Chain: Foreknown to Glorified",
    translation: "WEB",
    text: "We know that all things work together for good for those who love God, for those who are called according to his purpose. For whom he foreknew, he also predestined to be conformed to the image of his Son, that he might be the firstborn among many brothers. Whom he predestined, those he also called. Whom he called, those he also justified. Whom he justified, those he also glorified.",
    summary: "Paul grounds the believer's assurance amid suffering in God's unbreakable purpose, traced from eternal foreknowledge to final glorification.",
    status: "in_progress",
    themes: ["providence", "justification", "redemption"],
    sources: [
      { title: "The Epistle to the Romans (NICNT)", pages: "546–560", note: "Textual problem in v. 28 and the meaning of proegnō." },
    ],
    notes: [
      { type: "observation", title: "Five aorist verbs in unbroken sequence", body: "προέγνω, προώρισεν, ἐκάλεσεν, ἐδικαίωσεν, ἐδόξασεν — each link takes up the object of the previous. Nobody is lost between links. Even 'glorified' is aorist, viewing the future as certain from God's vantage." },
      { type: "grammar", title: "Text-critical issue in v. 28", body: "P46, A, B read ὁ θεός as explicit subject of συνεργεῖ ('God works all things together'); א, C, D omit it. Even without ὁ θεός, God is the implied subject (the alternative that 'all things' is the subject makes things impersonal agents of good). Sense is unchanged: God is the worker." },
      { type: "grammar", title: "'Foreknew' — cognitive or relational?", body: "προγινώσκω here likely carries the OT sense of yada' as covenantal choosing (Amos 3:2; Gen 18:19; Jer 1:5): 'whom he set his love upon beforehand'. Its object is persons, not facts about persons." },
      { type: "literary_context", title: "Within 8:18–39", body: "The section addresses present suffering (8:18) and the groaning of creation and believers (8:22–23). Vv. 28–30 supply the ground for hope; vv. 31–39 draw the triumphant conclusion." },
      { type: "theology", title: "The goal: conformity to the Son's image", body: "Predestination is not bare destiny but teleological — conformity to Christ (v. 29) so that he is 'firstborn among many brothers'. Election serves Christ's pre-eminence and the family of God." },
      { type: "application", title: "Assurance in suffering", body: "'Good' (v. 28) is defined by v. 29 — Christlikeness, not comfort. Every providence, including affliction, is bent toward that end." },
    ],
    words: [
      { lemma: "προγινώσκω", transliteration: "proginōskō", language: "greek", strongs: "G4267", gloss: "to know beforehand; to choose beforehand", semanticRange: "Prior cognition (Acts 26:5; 2 Pet 3:17); of God's prior relational election (Rom 11:2; 1 Pet 1:20, of Christ).", occurrences: 5, notes: "Every NT instance with God as subject has a personal object." },
      { lemma: "δικαιόω", transliteration: "dikaioō", language: "greek", strongs: "G1344", gloss: "to justify, declare righteous, vindicate", semanticRange: "Forensic declaration (Rom 3:24, 28; 4:5 — 'justifies the ungodly'); to show to be right (Luke 7:29; Matt 11:19).", occurrences: 39, notes: "LXX background: Deut 25:1, Prov 17:15 — judges 'justify' the righteous, i.e., declare, not make." },
      { lemma: "σύμμορφος", transliteration: "symmorphos", language: "greek", strongs: "G4832", gloss: "having the same form, conformed", semanticRange: "Sharing in form/nature; Phil 3:21 of the resurrection body conformed to Christ's glorious body.", occurrences: 2, notes: "Suggests inward transformation culminating in bodily resurrection (cf. 8:23)." },
    ],
    xrefs: [
      { reference: "Ephesians 1:4–5, 11", type: "parallel", note: "Election and predestination 'according to the purpose of his will'." },
      { reference: "Genesis 50:20", type: "thematic", note: "'You meant evil against me, but God meant it for good' — providence turning evil to good." },
      { reference: "Amos 3:2", type: "thematic", note: "'You only have I known' — yada' as covenantal election, backing the relational sense of foreknew." },
      { reference: "Philippians 3:21", type: "parallel", note: "Conformed (symmorphos) to the body of his glory." },
      { reference: "Colossians 1:18", type: "thematic", note: "Christ as firstborn from the dead, pre-eminent in all things." },
    ],
  },
  {
    book: "Psalms",
    chapterStart: 23, verseStart: 1, chapterEnd: 23, verseEnd: 3,
    title: "YHWH My Shepherd",
    translation: "WEB",
    text: "Yahweh is my shepherd; I shall lack nothing. He makes me lie down in green pastures. He leads me beside still waters. He restores my soul. He guides me in the paths of righteousness for his name's sake.",
    summary: "A psalm of trust: David draws on the royal-shepherd image to confess total provision and guidance by YHWH, grounded in God's own name.",
    status: "draft",
    themes: ["shepherd", "providence", "covenant"],
    sources: [
      { title: "Psalms 1–72 (Tyndale OT Commentaries)", pages: "109–112", note: "Shepherd and host imagery." },
    ],
    notes: [
      { type: "observation", title: "First-person confession", body: "The psalm opens with a nominal clause of relationship (YHWH = my shepherd) and immediately derives a consequence: 'I shall not lack'. The rest of vv. 2–3 unpacks that consequence with YHWH as subject of every verb." },
      { type: "historical_context", title: "Shepherd as royal metaphor", body: "In the ANE kings were routinely called shepherds (Hammurabi; Egyptian pharaohs with crook). Israel's God is the true Shepherd-King (Gen 49:24; Ps 80:1), and David — himself a shepherd — reflects on being shepherded." },
      { type: "grammar", title: "'Restores my soul' — נַפְשִׁי יְשׁוֹבֵב", body: "Polel of שׁוּב with nephesh: 'brings back my life/vitality', i.e., revives (cf. Lam 1:11, 16). Not primarily about moral repentance but restoration of life." },
      { type: "question", title: "Paths of righteousness or right paths?", body: "מַעְגְּלֵי־צֶדֶק — 'right tracks' (correct paths) or 'paths of righteousness' (ethical)? Both may be in view; 'for his name's sake' indicates God's reputation as guide is at stake." },
    ],
    words: [
      { lemma: "רָעָה", transliteration: "ra'ah", language: "hebrew", strongs: "H7462", gloss: "to shepherd, pasture, tend", semanticRange: "Literal shepherding (Gen 29:7); of rulers (2 Sam 5:2; Ezek 34); of God (Gen 48:15; Isa 40:11).", occurrences: 167, notes: "Participle ro'i 'my shepherd' — a durative role, not a one-off act." },
      { lemma: "חֶסֶד", transliteration: "hesed", language: "hebrew", strongs: "H2617", gloss: "steadfast love, covenant loyalty", semanticRange: "Loyal love within a relationship, often covenantal; mercy; kindness.", occurrences: 249, notes: "Appears in v. 6 ('goodness and hesed shall follow me'), giving the psalm its covenantal frame." },
    ],
    xrefs: [
      { reference: "Ezekiel 34:11–16", type: "thematic", note: "YHWH promises to shepherd his sheep himself — feed, seek, bind up." },
      { reference: "John 10:11–14", type: "fulfillment", note: "Jesus: 'I am the good shepherd.' Christ takes up YHWH's shepherd role." },
      { reference: "Isaiah 40:11", type: "parallel", note: "He will feed his flock like a shepherd." },
      { reference: "Revelation 7:17", type: "fulfillment", note: "The Lamb will shepherd them and guide them to springs of living water." },
    ],
  },
];

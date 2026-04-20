/**
 * Dictionary of allowed themes, types, periods, continents, and tags.
 * Used by generators, validators, and skills.
 */

const THEMES = {
  histoire_societes: "Histoire & Sociétés",
  geographie_territoires: "Géographie & Territoires",
  litterature: "Littérature",
  langues: "Langues",
  arts_culture: "Arts & Culture",
  usages_traditions: "Usages & Traditions",
  sciences_vivant: "Sciences du vivant",
  sciences_techniques: "Sciences & Techniques",
  loisirs_fiction: "Loisirs & Fiction",
};

const TYPES = {
  personne: "Personne",
  organisme: "Organisme",
  lieu: "Lieu",
  objet: "Objet",
  substance: "Substance",
  oeuvre: "Œuvre",
  concept: "Concept",
  evenement: "Événement",
  periode: "Période",
  entite: "Entité",
  fiction: "Fiction",
};

const PERIODS = {
  prehistoire: "Préhistoire",
  antiquite: "Antiquité",
  moyen_age: "Moyen Âge",
  temps_modernes: "Temps modernes",
  epoque_contemporaine: "Époque contemporaine",
};

const CONTINENTS = {
  europe: "Europe",
  asie: "Asie",
  afrique: "Afrique",
  amerique: "Amérique",
  oceanie: "Océanie",
};

/**
 * Describes the sub-directory hierarchy for each theme.
 * Used by skills to determine the target file path.
 */
const THEME_HIERARCHY = {
  histoire_societes: ["periode", "continent", "pays"],
  arts_culture: ["periode", "continent", "pays"],
  litterature: ["periode", "continent", "pays"],
  langues: ["langue"],
  geographie_territoires: ["continent", "pays"],
  usages_traditions: ["continent"],
  sciences_vivant: ["discipline"],
  sciences_techniques: ["discipline"],
  loisirs_fiction: ["sous_categorie"],
};

const TAGS = {
  // Themes (used as tags to encode file hierarchy)
  themes: Object.keys(THEMES),
  // Periods
  periodes: Object.keys(PERIODS),
  // Continents
  continents: Object.keys(CONTINENTS),
  // Sub-categories (disciplines, etc.)
  sous_categories: [
    "astronomie",
    "technologie",
    "fiction",
    "sports",
    "culture_pop",
  ],
  // Languages (used as sub-dirs under langues/)
  langues: ["francais", "mandarin", "anglais"],
  // Society / history / power
  societe: [
    "politique",
    "guerre",
    "empire",
    "colonisation",
    "revolution",
    "societe",
    "economie",
    "pouvoir",
  ],
  // Intellectual domains
  savoir: [
    "philosophie",
    "science",
    "technologie",
    "medecine",
    "religion",
    "droit",
    "education",
  ],
  // Culture / arts
  culture: [
    "art",
    "musique",
    "litterature",
    "cinema",
    "theatre",
    "culture_pop",
    "esthetique",
  ],
  // Scientific lenses
  sciences: ["biologie", "physique", "chimie", "espace", "nature"],
  // Geography details
  geographie: ["ville", "region", "territoire"],
  // Human / behavior
  humain: ["psychologie", "comportement", "identite", "langage"],
  // Meta / thinking tools
  meta: ["systeme", "structure", "classification", "symbole", "concept"],
};

const VALID_TAGS = new Set(Object.values(TAGS).flat());

/**
 * Labels for sub-category keys used in file paths.
 * Covers periods, continents, disciplines, and other sub-categories.
 */
const SUB_LABELS = {
  ...PERIODS,
  ...CONTINENTS,
  francais: "Français",
  mandarin: "Mandarin",
  anglais: "Anglais",
  astronomie: "Astronomie",
  physique: "Physique",
  chimie: "Chimie",
  technologie: "Technologie",
  biologie: "Biologie",
  medecine: "Médecine",
  nature: "Nature",
  fiction: "Fiction",
  sports: "Sports",
  culture_pop: "Culture pop",
  langage: "Langage",
};

/**
 * Canonical ordering for sub-category keys.
 * Keys not listed here sort alphabetically after listed ones.
 */
const SUB_ORDER = [
  // Periods (chronological)
  ...Object.keys(PERIODS),
  // Languages
  "francais",
  "mandarin",
  "anglais",
  // Continents
  ...Object.keys(CONTINENTS),
  // Disciplines
  "astronomie",
  "physique",
  "chimie",
  "technologie",
  "biologie",
  "medecine",
  "nature",
  // Loisirs sub-categories
  "sports",
  "culture_pop",
  "fiction",
  // Vocabulaire sub-files
  "langage",
];

module.exports = {
  THEMES,
  TYPES,
  PERIODS,
  CONTINENTS,
  THEME_HIERARCHY,
  TAGS,
  VALID_TAGS,
  SUB_LABELS,
  SUB_ORDER,
};

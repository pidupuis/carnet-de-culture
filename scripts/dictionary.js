/**
 * Dictionary of allowed themes and types with human-readable labels.
 * Used by generators to produce formatted output.
 */

const THEMES = {
  histoire_societes: "Histoire & Sociétés",
  geographie_territoires: "Géographie & Territoires",
  langue_litterature: "Langue & Littérature",
  arts_culture: "Arts & Culture",
  usages_traditions: "Usages & Traditions",
  sciences_vivant: "Sciences du vivant",
  sciences_techniques: "Sciences & Techniques",
  loisirs_fiction: "Loisirs & Fiction",
  mandarin: "Mandarin",
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

const TAGS = {
  // Geography / spatial thinking
  geographie: [
    "europe",
    "asie",
    "afrique",
    "amerique",
    "oceanie",
    "ville",
    "region",
    "territoire",
  ],
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
  // Time / structure
  temps: ["antiquite", "moyen_age", "moderne", "contemporain"],
  // Human / behavior
  humain: ["psychologie", "comportement", "identite", "langage"],
  // Meta / thinking tools
  meta: ["systeme", "structure", "classification", "symbole", "concept"],
};

const VALID_TAGS = new Set(Object.values(TAGS).flat());

module.exports = { THEMES, TYPES, TAGS, VALID_TAGS };

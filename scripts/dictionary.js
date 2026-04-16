/**
 * Dictionary of allowed themes and types with human-readable labels.
 * Used by generators to produce formatted output.
 */

const THEMES = {
  histoire_societes:    "Histoire & Sociétés",
  geographie_territoires: "Géographie & Territoires",
  langue_litterature:   "Langue & Littérature",
  arts_culture:         "Arts & Culture",
  sciences_vivant:      "Sciences du vivant",
  sciences_techniques:  "Sciences & Techniques",
  usages_traditions:    "Usages & Traditions",
  loisirs_fiction:      "Loisirs & Fiction",
};

const TYPES = {
  personne:  "Personne",
  organisme: "Organisme",
  lieu:      "Lieu",
  objet:     "Objet",
  substance: "Substance",
  oeuvre:    "Œuvre",
  concept:   "Concept",
  evenement: "Événement",
  periode:   "Période",
  entite:    "Entité",
  fiction:   "Fiction",
};

module.exports = { THEMES, TYPES };

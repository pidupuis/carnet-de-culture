#!/usr/bin/env node

/**
 * One-shot migration script.
 * Reads all flat data/*.yaml files and redistributes entries into
 * a hierarchical folder structure under data/.
 *
 * Usage: node scripts/migrate.js [--dry-run]
 */

const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");

const DATA_DIR = path.join(__dirname, "..", "data");
const DRY_RUN = process.argv.includes("--dry-run");

// ---------------------------------------------------------------------------
// 1. Read all current flat YAML files
// ---------------------------------------------------------------------------
const flatFiles = fs
  .readdirSync(DATA_DIR)
  .filter((f) => f.endsWith(".yaml"))
  .sort();

const allEntries = [];
for (const file of flatFiles) {
  const raw = fs.readFileSync(path.join(DATA_DIR, file), "utf8");
  const parsed = yaml.load(raw);
  if (!Array.isArray(parsed)) continue;
  for (const entry of parsed) {
    allEntries.push(entry);
  }
}

console.log(
  `Loaded ${allEntries.length} entries from ${flatFiles.length} files.\n`,
);

// ---------------------------------------------------------------------------
// 2. Helpers
// ---------------------------------------------------------------------------

const CONTINENTS = ["europe", "asie", "afrique", "amerique", "oceanie"];

const TAG_TO_PERIOD = {
  antiquite: "antiquite",
  moyen_age: "moyen_age",
  moderne: "temps_modernes",
  contemporain: "epoque_contemporaine",
};

/** Map discipline tags → discipline file names */
const DISCIPLINE_MAP = {
  biologie: "biologie",
  medecine: "medecine",
  nature: "nature",
  physique: "physique",
  chimie: "chimie",
  espace: "astronomie",
  technologie: "technologie",
};

/**
 * Extract first 4-digit year from a string.
 * Handles negative (av. J.-C.) by checking surrounding text.
 * Returns a number or null.
 */
function extractYear(str) {
  if (!str) return null;
  const s = String(str);

  // Handle "VIIIe siècle av. J.-C." style
  const romanMatch = s.match(
    /(\b[IVXLCDM]+e)\s+si[eè]cle\s*(av(?:ant|\.)?\s*J\.?-?C\.?)?/i,
  );
  if (romanMatch) {
    const roman = romanMatch[1].replace(/e$/i, "");
    const century = romanToInt(roman);
    if (century) {
      const year = (century - 1) * 100;
      return romanMatch[2] ? -year : year;
    }
  }

  // Handle "IIe et IIIe siècle" → take first
  const centuryMatch = s.match(/(\b[IVXLCDM]+)e/i);
  if (centuryMatch && s.includes("siècle")) {
    const century = romanToInt(centuryMatch[1]);
    if (century) {
      const year = (century - 1) * 100;
      return s.includes("av") ? -year : year;
    }
  }

  // Handle standard years: "1865", "1832-1898", "9 août 1564"
  const yearMatch = s.match(/(\d{3,4})/);
  if (yearMatch) {
    const y = parseInt(yearMatch[1], 10);
    // Check for "av. J.-C." nearby
    if (s.includes("av")) return -y;
    return y;
  }

  return null;
}

function romanToInt(s) {
  const map = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
  let total = 0;
  for (let i = 0; i < s.length; i++) {
    const cur = map[s[i].toUpperCase()] || 0;
    const next = map[(s[i + 1] || "").toUpperCase()] || 0;
    total += cur < next ? -cur : cur;
  }
  return total || null;
}

/**
 * Given a year, determine the historical period.
 */
function yearToPeriod(year) {
  if (year === null || year === undefined) return null;
  if (year < -3000) return "prehistoire";
  if (year < 476) return "antiquite";
  if (year < 1492) return "moyen_age";
  if (year < 1789) return "temps_modernes";
  return "epoque_contemporaine";
}

/**
 * Get tags from an entry.
 */
function getTags(entry) {
  return Array.isArray(entry.tags) ? entry.tags : [];
}

/**
 * Get continent from tags.
 */
function getContinent(entry) {
  const tags = getTags(entry);
  return CONTINENTS.find((c) => tags.includes(c)) || null;
}

/**
 * Get period from tags (direct tag match) or from date attributes.
 */
function getPeriod(entry, subjectEntries) {
  const tags = getTags(entry);

  // Direct tag match
  for (const [tag, period] of Object.entries(TAG_TO_PERIOD)) {
    if (tags.includes(tag)) return period;
  }

  // Infer from date attributes across all entries for this subject
  for (const e of subjectEntries) {
    if (
      ["date", "dates", "decouverte", "epoque", "couronnement"].includes(
        e.attribute,
      )
    ) {
      const year = extractYear(String(e.value));
      if (year !== null) return yearToPeriod(year);
    }
  }

  return null;
}

/**
 * Get discipline from tags for science themes.
 */
function getDiscipline(entry) {
  const tags = getTags(entry);
  for (const [tag, discipline] of Object.entries(DISCIPLINE_MAP)) {
    if (tags.includes(tag)) return discipline;
  }
  return null;
}

// ---------------------------------------------------------------------------
// 3. Group entries by subject within each theme
// ---------------------------------------------------------------------------
// { theme -> { subject -> [entries] } }
const byThemeSubject = new Map();

for (const entry of allEntries) {
  const theme = entry.theme;
  if (!byThemeSubject.has(theme)) byThemeSubject.set(theme, new Map());
  const subjects = byThemeSubject.get(theme);
  if (!subjects.has(entry.subject)) subjects.set(entry.subject, []);
  subjects.get(entry.subject).push(entry);
}

// ---------------------------------------------------------------------------
// 4. Classification: determine target file path for each subject group
// ---------------------------------------------------------------------------

// Manual overrides for ambiguous cases
const MANUAL_PERIOD = {
  // Quattrocento & Cinquecento = Renaissance = temps_modernes
  Quattrocento: "temps_modernes",
  Cinquecento: "temps_modernes",
  // Empire ottoman spans periods but founding ~1299 = moyen_age
  "Empire ottoman": "moyen_age",
  "Empire byzantin": "moyen_age",
  "Prise de Constantinople": "moyen_age",
  // Giotto: Trecento (1266-1337)
  Giotto: "moyen_age",
  // Vâtsyâyana: IIe-IIIe siècle
  Vâtsyâyana: "antiquite",
  // histoire_societes unsorted
  "Clara Petacci": "epoque_contemporaine",
  "Henri-Désiré Landru": "epoque_contemporaine",
  "Guillaume Apollinaire": "epoque_contemporaine",
  "Yves Blanc": "epoque_contemporaine",
  "Premier vol 1890": "epoque_contemporaine",
  "Premier vol maîtrisé 1903": "epoque_contemporaine",
  "Sœur Emmanuelle": "epoque_contemporaine",
  Voïvode: "moyen_age",
  "Maison de Habsbourg": "temps_modernes",
  Cérès: "antiquite",
  Jason: "antiquite",
  Œcuménisme: "epoque_contemporaine",
  // arts_culture unsorted
  Arlequin: "temps_modernes",
  "Pierre-Auguste Renoir": "epoque_contemporaine",
  "Le déjeuner des canotiers": "epoque_contemporaine",
  "Le bal du moulin de la Galette": "epoque_contemporaine",
  "Paul McCartney": "epoque_contemporaine",
  Fifre: "temps_modernes",
  "Monsieur Verdoux": "epoque_contemporaine",
  "Rowan Atkinson": "epoque_contemporaine",
};

// { targetPath -> [entries] }
const fileMap = new Map();
const unsorted = [];

for (const [theme, subjects] of byThemeSubject) {
  for (const [subject, entries] of subjects) {
    let targetPath;

    switch (theme) {
      // ===== Themes with period → continent → pays =====
      case "histoire_societes":
      case "arts_culture":
      case "langue_litterature": {
        // Special: langue_litterature vocabulary → vocabulaire/
        if (theme === "langue_litterature") {
          const tags0 = getTags(entries[0]);
          const isVocab =
            entries.every((e) => e.type === "concept") &&
            !tags0.includes("antiquite") &&
            !tags0.includes("litterature");
          if (isVocab) {
            const hasLangage = tags0.includes("langage");
            let fileName;
            if (hasLangage) fileName = "langage";
            else fileName = "_general";
            targetPath = path.join(theme, "vocabulaire", fileName + ".yaml");
            break;
          }

          // Special: langue_litterature prix/entites without period but with litterature tag
          const isLitteratureEntity =
            entries.some((e) => e.type === "entite") &&
            getTags(entries[0]).includes("litterature") &&
            !getTags(entries[0]).includes("antiquite");
          if (isLitteratureEntity) {
            // Prix Goncourt (1903), Prix Femina (1904) → epoque_contemporaine
            const year = extractYearFromSubjectEntries(entries);
            const period =
              year !== null ? yearToPeriod(year) : "epoque_contemporaine";
            const continent = getContinent(entries[0]) || "europe";
            targetPath = path.join(theme, period, continent + ".yaml");
            break;
          }
        }

        // Determine period
        let period = MANUAL_PERIOD[subject] || getPeriod(entries[0], entries);

        if (!period) {
          // Try to infer from date values
          const year = extractYearFromSubjectEntries(entries);
          if (year !== null) {
            period = yearToPeriod(year);
          }
        }

        if (!period) {
          unsorted.push({
            theme,
            subject,
            entries,
            reason: "no period found",
          });
          break;
        }

        // Determine continent
        const continent = getContinent(entries[0]);
        if (continent) {
          targetPath = path.join(theme, period, continent + ".yaml");
        } else {
          // Default continent by context:
          // - antiquite entries in langue_litterature are typically Greek
          // - most histoire_societes entries without continent are European
          // - arts_culture without continent: general
          if (
            (theme === "langue_litterature" || theme === "histoire_societes") &&
            (period === "antiquite" || period === "moyen_age")
          ) {
            targetPath = path.join(theme, period, "europe.yaml");
          } else {
            targetPath = path.join(theme, period, "_general.yaml");
          }
        }
        break;
      }

      // ===== Themes with continent =====
      case "geographie_territoires":
      case "usages_traditions": {
        const continent = getContinent(entries[0]);
        if (continent) {
          targetPath = path.join(theme, continent + ".yaml");
        } else {
          targetPath = path.join(theme, "_general.yaml");
        }
        break;
      }

      // ===== Themes with discipline =====
      case "sciences_vivant":
      case "sciences_techniques": {
        const discipline = getDiscipline(entries[0]);
        if (discipline) {
          targetPath = path.join(theme, discipline + ".yaml");
        } else {
          targetPath = path.join(theme, "_general.yaml");
        }
        break;
      }

      // ===== Loisirs & fiction =====
      case "loisirs_fiction": {
        const tags = getTags(entries[0]);
        const types = entries.map((e) => e.type);
        if (types.includes("fiction")) {
          targetPath = path.join(theme, "fiction.yaml");
        } else if (
          tags.includes("culture_pop") &&
          (subject.includes("Fosbury") ||
            entries.some((e) => e.attribute === "palmares"))
        ) {
          targetPath = path.join(theme, "sports.yaml");
        } else {
          targetPath = path.join(theme, "culture_pop.yaml");
        }
        break;
      }

      // ===== Mandarin =====
      case "mandarin": {
        targetPath = path.join(theme, "mandarin.yaml");
        break;
      }

      default:
        unsorted.push({ theme, subject, entries, reason: "unknown theme" });
    }

    if (targetPath) {
      if (!fileMap.has(targetPath)) fileMap.set(targetPath, []);
      fileMap.get(targetPath).push({ subject, entries });
    }
  }
}

/**
 * Extract year from any date-like attribute in the entries for a subject
 */
function extractYearFromSubjectEntries(entries) {
  const dateAttrs = [
    "date",
    "dates",
    "decouverte",
    "epoque",
    "couronnement",
    "creation",
    "naissance",
    "naissance_officielle",
  ];
  for (const e of entries) {
    if (dateAttrs.includes(e.attribute)) {
      const year = extractYear(String(e.value));
      if (year !== null) return year;
    }
  }
  // Also try the value field of any entry
  for (const e of entries) {
    const year = extractYear(String(e.value));
    if (year !== null) return year;
  }
  return null;
}

// ---------------------------------------------------------------------------
// 5. Build tags for each entry based on target path
// ---------------------------------------------------------------------------

function buildPathTags(targetPath) {
  const parts = targetPath.replace(/\.yaml$/, "").split(path.sep);
  // All path components become tags, except filenames starting with _ (fallback names like _general)
  const fileName = parts[parts.length - 1];
  if (fileName.startsWith("_")) {
    return parts.slice(0, -1);
  }
  return parts;
}

// ---------------------------------------------------------------------------
// 6. Sort entries within each file: chronologically by subject, then alpha
// ---------------------------------------------------------------------------

function getSortKey(subjectEntries) {
  const year = extractYearFromSubjectEntries(subjectEntries);
  return year;
}

for (const [targetPath, subjectGroups] of fileMap) {
  subjectGroups.sort((a, b) => {
    const ya = getSortKey(a.entries);
    const yb = getSortKey(b.entries);

    // Both have dates → chronological
    if (ya !== null && yb !== null) return ya - yb;
    // Only one has a date → dated first
    if (ya !== null) return -1;
    if (yb !== null) return 1;
    // Neither → alphabetical
    return a.subject.localeCompare(b.subject, "fr");
  });
}

// ---------------------------------------------------------------------------
// 7. Write files
// ---------------------------------------------------------------------------

function buildEntry(entry, pathTags) {
  const newEntry = {};
  if (entry.type) newEntry.type = entry.type;

  // Build tags: ensure path tags are present, keep existing semantic tags
  const existingTags = Array.isArray(entry.tags) ? [...entry.tags] : [];
  const allTags = [...new Set([...pathTags, ...existingTags])];

  // Remove old period tags that got remapped
  const oldPeriodTags = ["moderne", "contemporain"];
  const finalTags = allTags.filter((t) => !oldPeriodTags.includes(t));

  newEntry.tags = finalTags;
  newEntry.subject = entry.subject;
  newEntry.attribute = entry.attribute;
  newEntry.value = entry.value;

  return newEntry;
}

let totalWritten = 0;
const report = [];

for (const [targetPath, subjectGroups] of fileMap) {
  const pathTags = buildPathTags(targetPath);
  const yamlEntries = [];

  for (const { entries } of subjectGroups) {
    for (const entry of entries) {
      yamlEntries.push(buildEntry(entry, pathTags));
    }
  }

  const fullPath = path.join(DATA_DIR, targetPath);

  if (DRY_RUN) {
    report.push(`[DRY] ${targetPath}: ${yamlEntries.length} entries`);
  } else {
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    const yamlStr = yaml.dump(yamlEntries, {
      lineWidth: -1,
      noRefs: true,
      quotingType: '"',
      forceQuotes: false,
    });
    fs.writeFileSync(fullPath, yamlStr, "utf8");
    report.push(`${targetPath}: ${yamlEntries.length} entries`);
  }

  totalWritten += yamlEntries.length;
}

// ---------------------------------------------------------------------------
// 8. Report
// ---------------------------------------------------------------------------

console.log("=== Migration Report ===\n");
console.log(`Total entries: ${allEntries.length}`);
console.log(`Entries written: ${totalWritten}`);
console.log(`Unsorted entries: ${unsorted.length}`);
console.log(`Files created: ${fileMap.size}\n`);

console.log("--- Files ---");
for (const line of report.sort()) {
  console.log(`  ${line}`);
}

if (unsorted.length > 0) {
  console.log("\n--- Unsorted (need manual classification) ---");
  for (const { theme, subject, reason } of unsorted) {
    console.log(`  [${theme}] ${subject}: ${reason}`);
  }
}

if (DRY_RUN) {
  console.log("\n(Dry run — no files were written.)");
}

---
name: add-entry
description: "Add a new knowledge entry to the carnet-de-culture. Use when: adding a fact, recording something learned, adding a new piece of general culture knowledge, noting a new definition, person, place, event, or concept. Also works when the user drops a single word or name discovered while reading."
argument-hint: "Describe what you learned (optionally mention what you were reading)"
---

# Add Knowledge Entry

Add a new fact to the carnet-de-culture knowledge base by appending correctly formatted YAML entries to the appropriate data file.

## Core Principles

1. **Minimal input accepted** — the user can provide as little as a single word. Infer theme, type, tags, and attributes from context and verification.
2. **Concise values** — keep entry values short and memorable. One sentence max. For vocabulary: one core definition (the most common sense), not all senses. If you can say it in under 10 words, do.
3. **Don't over-enrich** — add only the most useful 1-3 attributes per subject. This is a memory aid, not an encyclopedia.

## Procedure

### 1. Understand the input

The user describes something they learned in natural language — or provides just a word/name with no detail.

Extract:

- **What** is the subject (a person, place, concept, event, work, etc.)
- **What facts** about it (each fact = one attribute/value pair)
- **Reading context** (optional) — if the user mentions a book, chapter, article, or author they were reading, note it. The context is **not stored** as an attribute — it is used only to guide research and disambiguation in step 2.

If the user gave **only a word or name**, infer intent:

- Common/uncommon French word → `langues` / `concept` with `definition` → `data/langues/francais.yaml`
- Person's name → look up who they are
- Place name → look up where/what it is
- Domain term → appropriate theme

### 2. Fact-check against the Internet

Before recording anything, verify the facts using `fetch_webpage` on reliable sources (Wikipedia, Wiktionary, or other authoritative references):

1. Search for the subject on Wikipedia (fr.wikipedia.org) or Wiktionary (fr.wiktionary.org) depending on the topic.
   - **If a reading context was provided**: use it to disambiguate the search when the term is ambiguous or polysemous. For example, searching "Phémios" with context "L'Odyssée" → search for "Phémios Odyssée" or go to `fr.wikipedia.org/wiki/Phémios`. For unambiguous terms (e.g. a common French word), search normally — don't force context into every query.
2. Cross-check each fact the user provided: dates, names, definitions, attributions.
3. **Use the verified sources to refine the wording** — prefer precise, well-established formulations over the user's casual phrasing. But **keep values concise**: one short sentence or phrase. Do NOT copy long paragraphs.
4. Only add extra attributes (etymology, synonyms) if they are genuinely interesting or memorable — not systematically.
   - **If a reading context was provided**: prioritize attributes that relate to the reading context over generic facts. For example, if the user is reading about the Odyssey, Phémios's role in the narrative ("aède épargné par Ulysse") is more relevant than generic biographical trivia.
5. Report the results to the user:
   - **Confirmed** — fact matches source(s)
   - **Corrected** — source gives a different or more precise value → propose the improved wording
   - **Enriched** — source provides a useful additional fact worth adding (keep it to 1-2 extras max)
   - **Unverifiable** — no reliable source found → warn the user
6. Proceed only with confirmed or user-approved facts.

### 3. Determine the theme and target file

Read [dictionary.js](../../../scripts/dictionary.js) for the current list of themes (`THEMES`), periods (`PERIODS`), continents (`CONTINENTS`), and the hierarchy per theme (`THEME_HIERARCHY`). Pick the theme that best fits:

| Theme key                | Use for                                                             |
| ------------------------ | ------------------------------------------------------------------- |
| `histoire_societes`      | Historical events, people in history, political entities, dynasties |
| `geographie_territoires` | Places, countries, mountains, rivers, geographic facts              |
| `litterature`            | Authors, literary works, mythology, grammar                         |
| `langues`                | Vocabulary & language learning (French, Mandarin, English…)         |
| `arts_culture`           | Artists, artworks, music, architecture, cultural objects            |
| `usages_traditions`      | Customs, food, drinks, rituals, everyday culture                    |
| `sciences_vivant`        | Biology, medicine, anatomy, zoology, botany                         |
| `sciences_techniques`    | Physics, chemistry, engineering, astronomy, technology              |
| `loisirs_fiction`        | Sports, games, fictional characters, TV, hobbies                    |

Then determine the **target file path** based on the theme's hierarchy (`THEME_HIERARCHY`):

| Theme                    | Hierarchy           | Example path                                         |
| ------------------------ | ------------------- | ---------------------------------------------------- |
| `histoire_societes`      | période → continent | `data/histoire_societes/temps_modernes/europe.yaml`  |
| `arts_culture`           | période → continent | `data/arts_culture/epoque_contemporaine/europe.yaml` |
| `litterature`            | période → continent | `data/litterature/antiquite/europe.yaml`             |
| `langues`                | langue              | `data/langues/francais.yaml`                         |
| `geographie_territoires` | continent           | `data/geographie_territoires/europe.yaml`            |
| `usages_traditions`      | continent           | `data/usages_traditions/asie.yaml`                   |
| `sciences_vivant`        | discipline          | `data/sciences_vivant/biologie.yaml`                 |
| `sciences_techniques`    | discipline          | `data/sciences_techniques/astronomie.yaml`           |
| `loisirs_fiction`        | sous-catégorie      | `data/loisirs_fiction/fiction.yaml`                  |

**Periods** (for `histoire_societes`, `arts_culture`, `litterature`):

- `prehistoire` — before -3000
- `antiquite` — -3000 to 476
- `moyen_age` — 476 to 1492
- `temps_modernes` — 1492 to 1789
- `epoque_contemporaine` — 1789 to present

**`langues` theme**: one flat file per language (`data/langues/francais.yaml`, `data/langues/mandarin.yaml`, `data/langues/anglais.yaml`). French is the default for vocabulary words. Tags must include `langues` + the language key (e.g. `francais`). Mandarin entries use special attributes (`pinyin`, `sens`, `composants` — see below).

File naming: snake_case, no empty files. If the target file doesn't exist yet, create it with the new entry.

### 4. Determine the type

Read [dictionary.js](../../../scripts/dictionary.js) for the current list of types. Pick the most specific one:

| Type key    | Use for                                               |
| ----------- | ----------------------------------------------------- |
| `personne`  | A named individual                                    |
| `lieu`      | A geographic location                                 |
| `oeuvre`    | A creative work (book, painting, film, song)          |
| `concept`   | An idea, definition, or abstract notion               |
| `evenement` | A dated historical event                              |
| `periode`   | A time period or era                                  |
| `entite`    | An institution, dynasty, organization, species family |
| `objet`     | A physical object or structure                        |
| `substance` | A material, chemical, food, or drink                  |
| `fiction`   | A fictional character or place                        |
| `organisme` | A living organism                                     |

### 5. Choose attributes

Attributes are free-form snake_case keys. Use consistent names based on the type:

**personne**: `vrai_nom`, `dates`, `nationalite`, `role`, `surnom`, `invention`, `lieu_naissance`, `oeuvre_notable`, `palmares`, `epoque`, `titre`
**lieu**: `localisation`, `altitude`, `particularite`, `autre_nom`, `titre`, `definition`, `etymologie`
**oeuvre**: `auteur`, `artiste`, `realisateur`, `createur`, `date`, `note`, `citation`, `corpus`, `chaine`
**concept**: `definition`, `synonyme`, `etymologie`, `note`
**evenement**: `date`, `description`, `effet`, `consequence`, `fondateur`
**periode**: `definition`, `dates`
**entite**: `definition`, `role`, `etymologie`, `parents`
**objet**: `definition`, `role`, `hauteur`, `decouverte`, `reclassification`
**substance**: `definition`, `molecule`, `fabricant`, `etymologie`
**fiction**: `definition`
**mandarin**: `pinyin`, `sens`, `composants`, `mnemonique`, `traditionnel`, `note`

### 6. Assign tags

Read [dictionary.js](../../../scripts/dictionary.js) for the canonical tag list organized by category. Assign 1-4 tags that best describe the entry's domain.

If no existing tag fits well, **ask the user** whether to:

- Use the closest existing tag
- Create a new tag — in that case, also add it to the appropriate category in `TAGS` in [dictionary.js](../../../scripts/dictionary.js)

### 7. Check for duplicates

Search across `data/**/*.yaml` (the entire data hierarchy) for the subject name using `grep_search`.

- If the subject exists **and** an entry with the same `attribute` key already exists for that subject, **compare values**:
  - If the existing value conveys the same information → **skip** that entry and inform the user it already exists.
  - If the new value adds meaningful detail or corrects the existing one → **ask the user** whether to update (replace) the existing entry or skip it.
- If the subject exists but the attribute is new → append the new entry after the last entry for that subject to keep entries grouped.
- If the subject does not exist → **insert in chronological order** (see step 8).

### 8. Write the entries

Write to the target file determined in step 3. Each attribute is a separate YAML entry:

```yaml
- type: <type_key>
  tags:
    - <theme_key>
    - <sub_category>
    - <continent>
    - <semantic_tag1>
  subject: <Subject Name>
  attribute: <attribute_name>
  value: <value>
```

Rules:

- **No `theme` field** — the theme is inferred from the first directory level under `data/`
- **Tags must include**: the theme key + every sub-directory name in the file path + any additional semantic tags. Example: file `data/histoire_societes/antiquite/europe.yaml` → tags must contain `histoire_societes`, `antiquite`, `europe`. Filenames starting with `_` (like `_general.yaml`) are NOT included as tags.
- One entry per attribute/value pair
- All entries for the same subject share the same `type` and `tags`
- Numeric-only values must be quoted: `value: "1502"`
- Values with colons or special YAML characters must be quoted
- **Chronological insertion**: entries within each file are ordered by date (oldest first). Insert new entries at the correct chronological position based on their date attributes. Subjects without dates go at the end of the file, sorted alphabetically.
- **Keep values concise** — one short sentence or phrase. If under 10 words, prefer that. This is a memory aid.
- For vocabulary/definitions: give the **single most useful definition**, not multiple senses

### 9. Validate and regenerate

Run in terminal:

```
npm run generate
```

This validates all entries (tags, types, themes) and regenerates output files (`output/knowledge.json` and `output/knowledge.md`). Fix any errors before finishing.

### 10. Generate markdown preview

If the user wants to review the rendered output, or before committing, run:

```
npm run generate:md
```

This regenerates `output/knowledge.md` with one-liner per subject, separated by blank lines, grouped under theme headings.

## Mandarin special case

For Chinese characters, use file `data/langues/mandarin.yaml`. Always include `pinyin` and `sens` attributes. Other attributes (`composants`, `mnemonique`, `traditionnel`, `note`) are optional. Tags must include `langues`, `mandarin`, and `langage`.

## Example

User says: "I learned that Frida Kahlo was a Mexican painter born in 1907, known for self-portraits"

→ Write to `data/arts_culture/epoque_contemporaine/amerique.yaml`:

```yaml
- type: personne
  tags:
    - arts_culture
    - epoque_contemporaine
    - amerique
    - art
  subject: Frida Kahlo
  attribute: role
  value: peintre mexicaine, connue pour ses autoportraits
- type: personne
  tags:
    - arts_culture
    - epoque_contemporaine
    - amerique
    - art
  subject: Frida Kahlo
  attribute: dates
  value: 1907-1954
```

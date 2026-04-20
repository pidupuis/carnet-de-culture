---
name: add-entries
description: "Add multiple knowledge entries to the carnet-de-culture in one go. Use when: adding several facts, recording a batch of things learned, adding multiple words/definitions/people/places/events at once. Also works when the user drops words or names discovered while reading — with or without specifying the reading context. Works with minimal input — even a bare list of words or names is enough."
argument-hint: "List what you learned (words, facts, names… optionally with reading context)"
---

# Add Multiple Knowledge Entries (Batch)

Add several facts at once to the carnet-de-culture. Designed to work fast with **minimal user input** — a bare list of words, names, or short phrases is enough.

## Core Principles

1. **Minimal input accepted** — the user can provide as little as a single word per entry. Infer theme, type, tags, and attributes from context and verification.
2. **Concise entries** — keep values short and memorable. One sentence max. For vocabulary words: one core definition only (the most common/useful sense), not an exhaustive dictionary entry.
3. **Batch efficiency** — process all entries together: verify, present, write, then validate once at the end.

## Procedure

### 1. Parse the input

The user provides a list — could be:

- A comma-separated list: "périple, résilience, syncrétisme"
- A numbered list
- A free-form paragraph with multiple facts
- A mix of subjects with varying detail
- **A list of words/names with a reading context**: "Reading _Pourquoi lire les classiques_ by Calvino, chapter _Les Odyssées dans L'Odyssée_. Found: Phémios, aède, Démodokos"

For each item, extract:

- **Subject** — the word, name, or topic
- **Any details provided** — use them, but don't require them
- **Reading context** (optional) — if the user mentions a book, chapter, article, or author they were reading, note it. The context is **not stored** as an attribute — it is used only to guide research, disambiguation, and attribute selection in step 2.

If the user gave **only a word or name with no context**, infer the most likely intent:

- A common/uncommon French word → `langues` / `concept` with `definition` → `data/langues/francais.yaml`
- A person's name → look up who they are
- A place name → look up where/what it is
- An obvious domain term → appropriate theme

### 2. Verify and enrich (lightweight)

For each item, do a **quick verification** using `fetch_webpage` (Wikipedia or Wiktionary):

- For **vocabulary words**: fetch Wiktionary (fr.wiktionary.org), extract the **primary definition only** (most common sense). Keep it to one short sentence. Add `etymologie` only if it's interesting/memorable.
- For **people**: fetch Wikipedia, extract role + dates at minimum.
- For **places**: fetch Wikipedia, extract localisation + key fact.
- For **other**: extract the single most important fact.

**Do NOT over-enrich.** The goal is a concise memory aid, not an encyclopedia entry. One or two attributes per subject is often enough.

#### When reading context is provided

If the user mentioned a book, chapter, article, or author in step 1, use that context to guide research:

- **Disambiguation**: for ambiguous or polysemous terms, append context keywords to Wikipedia/Wiktionary search queries. For example, "Phémios" with context "L'Odyssée" → search `fr.wikipedia.org/wiki/Phémios` or "Phémios Odyssée". For unambiguous terms (e.g. a common French word like "aède"), search normally — don't force context into every query.
- **Sense selection**: for polysemous words, prefer the sense relevant to the reading context over the most common sense. For example, "périple" in a maritime/Homeric context → prefer the original nautical meaning.
- **Tag inference**: use the reading context to help determine appropriate theme, type, and tags. For example, words discovered reading about the Odyssey likely belong to `litterature` with tags like `litterature`, `antiquite`.
- **Attribute relevance**: prioritize attributes that relate to the reading context over generic facts. For example, if the user is reading about the Odyssey, Phémios's role in the narrative ("aède épargné par Ulysse") matters more than generic biographical trivia.

### 3. Determine theme, type, tags, and target file for each

Use the reference tables from the add-entry skill ([SKILL.md](../add-entry/SKILL.md)):

- Theme → determines the first directory level under `data/`
- Sub-category (period, continent, discipline) → determines the sub-path and file — see `THEME_HIERARCHY` in [dictionary.js](../../../scripts/dictionary.js)
- Type → `personne`, `concept`, `lieu`, etc.
- Tags → must include the theme + all path components (except `_general` filenames) + 1-3 semantic tags from [dictionary.js](../../../scripts/dictionary.js)

Target file examples:

- `data/histoire_societes/antiquite/europe.yaml`
- `data/langues/francais.yaml`
- `data/sciences_techniques/astronomie.yaml`

Group entries by target file for efficient writing.

### 4. Check for duplicates

For each subject, `grep_search` across `data/**/*.yaml` (the entire data hierarchy):

- If subject + attribute already exists with equivalent value → **skip silently**
- If subject exists but attribute is new → append after existing entries
- If subject doesn't exist → **insert in chronological order** in the target file (see step 6)

### 5. Present for per-attribute approval

Show all proposed entries grouped by subject, with each attribute individually numbered for accept/reject:

```
### 1. Phémios (personne)
Thème: litterature | Fichier: data/litterature/antiquite/europe.yaml
Tags: litterature, antiquite, europe, litterature
  1.1. **role**: aède d'Ithaque dans l'Odyssée
  1.2. **note**: épargné par Ulysse lors du massacre des prétendants

### 2. aède (concept)
Thème: litterature | Fichier: data/litterature/antiquite/europe.yaml
Tags: litterature, antiquite, europe, litterature
  2.1. **definition**: poète-chanteur de la Grèce antique
  2.2. **etymologie**: du grec aoidós, « chanteur »
```

Then ask: **"Approve all, reject all, or list numbers to accept/reject/edit (e.g. 'accept 1.1, 2.1, 2.2' or 'reject 1.2' or 'edit 2.2: new value')?"**

If the list is ≤ 3 items and the user seems in a hurry (very short input, no reading context), **skip the confirmation and write directly**, just report what was added.

### 6. Write approved entries

Write **only user-approved attributes from step 5** to the appropriate target files. Format per entry:

```yaml
- type: <type_key>
  tags:
    - <theme_key>
    - <sub_category>
    - <continent>
    - <semantic_tag1>
  subject: <Subject>
  attribute: <attribute>
  value: <value>
```

Rules:

- **No `theme` field** — the theme is inferred from the first directory level under `data/`
- **Tags must include**: the theme key + every sub-directory name in the file path (except `_general` filenames) + semantic tags
- One YAML entry per attribute/value pair
- Quote numeric-only values: `value: "1494"`
- Keep values **short** — one sentence or phrase, never a paragraph
- For words/definitions: give the **single most useful definition**, not multiple senses
- **Chronological insertion**: insert entries at the correct chronological position in the file. Subjects without dates go at the end, sorted alphabetically.
- Group entries for the same subject together in the file
- If the target file doesn't exist yet, create it.

### 7. Validate once

Run once after all entries are written:

```
npm run generate
```

Fix any errors. Report total entries added.

## Conciseness Guidelines

| Type            | Good                                                           | Too much                                                                                                                                         |
| --------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Word definition | "voyage maritime circulaire"                                   | "1. voyage maritime autour d'une région. 2. par ext. long voyage. Du grec periplous, de peri (autour) et plous (navigation)..."                  |
| Person          | "physicien allemand, relativité"                               | "physicien théoricien allemand, considéré comme l'un des plus grands scientifiques de tous les temps, connu pour la théorie de la relativité..." |
| Place           | "volcan actif, Sicile (3 357 m)"                               | "stratovolcan actif situé sur la côte est de la Sicile, le plus haut volcan actif d'Europe, culminant à 3 357 mètres..."                         |
| Event           | "traité partageant le Nouveau Monde entre Espagne et Portugal" | "traité signé le 7 juin 1494 entre les couronnes de Castille et du Portugal sous l'arbitrage du pape Alexandre VI..."                            |

**Rule of thumb:** if you can say it in under 10 words, do.

## Examples

### Minimal input

User: "périple, syncrétisme, apocryphe"

→ Look up on Wiktionary → Write 3 concept entries to `data/langues/francais.yaml` with short definitions → Done.

### Mixed input

User: "Etna, Marie Curie, catalyse"

→ Look up each → Write to `data/geographie_territoires/europe.yaml`, `data/sciences_techniques/physique.yaml`, `data/sciences_techniques/chimie.yaml` → Done.

### Single word

User: "étiage"

→ Wiktionary → `langues` / concept / definition: "niveau le plus bas d'un cours d'eau" → `data/langues/francais.yaml` → Done.

### With reading context

User: "Reading _Pourquoi lire les classiques_ by Calvino, chapter _Les Odyssées dans L'Odyssée_. Found: Phémios, aède"

→ Note context: Calvino, Odyssey, Greek antiquity.
→ Search "Phémios" on Wikipedia (disambiguate with "Odyssée") → personne, aède in the Odyssey.
→ Search "aède" on Wiktionary → concept, poète-chanteur.
→ Present:

```
### 1. Phémios (personne)
Thème: litterature | Fichier: data/litterature/antiquite/europe.yaml
Tags: litterature, antiquite, europe, litterature
  1.1. **role**: aède d'Ithaque dans l'Odyssée
  1.2. **note**: épargné par Ulysse lors du massacre des prétendants

### 2. aède (concept)
Thème: litterature | Fichier: data/litterature/antiquite/europe.yaml
Tags: litterature, antiquite, europe, litterature
  2.1. **definition**: poète-chanteur de la Grèce antique
  2.2. **etymologie**: du grec aoidós, « chanteur »
```

User says "accept 1.1, 2.1, 2.2, reject 1.2" → Write 3 entries, skip 1 → `npm run generate`.

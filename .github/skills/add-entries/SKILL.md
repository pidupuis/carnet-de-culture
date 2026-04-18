---
name: add-entries
description: "Add multiple knowledge entries to the carnet-de-culture in one go. Use when: adding several facts, recording a batch of things learned, adding multiple words/definitions/people/places/events at once. Works with minimal input — even a bare list of words or names is enough."
argument-hint: "List what you learned (words, facts, names…)"
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

For each item, extract:

- **Subject** — the word, name, or topic
- **Any details provided** — use them, but don't require them

If the user gave **only a word or name with no context**, infer the most likely intent:

- A common/uncommon French word → `langue_litterature` / `concept` with `definition`
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

### 3. Determine theme, type, tags for each

Use the reference tables from the add-entry skill ([SKILL.md](../add-entry/SKILL.md)):

- Theme → which `data/<theme>.yaml` file
- Type → `personne`, `concept`, `lieu`, etc.
- Tags → 1-3 relevant tags from [dictionary.js](../../../scripts/dictionary.js)

Group entries by theme file for efficient writing.

### 4. Check for duplicates

For each subject, `grep_search` across `data/*.yaml`:

- If subject + attribute already exists with equivalent value → **skip silently**
- If subject exists but attribute is new → append after existing entries
- If subject doesn't exist → append at end of file

### 5. Present a compact summary

Show all proposed entries in a compact table or grouped list:

```
**langue_litterature** — concept
- **périple**: voyage maritime autour d'une région (gr. periplous) [langage]
- **résilience**: capacité à se remettre d'un choc [langage, psychologie]

**histoire_societes** — evenement
- **Traité de Tordesillas**: partage du Nouveau Monde entre Espagne et Portugal (1494) [europe, politique]
```

Then ask: **approve all, select, or edit?**

If the list is ≤ 3 items and the user seems in a hurry (very short input), **skip the confirmation and write directly**, just report what was added.

### 6. Write all entries

Append to the appropriate `data/<theme>.yaml` files. Format per entry:

```yaml
- theme: <theme_key>
  type: <type_key>
  tags:
    - <tag1>
  subject: <Subject>
  attribute: <attribute>
  value: <value>
```

Rules:

- One YAML entry per attribute/value pair
- Quote numeric-only values: `value: "1494"`
- Keep values **short** — one sentence or phrase, never a paragraph
- For words/definitions: give the **single most useful definition**, not multiple senses
- Group entries for the same subject together in the file

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

→ Look up on Wiktionary → Write 3 concept entries with short definitions → Done.

### Mixed input

User: "Etna, Marie Curie, catalyse"

→ Look up each → Write to `geographie_territoires.yaml`, `sciences_techniques.yaml`, `sciences_techniques.yaml` → Done.

### Single word

User: "étiage"

→ Wiktionary → `langue_litterature` / concept / definition: "niveau le plus bas d'un cours d'eau" → Done.

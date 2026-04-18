---
name: add-entry
description: "Add a new knowledge entry to the carnet-de-culture. Use when: adding a fact, recording something learned, adding a new piece of general culture knowledge, noting a new definition, person, place, event, or concept."
argument-hint: "Describe what you learned"
---

# Add Knowledge Entry

Add a new fact to the carnet-de-culture knowledge base by appending correctly formatted YAML entries to the appropriate data file.

## Procedure

### 1. Understand the input

The user describes something they learned in natural language. Extract:

- **What** is the subject (a person, place, concept, event, work, etc.)
- **What facts** about it (each fact = one attribute/value pair)

### 2. Fact-check against the Internet

Before recording anything, verify the facts using `fetch_webpage` on reliable sources (Wikipedia, Wiktionary, or other authoritative references):

1. Search for the subject on Wikipedia (fr.wikipedia.org) or Wiktionary (fr.wiktionary.org) depending on the topic.
2. Cross-check each fact the user provided: dates, names, definitions, attributions.
3. **Use the verified sources to refine the wording** of the entry values — prefer precise, well-established formulations over the user's casual phrasing. Add relevant details found during verification (e.g. etymology, synonyms, additional context) as separate entries.
4. Report the results to the user:
   - **Confirmed** — fact matches source(s)
   - **Corrected** — source gives a different or more precise value → propose the improved wording
   - **Enriched** — source provides useful additional facts worth adding
   - **Unverifiable** — no reliable source found → warn the user
5. Proceed only with confirmed or user-approved facts.

### 3. Determine the theme

Read [dictionary.js](../../../scripts/dictionary.js) for the current list of themes. Pick the one that best fits:

| Theme key                | Use for                                                             |
| ------------------------ | ------------------------------------------------------------------- |
| `histoire_societes`      | Historical events, people in history, political entities, dynasties |
| `geographie_territoires` | Places, countries, mountains, rivers, geographic facts              |
| `langue_litterature`     | Words, definitions, grammar, authors, literary works                |
| `arts_culture`           | Artists, artworks, music, architecture, cultural objects            |
| `usages_traditions`      | Customs, food, drinks, rituals, everyday culture                    |
| `sciences_vivant`        | Biology, medicine, anatomy, zoology, botany                         |
| `sciences_techniques`    | Physics, chemistry, engineering, astronomy, technology              |
| `loisirs_fiction`        | Sports, games, fictional characters, TV, hobbies                    |
| `mandarin`               | Chinese characters only — uses special format (see below)           |

The YAML file to edit is `data/<theme_key>.yaml`.

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

Search the target YAML file for the subject name.

- If the subject exists **and** an entry with the same `attribute` key already exists for that subject, **compare values**:
  - If the existing value conveys the same information → **skip** that entry and inform the user it already exists.
  - If the new value adds meaningful detail or corrects the existing one → **ask the user** whether to update (replace) the existing entry or skip it.
- If the subject exists but the attribute is new → append the new entry after the last entry for that subject to keep entries grouped.
- If the subject does not exist → append at the end of the file.

### 8. Write the entries

Append to `data/<theme_key>.yaml`. Each attribute is a separate YAML entry:

```yaml
- theme: <theme_key>
  type: <type_key>
  tags:
    - <tag1>
    - <tag2>
  subject: <Subject Name>
  attribute: <attribute_name>
  value: <value>
```

Rules:

- One entry per attribute/value pair
- All entries for the same subject share the same `theme`, `type`, and `tags`
- Numeric-only values must be quoted: `value: "1502"`
- Values with colons or special YAML characters must be quoted
- Empty tags list: `tags: []`
- Append at the end of the file (or after last entry for same subject if it exists)

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

For Chinese characters, use theme `mandarin` and file `data/mandarin.yaml`. Always include `pinyin` and `sens` attributes. Other attributes (`composants`, `mnemonique`, `traditionnel`, `note`) are optional.

## Example

User says: "I learned that Frida Kahlo was a Mexican painter born in 1907, known for self-portraits"

→ Append to `data/arts_culture.yaml`:

```yaml
- theme: arts_culture
  type: personne
  tags:
    - art
    - amerique
  subject: Frida Kahlo
  attribute: role
  value: peintre mexicaine, connue pour ses autoportraits
- theme: arts_culture
  type: personne
  tags:
    - art
    - amerique
  subject: Frida Kahlo
  attribute: dates
  value: 1907-1954
```

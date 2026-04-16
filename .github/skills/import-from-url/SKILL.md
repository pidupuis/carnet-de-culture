---
name: import-from-url
description: "Import knowledge entries from an external URL. Use when: the user shares a link/URL/article/webpage and wants to extract general culture facts from it into the carnet-de-culture."
argument-hint: "Paste a URL to extract knowledge from"
---

# Import Knowledge from URL

Read an external webpage, extract noteworthy general-culture facts, present them to the user for approval, then add approved entries using the add-entry skill.

## Procedure

### 1. Fetch the page content

Use the `fetch_webpage` tool to retrieve the main content from the URL the user provided. Use a query that describes what kind of knowledge to look for (e.g. "key facts, dates, people, places, definitions, events").

If the page cannot be fetched or has no useful content, inform the user and stop.

### 2. Read existing data for deduplication

Before extracting, scan the relevant `data/*.yaml` files to identify facts that are already recorded:

1. Use `grep_search` with the main subject name(s) from the article across all `data/*.yaml` files.
2. For each subject found, read the surrounding entries to collect all existing `attribute: value` pairs.
3. Build a list of already-known facts so they can be excluded from the proposal.

During extraction (step 3), **skip any fact that is already recorded** — same subject + same attribute + equivalent value. If a fact partially overlaps (same attribute but the new value adds detail or differs), flag it as an **update candidate** and present both old and new values to the user in step 4.

### 3. Extract candidate knowledge entries

Analyse the fetched content and extract facts that are worth recording in a general-culture notebook. Focus on:

- **People** — birth/death dates, nationality, notable role, famous works
- **Places** — location, altitude, notable features, etymology
- **Events** — date, description, consequences
- **Works** — author/artist, date, notable facts
- **Concepts/Definitions** — clear definitions, etymology
- **Objects/Substances** — what it is, origin, composition

Guidelines for extraction:

- Prefer **precise, atomic facts** (one fact = one future YAML entry)
- Skip trivial, obvious, or overly detailed information
- Skip content that is opinion, speculation, or unsourced claims
- Keep values concise — aim for one sentence or a short phrase
- Write values in **French** (this is a French knowledge base)
- Group facts by subject

### 4. Present the list to the user

Display the extracted facts as a numbered list grouped by subject for the user to review. For each fact, show:

```
### <Subject Name> (<proposed type>)
Thème: <theme_key> | Tags: <tag1>, <tag2>

1. **<attribute>**: <value>
2. **<attribute>**: <value>
...
```

Then ask the user to:

- **Approve all** — proceed with adding everything
- **Select specific items** — by number, to add only some
- **Edit** — modify any values before adding
- **Reject all** — cancel the import

### 5. Add approved entries

For each approved fact, follow the **add-entry** skill procedure (read the full skill at [SKILL.md](../add-entry/SKILL.md)):

1. Open the target `data/<theme_key>.yaml` file
2. Check if the subject already exists (append after last occurrence if so)
3. Append correctly formatted YAML entries
4. Respect all formatting rules (quoting numbers, one entry per attribute, etc.)

Process all entries for one subject at a time to keep the YAML grouped.

### 6. Validate and regenerate

After all entries have been added, run:

```
npm run generate
```

Fix any validation errors before finishing. Report the total number of entries added.

## Example

User shares: `https://en.wikipedia.org/wiki/Marie_Curie`

→ Fetch page → Extract facts → Present:

```
### Marie Curie (personne)
Thème: sciences_techniques | Tags: science, europe

1. **role**: physicienne et chimiste franco-polonaise, pionnière de la radioactivité
2. **dates**: 1867-1934
3. **nationalite**: polonaise, naturalisée française
4. **lieu_naissance**: Varsovie
5. **palmares**: première femme à recevoir un prix Nobel ; seule personne à avoir reçu deux prix Nobel dans deux sciences différentes (physique 1903, chimie 1911)
6. **vrai_nom**: Maria Salomea Skłodowska
```

User approves → add-entry for each → `npm run generate`.

## Notes

- If the article covers **multiple distinct subjects**, group facts by subject and propose separate theme/type/tags for each.
- If a new tag is needed, ask the user before creating it (same rule as add-entry).
- For very long articles, focus on the **most notable and memorable** facts (aim for 3–10 entries per subject, not an exhaustive dump).
- If the URL points to a non-article page (e.g. a video, image, or app), inform the user that extraction is not possible.

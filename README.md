# carnet-de-culture

Personal knowledge base built from YAML source files.

## Structure

- `data/` — YAML source files organized in a hierarchical folder structure (source of truth)
- `output/` — generated files (markdown, JSON), committed
- `scripts/` — generation scripts and shared modules
  - `dictionary.js` — allowed themes, types, periods, continents, and tags
  - `loader.js` — recursive YAML loader (infers theme from directory structure)
  - `validate.js` — validates entries against dictionary and path conventions
  - `generate_markdown.js` — generates `output/knowledge.md`
  - `generate_json.js` — generates `output/knowledge.json`
  - `migrate.js` — one-shot migration script (flat → hierarchical)

### Data hierarchy

Files are organized under `data/<theme>/` with sub-categories that vary by theme:

| Theme                    | Sub-levels          | Example path                                         |
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

### Conventions

- **No `theme` field** in YAML entries — inferred from the first directory level under `data/`
- **Tags must include** the theme + every sub-directory name in the file path + semantic tags
- Filenames starting with `_` (e.g. `_general.yaml`) are fallback names and are NOT included as tags
- Entries within each file are **sorted chronologically** (oldest first); undated entries go at the end, sorted alphabetically
- Files are only created when they contain entries — no empty files

## Usage

```bash
npm run generate       # generate both
npm run generate:md    # markdown only
npm run generate:json  # json only
```

## Output

The generated knowledge base in markdown format: [output/knowledge.md](output/knowledge.md)

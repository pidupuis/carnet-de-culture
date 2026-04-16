# carnet-de-culture

Personal knowledge base built from YAML source files.

## Structure

- `data/` — YAML source files (one per theme, source of truth)
- `output/` — generated files (markdown, JSON), committed
- `scripts/` — generation scripts and shared modules
  - `dictionary.js` — allowed themes and types with labels
  - `loader.js` — shared YAML loader
  - `generate_markdown.js` — generates `output/knowledge.md`
  - `generate_json.js` — generates `output/knowledge.json`

## Usage

```bash
npm run generate       # generate both
npm run generate:md    # markdown only
npm run generate:json  # json only
```

## Output

The generated knowledge base in markdown format: [output/knowledge.md](output/knowledge.md)

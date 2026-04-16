const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");

const DATA_DIR = path.join(__dirname, "..", "data");

/**
 * Reads all .yaml files from data/ and returns a flat array of entries.
 * Files are read in alphabetical order for deterministic output.
 */
function loadEntries() {
  const files = fs
    .readdirSync(DATA_DIR)
    .filter((f) => f.endsWith(".yaml"))
    .sort();

  const entries = [];

  for (const file of files) {
    const filePath = path.join(DATA_DIR, file);
    const raw = fs.readFileSync(filePath, "utf8");
    const parsed = yaml.load(raw);

    if (!Array.isArray(parsed)) {
      console.error(`Warning: ${file} does not contain a YAML list, skipping.`);
      continue;
    }

    entries.push(...parsed);
  }

  return entries;
}

module.exports = { loadEntries };

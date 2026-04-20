const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");
const { THEMES } = require("./dictionary");

const DATA_DIR = path.join(__dirname, "..", "data");

/**
 * Recursively walks a directory and returns all .yaml file paths, sorted.
 */
function walkDir(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkDir(fullPath));
    } else if (entry.name.endsWith(".yaml")) {
      results.push(fullPath);
    }
  }
  return results;
}

/**
 * Reads all .yaml files from data/ (recursively) and returns a flat array of entries.
 * The theme is inferred from the first directory level under data/.
 * Files are read in alphabetical order for deterministic output.
 */
function loadEntries() {
  const files = walkDir(DATA_DIR).sort();

  const entries = [];

  for (const filePath of files) {
    const raw = fs.readFileSync(filePath, "utf8");
    const parsed = yaml.load(raw);
    const relPath = path.relative(DATA_DIR, filePath);
    const pathParts = relPath.split(path.sep);
    // Theme: first directory under data/, or filename without .yaml for root-level files
    const theme =
      pathParts.length > 1
        ? pathParts[0]
        : path.basename(pathParts[0], ".yaml");

    if (!Array.isArray(parsed)) {
      console.error(
        `Warning: ${relPath} does not contain a YAML list, skipping.`,
      );
      continue;
    }

    if (!(theme in THEMES)) {
      console.error(
        `Warning: ${relPath} has unknown theme "${theme}", skipping.`,
      );
      continue;
    }

    for (const entry of parsed) {
      entry.theme = theme;
      // Inject sub-path components (between theme dir and filename) for grouping/ordering
      // e.g. "histoire_societes/antiquite/europe.yaml" → ["antiquite", "europe"]
      // e.g. "mandarin/mandarin.yaml" → []
      // Filename (without .yaml) is included unless it starts with _
      const subParts = pathParts.slice(1, -1); // directories between theme and file
      const fileName = path.basename(pathParts[pathParts.length - 1], ".yaml");
      if (!fileName.startsWith("_")) {
        subParts.push(fileName);
      }
      entry._path = subParts;
      entries.push(entry);
    }
  }

  return entries;
}

module.exports = { loadEntries };

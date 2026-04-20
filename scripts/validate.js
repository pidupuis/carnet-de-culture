#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");
const { THEMES, TYPES, VALID_TAGS } = require("./dictionary");

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

try {
  const files = walkDir(DATA_DIR).sort();
  let errors = 0;
  let totalEntries = 0;

  for (const filePath of files) {
    const raw = fs.readFileSync(filePath, "utf8");
    const parsed = yaml.load(raw);
    const relPath = path.relative(DATA_DIR, filePath);
    const pathParts = relPath.replace(/\.yaml$/, "").split(path.sep);
    const theme = pathParts[0];

    if (!Array.isArray(parsed)) {
      console.error(`Error: ${relPath} does not contain a YAML list.`);
      errors++;
      continue;
    }

    if (!(theme in THEMES)) {
      console.error(`Error: ${relPath} is under unknown theme "${theme}".`);
      errors++;
      continue;
    }

    // Path-derived tags: theme + all sub-directory names (not the filename)
    // Filenames starting with _ (like _general.yaml) are fallback names, not tags
    const fileName = pathParts[pathParts.length - 1];
    const pathTags = [
      ...pathParts.slice(0, -1),
      ...(fileName.startsWith("_") ? [] : [fileName]),
    ];

    for (const entry of parsed) {
      totalEntries++;
      const { type, subject, attribute, value, tags } = entry;

      if (!subject || !attribute || value === undefined) {
        console.error(
          `Error: missing required field in ${relPath}: ${JSON.stringify(entry)}`,
        );
        errors++;
      }

      if (entry.theme) {
        console.warn(
          `Warning: entry has vestigial "theme" field in ${relPath}, subject "${subject}" — remove it`,
        );
      }

      if (type && !(type in TYPES)) {
        console.error(
          `Error: unknown type "${type}" for subject "${subject}" in ${relPath}`,
        );
        errors++;
      }

      if (Array.isArray(tags)) {
        for (const tag of tags) {
          if (!VALID_TAGS.has(tag)) {
            console.error(
              `Error: unknown tag "${tag}" for subject "${subject}" in ${relPath} — add it to dictionary.js`,
            );
            errors++;
          }
        }

        // Check that path-derived tags are present
        for (const pathTag of pathTags) {
          if (!tags.includes(pathTag)) {
            console.error(
              `Error: missing path tag "${pathTag}" for subject "${subject}" in ${relPath}`,
            );
            errors++;
          }
        }
      } else {
        // tags absent or not an array — path tags are still required
        if (pathTags.length > 0) {
          console.error(
            `Error: missing tags for subject "${subject}" in ${relPath} — must include: ${pathTags.join(", ")}`,
          );
          errors++;
        }
      }
    }
  }

  if (errors > 0) {
    console.error(`\nValidation failed: ${errors} error(s) found.`);
    process.exit(1);
  }

  console.log(`Validation passed: ${totalEntries} entries, 0 errors.`);
} catch (err) {
  console.error("Error:", err.message);
  process.exit(1);
}

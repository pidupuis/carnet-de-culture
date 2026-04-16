#!/usr/bin/env node

const { THEMES, TYPES, VALID_TAGS } = require("./dictionary");
const { loadEntries } = require("./loader");

try {
  const entries = loadEntries();
  let errors = 0;

  for (const entry of entries) {
    const { theme, type, subject, attribute, value, tags } = entry;

    if (!theme || !subject || !attribute || value === undefined) {
      console.error(
        `Error: missing required field in entry: ${JSON.stringify(entry)}`,
      );
      errors++;
    }

    if (theme && !(theme in THEMES)) {
      console.error(`Error: unknown theme "${theme}" for subject "${subject}"`);
      errors++;
    }

    if (type && !(type in TYPES)) {
      console.error(`Error: unknown type "${type}" for subject "${subject}"`);
      errors++;
    }

    if (Array.isArray(tags)) {
      for (const tag of tags) {
        if (!VALID_TAGS.has(tag)) {
          console.error(
            `Error: unknown tag "${tag}" for subject "${subject}" — add it to dictionary.js`,
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

  console.log(`Validation passed: ${entries.length} entries, 0 errors.`);
} catch (err) {
  console.error("Error:", err.message);
  process.exit(1);
}

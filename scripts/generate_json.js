#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { loadEntries } = require("./loader");

const OUTPUT = path.join(__dirname, "..", "output", "knowledge.json");

try {
  const entries = loadEntries();

  for (const entry of entries) {
    const { theme, subject, attribute, value } = entry;

    if (!theme || !subject || !attribute || value === undefined) {
      console.error(
        "Warning: entry with missing fields:",
        JSON.stringify(entry),
      );
    }
  }

  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
  fs.writeFileSync(OUTPUT, JSON.stringify(entries, null, 2) + "\n", "utf8");
  console.log(`Generated ${OUTPUT} (${entries.length} entries)`);
} catch (err) {
  console.error("Error:", err.message);
  process.exit(1);
}

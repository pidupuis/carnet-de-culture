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

  // Sort entries by THEMES order
  const { THEMES } = require("./dictionary");
  const themeOrder = Object.keys(THEMES);
  entries.sort((a, b) => {
    const ai = themeOrder.indexOf(a.theme);
    const bi = themeOrder.indexOf(b.theme);
    return (ai === -1 ? Infinity : ai) - (bi === -1 ? Infinity : bi);
  });

  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
  fs.writeFileSync(OUTPUT, JSON.stringify(entries, null, 2) + "\n", "utf8");
  console.log(`Generated ${OUTPUT} (${entries.length} entries)`);
} catch (err) {
  console.error("Error:", err.message);
  process.exit(1);
}

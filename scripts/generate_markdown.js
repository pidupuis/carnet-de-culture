#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { THEMES, TYPES } = require("./dictionary");
const { loadEntries } = require("./loader");

const OUTPUT = path.join(__dirname, "..", "output", "knowledge.md");

try {
  const entries = loadEntries();

  const grouped = new Map();

  for (const entry of entries) {
    const { theme, type, subject, attribute, value } = entry;

    if (!theme || !subject || !attribute || value === undefined) {
      console.error(
        "Warning: skipping entry with missing fields:",
        JSON.stringify(entry),
      );
      continue;
    }

    if (!(theme in THEMES)) {
      console.error(
        `Warning: unknown theme "${theme}" for subject "${subject}"`,
      );
    }
    if (type && !(type in TYPES)) {
      console.error(`Warning: unknown type "${type}" for subject "${subject}"`);
    }

    if (!grouped.has(theme)) {
      grouped.set(theme, []);
    }
    grouped.get(theme).push({ type, subject, attribute, value });
  }

  const lines = [];

  for (const [theme, items] of grouped) {
    const themeLabel = THEMES[theme] || theme;
    lines.push(`## ${themeLabel}\n`);
    for (const { type, subject, attribute, value } of items) {
      const typeLabel = type ? TYPES[type] || type : "";
      const prefix = typeLabel ? `(${typeLabel}) ` : "";
      lines.push(`${prefix}[${subject}] ${attribute} :: ${value}`);
    }
    lines.push("");
  }

  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
  fs.writeFileSync(OUTPUT, lines.join("\n"), "utf8");
  console.log(
    `Generated ${OUTPUT} (${grouped.size} themes, ${entries.length} entries)`,
  );
} catch (err) {
  console.error("Error:", err.message);
  process.exit(1);
}

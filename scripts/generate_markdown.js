#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { THEMES } = require("./dictionary");
const { loadEntries } = require("./loader");

const OUTPUT = path.join(__dirname, "..", "output", "knowledge.md");
const INLINE_THRESHOLD = 4;

try {
  const entries = loadEntries();

  // Group by theme, then by subject (preserving insertion order)
  const grouped = new Map();

  for (const entry of entries) {
    const { theme, subject, attribute, value } = entry;

    if (!theme || !subject || !attribute || value === undefined) {
      console.error(
        "Warning: skipping entry with missing fields:",
        JSON.stringify(entry),
      );
      continue;
    }

    if (!grouped.has(theme)) {
      grouped.set(theme, new Map());
    }
    const subjects = grouped.get(theme);
    if (!subjects.has(subject)) {
      subjects.set(subject, []);
    }
    subjects.get(subject).push({ attribute, value });
  }

  const lines = [];

  // Iterate in THEMES order
  for (const theme of Object.keys(THEMES)) {
    const subjects = grouped.get(theme);
    if (!subjects) continue;
    const themeLabel = THEMES[theme];
    lines.push(`## ${themeLabel}\n`);

    const isMandarin = theme === "mandarin";

    for (const [subject, attrs] of subjects) {
      if (isMandarin) {
        // Mandarin: always bullet list with attribute names
        lines.push(`**${subject}**`);
        for (const { attribute, value } of attrs) {
          lines.push(`- ${attribute} : ${value}`);
        }
        lines.push("");
      } else {
        const values = attrs.map((a) => a.value).join(" · ");
        lines.push(`**${subject}** — ${values}\n`);
      }
    }

    // Add trailing blank line after theme (if not already added by bullet list)
    if (lines[lines.length - 1] !== "") {
      lines.push("");
    }
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

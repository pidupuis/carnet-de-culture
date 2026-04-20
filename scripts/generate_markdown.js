#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { THEMES, SUB_LABELS, SUB_ORDER } = require("./dictionary");
const { loadEntries } = require("./loader");

const OUTPUT = path.join(__dirname, "..", "output", "knowledge.md");

/**
 * Returns a sort rank for a sub-category key.
 * Keys in SUB_ORDER get their index; unknown keys sort after.
 */
function subRank(key) {
  const idx = SUB_ORDER.indexOf(key);
  return idx === -1 ? SUB_ORDER.length : idx;
}

/**
 * Returns a human-readable label for a sub-category key.
 */
function subLabel(key) {
  return SUB_LABELS[key] || key;
}

try {
  const entries = loadEntries();

  // Build tree: theme → pathKey → subject → [{attribute, value}]
  // pathKey is the _path array joined with "/" for grouping
  const tree = new Map();

  for (const entry of entries) {
    const { theme, subject, attribute, value, _path } = entry;

    if (!theme || !subject || !attribute || value === undefined) {
      console.error(
        "Warning: skipping entry with missing fields:",
        JSON.stringify(entry),
      );
      continue;
    }

    if (!tree.has(theme)) tree.set(theme, new Map());
    const subMap = tree.get(theme);

    const pathKey = (_path || []).join("/");
    if (!subMap.has(pathKey)) subMap.set(pathKey, new Map());
    const subjects = subMap.get(pathKey);

    if (!subjects.has(subject)) subjects.set(subject, []);
    subjects.get(subject).push({ attribute, value });
  }

  const lines = [];

  // Iterate themes in THEMES order
  for (const theme of Object.keys(THEMES)) {
    const subMap = tree.get(theme);
    if (!subMap) continue;

    const themeLabel = THEMES[theme];
    lines.push(`## ${themeLabel}\n`);

    // Sort path keys by canonical sub-category order
    const sortedPaths = [...subMap.keys()].sort((a, b) => {
      const pa = a.split("/");
      const pb = b.split("/");
      const len = Math.max(pa.length, pb.length);
      for (let i = 0; i < len; i++) {
        const ra = pa[i] !== undefined ? subRank(pa[i]) : -1;
        const rb = pb[i] !== undefined ? subRank(pb[i]) : -1;
        if (ra !== rb) return ra - rb;
        // Same rank → alphabetical
        if ((pa[i] || "") !== (pb[i] || "")) {
          return (pa[i] || "").localeCompare(pb[i] || "", "fr");
        }
      }
      return 0;
    });

    for (const pathKey of sortedPaths) {
      const subjects = subMap.get(pathKey);

      // Add sub-category header(s) if path is non-empty
      // Skip if the only path component is the theme name itself (e.g. mandarin/mandarin)
      if (pathKey && pathKey !== theme) {
        const parts = pathKey.split("/");
        const label = parts.map(subLabel).join(" · ");
        lines.push(`### ${label}\n`);
      }

      // Mandarin entries use list format (pinyin, sens, composants…)
      const isMandarin =
        theme === "langues" && pathKey.split("/").includes("mandarin");

      for (const [subject, attrs] of subjects) {
        if (isMandarin) {
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
    }

    // Trailing blank line after theme
    if (lines[lines.length - 1] !== "") {
      lines.push("");
    }
  }

  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
  fs.writeFileSync(OUTPUT, lines.join("\n"), "utf8");
  console.log(
    `Generated ${OUTPUT} (${tree.size} themes, ${entries.length} entries)`,
  );
} catch (err) {
  console.error("Error:", err.message);
  process.exit(1);
}

#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { loadEntries } = require("./loader");

const OUTPUT = path.join(__dirname, "..", "output", "knowledge.json");

try {
  const entries = loadEntries();
  const { THEMES, SUB_ORDER } = require("./dictionary");

  for (const entry of entries) {
    const { theme, subject, attribute, value } = entry;

    if (!theme || !subject || !attribute || value === undefined) {
      console.error(
        "Warning: entry with missing fields:",
        JSON.stringify(entry),
      );
    }
  }

  // Sort entries by THEMES order, then by sub-category order
  const themeOrder = Object.keys(THEMES);

  function subRank(key) {
    const idx = SUB_ORDER.indexOf(key);
    return idx === -1 ? SUB_ORDER.length : idx;
  }

  entries.sort((a, b) => {
    // Theme order
    const ai = themeOrder.indexOf(a.theme);
    const bi = themeOrder.indexOf(b.theme);
    if (ai !== bi)
      return (ai === -1 ? Infinity : ai) - (bi === -1 ? Infinity : bi);

    // Sub-category order (compare _path arrays element by element)
    const pa = a._path || [];
    const pb = b._path || [];
    const len = Math.max(pa.length, pb.length);
    for (let i = 0; i < len; i++) {
      const ra = pa[i] !== undefined ? subRank(pa[i]) : -1;
      const rb = pb[i] !== undefined ? subRank(pb[i]) : -1;
      if (ra !== rb) return ra - rb;
      if ((pa[i] || "") !== (pb[i] || "")) {
        return (pa[i] || "").localeCompare(pb[i] || "", "fr");
      }
    }
    return 0;
  });

  // Remove internal _path field from output
  const cleaned = entries.map(({ _path, ...rest }) => rest);

  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
  fs.writeFileSync(OUTPUT, JSON.stringify(cleaned, null, 2) + "\n", "utf8");
  console.log(`Generated ${OUTPUT} (${entries.length} entries)`);
} catch (err) {
  console.error("Error:", err.message);
  process.exit(1);
}

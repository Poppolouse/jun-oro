#!/usr/bin/env node
// tools/generate_knowledge_index.js
// Simple repository knowledge index generator.
// Scans files under workspace, extracts metadata (path, size, first lines)
// and writes knowledge/index.json. Ignores node_modules, .git, dist, build.

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const OUT_DIR = path.join(ROOT, "knowledge");
const OUT_FILE = path.join(OUT_DIR, "index.json");
const IGNORED = new Set([
  "node_modules",
  ".git",
  "dist",
  "build",
  "coverage",
  ".cache",
  "venv",
]);

async function walk(dir, list = []) {
  const entries = await fs.promises.readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    if (IGNORED.has(e.name)) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      await walk(full, list);
    } else if (e.isFile()) {
      list.push(full);
    }
  }
  return list;
}

async function headLines(file, n = 6) {
  try {
    const s = await fs.promises.readFile(file, "utf8");
    return s
      .split(/\r?\n/)
      .slice(0, n)
      .map((l) => l.trim());
  } catch (err) {
    return [];
  }
}

function rel(p) {
  return path.relative(ROOT, p).replace(/\\\\/g, "/");
}

async function buildIndex() {
  const files = await walk(ROOT);
  const filtered = files.filter((f) => {
    const r = rel(f);
    // ignore generated knowledge folder
    if (r.startsWith("knowledge/")) return false;
    // ignore workspace config files optionally
    return true;
  });

  const items = [];
  for (const f of filtered) {
    try {
      const stat = await fs.promises.stat(f);
      // only include reasonable file sizes
      if (stat.size > 5 * 1024 * 1024) continue;
      const lines = await headLines(f, 8);
      items.push({
        path: rel(f),
        size: stat.size,
        mtime: stat.mtime.toISOString(),
        preview: lines.join("\\n"),
      });
    } catch (err) {
      // ignore
    }
  }

  const index = {
    generatedAt: new Date().toISOString(),
    items,
  };

  await fs.promises.mkdir(OUT_DIR, { recursive: true });
  await fs.promises.writeFile(OUT_FILE, JSON.stringify(index, null, 2), "utf8");
  console.log("Knowledge index written to", OUT_FILE);
}

if (require.main === module) {
  buildIndex().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = {
  buildIndex,
};

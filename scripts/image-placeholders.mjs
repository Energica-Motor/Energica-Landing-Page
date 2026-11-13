// Builds data/image-placeholders.json: a tiny blurred preview for every local
// image the site references, shown behind the photo while it loads
// (components/ui/Photo). Runs before each build (package.json "prebuild");
// the output is committed so `next dev` has it too.
//
//   node scripts/image-placeholders.mjs
import { readFile, writeFile, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "..");
const SOURCES = ["app", "components", "data", "lib"];
const OUT = path.join(ROOT, "data", "image-placeholders.json");
const IMAGE_PATH = /\/images\/[^"'`)\s]+?\.(?:jpe?g|png|webp|avif)/gi;

async function* files(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* files(p);
    else if (/\.(tsx?|json)$/.test(entry.name) && p !== OUT) yield p;
  }
}

const referenced = new Set();
for (const dir of SOURCES) {
  for await (const file of files(path.join(ROOT, dir))) {
    for (const m of (await readFile(file, "utf8")).matchAll(IMAGE_PATH)) referenced.add(decodeURI(m[0]));
  }
}

const out = {};
for (const src of [...referenced].sort()) {
  const file = path.join(ROOT, "public", src);
  if (!existsSync(file)) {
    console.warn(`[image-placeholders] missing: ${src}`);
    continue;
  }
  // Cut-out bikes (transparent PNG/WebP) get no preview: a blurred copy
  // behind them would show as a glow around the bike
  if (!(await sharp(file).stats()).isOpaque) continue;
  const buf = await sharp(file).resize(16, 16, { fit: "inside" }).webp({ quality: 40 }).toBuffer();
  out[src] = `data:image/webp;base64,${buf.toString("base64")}`;
}

await writeFile(OUT, JSON.stringify(out, null, 1) + "\n");
console.log(`[image-placeholders] ${Object.keys(out).length} images -> ${path.relative(ROOT, OUT)}`);

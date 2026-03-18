/**
 * Energica — Image Setup Script
 * ─────────────────────────────────────────────────────────
 * Copies and renames source images from the extracted 7z archive
 * into the correct public/images/ structure expected by the website.
 *
 * Usage:
 *   node scripts/setup-images.mjs [source-dir]
 *
 * Where [source-dir] is the path to the extracted archive root.
 * Defaults to: ../SITO IMMAGINI
 *
 * Example:
 *   node scripts/setup-images.mjs "D:/Downloads/Energica Assets"
 */

import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "..");
const PUBLIC_DIR = path.join(PROJECT_ROOT, "public", "images");

// ── Colours for terminal output ────────────────────────────
const C = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  dim: "\x1b[2m",
  bold: "\x1b[1m",
};
const ok  = (msg) => console.log(`${C.green}  ✓${C.reset}  ${msg}`);
const skip = (msg) => console.log(`${C.yellow}  ○${C.reset}  ${C.dim}${msg}${C.reset}`);
const err  = (msg) => console.error(`${C.red}  ✗${C.reset}  ${msg}`);
const info = (msg) => console.log(`${C.cyan}  →${C.reset}  ${msg}`);

// ── Image map: [relativeSourcePath, relativeDestPath] ──────
// Source paths are relative to the provided source directory.
// Dest paths are relative to /public/images/
const IMAGE_MAP = [
  // ── Logo ──────────────────────────────────────────────────
  ["Logo/energica-logo@2x.png",               "Logo/energica-logo@2x.png"],

  // ── Hero slides ───────────────────────────────────────────
  ["new/home-slide-1.jpg",  "new/home-slide-1.jpg"],
  ["new/home-slide-2.jpg",  "new/home-slide-2.jpg"],
  ["new/home-slide-3.jpg",  "new/home-slide-3.jpg"],
  ["new/home-slide-4.jpg",  "new/home-slide-4.jpg"],
  ["new/home-slide-5.jpg",  "new/home-slide-5.jpg"],
  ["new/home-slide-6.jpg",  "new/home-slide-6.jpg"],
  ["new/home-slide-7.jpg",  "new/home-slide-7.jpg"],
  ["new/home-slide-8.jpg",  "new/home-slide-8.jpg"],
  ["new/home-slide-9.jpg",  "new/home-slide-9.jpg"],

  // ── Experia ───────────────────────────────────────────────
  ["Pagina Experia/Energica_Experia.png",          "Pagina Experia/Energica_Experia.png"],
  ["Pagina Experia/Experia_dx-1.png",              "Pagina Experia/Experia_dx-1.png"],
  ["Pagina Experia/ANN7719_mod-rc.jpg",            "Pagina Experia/ANN7719_mod-rc.jpg"],
  ["Pagina Experia/0N-Experia_MM_0656_mod.jpg",    "Pagina Experia/0N-Experia_MM_0656_mod.jpg"],
  ["Pagina Experia/Experia_MM_0218.jpg",           "Pagina Experia/Experia_MM_0218.jpg"],

  // ── EsseEsse9 ────────────────────────────────────────────
  ["Pagina SS9/ss9-1.png",                                              "Pagina SS9/ss9-1.png"],
  ["Pagina SS9/ss9RS.png",                                              "Pagina SS9/ss9RS.png"],
  ["Pagina SS9/egoplus-black-red-frame-resize-5.png",                   "Pagina SS9/egoplus-black-red-frame-resize-5.png"],
  ["Pagina SS9/esseesse9-sunrisered-plus-Colored-belly-pan-resize-5.png","Pagina SS9/esseesse9-sunrisered-plus-Colored-belly-pan-resize-5.png"],
  ["Pagina SS9/ss9_featured_740x660_7766.jpg",                          "Pagina SS9/ss9_featured_740x660_7766.jpg"],
  ["Pagina SS9/ANN7756.jpg",                                            "Pagina SS9/ANN7756.jpg"],
  ["Pagina SS9/ANN7824.jpg",                                            "Pagina SS9/ANN7824.jpg"],
  ["Pagina SS9/ss9_mosaico_ANN4384.jpg",                                "Pagina SS9/ss9_mosaico_ANN4384.jpg"],

  // ── Eva Ribelle ───────────────────────────────────────────
  ["Pagina Eva/Eva-Ribelle-1.png",                       "Pagina Eva/Eva-Ribelle-1.png"],
  ["Pagina Eva/evaribelle.png",                          "Pagina Eva/evaribelle.png"],
  ["Pagina Eva/evaribelle-RS.png",                       "Pagina Eva/evaribelle-RS.png"],
  ["Pagina Eva/evaribelle-tricolore_670x377.png",        "Pagina Eva/evaribelle-tricolore_670x377.png"],
  ["Pagina Eva/evaribelle_slider1440x930_5533-1.jpg",    "Pagina Eva/evaribelle_slider1440x930_5533-1.jpg"],
  ["Pagina Eva/ANN5461.jpg",                             "Pagina Eva/ANN5461.jpg"],
  ["Pagina Eva/ANN5814.jpg",                             "Pagina Eva/ANN5814.jpg"],
  ["Pagina Eva/evaribelle_mosaico_ANN4110.jpg",          "Pagina Eva/evaribelle_mosaico_ANN4110.jpg"],
  ["Pagina Eva/homepage_forza_img-1536x837.jpg",         "Pagina Eva/homepage_forza_img-1536x837.jpg"],

  // ── Ego ──────────────────────────────────────────────────
  ["Pagina EGO/Ego-1.png",               "Pagina EGO/Ego-1.png"],
  ["Pagina EGO/Ego-RS.png",              "Pagina EGO/Ego-RS.png"],
  ["Pagina EGO/ego-tricolore_670x377.png","Pagina EGO/ego-tricolore_670x377.png"],
  ["Pagina EGO/ego_mosaico_ANN4320.jpg", "Pagina EGO/ego_mosaico_ANN4320.jpg"],
  ["Pagina EGO/ANN4778.jpg",             "Pagina EGO/ANN4778.jpg"],
  ["Pagina EGO/ANN4779.jpg",             "Pagina EGO/ANN4779.jpg"],
  ["Pagina EGO/ANN4787.jpg",             "Pagina EGO/ANN4787.jpg"],
];

// ── Helper: ensure directory exists ───────────────────────
async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
}

// ── Helper: check if file exists ──────────────────────────
async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

// ── Main ──────────────────────────────────────────────────
async function main() {
  const sourceArg = process.argv[2];
  const sourceRoot = sourceArg
    ? path.resolve(sourceArg)
    : path.resolve(PROJECT_ROOT, "..", "SITO IMMAGINI");

  console.log(`\n${C.bold}Energica — Image Setup${C.reset}`);
  console.log(`${C.dim}${"─".repeat(50)}${C.reset}`);
  info(`Source: ${sourceRoot}`);
  info(`Destination: ${PUBLIC_DIR}`);
  console.log(`${C.dim}${"─".repeat(50)}${C.reset}\n`);

  // Verify source exists
  if (!(await fileExists(sourceRoot))) {
    err(`Source directory not found: ${sourceRoot}`);
    err(`Usage: node scripts/setup-images.mjs [path-to-extracted-archive]`);
    process.exit(1);
  }

  let copied = 0, skipped = 0, failed = 0;

  for (const [srcRel, destRel] of IMAGE_MAP) {
    const srcPath  = path.join(sourceRoot, srcRel);
    const destPath = path.join(PUBLIC_DIR, destRel);

    // Ensure destination directory exists
    await ensureDir(path.dirname(destPath));

    if (!(await fileExists(srcPath))) {
      skip(`Not found: ${srcRel}`);
      skipped++;
      continue;
    }

    try {
      await fs.copyFile(srcPath, destPath);
      ok(`${srcRel}  →  public/images/${destRel}`);
      copied++;
    } catch (e) {
      err(`Failed to copy ${srcRel}: ${e.message}`);
      failed++;
    }
  }

  console.log(`\n${C.dim}${"─".repeat(50)}${C.reset}`);
  console.log(
    `${C.bold}Done.${C.reset}  ` +
    `${C.green}${copied} copied${C.reset}  ` +
    `${C.yellow}${skipped} skipped${C.reset}  ` +
    (failed ? `${C.red}${failed} failed${C.reset}` : "") +
    "\n"
  );

  if (failed > 0) process.exit(1);
}

main().catch((e) => {
  err(e.message);
  process.exit(1);
});

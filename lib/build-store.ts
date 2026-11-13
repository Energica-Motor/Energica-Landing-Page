// Short links for configurator builds: energicamotor.com/b/<code>.
// A build (model + layer IDs) is stored as a tiny JSON file in Vercel Blob,
// keyed by a hash of its contents — the same build always gets the same code,
// so saving is idempotent and needs no collision handling.
// Without BLOB_READ_WRITE_TOKEN (local dev) builds are kept in the OS temp dir.
import { createHash } from "crypto";
import { promises as fs } from "fs";
import os from "os";
import path from "path";
import { isConfiguratorModel } from "@/lib/configurator-models";

export interface StoredBuild {
  model: string;
  layers: string[];
}

const BASE62 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const CODE_LENGTH = 8;
const LAYER_ID = /^[a-z0-9_]{1,80}$/;
const LOCAL_DIR = path.join(os.tmpdir(), "energica-builds");

export const isBuildCode = (code: string) => /^[0-9A-Za-z]{8}$/.test(code);

/** Returns a clean build, or null if the input isn't a plausible build. */
export function parseBuild(input: unknown): StoredBuild | null {
  const { model, layers } = (input ?? {}) as Record<string, unknown>;
  if (typeof model !== "string" || !isConfiguratorModel(model)) return null;
  if (!Array.isArray(layers) || layers.length === 0 || layers.length > 200) return null;
  if (!layers.every((l) => typeof l === "string" && LAYER_ID.test(l))) return null;
  return { model, layers: [...new Set(layers as string[])].sort() };
}

function codeFor(build: StoredBuild): string {
  const digest = createHash("sha256").update(`${build.model}|${build.layers.join(",")}`).digest();
  let code = "";
  for (let i = 0; i < CODE_LENGTH; i++) code += BASE62[digest[i] % 62];
  return code;
}

export async function saveBuild(build: StoredBuild): Promise<string> {
  const code = codeFor(build);
  const body = JSON.stringify(build);
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { put } = await import("@vercel/blob");
    await put(`builds/${code}.json`, body, {
      access: "public",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: "application/json",
    });
  } else {
    await fs.mkdir(LOCAL_DIR, { recursive: true });
    await fs.writeFile(path.join(LOCAL_DIR, `${code}.json`), body);
  }
  return code;
}

export async function loadBuild(code: string): Promise<StoredBuild | null> {
  if (!isBuildCode(code)) return null;
  try {
    let raw: string;
    const base = process.env.BLOB_BASE_URL || process.env.NEXT_PUBLIC_BLOB_BASE_URL;
    if (process.env.BLOB_READ_WRITE_TOKEN && base) {
      const res = await fetch(`${base.replace(/\/$/, "")}/builds/${code}.json`, { cache: "force-cache" });
      if (!res.ok) return null;
      raw = await res.text();
    } else {
      raw = await fs.readFile(path.join(LOCAL_DIR, `${code}.json`), "utf8");
    }
    return parseBuild(JSON.parse(raw));
  } catch {
    return null;
  }
}

import { NextRequest, NextResponse } from "next/server";
import { loadBuild } from "@/lib/build-store";

// Short build link → the configurator with that build restored.
// Unknown codes fall back to the configurator's default build.
export async function GET(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const build = await loadBuild(code);
  const target = new URL("/configurator", req.url);
  if (build) {
    target.searchParams.set("model", build.model);
    // Same base64url-of-sorted-JSON format the configurator's encodeConfig uses.
    target.searchParams.set("layers", Buffer.from(JSON.stringify(build.layers)).toString("base64url"));
  }
  return NextResponse.redirect(target, 307);
}

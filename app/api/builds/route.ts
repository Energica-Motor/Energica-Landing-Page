import { NextRequest, NextResponse } from "next/server";
import { parseBuild, saveBuild } from "@/lib/build-store";

// Saves a configurator build and returns its short code (/b/<code>).
export async function POST(req: NextRequest) {
  try {
    const build = parseBuild(await req.json());
    if (!build) return NextResponse.json({ error: "Invalid build" }, { status: 400 });
    const code = await saveBuild(build);
    return NextResponse.json({ code });
  } catch (err) {
    console.error("[builds]", err);
    return NextResponse.json({ error: "Could not save build" }, { status: 500 });
  }
}

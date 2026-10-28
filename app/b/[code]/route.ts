import { NextRequest, NextResponse } from "next/server";
import { isBuildCode } from "@/lib/build-store";

// Short build link → the configurator, which restores the saved build.
export async function GET(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const target = new URL("/configurator", req.url);
  if (isBuildCode(code)) target.searchParams.set("build", code);
  return NextResponse.redirect(target, 307);
}

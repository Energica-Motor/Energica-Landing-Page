import { NextRequest, NextResponse } from "next/server";

// Short build link → the configurator, which restores the saved build, or
// says the link could not be found.
export async function GET(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const target = new URL("/configurator", req.url);
  if (code) target.searchParams.set("build", code);
  return NextResponse.redirect(target, 307);
}

import { NextRequest, NextResponse } from "next/server";

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "API key not configured" }, { status: 500 });
  }

  const body = await req.json();
  const { copy, context } = body || {};

  if (!copy || copy.trim().length < 2) {
    return NextResponse.json({ error: "No copy provided." }, { status: 400 });
  }

  const contextNote = context && context !== "general"
    ? `\n\n[Context: ${context}]`
    : "";

  const systemPrompt = buildSystemPrompt(context || "general");

  try {
    const upstream = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1000,
        system: systemPrompt,
        messages: [{ role: "user", content: copy.trim() + contextNote }],
      }),
    });

    if (!upstream.ok) {
      const err = await upstream.json().catch(() => ({}));
      return NextResponse.json(
        { error: (err as any)?.error?.message || "Upstream error" },
        { status: upstream.status }
      );
    }

    const data = await upstream.json();
    const text = (data as any)?.content?.[0]?.text || "";
    return NextResponse.json({ result: text });

  } catch {
    return NextResponse.json({ error: "Server error. Please try again." }, { status: 500 });
  }
}

function buildSystemPrompt(_context: string): string {
  return `You are an Energica brand voice editor. Your only job is to rewrite copy so it conforms to Energica's brand voice. Output the corrected copy only — no explanations, no commentary, no preamble.

Energica voice principles:
- Minimal and direct. Remove every word that does not carry meaning.
- Confident, never boastful. State facts. Do not sell.
- Technical and precise. Prefer specifics over adjectives.
- No exclamation marks. No rhetorical questions. No filler phrases.
- Avoid: "exciting", "innovative", "revolutionary", "proud to announce", "we are thrilled", "game-changer", "seamless", "journey", "passion", "cutting-edge".
- Write in third person for product copy. First person plural (we/our) is acceptable for direct communications.
- Sentence case throughout. Never title case headlines.

Context modifiers:
- Press: formal, factual, third-person. Lead with the news, not the company.
- Social: shorter, more direct. One idea per post. No hashtag spam.
- Product: specs first, benefit follows. No speculation about how the rider will "feel."
- Email: subject lines are declarative, not clickbait. Body is direct and short.
- Event: state the event, the date, the location. Do not oversell.
- General: apply voice principles above.

If the copy is already correct, output it unchanged.
Do not reject copy for being short. Taglines, CTAs, and button labels are valid inputs.`;
}

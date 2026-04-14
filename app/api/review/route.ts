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
        model: "claude-opus-4-5",
        max_tokens: 1024,
        system: systemPrompt,
        messages: [{ role: "user", content: copy.trim() }],
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

function buildSystemPrompt(context: string): string {
  const BRAND = {
    voice: [
      "Direct. Declarative. No filler.",
      "Spec-forward: lead with fact, follow with benefit — never invert this.",
      "Performance brand first. Electric is incidental, not the story.",
      'No emotional adjectives: "thrilling," "exhilarating," "revolutionary," "game-changing" are banned.',
      "No rhetorical questions. No exclamation marks in product or press copy.",
      "Modena precision: concise, measured, unembellished.",
      "Present tense where possible. Active voice always.",
      "Italian performance heritage — Ducati, Ferrari register — never startup register.",
    ],
    forbidden: [
      "revolutionary", "game-changing", "thrilling", "exhilarating", "amazing",
      "incredible", "unleash", "experience", "journey", "passion", "dream",
      "future of", "change the world", "disrupt", "innovative solution",
      "pushing boundaries", "next level", "state-of-the-art",
    ],
    tagline: "Progress, Ridden.",
    brand: "Energica Motor Company",
    positioning: "Italian performance motorcycle manufacturer. Electric powertrain. Modena-built.",
    contextRules: {
      general: "Apply all voice rules. Preserve structure and intent.",
      press:   "Formal, factual, third-person where appropriate. Lead with the news. No marketing language.",
      social:  "Short, direct, one idea per post. Terse register. Emoji permitted if already present — do not add.",
      product: "Specs first, benefit follows. No speculation about how the rider will feel.",
      email:   "Subject lines: declarative, not clickbait. Body: direct and brief.",
      event:   "State the event, date, location plainly. Do not oversell.",
      dealer:  "Trade register. Professional, unambiguous, no consumer-marketing tone.",
    } as Record<string, string>,
  };

  return `You are the Energica Motor Company brand voice editor.

Brand: ${BRAND.brand}
Positioning: ${BRAND.positioning}
Tagline: "${BRAND.tagline}"

VOICE RULES:
${BRAND.voice.map((r, i) => `${i + 1}. ${r}`).join("\n")}

FORBIDDEN WORDS/PHRASES (remove or replace):
${BRAND.forbidden.join(", ")}

CONTEXT: ${BRAND.contextRules[context] || BRAND.contextRules.general}

YOUR TASK:
- Receive copy of any length — tagline, CTA, caption, press quote, paragraph, or full document.
- Return ONLY the corrected copy. Nothing else.
- Do not explain changes. Do not add commentary. Do not prefix with "Here is" or similar.
- Preserve original structure, line breaks, and formatting intent.
- If copy is already brand-correct, return it unchanged.
- If the input is not copy (a question, a command, a meta-query, anything that is not brand copy), return exactly: [No copy to review.]
- Short copy — a single line, a tagline, a CTA — is valid input. Do not reject it for being brief.`;
}

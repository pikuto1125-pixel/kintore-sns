import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const LANG_NAMES: Record<string, string> = {
  ja: "Japanese", en: "English", es: "Spanish", fr: "French",
  de: "German", zh: "Simplified Chinese", ko: "Korean",
  pt: "Portuguese", ar: "Arabic", hi: "Hindi",
};

export async function POST(request: Request) {
  const { text, targetLang } = await request.json();

  if (!text || !targetLang) {
    return NextResponse.json({ error: "Missing text or targetLang" }, { status: 400 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "Translation not configured" }, { status: 503 });
  }

  const client = new Anthropic();
  const langName = LANG_NAMES[targetLang] ?? "English";

  const message = await client.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `Translate the following text to ${langName}. Return ONLY the translated text, no explanation:\n\n${text}`,
      },
    ],
  });

  const translated = message.content[0].type === "text" ? message.content[0].text : null;
  return NextResponse.json({ translated });
}

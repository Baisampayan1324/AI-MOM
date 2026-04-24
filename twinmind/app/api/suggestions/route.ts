import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { TranscriptChunk, Suggestion } from "@/types";

interface RequestBody {
  transcript: TranscriptChunk[];
  contextWindow: number;
  prompt: string;
}

function formatTranscriptForPrompt(chunks: TranscriptChunk[]): string {
  return chunks.map((c) => `[${c.timestamp}] ${c.text}`).join("\n");
}

function stripMarkdownFences(text: string): string {
  return text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
}

async function fetchSuggestions(
  groq: Groq,
  systemPrompt: string
): Promise<Suggestion[] | null> {
  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: systemPrompt }],
    temperature: 0.7,
    max_tokens: 800,
  });

  const raw = response.choices[0]?.message?.content ?? "";
  const cleaned = stripMarkdownFences(raw);

  try {
    const parsed = JSON.parse(cleaned);
    if (Array.isArray(parsed) && parsed.length === 3) {
      return parsed as Suggestion[];
    }
    return null;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const apiKey = req.headers.get("x-groq-key");
  if (!apiKey) {
    return NextResponse.json({ error: "Missing Groq API key" }, { status: 401 });
  }

  let body: RequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { transcript, contextWindow, prompt } = body;

  if (!transcript || !Array.isArray(transcript)) {
    return NextResponse.json({ error: "transcript array required" }, { status: 400 });
  }

  if (!transcript.length) {
    return NextResponse.json({ error: "No transcript to generate suggestions from" }, { status: 400 });
  }

  const recentChunks = transcript.slice(-contextWindow);
  const transcriptText = formatTranscriptForPrompt(recentChunks);

  const filledPrompt = prompt
    .replace("{{context_window}}", String(contextWindow))
    .replace("{{transcript}}", transcriptText);

  const groq = new Groq({ apiKey });

  try {
    // First attempt
    let suggestions = await fetchSuggestions(groq, filledPrompt);

    // Retry once with stricter JSON instruction if first attempt failed
    if (!suggestions) {
      const retryPrompt = filledPrompt + "\n\nIMPORTANT: Return ONLY a valid JSON array with exactly 3 objects. No markdown, no preamble.";
      suggestions = await fetchSuggestions(groq, retryPrompt);
    }

    if (!suggestions) {
      return NextResponse.json(
        { error: "Failed to parse suggestions after retry" },
        { status: 500 }
      );
    }

    return NextResponse.json({ suggestions });
  } catch (err: unknown) {
    const error = err as { status?: number; message?: string };
    if (error?.status === 401) {
      return NextResponse.json(
        { error: "Invalid API key — Groq rejected it" },
        { status: 401 }
      );
    }
    if (error?.status === 429) {
      return NextResponse.json(
        { error: "Rate limited", retryAfter: 10 },
        { status: 429 }
      );
    }
    console.error("Suggestions error:", error);
    return NextResponse.json(
      { error: error?.message ?? "Suggestion generation failed" },
      { status: 502 }
    );
  }
}

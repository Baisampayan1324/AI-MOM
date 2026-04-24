import { NextRequest } from "next/server";
import Groq from "groq-sdk";
import { TranscriptChunk, ChatMessage } from "@/types";

interface RequestBody {
  messages: ChatMessage[];
  transcript: TranscriptChunk[];
  prompt: string;
  contextWindow: number;
  // When a suggestion is clicked, these are provided for the detail prompt
  isSuggestionClick?: boolean;
  suggestionHeadline?: string;
  detailPrompt?: string;
}

function formatTranscript(chunks: TranscriptChunk[]): string {
  return chunks.map((c) => `[${c.timestamp}] ${c.text}`).join("\n") || "No transcript yet.";
}

export async function POST(req: NextRequest) {
  const apiKey = req.headers.get("x-groq-key");
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "Missing Groq API key" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  let body: RequestBody;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400 });
  }

  const { messages, transcript, prompt, contextWindow, isSuggestionClick, suggestionHeadline, detailPrompt } = body;

  const recentTranscript = formatTranscript(transcript.slice(-contextWindow));

  // Build system message depending on whether this is a suggestion click or free chat
  let systemContent: string;
  if (isSuggestionClick && suggestionHeadline && detailPrompt) {
    systemContent = detailPrompt
      .replace("{{suggestion}}", suggestionHeadline)
      .replace("{{full_transcript}}", formatTranscript(transcript));
  } else {
    // Free chat — use last user message as the question
    const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
    systemContent = prompt
      .replace("{{transcript}}", recentTranscript)
      .replace("{{question}}", lastUserMsg?.content ?? "");
  }

  // Build message list for Groq: system + prior chat history (excluding last user msg we already embedded)
  const groqMessages: { role: "system" | "user" | "assistant"; content: string }[] = [
    { role: "system", content: systemContent },
    // Include prior turns for conversation continuity (exclude the last user msg — it's in system)
    ...messages.slice(0, -1).map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
    // Re-add last user message for the model to respond to
    ...(messages.length > 0 && messages[messages.length - 1].role === "user"
      ? [{ role: "user" as const, content: messages[messages.length - 1].content }]
      : []),
  ];

  const groq = new Groq({ apiKey });

  try {
    const stream = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: groqMessages,
      temperature: 0.6,
      max_tokens: 600,
      stream: true,
    });

    // Convert Groq's async iterator to a web-standard ReadableStream
    const readable = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const chunk of stream) {
            const token = chunk.choices[0]?.delta?.content ?? "";
            if (token) {
              // SSE format: "data: <token>\n\n"
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(token)}\n\n`));
            }
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        } catch (err) {
          console.error("Stream error:", err);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err: unknown) {
    const error = err as { status?: number; message?: string };
    if (error?.status === 401) {
      return new Response(JSON.stringify({ error: "Invalid API key — Groq rejected it" }), {
        status: 401,
      });
    }
    if (error?.status === 429) {
      return new Response(JSON.stringify({ error: "Rate limited", retryAfter: 10 }), {
        status: 429,
      });
    }
    return new Response(JSON.stringify({ error: error?.message ?? "Chat failed" }), {
      status: 502,
    });
  }
}

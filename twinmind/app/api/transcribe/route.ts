import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

export async function POST(req: NextRequest) {
  const apiKey = req.headers.get("x-groq-key");
  if (!apiKey) {
    return NextResponse.json({ error: "Missing Groq API key" }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const audioFile = formData.get("audio") as File | null;
  if (!audioFile) {
    return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
  }

  // Reject tiny blobs — likely silence or a failed capture
  if (audioFile.size < 1000) {
    return NextResponse.json({ text: "" });
  }

  const groq = new Groq({ apiKey });

  try {
    const transcription = await groq.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-large-v3",
      response_format: "json",
      language: "en",
    });

    return NextResponse.json({ text: transcription.text ?? "" });
  } catch (err: unknown) {
    const error = err as { status?: number; message?: string; error?: any };
    // Gracefully ignore empty/silent blobs that Whisper rejects
    if (error?.status === 400) {
      return NextResponse.json({ text: "" });
    }
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
    console.error("Whisper error:", error);
    return NextResponse.json(
      { error: error?.message ?? "Transcription failed" },
      { status: 502 }
    );
  }
}

"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  TranscriptChunk,
  SuggestionBatch,
  Suggestion,
  ChatMessage,
  Settings,
  SessionExport,
} from "@/types";
import {
  DEFAULT_SUGGESTION_PROMPT,
  DEFAULT_DETAIL_PROMPT,
  DEFAULT_CHAT_PROMPT,
} from "@/lib/prompts";
import * as audioCapture from "@/lib/audioCapture";

const SESSION_STORAGE_KEY = "twinmind_settings";

const DEFAULT_SETTINGS: Settings = {
  apiKey: "",
  suggestionPrompt: DEFAULT_SUGGESTION_PROMPT,
  detailPrompt: DEFAULT_DETAIL_PROMPT,
  chatPrompt: DEFAULT_CHAT_PROMPT,
  suggestionContextWindow: 5,
  chatContextWindow: 10,
  refreshInterval: 30,
};

function genId(): string {
  return Math.random().toString(36).slice(2, 10);
}

function nowISO(): string {
  return new Date().toISOString();
}

function loadSettings(): Settings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export interface SessionError {
  column: "transcript" | "suggestions" | "chat" | "global";
  message: string;
  retryAfter?: number;
}

export function useSession() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptChunk[]>([]);
  const [suggestionBatches, setSuggestionBatches] = useState<SuggestionBatch[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "Hi! I'm TwinMind. Start recording and I'll surface live suggestions as your meeting progresses. Click any suggestion card for a detailed answer, or ask me anything directly.",
      timestamp: nowISO(),
    },
  ]);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [isStreamingChat, setIsStreamingChat] = useState(false);
  const [error, setError] = useState<SessionError | null>(null);

  // Refs to always have latest values inside callbacks without stale closures
  const transcriptRef = useRef<TranscriptChunk[]>([]);
  const settingsRef = useRef<Settings>(DEFAULT_SETTINGS);
  transcriptRef.current = transcript;
  settingsRef.current = settings;

  // Load settings from sessionStorage on mount
  useEffect(() => {
    setSettings(loadSettings());
  }, []);

  const saveSettings = useCallback((next: Settings) => {
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(next));
  }, []);

  const updateSettings = useCallback(
    (partial: Partial<Settings>) => {
      setSettings((prev) => {
        const next = { ...prev, ...partial };
        saveSettings(next);
        return next;
      });
    },
    [saveSettings]
  );

  const clearError = useCallback(() => setError(null), []);

  // ─── Transcription ─────────────────────────────────────────────────────────
  const transcribeBlob = useCallback(
    async (blob: Blob): Promise<string | null> => {
      const s = settingsRef.current;
      if (!s.apiKey) return null;

      setIsTranscribing(true);
      const fd = new FormData();
      fd.append("audio", blob, "audio.webm");

      try {
        const res = await fetch("/api/transcribe", {
          method: "POST",
          headers: { "x-groq-key": s.apiKey },
          body: fd,
        });
        const data = await res.json();
        if (!res.ok) {
          if (res.status === 429) {
            setError({ column: "transcript", message: `Rate limited. Retrying in ${data.retryAfter ?? 10}s.`, retryAfter: data.retryAfter });
          } else {
            setError({ column: "transcript", message: data.error ?? "Transcription failed" });
          }
          return null;
        }
        return data.text ?? "";
      } catch {
        setError({ column: "transcript", message: "Network error during transcription." });
        return null;
      } finally {
        setIsTranscribing(false);
      }
    },
    []
  );

  const appendTranscript = useCallback((text: string): TranscriptChunk | null => {
    if (!text.trim()) return null;
    const chunk: TranscriptChunk = {
      id: genId(),
      timestamp: new Date().toLocaleTimeString("en-US", { hour12: false }),
      text: text.trim(),
    };
    setTranscript((prev) => [...prev, chunk]);
    return chunk;
  }, []);

  // ─── Suggestions ───────────────────────────────────────────────────────────
  const fetchSuggestions = useCallback(async (latestTranscript?: TranscriptChunk[]) => {
    const s = settingsRef.current;
    const t = latestTranscript ?? transcriptRef.current;
    if (!s.apiKey || t.length === 0) return;

    setIsLoadingSuggestions(true);
    try {
      const res = await fetch("/api/suggestions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-groq-key": s.apiKey,
        },
        body: JSON.stringify({
          transcript: t,
          contextWindow: s.suggestionContextWindow,
          prompt: s.suggestionPrompt,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 429) {
          setError({ column: "suggestions", message: `Rate limited. Retrying in ${data.retryAfter ?? 10}s.`, retryAfter: data.retryAfter });
        } else {
          setError({ column: "suggestions", message: data.error ?? "Failed to get suggestions" });
        }
        return;
      }
      const batch: SuggestionBatch = {
        batchId: genId(),
        generatedAt: nowISO(),
        suggestions: data.suggestions,
      };
      setSuggestionBatches((prev) => [batch, ...prev]);
    } catch {
      setError({ column: "suggestions", message: "Network error fetching suggestions." });
    } finally {
      setIsLoadingSuggestions(false);
    }
  }, []);

  // ─── Recording ─────────────────────────────────────────────────────────────
  const startRecording = useCallback(async () => {
    const s = settingsRef.current;
    if (!s.apiKey) {
      setError({ column: "global", message: "Please set your Groq API key in Settings first." });
      return;
    }

    try {
      await audioCapture.startCapture(
        async (blob: Blob) => {
          const text = await transcribeBlob(blob);
          if (text) {
            const newChunk = appendTranscript(text);
            if (newChunk) {
              // Pass the newly constructed transcript array to avoid stale refs
              await fetchSuggestions([...transcriptRef.current, newChunk]);
            }
          }
        },
        s.refreshInterval * 1000
      );
      setIsRecording(true);
      setError(null);
    } catch (err: unknown) {
      const e = err as Error;
      setError({ column: "global", message: e.message });
    }
  }, [transcribeBlob, appendTranscript, fetchSuggestions]);

  const stopRecording = useCallback(async () => {
    const remaining = audioCapture.stopCapture();
    setIsRecording(false);
    if (remaining) {
      const text = await transcribeBlob(remaining);
      if (text) appendTranscript(text);
    }
  }, [transcribeBlob, appendTranscript]);

  // Manual refresh: flush current audio → transcribe → suggest
  const manualRefresh = useCallback(async () => {
    const blob = audioCapture.flushBuffer();
    let latestT = transcriptRef.current;
    if (blob) {
      const text = await transcribeBlob(blob);
      if (text) {
        const newChunk = appendTranscript(text);
        if (newChunk) latestT = [...transcriptRef.current, newChunk];
      }
    }
    await fetchSuggestions(latestT);
  }, [transcribeBlob, appendTranscript, fetchSuggestions]);

  // ─── Chat ──────────────────────────────────────────────────────────────────
  const sendChatMessage = useCallback(
    async (
      text: string,
      opts?: { isSuggestionClick?: boolean; suggestionHeadline?: string }
    ) => {
      const s = settingsRef.current;
      const t = transcriptRef.current;
      if (!s.apiKey || !text.trim()) return;

      const userMsg: ChatMessage = { role: "user", content: text.trim(), timestamp: nowISO() };

      // Add placeholder assistant message for streaming
      const assistantId = genId();
      const assistantMsg: ChatMessage = {
        role: "assistant",
        content: "",
        timestamp: nowISO(),
      };

      setChatMessages((prev) => {
        const next = [...prev, userMsg, assistantMsg];
        // tag assistant msg so we can update it
        (next[next.length - 1] as ChatMessage & { _id?: string })._id = assistantId;
        return next;
      });

      setIsStreamingChat(true);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-groq-key": s.apiKey,
          },
          body: JSON.stringify({
            messages: [...(chatMessages), userMsg],
            transcript: t,
            prompt: s.chatPrompt,
            contextWindow: s.chatContextWindow,
            isSuggestionClick: opts?.isSuggestionClick ?? false,
            suggestionHeadline: opts?.suggestionHeadline,
            detailPrompt: s.detailPrompt,
          }),
        });

        if (!res.ok) {
          const data = await res.json();
          setError({ column: "chat", message: data.error ?? "Chat failed" });
          setChatMessages((prev) => prev.slice(0, -1)); // remove empty assistant msg
          return;
        }

        // Stream SSE tokens
        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        if (!reader) return;

        let accumulated = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const raw = decoder.decode(value);
          const lines = raw.split("\n").filter((l) => l.startsWith("data: "));
          for (const line of lines) {
            const payload = line.slice(6).trim();
            if (payload === "[DONE]") break;
            try {
              const token = JSON.parse(payload) as string;
              accumulated += token;
              // Update the last (streaming) assistant message
              setChatMessages((prev) => {
                const next = [...prev];
                next[next.length - 1] = { ...next[next.length - 1], content: accumulated };
                return next;
              });
            } catch {
              // malformed SSE chunk, skip
            }
          }
        }
      } catch {
        setError({ column: "chat", message: "Network error during chat." });
      } finally {
        setIsStreamingChat(false);
      }
    },
    [chatMessages]
  );

  const clickSuggestion = useCallback(
    (suggestion: Suggestion) => {
      sendChatMessage(suggestion.headline, {
        isSuggestionClick: true,
        suggestionHeadline: suggestion.headline,
      });
    },
    [sendChatMessage]
  );

  // ─── Export ────────────────────────────────────────────────────────────────
  const exportSession = useCallback(() => {
    const data: SessionExport = {
      exportedAt: nowISO(),
      transcript,
      suggestionBatches,
      chat: chatMessages,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `session_${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [transcript, suggestionBatches, chatMessages]);

  return {
    settings,
    isRecording,
    transcript,
    suggestionBatches,
    chatMessages,
    isTranscribing,
    isLoadingSuggestions,
    isStreamingChat,
    error,
    clearError,
    startRecording,
    stopRecording,
    manualRefresh,
    sendChatMessage,
    clickSuggestion,
    updateSettings,
    exportSession,
  };
}

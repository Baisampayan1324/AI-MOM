"use client";

import { useState, useEffect } from "react";
import { Settings } from "@/types";
import {
  DEFAULT_SUGGESTION_PROMPT,
  DEFAULT_DETAIL_PROMPT,
  DEFAULT_CHAT_PROMPT,
} from "@/lib/prompts";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: Settings;
  onSave: (partial: Partial<Settings>) => void;
  /** Force-open on first load if no API key is set */
  forceOpen?: boolean;
}

export default function SettingsModal({
  isOpen,
  onClose,
  settings,
  onSave,
  forceOpen,
}: SettingsModalProps) {
  const [apiKey, setApiKey] = useState(settings.apiKey);
  const [suggestionPrompt, setSuggestionPrompt] = useState(settings.suggestionPrompt);
  const [detailPrompt, setDetailPrompt] = useState(settings.detailPrompt);
  const [chatPrompt, setChatPrompt] = useState(settings.chatPrompt);
  const [suggCtx, setSuggCtx] = useState(settings.suggestionContextWindow);
  const [chatCtx, setChatCtx] = useState(settings.chatContextWindow);
  const [interval, setIntervalVal] = useState(settings.refreshInterval);
  const [validating, setValidating] = useState(false);
  const [validationMsg, setValidationMsg] = useState<{ ok: boolean; text: string } | null>(null);

  // Sync when settings change externally
  useEffect(() => {
    setApiKey(settings.apiKey);
    setSuggestionPrompt(settings.suggestionPrompt);
    setDetailPrompt(settings.detailPrompt);
    setChatPrompt(settings.chatPrompt);
    setSuggCtx(settings.suggestionContextWindow);
    setChatCtx(settings.chatContextWindow);
    setIntervalVal(settings.refreshInterval);
  }, [settings]);

  if (!isOpen && !forceOpen) return null;

  const handleSave = async () => {
    // Validate key
    if (!apiKey.trim()) {
      setValidationMsg({ ok: false, text: "API key is required." });
      return;
    }

    setValidating(true);
    setValidationMsg(null);

    try {
      // Lightweight validation: attempt a small transcription of silence
      // We use the suggestions endpoint with empty transcript which will 401 on bad key
      const res = await fetch("/api/suggestions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-groq-key": apiKey.trim(),
        },
        body: JSON.stringify({
          transcript: [{ id: "test", timestamp: "00:00:00", text: "hello" }],
          contextWindow: 1,
          prompt: "Return exactly: [{\"type\":\"Answer\",\"headline\":\"test\",\"preview\":\"test\"}]",
        }),
      });

      if (res.status === 401) {
        setValidationMsg({ ok: false, text: "Invalid API key — Groq rejected it." });
        return;
      }

      // Any other response (including 500) means the key was accepted
      setValidationMsg({ ok: true, text: "API key validated ✓" });

      onSave({
        apiKey: apiKey.trim(),
        suggestionPrompt,
        detailPrompt,
        chatPrompt,
        suggestionContextWindow: Number(suggCtx),
        chatContextWindow: Number(chatCtx),
        refreshInterval: Number(interval),
      });

      setTimeout(onClose, 800);
    } catch {
      setValidationMsg({ ok: false, text: "Network error during validation." });
    } finally {
      setValidating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onKeyDown={handleKeyDown}
    >
      <div className="bg-neutral-900 border border-neutral-700 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-800 sticky top-0 bg-neutral-900 z-10">
          <h2 className="text-base font-semibold text-neutral-100">Settings</h2>
          {!forceOpen && (
            <button
              onClick={onClose}
              className="text-neutral-500 hover:text-neutral-200 transition-colors"
              aria-label="Close settings"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <div className="px-6 py-5 space-y-6">
          {/* API Key */}
          <div>
            <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
              Groq API Key <span className="text-red-400">*</span>
            </label>
            {forceOpen && (
              <p className="text-xs text-indigo-400 mb-3">
                Paste your Groq API key to get started. Get one free at{" "}
                <a href="https://console.groq.com" target="_blank" rel="noreferrer" className="underline">
                  console.groq.com
                </a>
              </p>
            )}
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="gsk_..."
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2.5 text-sm text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-indigo-500 font-mono"
            />
            {validationMsg && (
              <p className={`text-xs mt-1.5 ${validationMsg.ok ? "text-green-400" : "text-red-400"}`}>
                {validationMsg.text}
              </p>
            )}
          </div>

          {/* Numeric params */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                Suggestion Context
              </label>
              <input
                type="number"
                min={1}
                max={20}
                value={suggCtx}
                onChange={(e) => setSuggCtx(Number(e.target.value))}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-neutral-200 focus:outline-none focus:border-indigo-500"
              />
              <p className="text-[10px] text-neutral-600 mt-1">chunks (30s each)</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                Chat Context
              </label>
              <input
                type="number"
                min={1}
                max={30}
                value={chatCtx}
                onChange={(e) => setChatCtx(Number(e.target.value))}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-neutral-200 focus:outline-none focus:border-indigo-500"
              />
              <p className="text-[10px] text-neutral-600 mt-1">chunks</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                Refresh Interval
              </label>
              <input
                type="number"
                min={10}
                max={120}
                value={interval}
                onChange={(e) => setIntervalVal(Number(e.target.value))}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-neutral-200 focus:outline-none focus:border-indigo-500"
              />
              <p className="text-[10px] text-neutral-600 mt-1">seconds</p>
            </div>
          </div>

          {/* Prompts */}
          {[
            {
              label: "Suggestion Prompt",
              value: suggestionPrompt,
              setter: setSuggestionPrompt,
              defaultVal: DEFAULT_SUGGESTION_PROMPT,
              hint: "Variables: {{transcript}}, {{context_window}}",
            },
            {
              label: "Detail Answer Prompt (on card click)",
              value: detailPrompt,
              setter: setDetailPrompt,
              defaultVal: DEFAULT_DETAIL_PROMPT,
              hint: "Variables: {{suggestion}}, {{full_transcript}}",
            },
            {
              label: "Chat Prompt",
              value: chatPrompt,
              setter: setChatPrompt,
              defaultVal: DEFAULT_CHAT_PROMPT,
              hint: "Variables: {{transcript}}, {{question}}",
            },
          ].map(({ label, value, setter, defaultVal, hint }) => (
            <div key={label}>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                  {label}
                </label>
                <button
                  onClick={() => setter(defaultVal)}
                  className="text-[10px] text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  Reset to default
                </button>
              </div>
              <p className="text-[10px] text-neutral-600 mb-1.5">{hint}</p>
              <textarea
                value={value}
                onChange={(e) => setter(e.target.value)}
                rows={6}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-xs text-neutral-300 font-mono focus:outline-none focus:border-indigo-500 resize-y"
              />
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-neutral-900 border-t border-neutral-800 px-6 py-4 flex justify-end gap-3">
          {!forceOpen && (
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-neutral-400 hover:text-neutral-200 transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={validating}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            {validating ? "Validating…" : "Save & Close"}
          </button>
        </div>
      </div>
    </div>
  );
}

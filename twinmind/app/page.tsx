"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/useSession";
import MicPanel from "@/components/MicPanel";
import SuggestionsPanel from "@/components/SuggestionsPanel";
import ChatPanel from "@/components/ChatPanel";
import SettingsModal from "@/components/SettingsModal";

export default function Home() {
  const session = useSession();
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Auto-open settings if no API key on mount
  useEffect(() => {
    if (!session.settings.apiKey) {
      setSettingsOpen(true);
    }
  }, [session.settings.apiKey]);

  // Auto-dismiss errors after 5s
  useEffect(() => {
    if (!session.error) return;
    const t = setTimeout(session.clearError, 5000);
    return () => clearTimeout(t);
  }, [session.error, session.clearError]);

  return (
    <div className="h-screen flex flex-col bg-neutral-950 text-neutral-100 overflow-hidden">
      {/* ── Top bar ── */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-neutral-800 shrink-0 bg-neutral-950/80 backdrop-blur-md z-20">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" />
            </svg>
          </div>
          <span className="font-semibold text-sm text-neutral-100">TwinMind</span>
          <span className="hidden sm:inline text-[10px] text-neutral-600 bg-neutral-800/60 px-2 py-0.5 rounded-full">
            Live Suggestions Copilot
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Export */}
          <button
            onClick={session.exportSession}
            disabled={session.transcript.length === 0 && session.chatMessages.length <= 1}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-neutral-400 hover:text-neutral-200 border border-neutral-700 hover:border-neutral-500 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export
          </button>

          {/* Settings */}
          <button
            onClick={() => setSettingsOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-neutral-400 hover:text-neutral-200 border border-neutral-700 hover:border-neutral-500 rounded-lg transition-all"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Settings
            {!session.settings.apiKey && (
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 ml-0.5" />
            )}
          </button>
        </div>
      </header>

      {/* ── Error toast ── */}
      {session.error && (
        <div
          className={`mx-4 mt-3 shrink-0 flex items-center gap-3 px-4 py-3 rounded-xl text-sm border ${
            session.error.column === "global"
              ? "bg-red-900/30 border-red-800/60 text-red-300"
              : "bg-amber-900/30 border-amber-800/60 text-amber-300"
          }`}
        >
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span className="flex-1">{session.error.message}</span>
          <button onClick={session.clearError} className="text-current opacity-60 hover:opacity-100">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* ── 3-column layout ── */}
      <main className="flex-1 grid grid-cols-3 min-h-0 divide-x divide-neutral-800">
        {/* Col 1: Transcript */}
        <div className="min-h-0 overflow-hidden">
          <MicPanel
            isRecording={session.isRecording}
            isTranscribing={session.isTranscribing}
            transcript={session.transcript}
            onStart={session.startRecording}
            onStop={session.stopRecording}
            onManualRefresh={session.manualRefresh}
          />
        </div>

        {/* Col 2: Suggestions */}
        <div className="min-h-0 overflow-hidden">
          <SuggestionsPanel
            batches={session.suggestionBatches}
            isLoading={session.isLoadingSuggestions}
            onSuggestionClick={session.clickSuggestion}
            onManualRefresh={session.manualRefresh}
            hasTranscript={session.transcript.length > 0}
          />
        </div>

        {/* Col 3: Chat */}
        <div className="min-h-0 overflow-hidden">
          <ChatPanel
            messages={session.chatMessages}
            isStreaming={session.isStreamingChat}
            onSend={session.sendChatMessage}
          />
        </div>
      </main>

      {/* ── Settings Modal ── */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={session.settings}
        onSave={session.updateSettings}
        forceOpen={!session.settings.apiKey && settingsOpen}
      />
    </div>
  );
}

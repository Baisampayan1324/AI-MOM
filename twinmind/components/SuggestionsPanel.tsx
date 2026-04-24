"use client";

import { SuggestionBatch, Suggestion } from "@/types";
import SuggestionCard from "./SuggestionCard";

interface SuggestionsPanelProps {
  batches: SuggestionBatch[];
  isLoading: boolean;
  onSuggestionClick: (s: Suggestion) => void;
  onManualRefresh: () => void;
  hasTranscript: boolean;
}

function RelativeTime({ iso }: { iso: string }) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return <span>{diff}s ago</span>;
  if (diff < 3600) return <span>{Math.floor(diff / 60)}m ago</span>;
  return <span>{Math.floor(diff / 3600)}h ago</span>;
}

function SkeletonCard() {
  return (
    <div className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-4 animate-pulse">
      <div className="h-4 w-24 bg-neutral-800 rounded-full mb-3" />
      <div className="h-3.5 w-full bg-neutral-800 rounded mb-2" />
      <div className="h-3 w-4/5 bg-neutral-800/70 rounded mb-1" />
      <div className="h-3 w-3/5 bg-neutral-800/50 rounded" />
    </div>
  );
}

export default function SuggestionsPanel({
  batches,
  isLoading,
  onSuggestionClick,
  onManualRefresh,
  hasTranscript,
}: SuggestionsPanelProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800 shrink-0">
        <h2 className="text-xs font-semibold text-neutral-400 uppercase tracking-widest">Live Suggestions</h2>
        <button
          onClick={onManualRefresh}
          disabled={isLoading || !hasTranscript}
          className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Refresh suggestions"
        >
          <svg
            className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Refresh
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
        {/* Loading skeleton */}
        {isLoading && (
          <div className="space-y-3">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        )}

        {/* Batches */}
        {batches.map((batch, idx) => (
          <div key={batch.batchId}>
            {idx > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex-1 h-px bg-neutral-800" />
                <span className="text-[10px] text-neutral-600">
                  <RelativeTime iso={batch.generatedAt} />
                </span>
                <div className="flex-1 h-px bg-neutral-800" />
              </div>
            )}
            <div className="space-y-3">
              {batch.suggestions.map((s, i) => (
                <SuggestionCard key={i} suggestion={s} onClick={onSuggestionClick} />
              ))}
            </div>
          </div>
        ))}

        {/* Empty state */}
        {!isLoading && batches.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center gap-3 py-12">
            <svg className="w-10 h-10 text-neutral-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <p className="text-sm text-neutral-600 max-w-[200px]">
              Suggestions will appear as the conversation progresses
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

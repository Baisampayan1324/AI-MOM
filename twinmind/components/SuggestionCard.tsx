"use client";

import { Suggestion, SuggestionType } from "@/types";

const TYPE_STYLES: Record<SuggestionType, { badge: string; border: string }> = {
  "Question to ask": {
    badge: "bg-blue-500/20 text-blue-300 border border-blue-500/30",
    border: "border-blue-500/20 hover:border-blue-500/50",
  },
  "Talking point": {
    badge: "bg-violet-500/20 text-violet-300 border border-violet-500/30",
    border: "border-violet-500/20 hover:border-violet-500/50",
  },
  Answer: {
    badge: "bg-green-500/20 text-green-300 border border-green-500/30",
    border: "border-green-500/20 hover:border-green-500/50",
  },
  "Fact-check": {
    badge: "bg-amber-500/20 text-amber-300 border border-amber-500/30",
    border: "border-amber-500/20 hover:border-amber-500/50",
  },
  Clarification: {
    badge: "bg-slate-400/20 text-slate-300 border border-slate-400/30",
    border: "border-slate-400/20 hover:border-slate-400/50",
  },
};

interface SuggestionCardProps {
  suggestion: Suggestion;
  onClick: (s: Suggestion) => void;
}

export default function SuggestionCard({ suggestion, onClick }: SuggestionCardProps) {
  const styles = TYPE_STYLES[suggestion.type] ?? TYPE_STYLES["Clarification"];

  return (
    <button
      onClick={() => onClick(suggestion)}
      className={`w-full text-left bg-neutral-900 border rounded-xl p-4 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/40 active:scale-[0.99] ${styles.border}`}
    >
      <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full mb-2 ${styles.badge}`}>
        {suggestion.type}
      </span>
      <p className="text-sm font-semibold text-neutral-100 leading-snug mb-1.5">
        {suggestion.headline}
      </p>
      <p className="text-xs text-neutral-400 leading-relaxed line-clamp-3">
        {suggestion.preview}
      </p>
    </button>
  );
}

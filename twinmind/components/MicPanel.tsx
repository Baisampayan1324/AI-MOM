"use client";

import { useEffect, useRef } from "react";
import { TranscriptChunk } from "@/types";

interface MicPanelProps {
  isRecording: boolean;
  isTranscribing: boolean;
  transcript: TranscriptChunk[];
  onStart: () => void;
  onStop: () => void;
  onManualRefresh: () => void;
}

export default function MicPanel({
  isRecording,
  isTranscribing,
  transcript,
  onStart,
  onStop,
  onManualRefresh,
}: MicPanelProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest chunk
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800 shrink-0">
        <h2 className="text-xs font-semibold text-neutral-400 uppercase tracking-widest">Transcript</h2>
        {isTranscribing && (
          <span className="flex items-center gap-1.5 text-xs text-indigo-400">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            Transcribing…
          </span>
        )}
      </div>

      {/* Mic button */}
      <div className="flex flex-col items-center justify-center py-6 shrink-0 border-b border-neutral-800">
        <button
          onClick={isRecording ? onStop : onStart}
          aria-label={isRecording ? "Stop recording" : "Start recording"}
          className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
            isRecording
              ? "bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/40"
              : "bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/40"
          }`}
        >
          {/* Pulsing ring when recording */}
          {isRecording && (
            <>
              <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-30" />
              <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-20 animation-delay-300" />
            </>
          )}
          {isRecording ? (
            /* Stop icon */
            <span className="w-5 h-5 rounded-sm bg-white" />
          ) : (
            /* Mic icon */
            <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 1a4 4 0 0 0-4 4v7a4 4 0 0 0 8 0V5a4 4 0 0 0-4-4z" />
              <path d="M19 11a1 1 0 0 0-2 0 5 5 0 0 1-10 0 1 1 0 0 0-2 0 7 7 0 0 0 6 6.92V21H9a1 1 0 0 0 0 2h6a1 1 0 0 0 0-2h-2v-3.08A7 7 0 0 0 19 11z" />
            </svg>
          )}
        </button>

        <p className="mt-3 text-xs text-neutral-500">
          {isRecording ? "Recording — click to stop" : "Click to start recording"}
        </p>
      </div>

      {/* Transcript scroll area */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {transcript.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center gap-3 py-12">
            <svg className="w-10 h-10 text-neutral-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 1a4 4 0 0 0-4 4v7a4 4 0 0 0 8 0V5a4 4 0 0 0-4-4z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 0 1-14 0" />
            </svg>
            <p className="text-sm text-neutral-600 max-w-[180px]">Click the mic to begin recording your meeting</p>
          </div>
        ) : (
          transcript.map((chunk) => (
            <div key={chunk.id} className="group">
              <span className="text-[10px] font-mono text-neutral-600 mb-1 block">
                {chunk.timestamp}
              </span>
              <p className="text-sm text-neutral-300 leading-relaxed">{chunk.text}</p>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}

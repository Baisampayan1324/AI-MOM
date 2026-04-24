export type SuggestionType =
  | "Question to ask"
  | "Talking point"
  | "Answer"
  | "Fact-check"
  | "Clarification";

export interface TranscriptChunk {
  id: string;
  timestamp: string; // ISO string
  text: string;
}

export interface Suggestion {
  type: SuggestionType;
  headline: string;
  preview: string;
}

export interface SuggestionBatch {
  batchId: string;
  generatedAt: string; // ISO string
  suggestions: Suggestion[];
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string; // ISO string
}

export interface Settings {
  apiKey: string;
  suggestionPrompt: string;
  detailPrompt: string;
  chatPrompt: string;
  suggestionContextWindow: number; // number of chunks
  chatContextWindow: number;
  refreshInterval: number; // seconds
}

export interface SessionExport {
  exportedAt: string;
  transcript: TranscriptChunk[];
  suggestionBatches: SuggestionBatch[];
  chat: ChatMessage[];
}

# TwinMind — Live Suggestions Copilot

TwinMind is an always-on AI meeting copilot. It listens to live audio, transcribes the conversation, and continuously surfaces 3 useful, context-aware suggestions every 30 seconds. Clicking a suggestion opens a detailed, actionable answer in a streaming chat panel on the right.

## Setup & Run Locally

1. **Clone the repository** (if you haven't already).
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Start the development server**:
   ```bash
   npm run dev
   ```
4. **Open your browser** to [http://localhost:3000](http://localhost:3000).
5. **Paste your Groq API Key** in the Settings modal that appears.
6. **Click the Mic button** to start recording!

## Tech Stack & Architectural Decisions

- **Next.js 14 (App Router)**: Provides a seamless full-stack experience with zero configuration needed for API routes. Deploys instantly to Vercel.
- **Tailwind CSS v4**: For rapid UI styling, dark mode, and custom scrollbar aesthetics.
- **Groq API**: Chosen for its industry-leading inference speed, which is critical for a "live" copilot.
  - **Whisper Large V3**: Fast and highly accurate audio transcription.
  - **Llama 3.3 70B Versatile**: Used for both strict JSON generation (Live Suggestions) and streaming responses (Chat).
- **Client-side State (`useSession`)**: All state is ephemeral and managed in a single React hook. The API key is stored in `sessionStorage` so it persists across hot-reloads but vanishes when the tab closes, ensuring security without sacrificing developer experience.
- **No WebSockets**: Polling the transcription and triggering suggestions immediately after each 30s chunk provides a robust, stateless architecture that scales perfectly on serverless infrastructure without the complexity of WebSocket management.

## Prompt Strategy

The application uses three distinct prompts (editable in Settings):
1. **Live Suggestions**: Forced to return exactly 3 suggestions in a strict JSON array. The prompt requires varying types ("Question to ask", "Talking point", "Answer", "Fact-check", "Clarification") based on the actual transcript context to ensure high relevance.
2. **Detail Answer**: When a suggestion card is clicked, this prompt instructs the model to provide a 150-300 word, highly actionable, inverted-pyramid style answer suitable for reading *during* a meeting.
3. **Free Chat**: A standard conversational prompt that prioritizes brevity and uses the meeting transcript as its primary knowledge base.

## Deployment

Deploying to Vercel takes one command:

```bash
npx vercel --prod
```

Or connect the GitHub repository in the Vercel dashboard for automatic deployments.

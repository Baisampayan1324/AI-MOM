import { useState, useRef } from "react";
import { Upload, FileAudio, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import TranscriptDisplay from "@/components/TranscriptDisplay";
import SummaryDisplay from "@/components/SummaryDisplay";

const FileProcessing = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [transcript, setTranscript] = useState<Array<{ speaker: string; text: string; timestamp: string }>>([]);
  const [summary, setSummary] = useState<{ keyPoints: string[]; actionItems: string[] } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const validTypes = ["audio/mp3", "audio/wav", "audio/m4a", "audio/mpeg"];
      if (!validTypes.includes(file.type) && !file.name.match(/\.(mp3|wav|m4a)$/i)) {
        toast.error("Please select a valid audio file (MP3, WAV, or M4A)");
        return;
      }
      setSelectedFile(file);
      toast.success(`File selected: ${file.name}`);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    const file = event.dataTransfer.files[0];
    if (file) {
      const validTypes = ["audio/mp3", "audio/wav", "audio/m4a", "audio/mpeg"];
      if (!validTypes.includes(file.type) && !file.name.match(/\.(mp3|wav|m4a)$/i)) {
        toast.error("Please drop a valid audio file (MP3, WAV, or M4A)");
        return;
      }
      setSelectedFile(file);
      toast.success(`File dropped: ${file.name}`);
    }
  };

  const handleProcess = async () => {
    if (!selectedFile) {
      toast.error("Please select a file first");
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    // Simulate processing with progress updates
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) {
          clearInterval(interval);
          return 95;
        }
        return prev + 5;
      });
    }, 500);

    // Simulate API call
    setTimeout(() => {
      clearInterval(interval);
      setProgress(100);
      
      // Mock transcript data
      setTranscript([
        { speaker: "Speaker 1", text: "Welcome everyone to today's meeting. Let's start by reviewing our progress from last week.", timestamp: "00:00:12" },
        { speaker: "Speaker 2", text: "Thanks for having me. I've completed the analysis and have the results ready to present.", timestamp: "00:00:28" },
        { speaker: "Speaker 1", text: "Great, please go ahead and share your findings with the team.", timestamp: "00:00:35" },
        { speaker: "Speaker 2", text: "The data shows a 25% increase in engagement over the past quarter.", timestamp: "00:00:42" },
        { speaker: "Speaker 3", text: "That's impressive! What were the main drivers of this growth?", timestamp: "00:00:58" },
      ]);

      // Mock summary data
      setSummary({
        keyPoints: [
          "Team reviewed weekly progress and achievements",
          "Data analysis shows 25% increase in user engagement",
          "New marketing strategies proving effective",
          "Q1 targets on track to be met"
        ],
        actionItems: [
          "Share detailed analysis report with stakeholders",
          "Schedule follow-up meeting for next week",
          "Prepare Q2 planning documents",
          "Update dashboard with latest metrics"
        ]
      });

      setIsProcessing(false);
      toast.success("Processing complete!");
    }, 10000);
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-2">Audio File Processing</h1>
          <p className="text-muted-foreground">Upload and process pre-recorded meeting audio</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Upload */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="p-6 shadow-card">
              <h2 className="text-xl font-semibold mb-4">Upload Audio</h2>
              
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-2">
                  Drag & drop your audio file here
                </p>
                <p className="text-xs text-muted-foreground">
                  or click to browse
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Supports MP3, WAV, M4A
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".mp3,.wav,.m4a,audio/*"
                onChange={handleFileSelect}
                className="hidden"
              />

              {selectedFile && (
                <div className="mt-4 p-4 bg-secondary rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileAudio className="h-8 w-8 text-primary" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {isProcessing && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Processing...</span>
                    <span className="text-sm font-medium">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              )}

              <Button
                onClick={handleProcess}
                disabled={!selectedFile || isProcessing}
                className="w-full mt-4"
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : progress === 100 ? (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Complete
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Process Audio
                  </>
                )}
              </Button>
            </Card>
          </div>

          {/* Right Column - Results */}
          <div className="lg:col-span-2 space-y-6">
            {transcript.length > 0 && (
              <>
                <TranscriptDisplay transcript={transcript} isRecording={false} />
                {summary && <SummaryDisplay summary={summary} />}
              </>
            )}
            
            {!transcript.length && !isProcessing && (
              <Card className="p-12 shadow-card text-center">
                <FileAudio className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No transcript yet</h3>
                <p className="text-sm text-muted-foreground">
                  Upload an audio file to see the transcript and summary
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileProcessing;

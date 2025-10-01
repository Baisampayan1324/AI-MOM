import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TranscriptItem {
  speaker: string;
  text: string;
  timestamp: string;
}

interface TranscriptDisplayProps {
  transcript: TranscriptItem[];
  isRecording?: boolean;
}

const TranscriptDisplay = ({ transcript, isRecording = false }: TranscriptDisplayProps) => {
  const speakerColors = ["bg-primary", "bg-accent", "bg-success", "bg-warning"];

  const getSpeakerColor = (speaker: string) => {
    const index = parseInt(speaker.match(/\d+/)?.[0] || "0") - 1;
    return speakerColors[index % speakerColors.length];
  };

  return (
    <Card className="p-6 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Live Transcript</h2>
        </div>
        {isRecording && (
          <Badge variant="outline" className="border-success text-success">
            <span className="h-2 w-2 rounded-full bg-success mr-2 recording-pulse" />
            Recording
          </Badge>
        )}
      </div>

      <ScrollArea className="h-[500px] pr-4">
        {transcript.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              {isRecording ? "Listening... Speak to see transcript" : "No transcript available yet"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {transcript.map((item, index) => (
              <div key={index} className="flex gap-3">
                <div className={`h-8 w-8 rounded-full ${getSpeakerColor(item.speaker)} flex items-center justify-center text-white text-sm font-medium flex-shrink-0`}>
                  {item.speaker.charAt(item.speaker.length - 1)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{item.speaker}</span>
                    <span className="text-xs text-muted-foreground">{item.timestamp}</span>
                  </div>
                  <p className="text-sm text-foreground">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </Card>
  );
};

export default TranscriptDisplay;

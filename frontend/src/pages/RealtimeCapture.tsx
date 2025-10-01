import { useState, useRef } from "react";
import { Mic, MicOff, Play, Square, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import AudioVisualizer from "@/components/AudioVisualizer";
import TranscriptDisplay from "@/components/TranscriptDisplay";
import SummaryDisplay from "@/components/SummaryDisplay";

const RealtimeCapture = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [meetingId, setMeetingId] = useState("");
  const [language, setLanguage] = useState("en");
  const [transcript, setTranscript] = useState<Array<{ speaker: string; text: string; timestamp: string }>>([]);
  const [summary, setSummary] = useState<{ keyPoints: string[]; actionItems: string[] } | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const wsRef = useRef<WebSocket | null>(null);

  const handleConnect = () => {
    if (!meetingId.trim()) {
      toast.error("Please enter a meeting ID");
      return;
    }

    try {
      wsRef.current = new WebSocket(`ws://localhost:8000/ws/${meetingId}`);
      
      wsRef.current.onopen = () => {
        setIsConnected(true);
        toast.success("Connected to meeting");
      };

      wsRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === "transcript") {
          setTranscript(prev => [...prev, data]);
        } else if (data.type === "summary") {
          setSummary(data);
        }
      };

      wsRef.current.onerror = () => {
        toast.error("Connection failed. Make sure the backend server is running.");
      };

      wsRef.current.onclose = () => {
        setIsConnected(false);
        toast.info("Disconnected from meeting");
      };
    } catch (error) {
      toast.error("Failed to connect to server");
    }
  };

  const handleStartRecording = async () => {
    if (!isConnected) {
      toast.error("Please connect to a meeting first");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setIsRecording(true);
      toast.success("Recording started");
      
      // Simulate audio level changes
      const interval = setInterval(() => {
        setAudioLevel(Math.random() * 100);
      }, 100);

      return () => {
        clearInterval(interval);
        stream.getTracks().forEach(track => track.stop());
      };
    } catch (error) {
      toast.error("Microphone access denied");
    }
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    toast.info("Recording stopped");
    
    // Generate summary
    setTimeout(() => {
      setSummary({
        keyPoints: [
          "Project timeline discussed for Q1 2025",
          "Budget allocation approved",
          "New team members to be onboarded next week"
        ],
        actionItems: [
          "John to prepare budget report by Friday",
          "Sarah to schedule onboarding sessions",
          "Team to review project milestones"
        ]
      });
      toast.success("Summary generated");
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-2">Real-time Capture</h1>
          <p className="text-muted-foreground">Live meeting transcription with speaker alerts</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Controls */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="p-6 shadow-card">
              <h2 className="text-xl font-semibold mb-4">Meeting Setup</h2>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="meetingId">Meeting ID</Label>
                  <Input
                    id="meetingId"
                    placeholder="Enter meeting ID"
                    value={meetingId}
                    onChange={(e) => setMeetingId(e.target.value)}
                    disabled={isConnected}
                  />
                </div>

                <div>
                  <Label htmlFor="language">Language</Label>
                  <Select value={language} onValueChange={setLanguage} disabled={isConnected}>
                    <SelectTrigger id="language">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {!isConnected ? (
                  <Button onClick={handleConnect} className="w-full" size="lg">
                    <Play className="mr-2 h-4 w-4" />
                    Connect to Meeting
                  </Button>
                ) : (
                  <Badge variant="outline" className="w-full justify-center py-2 border-success text-success">
                    Connected
                  </Badge>
                )}
              </div>
            </Card>

            <Card className="p-6 shadow-card">
              <h2 className="text-xl font-semibold mb-4">Recording</h2>
              
              {!isRecording ? (
                <Button
                  onClick={handleStartRecording}
                  disabled={!isConnected}
                  className="w-full"
                  size="lg"
                  variant="default"
                >
                  <Mic className="mr-2 h-4 w-4" />
                  Start Recording
                </Button>
              ) : (
                <Button
                  onClick={handleStopRecording}
                  className="w-full"
                  size="lg"
                  variant="destructive"
                >
                  <Square className="mr-2 h-4 w-4" />
                  Stop Recording
                </Button>
              )}

              {isRecording && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Audio Level</span>
                    <Volume2 className="h-4 w-4 text-primary recording-pulse" />
                  </div>
                  <AudioVisualizer level={audioLevel} />
                </div>
              )}
            </Card>
          </div>

          {/* Right Column - Transcript & Summary */}
          <div className="lg:col-span-2 space-y-6">
            <TranscriptDisplay transcript={transcript} isRecording={isRecording} />
            {summary && <SummaryDisplay summary={summary} />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealtimeCapture;

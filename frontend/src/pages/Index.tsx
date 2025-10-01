import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mic, Upload, Sparkles, Clock, Users, FileText } from "lucide-react";

const Index = () => {
  const features = [
    {
      icon: Mic,
      title: "Real-time Transcription",
      description: "Capture live meetings with instant speaker identification and transcription"
    },
    {
      icon: Upload,
      title: "File Processing",
      description: "Upload pre-recorded audio files for comprehensive analysis and transcription"
    },
    {
      icon: Sparkles,
      title: "AI-Powered Summaries",
      description: "Automatically generate key points and action items from your meetings"
    },
    {
      icon: Users,
      title: "Speaker Diarization",
      description: "Identify and track multiple speakers with visual color coding"
    },
    {
      icon: Clock,
      title: "Session Persistence",
      description: "All your meetings are automatically saved for future reference"
    },
    {
      icon: FileText,
      title: "Smart Alerts",
      description: "Get notified when important keywords or speakers are mentioned"
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Hero Section */}
      <div className="container mx-auto px-6 pt-20 pb-16 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 gradient-text">
            AI Meeting Minutes
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8">
            Transform your meetings into actionable insights with real-time transcription and AI-powered summarization
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/realtime">
              <Button size="lg" className="gap-2 px-8 text-lg h-14">
                <Mic className="h-5 w-5" />
                Start Recording
              </Button>
            </Link>
            <Link to="/file-processing">
              <Button size="lg" variant="outline" className="gap-2 px-8 text-lg h-14">
                <Upload className="h-5 w-5" />
                Upload Audio File
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="container mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Powerful Features</h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="p-6 shadow-card hover:shadow-elegant transition-all duration-300">
                <div className="h-12 w-12 rounded-lg bg-gradient-primary flex items-center justify-center mb-4">
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </Card>
            );
          })}
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-6 py-16">
        <Card className="p-12 text-center bg-gradient-primary text-white shadow-glow">
          <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-lg mb-8 opacity-90">
            Connect your microphone or upload an audio file to begin transcribing
          </p>
          <Link to="/realtime">
            <Button size="lg" variant="secondary" className="gap-2 px-8 text-lg h-14">
              <Mic className="h-5 w-5" />
              Start Your First Meeting
            </Button>
          </Link>
        </Card>
      </div>
    </div>
  );
};

export default Index;

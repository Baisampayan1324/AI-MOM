import { Card } from "@/components/ui/card";
import { FileText, CheckCircle2, ListChecks } from "lucide-react";

interface SummaryDisplayProps {
  summary: {
    keyPoints: string[];
    actionItems: string[];
  };
}

const SummaryDisplay = ({ summary }: SummaryDisplayProps) => {
  return (
    <Card className="p-6 shadow-card">
      <div className="flex items-center gap-2 mb-6">
        <FileText className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold">AI Summary</h2>
      </div>

      <div className="space-y-6">
        {/* Key Points */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <ListChecks className="h-4 w-4 text-primary" />
            <h3 className="font-semibold">Key Points</h3>
          </div>
          <ul className="space-y-2">
            {summary.keyPoints.map((point, index) => (
              <li key={index} className="flex gap-2 text-sm">
                <span className="text-primary mt-1">•</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Action Items */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="h-4 w-4 text-success" />
            <h3 className="font-semibold">Action Items</h3>
          </div>
          <ul className="space-y-2">
            {summary.actionItems.map((item, index) => (
              <li key={index} className="flex gap-2 text-sm">
                <span className="text-success mt-1">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  );
};

export default SummaryDisplay;

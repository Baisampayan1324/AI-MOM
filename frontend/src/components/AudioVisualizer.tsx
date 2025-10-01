interface AudioVisualizerProps {
  level: number;
}

const AudioVisualizer = ({ level }: AudioVisualizerProps) => {
  const bars = 5;
  const activeCount = Math.ceil((level / 100) * bars);

  return (
    <div className="flex items-end gap-1 h-12">
      {Array.from({ length: bars }).map((_, i) => (
        <div
          key={i}
          className={`flex-1 rounded-t transition-all duration-150 ${
            i < activeCount
              ? "bg-primary"
              : "bg-muted"
          }`}
          style={{
            height: `${((i + 1) / bars) * 100}%`,
            opacity: i < activeCount ? 1 : 0.3,
          }}
        />
      ))}
    </div>
  );
};

export default AudioVisualizer;

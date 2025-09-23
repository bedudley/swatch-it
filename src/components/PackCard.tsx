import { PackMetadata } from "@/lib/packLibrary";

interface PackCardProps {
  pack: PackMetadata;
  isLoaded?: boolean;
  onLoad: (pack: PackMetadata) => void;
}

export default function PackCard({ pack, isLoaded = false, onLoad }: PackCardProps) {
  return (
    <div className={`bg-card rounded-lg border-2 p-4 transition-all hover:shadow-md ${
      isLoaded ? 'border-success bg-success/5' : 'border-border hover:border-primary/50'
    }`}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-text-primary mb-2 line-clamp-2">
            {pack.title}
          </h3>

          {/* Stats */}
          <div className="space-y-1 text-sm text-text-secondary mb-4">
            <div className="flex justify-between">
              <span>Categories:</span>
              <span className="font-medium">{pack.categoryCount}</span>
            </div>
            <div className="flex justify-between">
              <span>Questions:</span>
              <span className="font-medium">{pack.questionCount}</span>
            </div>
          </div>
        </div>

        {/* Status & Action */}
        <div className="flex items-center justify-between">
          {isLoaded ? (
            <div className="flex items-center gap-2 text-success text-sm font-medium">
              <span className="text-lg">✓</span>
              <span>Loaded</span>
            </div>
          ) : (
            <button
              onClick={() => onLoad(pack)}
              className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
            >
              Load Pack
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
import React from 'react';
import { Progress } from '@/components/ui/progress';

interface LoadingProgressProps {
  phase: string;
  progress: number;
  status: string;
  compact?: boolean;
}

const LoadingProgress: React.FC<LoadingProgressProps> = ({ phase, progress, status, compact = false }) => {
  const phases = [
    { id: 'init', label: 'Initializing', color: 'text-primary' },
    { id: 'structure', label: 'Building Structure', color: 'text-secondary' },
    { id: 'content', label: 'Generating Content', color: 'text-accent' },
    { id: 'complete', label: 'Complete', color: 'text-green-500' }
  ];

  const currentPhaseIndex = phases.findIndex(p => p.label === phase);

  const containerClasses = compact
    ? "w-full bg-background/80 backdrop-blur-sm rounded-lg p-4 shadow-lg border border-border/10"
    : "flex flex-col items-center justify-center h-full p-8 animate-fade-in";

  const contentContainerClasses = compact
    ? "w-full space-y-3"
    : "w-full max-w-md space-y-8";

  return (
    <div className={containerClasses}>
      <div className={contentContainerClasses}>
        {/* Phase Tracker */}
        {!compact && (
          <div className="flex justify-between items-center mb-8">
            {phases.map((phaseItem, index) => {
              const isCompleted = index < currentPhaseIndex;
              const isInProgress = index === currentPhaseIndex;

              return (
                <div key={phaseItem.id} className="flex flex-col items-center">
                  <div className={`
                    w-12 h-12 rounded-full border-2 flex items-center justify-center text-sm font-semibold
                    transition-all duration-300
                    ${isCompleted
                      ? 'border-green-500 bg-green-500 text-white'
                      : isInProgress
                      ? 'border-primary bg-primary/20 text-primary animate-pulse'
                      : 'border-muted text-muted-foreground'
                    }
                  `}>
                    {isCompleted ? '✓' : index + 1}
                  </div>
                  <span className={`
                    text-xs mt-2 transition-colors duration-300
                    ${isCompleted 
                      ? 'text-green-500' 
                      : isInProgress 
                      ? phaseItem.color 
                      : 'text-muted-foreground'
                    }
                  `}>
                    {phaseItem.label}
                  </span>
                </div>
              )
            })}
          </div>
        )}

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-medium">
            <span className="text-foreground">{phase}</span>
            <span className="text-muted-foreground">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Status Message */}
        <div className="glass-panel rounded-md p-2">
          <p className="text-xs text-center text-foreground truncate">
            {status}
          </p>
        </div>

        {/* Animated Galaxy */}
        {!compact && (
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
              <div className="absolute inset-2 w-12 h-12 border-4 border-secondary/30 border-t-secondary rounded-full animate-spin-slow" />
              <div className="absolute inset-4 w-8 h-8 border-4 border-accent/30 border-t-accent rounded-full animate-spin" style={{ animationDirection: 'reverse' }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoadingProgress;

import React from 'react';
import { Brain, Sparkles, Zap } from 'lucide-react';

const GalaxyPlaceholder: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8 animate-fade-in">
      <div className="relative mb-8">
        <div className="relative">
          <Brain className="w-24 h-24 text-primary animate-float" />
          <Sparkles className="w-6 h-6 text-accent absolute -top-2 -right-2 animate-pulse" />
          <Sparkles className="w-4 h-4 text-secondary absolute -bottom-1 -left-2 animate-pulse delay-300" />
          <Sparkles className="w-5 h-5 text-accent absolute top-1/2 -right-6 animate-pulse delay-700" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 rounded-full blur-xl animate-pulse-glow" />
      </div>
      
      <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
        Your Knowledge Galaxy Awaits
      </h1>
      
      <p className="text-lg text-muted-foreground mb-8 max-w-md leading-relaxed">
        Transform your ideas into an interconnected constellation of knowledge. 
        Click the action button to generate your first note and begin exploring.
      </p>
      
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Zap className="w-4 h-4 text-accent" />
        <span>AI-powered • Interactive • Beautiful</span>
      </div>
    </div>
  );
};

export default GalaxyPlaceholder;

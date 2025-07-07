
import React from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface FocusModeProps {
  isActive: boolean;
  onToggle: () => void;
}

const FocusMode: React.FC<FocusModeProps> = ({ isActive, onToggle }) => {
  return (
    <div className="fixed top-4 right-4 z-40">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="icon"
            variant={isActive ? "default" : "outline"}
            className={`h-10 w-10 rounded-full glass-panel transition-all duration-300 ${
              isActive ? 'cosmic-glow' : ''
            }`}
            onClick={onToggle}
          >
            {isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left">
          <p>{isActive ? 'Exit Focus Mode' : 'Enter Focus Mode'}</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
};

export default FocusMode;

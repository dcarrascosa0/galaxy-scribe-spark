
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Zap, 
  Plus, 
  History, 
  Search, 
  Download, 
  Settings, 
  HelpCircle 
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface AdditionalAction {
  component: React.ReactNode;
  position: 'top' | 'bottom' | 'left' | 'right';
}

interface SpeedDialProps {
  onGenerateClick: () => void;
  onHistoryClick: () => void;
  onSearchClick: () => void;
  onExportClick: () => void;
  onSettingsClick: () => void;
  onHelpClick: () => void;
  additionalActions?: AdditionalAction[];
}

const SpeedDial: React.FC<SpeedDialProps> = ({
  onGenerateClick,
  onHistoryClick,
  onSearchClick,
  onExportClick,
  onSettingsClick,
  onHelpClick,
  additionalActions = []
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    { 
      icon: Plus, 
      label: 'Generate Notes', 
      onClick: onGenerateClick, 
      color: 'bg-primary hover:bg-primary/90 text-primary-foreground' 
    },
    { 
      icon: History, 
      label: 'Note History', 
      onClick: onHistoryClick, 
      color: 'bg-secondary hover:bg-secondary/90 text-secondary-foreground' 
    },
    { 
      icon: Search, 
      label: 'Focus Search', 
      onClick: onSearchClick, 
      color: 'bg-accent hover:bg-accent/90 text-accent-foreground' 
    },
    { 
      icon: Download, 
      label: 'Export Notes', 
      onClick: onExportClick, 
      color: 'bg-green-500 hover:bg-green-600 text-white' 
    },
    { 
      icon: Settings, 
      label: 'Settings', 
      onClick: onSettingsClick, 
      color: 'bg-muted hover:bg-muted/80 text-muted-foreground' 
    },
    { 
      icon: HelpCircle, 
      label: 'Help & Shortcuts', 
      onClick: onHelpClick, 
      color: 'bg-muted hover:bg-muted/80 text-muted-foreground' 
    }
  ];

  const handleActionClick = (action: typeof actions[0]) => {
    action.onClick();
    setIsOpen(false);
  };

  return (
    <TooltipProvider>
      <div className="fixed bottom-6 right-6 z-50">
        {/* Additional Actions */}
        {additionalActions.map((additionalAction, index) => (
          <div key={index} className={`
            absolute transition-all duration-300
            ${additionalAction.position === 'top' ? '-top-20' : ''}
            ${additionalAction.position === 'bottom' ? '-bottom-20' : ''}
            ${additionalAction.position === 'left' ? '-left-20' : ''}
            ${additionalAction.position === 'right' ? '-right-20' : ''}
            ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}
          `}>
            {additionalAction.component}
          </div>
        ))}

        {/* Action buttons */}
        <div className={`
          flex flex-col gap-3 mb-4 transition-all duration-300 origin-bottom
          ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}
        `}>
          {actions.map((action, index) => (
            <Tooltip key={action.label}>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  className={`
                    speed-dial-button h-12 w-12 rounded-full shadow-lg transition-all duration-200
                    ${action.color}
                  `}
                  style={{
                    animationDelay: `${index * 50}ms`
                  }}
                  onClick={() => handleActionClick(action)}
                >
                  <action.icon className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left" className="mr-2">
                <p>{action.label}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>

        {/* Main button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              className={`
                h-16 w-16 rounded-full shadow-lg transition-all duration-300 cosmic-glow
                bg-gradient-to-br from-primary to-secondary hover:from-primary/90 hover:to-secondary/90
                text-white transform ${isOpen ? 'rotate-45' : 'rotate-0'}
              `}
              onClick={() => setIsOpen(!isOpen)}
            >
              <Zap className="h-8 w-8" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left" className="mr-2">
            <p>{isOpen ? 'Close Menu' : 'Actions'}</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
};

export default SpeedDial;

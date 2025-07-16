import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Zap, 
  Plus, 
  History, 
  Search, 
  Download, 
  Settings, 
  HelpCircle,
  Star,
  Target,
  Bookmark
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
  achievements?: Array<{
    id: string;
    title: string;
    description: string;
    unlocked: boolean;
    icon: React.ReactNode;
  }>;
  onAchievementClick?: () => void;
}

const SpeedDial: React.FC<SpeedDialProps> = ({
  onGenerateClick,
  onHistoryClick,
  onSearchClick,
  onExportClick,
  onSettingsClick,
  onHelpClick,
  additionalActions = [],
  achievements = [],
  onAchievementClick
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [pulseEffect, setPulseEffect] = useState(false);
  const [showAchievementNotification, setShowAchievementNotification] = useState(false);

  const actions = [
    { 
      icon: Plus, 
      label: 'Generate Notes', 
      onClick: onGenerateClick, 
      color: 'bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white',
      shortcut: 'G'
    },
    { 
      icon: History, 
      label: 'Note History', 
      onClick: onHistoryClick, 
      color: 'bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white',
      shortcut: 'H'
    },
    { 
      icon: Search, 
      label: 'Focus Search', 
      onClick: onSearchClick, 
      color: 'bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white',
      shortcut: 'F'
    },
    { 
      icon: Download, 
      label: 'Export Notes', 
      onClick: onExportClick, 
      color: 'bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white',
      shortcut: 'E'
    },
    { 
      icon: Settings, 
      label: 'Settings', 
      onClick: onSettingsClick, 
      color: 'bg-gradient-to-br from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white',
      shortcut: 'S'
    },
    { 
      icon: HelpCircle, 
      label: 'Help & Shortcuts', 
      onClick: onHelpClick, 
      color: 'bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white',
      shortcut: '?'
    }
  ];

  // Add achievement button if there are achievements
  if (achievements.length > 0 && onAchievementClick) {
    actions.push({
      icon: Star,
      label: 'Achievements',
      onClick: onAchievementClick,
      color: 'bg-gradient-to-br from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white',
      shortcut: 'A'
    });
  }

  const handleActionClick = (action: typeof actions[0]) => {
    action.onClick();
    setIsOpen(false);
    setPulseEffect(true);
    setTimeout(() => setPulseEffect(false), 300);
  };

  // Check for new achievements
  useEffect(() => {
    const newAchievements = achievements.filter(a => a.unlocked);
    if (newAchievements.length > 0) {
      setShowAchievementNotification(true);
      setTimeout(() => setShowAchievementNotification(false), 3000);
    }
  }, [achievements]);

  return (
    <TooltipProvider>
      <div className="fixed bottom-6 right-6 z-50">
        {/* Achievement Notification */}
        {showAchievementNotification && (
          <div className="absolute -top-20 right-0 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-lg shadow-lg animate-slide-in-right">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              <span className="text-sm font-medium">Achievement Unlocked!</span>
            </div>
          </div>
        )}

        {/* Additional Actions */}
        {additionalActions.map((additionalAction, index) => (
          <div key={index} className={`
            absolute transition-all duration-500 ease-out
            ${additionalAction.position === 'top' ? '-top-20' : ''}
            ${additionalAction.position === 'bottom' ? '-bottom-20' : ''}
            ${additionalAction.position === 'left' ? '-left-20' : ''}
            ${additionalAction.position === 'right' ? '-right-20' : ''}
            ${isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-2 pointer-events-none'}
          `}
          style={{ transitionDelay: `${index * 100}ms` }}
          >
            {additionalAction.component}
          </div>
        ))}

        {/* Action buttons */}
        <div className={`
          flex flex-col gap-3 mb-4 transition-all duration-500 origin-bottom
          ${isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4 pointer-events-none'}
        `}>
          {actions.map((action, index) => (
            <div
              key={action.label}
              className={`transition-all duration-300 ease-out ${
                isOpen ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'
              }`}
              style={{
                transitionDelay: `${index * 80}ms`
              }}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    className={`
                      h-14 w-14 rounded-full shadow-lg transition-all duration-300 
                      hover:scale-110 hover:shadow-xl active:scale-95
                      ${action.color}
                      relative overflow-hidden group
                    `}
                    onClick={() => handleActionClick(action)}
                  >
                    {/* Animated background effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent 
                                  transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] 
                                  transition-transform duration-700" />
                    
                    <action.icon className="h-6 w-6 relative z-10" />
                    
                    {/* Keyboard shortcut indicator */}
                    <div className="absolute -top-1 -right-1 bg-white/20 text-white text-xs 
                                  rounded-full w-5 h-5 flex items-center justify-center 
                                  font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                      {action.shortcut}
                    </div>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left" className="mr-2 bg-black/90 text-white border-0">
                  <div className="flex flex-col items-center">
                    <p className="font-medium">{action.label}</p>
                    <p className="text-xs opacity-75">Press {action.shortcut}</p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </div>
          ))}
        </div>

        {/* Enhanced Main button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              className={`
                h-18 w-18 rounded-full shadow-2xl transition-all duration-500 
                bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 
                hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600
                text-white transform relative overflow-hidden group
                ${isOpen ? 'rotate-45 scale-110' : 'rotate-0 scale-100 hover:scale-105'}
                ${pulseEffect ? 'animate-pulse-glow' : ''}
              `}
              onClick={() => setIsOpen(!isOpen)}
            >
              {/* Animated ring effects */}
              <div className={`absolute inset-0 rounded-full border-2 border-white/30 
                             ${isOpen ? 'animate-ping' : ''}`} />
              <div className={`absolute inset-2 rounded-full border border-white/20 
                             ${isOpen ? 'animate-pulse' : ''}`} />
              
              {/* Lightning bolt with enhanced animation */}
              <Zap className={`h-8 w-8 relative z-10 transition-all duration-300 
                             ${isOpen ? 'scale-110' : 'scale-100'}`} />
              
              {/* Sparkle effects */}
              <div className="absolute top-1 right-1 w-2 h-2 bg-white rounded-full 
                            animate-ping opacity-75" />
              <div className="absolute bottom-2 left-2 w-1 h-1 bg-white rounded-full 
                            animate-pulse opacity-60" />
              
              {/* Rotating gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent 
                            transform rotate-0 group-hover:rotate-180 transition-transform duration-1000" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left" className="mr-2 bg-black/90 text-white border-0">
            <div className="flex flex-col items-center">
              <p className="font-medium">{isOpen ? 'Close Actions' : 'Quick Actions'}</p>
              <p className="text-xs opacity-75">Press Space</p>
            </div>
          </TooltipContent>
        </Tooltip>

        {/* Floating particles around the main button */}
        {isOpen && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full animate-float opacity-60"
                style={{
                  left: `${50 + Math.cos(i * Math.PI / 3) * 40}%`,
                  top: `${50 + Math.sin(i * Math.PI / 3) * 40}%`,
                  animationDelay: `${i * 200}ms`
                }}
              />
            ))}
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};

export default SpeedDial;
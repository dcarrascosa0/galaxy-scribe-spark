import React from 'react';
import { Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Theme {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };
}

interface ThemeSelectorProps {
  currentTheme: string;
  onThemeChange: (themeId: string) => void;
}

const ThemeSelector: React.FC<ThemeSelectorProps> = ({ currentTheme, onThemeChange }) => {
  const themes: Theme[] = [
    {
      id: 'cosmic',
      name: 'Cosmic Blue',
      colors: {
        primary: '#3498DB',
        secondary: '#2ECC71',
        accent: '#F1C40F',
        background: '#0B1426'
      }
    },
    {
      id: 'nebula',
      name: 'Nebula Purple',
      colors: {
        primary: '#8E44AD',
        secondary: '#E74C3C',
        accent: '#F39C12',
        background: '#2C1810'
      }
    },
    {
      id: 'solar',
      name: 'Solar System',
      colors: {
        primary: '#E67E22',
        secondary: '#D35400',
        accent: '#F1C40F',
        background: '#1A1A0A'
      }
    },
    {
      id: 'matrix',
      name: 'Digital Matrix',
      colors: {
        primary: '#00FF00',
        secondary: '#00CC00',
        accent: '#FFFF00',
        background: '#000000'
      }
    }
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon" variant="outline" className="h-10 w-10 rounded-full glass-panel">
          <Palette className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {themes.map((theme) => (
          <DropdownMenuItem
            key={theme.id}
            onClick={() => onThemeChange(theme.id)}
            className="flex items-center gap-3 cursor-pointer"
          >
            <div className="flex gap-1">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: theme.colors.primary }}
              />
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: theme.colors.secondary }}
              />
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: theme.colors.accent }}
              />
            </div>
            <span className={currentTheme === theme.id ? 'font-semibold' : ''}>
              {theme.name}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ThemeSelector;
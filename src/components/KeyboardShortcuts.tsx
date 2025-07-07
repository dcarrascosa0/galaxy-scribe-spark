
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface KeyboardShortcutsProps {
  isOpen: boolean;
  onClose: () => void;
}

const KeyboardShortcuts: React.FC<KeyboardShortcutsProps> = ({ isOpen, onClose }) => {
  const shortcuts = [
    { key: '?', description: 'Show keyboard shortcuts' },
    { key: 'Space', description: 'Open speed dial menu' },
    { key: 'Escape', description: 'Close panels/dialogs' },
    { key: 'G', description: 'Open generate panel' },
    { key: 'H', description: 'Open history panel' },
    { key: 'F', description: 'Toggle focus mode' },
    { key: 'S', description: 'Focus search' },
    { key: 'R', description: 'Reset galaxy view' },
    { key: '+', description: 'Zoom in' },
    { key: '-', description: 'Zoom out' },
    { key: 'Delete', description: 'Delete selected note' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>Keyboard Shortcuts</span>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          {shortcuts.map((shortcut, index) => (
            <div key={index} className="flex items-center justify-between py-2">
              <span className="text-sm text-muted-foreground">{shortcut.description}</span>
              <kbd className="px-2 py-1 text-xs font-mono bg-muted rounded border">
                {shortcut.key}
              </kbd>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default KeyboardShortcuts;

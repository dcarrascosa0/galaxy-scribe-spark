import React from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  X, 
  History, 
  Eye, 
  Trash2, 
  Clock,
  FileText,
  Layers
} from 'lucide-react';

interface HistoryItem {
  id: string;
  topic: string;
  createdAt: Date;
  noteCount: number;
  depth: number;
}

interface HistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onLoadHistory: (id: string) => void;
  onDeleteHistory: (id: string) => void;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({ 
  isOpen, 
  onClose, 
  history, 
  onLoadHistory, 
  onDeleteHistory 
}) => {
  const formatDate = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-fade-in"
          onClick={onClose}
        />
      )}

      {/* Panel */}
      <div className={`
        fixed left-0 top-0 h-full w-96 glass-panel z-50 transition-transform duration-300
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <History className="h-5 w-5 text-secondary" />
              <h2 className="text-xl font-semibold">Note History</h2>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* History List */}
          <div className="flex-1">
            {history.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <History className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No History Yet</h3>
                <p className="text-sm text-muted-foreground">
                  Your generated knowledge galaxies will appear here
                </p>
              </div>
            ) : (
              <ScrollArea className="h-full">
                <div className="space-y-3">
                  {history.map((item) => (
                    <div
                      key={item.id}
                      className="glass-panel rounded-lg p-4 hover:bg-accent/5 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-medium text-sm line-clamp-2">
                          {item.topic}
                        </h3>
                        <div className="flex gap-1 ml-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => onLoadHistory(item.id)}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:bg-destructive/10"
                            onClick={() => onDeleteHistory(item.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDate(item.createdAt)}
                        </div>
                        <div className="flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          {item.noteCount} notes
                        </div>
                        <div className="flex items-center gap-1">
                          <Layers className="h-3 w-3" />
                          {item.depth} levels
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default HistoryPanel;
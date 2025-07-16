import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  X, 
  FileText, 
  ChevronRight,
  Copy,
  ExternalLink
} from 'lucide-react';

interface Note {
  id: string;
  title: string;
  content: string;
  children: Note[];
  depth: number;
}

interface NoteInspectorProps {
  isOpen: boolean;
  onClose: () => void;
  note: Note | null;
  breadcrumbs: Note[];
}

const NoteInspector: React.FC<NoteInspectorProps> = ({ 
  isOpen, 
  onClose, 
  note, 
  breadcrumbs 
}) => {
  const copyToClipboard = () => {
    if (note) {
      navigator.clipboard.writeText(note.content);
    }
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
        fixed right-0 top-0 h-full w-full md:w-[40rem] lg:w-[50rem] glass-panel z-50 transition-transform duration-300
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        <div className="p-6 h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-accent" />
              <h2 className="text-xl font-semibold">Note Inspector</h2>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" onClick={copyToClipboard}>
                <Copy className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {note ? (
            <>
              {/* Breadcrumbs */}
              {breadcrumbs.length > 0 && (
                <div className="flex items-center gap-1 mb-4 text-sm text-muted-foreground overflow-hidden">
                  {breadcrumbs.map((crumb, index) => (
                    <React.Fragment key={crumb.id}>
                      <span className="truncate">{crumb.title}</span>
                      {index < breadcrumbs.length - 1 && (
                        <ChevronRight className="h-3 w-3 flex-shrink-0" />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              )}

              {/* Note Title */}
              <h3 className="text-lg font-semibold mb-4 line-clamp-2">
                {note.title}
              </h3>

              {/* Note Content */}
              <ScrollArea className="flex-1">
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm, remarkMath]} 
                    rehypePlugins={[rehypeKatex]} 
                    children={note.content} />
                </div>
              </ScrollArea>

              {/* Footer */}
              <div className="mt-4 pt-4 border-t border-border">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Depth: Level {note.depth + 1}</span>
                  <span>{note.children.length} sub-notes</span>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Note Selected</h3>
              <p className="text-sm text-muted-foreground">
                Click on a node in the galaxy to view its content
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default NoteInspector;
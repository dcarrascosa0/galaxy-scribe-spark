import React, { useState } from 'react';
import { Download, Image, FileText, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';

interface Note {
  id: string;
  title: string;
  content: string;
  children: Note[];
  depth: number;
}

interface ExportGalaxyProps {
  notes: Note[];
  galaxyCanvasRef: React.RefObject<HTMLCanvasElement>;
}

const ExportGalaxy: React.FC<ExportGalaxyProps> = ({ notes, galaxyCanvasRef }) => {
  const [isOpen, setIsOpen] = useState(false);

  const exportAsImage = () => {
    const canvas = galaxyCanvasRef.current;
    if (!canvas) {
      toast({ title: "Error", description: "Galaxy not ready for export" });
      return;
    }

    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `knowledge-galaxy-${Date.now()}.png`;
        a.click();
        URL.revokeObjectURL(url);
        toast({ title: "Success", description: "Galaxy image exported!" });
      }
    });
    setIsOpen(false);
  };

  const exportAsMarkdown = () => {
    const generateMarkdown = (note: Note, depth = 0): string => {
      const indent = '  '.repeat(depth);
      const header = '#'.repeat(Math.min(depth + 1, 6));
      let markdown = `${header} ${note.title}\n\n${note.content}\n\n`;
      
      note.children.forEach(child => {
        markdown += generateMarkdown(child, depth + 1);
      });
      
      return markdown;
    };

    let content = '# Knowledge Galaxy Export\n\n';
    notes.forEach(note => {
      content += generateMarkdown(note);
    });

    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `knowledge-galaxy-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({ title: "Success", description: "Markdown exported!" });
    setIsOpen(false);
  };

  const exportAsJSON = () => {
    const dataStr = JSON.stringify(notes, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `knowledge-galaxy-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({ title: "Success", description: "JSON exported!" });
    setIsOpen(false);
  };

  const shareGalaxy = async () => {
    const url = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Knowledge Galaxy',
          text: 'Check out my knowledge galaxy!',
          url: url,
        });
        toast({ title: "Success", description: "Galaxy shared!" });
      } catch (error) {
        // Fallback to clipboard
        navigator.clipboard.writeText(url);
        toast({ title: "Success", description: "Link copied to clipboard!" });
      }
    } else {
      navigator.clipboard.writeText(url);
      toast({ title: "Success", description: "Link copied to clipboard!" });
    }
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="icon" className="bg-green-500 hover:bg-green-600 text-white h-12 w-12 rounded-full shadow-lg">
          <Download className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Export Galaxy</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Button
            onClick={exportAsImage}
            className="w-full justify-start"
            variant="outline"
          >
            <Image className="h-4 w-4 mr-2" />
            Export as Image
          </Button>
          <Button
            onClick={exportAsMarkdown}
            className="w-full justify-start"
            variant="outline"
          >
            <FileText className="h-4 w-4 mr-2" />
            Export as Markdown
          </Button>
          <Button
            onClick={exportAsJSON}
            className="w-full justify-start"
            variant="outline"
          >
            <Download className="h-4 w-4 mr-2" />
            Export as JSON
          </Button>
          <Button
            onClick={shareGalaxy}
            className="w-full justify-start"
            variant="outline"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share Galaxy
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExportGalaxy;
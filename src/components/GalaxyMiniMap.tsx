
import React, { useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';

interface Note {
  id: string;
  title: string;
  content: string;
  children: Note[];
  depth: number;
  x?: number;
  y?: number;
}

interface GalaxyMiniMapProps {
  notes: Note[];
  scale: number;
  offset: { x: number; y: number };
  onNavigate: (x: number, y: number) => void;
  onReset: () => void;
}

const GalaxyMiniMap: React.FC<GalaxyMiniMapProps> = ({
  notes,
  scale,
  offset,
  onNavigate,
  onReset
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || notes.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, width, height);

    // Find bounds of all nodes
    const bounds = notes.reduce(
      (acc, note) => ({
        minX: Math.min(acc.minX, note.x || 0),
        maxX: Math.max(acc.maxX, note.x || 0),
        minY: Math.min(acc.minY, note.y || 0),
        maxY: Math.max(acc.maxY, note.y || 0),
      }),
      { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity }
    );

    const nodeRange = Math.max(bounds.maxX - bounds.minX, bounds.maxY - bounds.minY);
    const scaleFactor = Math.min(width, height) / (nodeRange * 1.2);

    // Draw nodes
    notes.forEach(note => {
      if (note.x !== undefined && note.y !== undefined) {
        const x = ((note.x || 0) - bounds.minX) * scaleFactor + width * 0.1;
        const y = ((note.y || 0) - bounds.minY) * scaleFactor + height * 0.1;
        
        ctx.fillStyle = `hsl(${200 + note.depth * 40}, 70%, 60%)`;
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Draw viewport indicator
    const viewportX = width / 2 + (offset.x * scaleFactor * 0.1);
    const viewportY = height / 2 + (offset.y * scaleFactor * 0.1);
    const viewportSize = Math.max(20 / scale, 10);

    ctx.strokeStyle = 'rgba(241, 196, 15, 0.8)';
    ctx.lineWidth = 2;
    ctx.strokeRect(
      viewportX - viewportSize / 2,
      viewportY - viewportSize / 2,
      viewportSize,
      viewportSize
    );
  }, [notes, scale, offset]);

  const handleClick = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Convert minimap coordinates to world coordinates
    const worldX = (x - canvas.width / 2) * 10;
    const worldY = (y - canvas.height / 2) * 10;

    onNavigate(-worldX, -worldY);
  };

  return (
    <div className="fixed bottom-4 left-4 z-40 glass-panel rounded-lg p-2">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs text-muted-foreground">Mini Map</span>
        <Button
          size="icon"
          variant="ghost"
          className="h-6 w-6"
          onClick={onReset}
        >
          <RotateCcw className="h-3 w-3" />
        </Button>
      </div>
      <canvas
        ref={canvasRef}
        width={120}
        height={120}
        className="border border-border/30 rounded cursor-pointer"
        onClick={handleClick}
      />
      <div className="text-xs text-muted-foreground mt-1">
        Zoom: {Math.round(scale * 100)}%
      </div>
    </div>
  );
};

export default GalaxyMiniMap;

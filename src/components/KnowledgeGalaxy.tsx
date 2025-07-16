
import React, { useState, useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from 'react';

interface Note {
  id: string;
  title: string;
  content: string;
  children: Note[];
  depth: number;
  importance?: number;
  tags?: string[];
  lastViewed?: Date;
}

interface ProcessedNode extends Note {
  x: number;
  y: number;
  radius: number;
  color: string;
}

interface KnowledgeGalaxyProps {
  notes: Note[];
  onNodeClick: (note: Note) => void;
  onNodeHover: (note: Note | null) => void;
  selectedNodeId?: string;
  focusMode?: boolean;
  searchResults?: Note[];
  onScaleChange?: (scale: number) => void;
  onOffsetChange?: (offset: { x: number; y: number }) => void;
  theme: string;
}

const KnowledgeGalaxy = forwardRef<HTMLCanvasElement, KnowledgeGalaxyProps>(
  ({ notes, onNodeClick, onNodeHover, selectedNodeId, focusMode, searchResults, onScaleChange, onOffsetChange, theme }, forwardedRef) => {
  const [processedNodes, setProcessedNodes] = useState<ProcessedNode[]>([]);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredNode, setHoveredNode] = useState<ProcessedNode | null>(null);
  const [particles, setParticles] = useState<any[]>([]);
  
  const internalCanvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>(0);

  // Expose the internal ref to the parent
  useImperativeHandle(forwardedRef, () => internalCanvasRef.current!, []);

  const colors = [
    '#69B34C', '#ACB334', '#FAB733', '#FF8E15', '#FF4E11',
    '#54ACC1', '#A34CAC', '#5486C1', '#D4AC0D', '#1A5276'
  ];

  const getThemeBackground = (theme: string) => {
    switch (theme) {
      case 'dark': return '#121212';
      case 'light': return '#f9f9f9';
      case 'cosmic': return '#0D0423';
      case 'serene': return '#E8F6EF';
      default: return '#FFFFFF';
    }
  };

  const processNodes = useCallback(() => {
    if (!notes) return [];

    const width = dimensions.width;
    const height = dimensions.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.4;
    const angleIncrement = (2 * Math.PI) / notes.length;

    return notes.map((note, index) => {
      const angle = index * angleIncrement;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      const color = colors[index % colors.length];
      const nodeRadius = 10 + (note.children.length * 2);

      return {
        ...note,
        x,
        y,
        radius: nodeRadius,
        color
      };
    });
  }, [colors, dimensions, notes]);

  const initializeParticles = useCallback(() => {
    const newParticles = [];
    const numberOfParticles = Math.floor(dimensions.width * dimensions.height / 10000);

    for (let i = 0; i < numberOfParticles; i++) {
      newParticles.push({
        x: Math.random() * dimensions.width,
        y: Math.random() * dimensions.height,
        opacity: Math.random(),
      });
    }
    setParticles(newParticles);
  }, [dimensions]);

  useEffect(() => {
    if (!internalCanvasRef.current) return;

    const canvas = internalCanvasRef.current;
    const handleResize = () => {
      setDimensions({
        width: canvas.offsetWidth,
        height: canvas.offsetHeight
      });
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  useEffect(() => {
    setProcessedNodes(processNodes());
    initializeParticles();
  }, [notes, dimensions, processNodes, initializeParticles]);

  useEffect(() => {
    if (onScaleChange) onScaleChange(scale);
    if (onOffsetChange) onOffsetChange(offset);
  }, [scale, offset, onScaleChange, onOffsetChange]);

  useEffect(() => {
    const canvas = internalCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, dimensions.width, dimensions.height);

    const render = () => {
      ctx.clearRect(0, 0, dimensions.width, dimensions.height);
      ctx.save();
      ctx.translate(offset.x, offset.y);
      ctx.scale(scale, scale);

      processedNodes.forEach(node => {
        const alpha = focusMode && selectedNodeId !== node.id ? 0.3 : 1;
        drawNode(ctx, node, alpha);
      });

      processedNodes.forEach(node => {
        if (node.children) {
          node.children.forEach(child => {
            const childNode = processedNodes.find(n => n.id === child.id);
            if (childNode) {
              drawConnection(ctx, node, childNode);
            }
          });
        }
      });

      ctx.restore();
      animationFrameRef.current = requestAnimationFrame(render);
    };

    animationFrameRef.current = requestAnimationFrame(render);

    return () => cancelAnimationFrame(animationFrameRef.current);
  }, [processedNodes, scale, offset, selectedNodeId, focusMode, dimensions]);

  const drawConnection = (ctx: CanvasRenderingContext2D, node1: ProcessedNode, node2: ProcessedNode) => {
    ctx.save();
    ctx.strokeStyle = '#FFFFFF20';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(node1.x, node1.y);
    ctx.lineTo(node2.x, node2.y);
    ctx.stroke();
    ctx.restore();
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = internalCanvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left - offset.x) / scale;
    const y = (event.clientY - rect.top - offset.y) / scale;

    const clickedNode = processedNodes.find(node => {
      const dx = x - node.x;
      const dy = y - node.y;
      return Math.sqrt(dx * dx + dy * dy) < node.radius;
    });

    if (clickedNode) {
      onNodeClick(clickedNode);
    }
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = internalCanvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left - offset.x) / scale;
    const y = (event.clientY - rect.top - offset.y) / scale;

    const hoveredNode = processedNodes.find(node => {
      const dx = x - node.x;
      const dy = y - node.y;
      return Math.sqrt(dx * dx + dy * dy) < node.radius;
    });

    setHoveredNode(hoveredNode);
    onNodeHover(hoveredNode || null);
  };

  const handleMouseLeave = () => {
    onNodeHover(null);
  };

  const handleWheel = (event: React.WheelEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    const zoomSpeed = 0.1;
    const newScale = scale + event.deltaY * -zoomSpeed;
    setScale(Math.max(0.1, newScale));
  };

  const handleZoomIn = () => {
    setScale(prevScale => Math.min(3, prevScale + 0.1));
  };

  const handleZoomOut = () => {
    setScale(prevScale => Math.max(0.1, prevScale - 0.1));
  };

    const drawNode = (ctx: CanvasRenderingContext2D, node: ProcessedNode, alpha: number = 1) => {
      const { x, y, radius, color, importance } = node;
      
      ctx.save();
      ctx.globalAlpha = alpha;
      
      // Draw node glow
      if (importance && importance > 2) {
        const glowRadius = radius * 2;
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, glowRadius);
        gradient.addColorStop(0, `${color}40`);
        gradient.addColorStop(1, `${color}00`);
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, glowRadius, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Draw main node with layers
      const layers = Math.min(importance || 1, 3);
      for (let i = layers; i > 0; i--) {
        const layerRadius = radius * (0.6 + (i * 0.2));
        const layerAlpha = 0.3 + (i * 0.2);
        
        ctx.globalAlpha = alpha * layerAlpha;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, layerRadius, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Draw main node
      ctx.globalAlpha = alpha;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw border
      ctx.strokeStyle = selectedNodeId === node.id ? '#FFD700' : '#FFFFFF';
      ctx.lineWidth = selectedNodeId === node.id ? 3 : 1;
      ctx.stroke();
      
      // Draw text
      ctx.fillStyle = '#FFFFFF';
      ctx.font = `${Math.max(10, radius / 3)}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      const maxWidth = radius * 1.5;
      const words = node.title.split(' ');
      const lines = [];
      let currentLine = '';
      
      for (const word of words) {
        const testLine = currentLine + (currentLine ? ' ' : '') + word;
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      }
      if (currentLine) lines.push(currentLine);
      
      const lineHeight = Math.max(12, radius / 4);
      const startY = y - ((lines.length - 1) * lineHeight) / 2;
      
      lines.forEach((line, index) => {
        ctx.fillText(line, x, startY + index * lineHeight);
      });
      
      ctx.restore();
    };

    return (
      <div className="relative w-full h-full overflow-hidden">
        <canvas
          ref={internalCanvasRef}
          width={dimensions.width}
          height={dimensions.height}
          className="absolute inset-0 cursor-pointer"
          onClick={handleCanvasClick}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onWheel={handleWheel}
          style={{ 
            background: getThemeBackground(theme),
            imageRendering: 'pixelated'
          }}
        />
        
        {/* Particle overlay */}
        <div className="absolute inset-0 pointer-events-none">
          {particles.map((particle, index) => (
            <div
              key={index}
              className="absolute w-1 h-1 bg-white rounded-full opacity-20 animate-pulse"
              style={{
                left: `${particle.x}px`,
                top: `${particle.y}px`,
                animationDelay: `${index * 0.1}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
        
        {/* Controls */}
        <div className="absolute bottom-4 right-4 flex flex-col gap-2">
          <button
            onClick={handleZoomIn}
            className="bg-white/20 backdrop-blur-sm text-white p-2 rounded-full hover:bg-white/30 transition-colors"
          >
            +
          </button>
          <button
            onClick={handleZoomOut}
            className="bg-white/20 backdrop-blur-sm text-white p-2 rounded-full hover:bg-white/30 transition-colors"
          >
            -
          </button>
        </div>
      </div>
    );
  }
);

export default KnowledgeGalaxy;

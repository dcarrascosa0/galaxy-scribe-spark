
import React, { useState, useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from 'react';
import { X, ArrowUp, ArrowRight } from 'lucide-react';

interface Note {
  id: string;
  title: string;
  content: string;
  children: Note[];
  depth: number;
  importance?: number;
  tags?: string[];
  lastViewed?: Date;
  parentId?: string;
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
    const [targetScale, setTargetScale] = useState(1);
    const [targetOffset, setTargetOffset] = useState({ x: 0, y: 0 });
    const [isAnimating, setIsAnimating] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [hoveredNode, setHoveredNode] = useState<ProcessedNode | null>(null);
    const [selectedNode, setSelectedNode] = useState<ProcessedNode | null>(null);
    const [overlayPosition, setOverlayPosition] = useState({ x: 0, y: 0 });
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

    // Process all notes into a flat array for rendering
    const flattenNotes = useCallback((notes: Note[]): Note[] => {
      const flattened: Note[] = [];
      
      const traverse = (noteList: Note[], parentId?: string) => {
        noteList.forEach(note => {
          flattened.push({ ...note, parentId });
          if (note.children && note.children.length > 0) {
            traverse(note.children, note.id);
          }
        });
      };
      
      traverse(notes);
      return flattened;
    }, []);

    const processNodes = useCallback(() => {
      if (!notes || notes.length === 0) {
        console.log('No notes to process');
        return [];
      }

      const flatNotes = flattenNotes(notes);
      console.log('Processing notes:', flatNotes.length);

      const width = dimensions.width;
      const height = dimensions.height;
      
      if (width === 0 || height === 0) {
        console.log('Canvas dimensions not ready:', { width, height });
        return [];
      }

      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.min(width, height) * 0.3;

      return flatNotes.map((note, index) => {
        const angle = (index / flatNotes.length) * 2 * Math.PI;
        const nodeRadius = Math.max(radius * 0.3, radius * 0.6);
        const x = centerX + nodeRadius * Math.cos(angle);
        const y = centerY + nodeRadius * Math.sin(angle);
        const color = colors[index % colors.length];
        const size = 15 + (note.children?.length || 0) * 3;

        return {
          ...note,
          x,
          y,
          radius: size,
          color
        };
      });
    }, [notes, dimensions, colors, flattenNotes]);

    // Animation function for smooth camera movement
    const animateCamera = useCallback(() => {
      if (!isAnimating) return;

      const lerp = (start: number, end: number, factor: number) => {
        return start + (end - start) * factor;
      };

      const animationSpeed = 0.1;
      
      const newScale = lerp(scale, targetScale, animationSpeed);
      const newOffsetX = lerp(offset.x, targetOffset.x, animationSpeed);
      const newOffsetY = lerp(offset.y, targetOffset.y, animationSpeed);

      setScale(newScale);
      setOffset({ x: newOffsetX, y: newOffsetY });

      // Check if animation is complete
      const scaleDiff = Math.abs(newScale - targetScale);
      const offsetDiffX = Math.abs(newOffsetX - targetOffset.x);
      const offsetDiffY = Math.abs(newOffsetY - targetOffset.y);

      if (scaleDiff < 0.01 && offsetDiffX < 1 && offsetDiffY < 1) {
        setScale(targetScale);
        setOffset(targetOffset);
        setIsAnimating(false);
      }
    }, [isAnimating, scale, offset, targetScale, targetOffset]);

    // Focus on a specific node with smooth animation
    const focusOnNode = useCallback((node: ProcessedNode) => {
      const canvas = internalCanvasRef.current;
      if (!canvas) return;

      const centerX = dimensions.width / 2;
      const centerY = dimensions.height / 2;
      const focusScale = 1.5;

      // Calculate the target offset to center the node
      const targetX = centerX - (node.x * focusScale);
      const targetY = centerY - (node.y * focusScale);

      setTargetScale(focusScale);
      setTargetOffset({ x: targetX, y: targetY });
      setIsAnimating(true);

      // Calculate overlay position (next to the focused node)
      const overlayX = centerX + 100; // Position to the right of centered node
      const overlayY = centerY - 150; // Slightly above centered node
      setOverlayPosition({ x: overlayX, y: overlayY });
    }, [dimensions]);

    // Find parent and next sibling nodes
    const findParentNode = useCallback((nodeId: string): ProcessedNode | null => {
      const node = processedNodes.find(n => n.id === nodeId);
      if (!node?.parentId) return null;
      return processedNodes.find(n => n.id === node.parentId) || null;
    }, [processedNodes]);

    const findNextSibling = useCallback((nodeId: string): ProcessedNode | null => {
      const node = processedNodes.find(n => n.id === nodeId);
      if (!node?.parentId) return null;
      
      const parent = processedNodes.find(n => n.id === node.parentId);
      if (!parent) return null;
      
      const siblingIndex = parent.children.findIndex(child => child.id === nodeId);
      const nextSibling = parent.children[siblingIndex + 1];
      
      return nextSibling ? processedNodes.find(n => n.id === nextSibling.id) || null : null;
    }, [processedNodes]);

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

    // Set up canvas dimensions
    useEffect(() => {
      const canvas = internalCanvasRef.current;
      if (!canvas) return;

      const handleResize = () => {
        const rect = canvas.getBoundingClientRect();
        const newWidth = rect.width;
        const newHeight = rect.height;
        
        canvas.width = newWidth;
        canvas.height = newHeight;
        
        setDimensions({ width: newWidth, height: newHeight });
        console.log('Canvas resized:', { width: newWidth, height: newHeight });
      };

      handleResize();
      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    }, []);

    // Process nodes when notes or dimensions change
    useEffect(() => {
      if (dimensions.width > 0 && dimensions.height > 0) {
        const processed = processNodes();
        console.log('Processed nodes:', processed.length);
        setProcessedNodes(processed);
        initializeParticles();
      }
    }, [notes, dimensions, processNodes, initializeParticles]);

    useEffect(() => {
      if (onScaleChange) onScaleChange(scale);
      if (onOffsetChange) onOffsetChange(offset);
    }, [scale, offset, onScaleChange, onOffsetChange]);

    useEffect(() => {
      if (isAnimating) {
        const animate = () => {
          animateCamera();
          if (isAnimating) {
            animationFrameRef.current = requestAnimationFrame(animate);
          }
        };
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    }, [isAnimating, animateCamera]);

    // Main render loop
    useEffect(() => {
      const canvas = internalCanvasRef.current;
      if (!canvas || dimensions.width === 0 || dimensions.height === 0) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const render = () => {
        // Clear canvas
        ctx.fillStyle = getThemeBackground(theme);
        ctx.fillRect(0, 0, dimensions.width, dimensions.height);

        // Save context and apply transformations
        ctx.save();
        ctx.translate(offset.x, offset.y);
        ctx.scale(scale, scale);

        // Draw connections first
        processedNodes.forEach(node => {
          if (node.children && node.children.length > 0) {
            node.children.forEach(child => {
              const childNode = processedNodes.find(n => n.id === child.id);
              if (childNode) {
                drawConnection(ctx, node, childNode);
              }
            });
          }
        });

        // Draw nodes
        processedNodes.forEach(node => {
          const alpha = focusMode && selectedNodeId !== node.id ? 0.3 : 1;
          drawNode(ctx, node, alpha);
        });

        ctx.restore();

        if (!isAnimating) {
          animationFrameRef.current = requestAnimationFrame(render);
        }
      };

      render();

      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    }, [processedNodes, scale, offset, selectedNodeId, focusMode, dimensions, theme, isAnimating]);

    const drawConnection = (ctx: CanvasRenderingContext2D, node1: ProcessedNode, node2: ProcessedNode) => {
      ctx.save();
      ctx.strokeStyle = theme === 'dark' || theme === 'cosmic' ? '#FFFFFF20' : '#00000020';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(node1.x, node1.y);
      ctx.lineTo(node2.x, node2.y);
      ctx.stroke();
      ctx.restore();
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
      
      // Draw main node
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw border
      ctx.strokeStyle = selectedNodeId === node.id ? '#FFD700' : (theme === 'dark' || theme === 'cosmic' ? '#FFFFFF' : '#000000');
      ctx.lineWidth = selectedNodeId === node.id ? 3 : 1;
      ctx.stroke();
      
      // Draw text
      ctx.fillStyle = theme === 'dark' || theme === 'cosmic' ? '#FFFFFF' : '#000000';
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
        setSelectedNode(clickedNode);
        focusOnNode(clickedNode);
        onNodeClick(clickedNode);
      } else {
        setSelectedNode(null);
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

    return (
      <div className="relative w-full h-full overflow-hidden">
        <canvas
          ref={internalCanvasRef}
          className="absolute inset-0 cursor-pointer w-full h-full"
          onClick={handleCanvasClick}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onWheel={handleWheel}
          style={{ 
            background: getThemeBackground(theme),
          }}
        />
        
        {/* Integrated Node Overlay */}
        {selectedNode && (
          <div
            className="absolute z-50 bg-black/90 backdrop-blur-lg text-white p-6 rounded-xl border border-white/20 shadow-2xl max-w-md"
            style={{
              left: `${overlayPosition.x}px`,
              top: `${overlayPosition.y}px`,
              transform: 'translate(-50%, 0)'
            }}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-semibold text-white pr-4">
                {selectedNode.title}
              </h3>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-white/60 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Content */}
            <div className="mb-4">
              <p className="text-sm text-white/80 leading-relaxed">
                {selectedNode.content}
              </p>
            </div>

            {/* Tags */}
            {selectedNode.tags && selectedNode.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-4">
                {selectedNode.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-white/20 rounded-full text-xs text-white/90"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Navigation Controls */}
            <div className="flex gap-2">
              {findParentNode(selectedNode.id) && (
                <button
                  onClick={() => {
                    const parent = findParentNode(selectedNode.id);
                    if (parent) {
                      setSelectedNode(parent);
                      focusOnNode(parent);
                    }
                  }}
                  className="flex items-center gap-2 px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-sm"
                >
                  <ArrowUp className="h-3 w-3" />
                  Parent
                </button>
              )}
              
              {findNextSibling(selectedNode.id) && (
                <button
                  onClick={() => {
                    const nextSibling = findNextSibling(selectedNode.id);
                    if (nextSibling) {
                      setSelectedNode(nextSibling);
                      focusOnNode(nextSibling);
                    }
                  }}
                  className="flex items-center gap-2 px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-sm"
                >
                  <ArrowRight className="h-3 w-3" />
                  Next
                </button>
              )}
            </div>
          </div>
        )}
        
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

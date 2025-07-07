import React, { useEffect, useRef, useState, useCallback, forwardRef, useImperativeHandle } from 'react';

interface Note {
  id: string;
  title: string;
  content: string;
  children: Note[];
  x?: number;
  y?: number;
  depth: number;
  vx?: number;
  vy?: number;
  targetX?: number;
  targetY?: number;
}

interface KnowledgeGalaxyProps {
  notes: Note[];
  onNodeClick: (note: Note) => void;
  selectedNodeId?: string;
  focusMode?: boolean;
  searchResults?: Note[];
  onScaleChange?: (scale: number) => void;
  onOffsetChange?: (offset: { x: number; y: number }) => void;
  theme?: string;
}

const KnowledgeGalaxy = forwardRef<HTMLCanvasElement, KnowledgeGalaxyProps>(({ 
  notes, 
  onNodeClick, 
  selectedNodeId,
  focusMode = false,
  searchResults,
  onScaleChange,
  onOffsetChange,
  theme = 'cosmic'
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [nodes, setNodes] = useState<Note[]>([]);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastMouse, setLastMouse] = useState({ x: 0, y: 0 });
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [velocity, setVelocity] = useState({ x: 0, y: 0 });
  const [particles, setParticles] = useState<Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    maxLife: number;
    size: number;
  }>>([]);

  // Expose canvas ref to parent
  useImperativeHandle(ref, () => canvasRef.current!);

  // Generate floating particles for background
  useEffect(() => {
    const newParticles = Array.from({ length: 50 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      life: Math.random() * 200,
      maxLife: 200,
      size: Math.random() * 2 + 1
    }));
    setParticles(newParticles);
  }, []);

  useEffect(() => {
    if (notes.length > 0) {
      generateNodePositions(notes);
    }
  }, [notes]);

  const generateNodePositions = (noteData: Note[]) => {
    const allNodes: Note[] = [];
    
    const traverse = (note: Note, depth: number, parentX = 0, parentY = 0, angle = 0) => {
      const radius = 120 + depth * 100;
      const nodeWithPosition = {
        ...note,
        depth,
        x: parentX + Math.cos(angle) * radius,
        y: parentY + Math.sin(angle) * radius,
        targetX: parentX + Math.cos(angle) * radius,
        targetY: parentY + Math.sin(angle) * radius,
        vx: 0,
        vy: 0
      };
      
      allNodes.push(nodeWithPosition);
      
      note.children.forEach((child, index) => {
        const childAngle = angle + (index - (note.children.length - 1) / 2) * (Math.PI / 4);
        traverse(child, depth + 1, nodeWithPosition.x!, nodeWithPosition.y!, childAngle);
      });
    };

    noteData.forEach((note, index) => {
      const startAngle = (index / noteData.length) * 2 * Math.PI;
      traverse(note, 0, 0, 0, startAngle);
    });

    setNodes(allNodes);
  };

  const drawCurvedConnection = (ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, pulsePhase: number) => {
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;
    const distance = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    const offset = Math.min(distance * 0.3, 80);
    
    // Calculate perpendicular offset for curve
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const perpAngle = angle + Math.PI / 2;
    const controlX = midX + Math.cos(perpAngle) * offset;
    const controlY = midY + Math.sin(perpAngle) * offset;

    // Animate connection opacity and thickness based on pulse
    const pulseIntensity = (Math.sin(pulsePhase) + 1) / 2;
    const baseOpacity = 0.3;
    const pulseOpacity = baseOpacity + pulseIntensity * 0.2;
    
    ctx.strokeStyle = `rgba(52, 152, 219, ${pulseOpacity})`;
    ctx.lineWidth = 1 + pulseIntensity * 0.5;
    ctx.shadowColor = 'rgba(52, 152, 219, 0.4)';
    ctx.shadowBlur = 3 + pulseIntensity * 2;

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.quadraticCurveTo(controlX, controlY, x2, y2);
    ctx.stroke();
    
    // Reset shadow
    ctx.shadowBlur = 0;
  };

  const drawNode = (ctx: CanvasRenderingContext2D, node: Note, time: number) => {
    const isSelected = node.id === selectedNodeId;
    const isHovered = node.id === hoveredNode;
    
    const colors = [
      { r: 52, g: 152, b: 219 },   // Galaxy blue
      { r: 142, g: 68, b: 173 },   // Nebula purple
      { r: 231, g: 76, b: 60 },    // Star red
      { r: 241, g: 196, b: 15 },   // Cosmic gold
      { r: 46, g: 204, b: 113 }    // Space green
    ];
    
    const color = colors[node.depth % colors.length];
    const baseRadius = 8 + (5 - node.depth) * 2;
    
    // Animated radius with breathing effect
    const breathingPhase = time * 0.003 + node.depth * 0.5;
    const breathingEffect = Math.sin(breathingPhase) * 0.2 + 1;
    const radius = baseRadius * breathingEffect;
    
    // Selection and hover effects
    const interactionScale = isSelected ? 1.5 : isHovered ? 1.3 : 1;
    const finalRadius = radius * interactionScale;
    
    // Outer glow rings
    if (isSelected || isHovered) {
      const ringCount = isSelected ? 3 : 2;
      for (let i = 0; i < ringCount; i++) {
        const ringRadius = finalRadius + (i + 1) * 8;
        const ringOpacity = (0.3 - i * 0.1) * (isSelected ? 1 : 0.7);
        const pulsePhase = time * 0.008 - i * 0.5;
        const pulseBrightness = (Math.sin(pulsePhase) + 1) / 2;
        
        ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${ringOpacity * pulseBrightness})`;
        ctx.lineWidth = 2 - i * 0.3;
        ctx.beginPath();
        ctx.arc(node.x!, node.y!, ringRadius, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    
    // Main node with gradient and glow
    const gradient = ctx.createRadialGradient(
      node.x! - finalRadius * 0.3, node.y! - finalRadius * 0.3, 0,
      node.x!, node.y!, finalRadius
    );
    gradient.addColorStop(0, `rgba(${color.r + 50}, ${color.g + 50}, ${color.b + 50}, 1)`);
    gradient.addColorStop(0.7, `rgba(${color.r}, ${color.g}, ${color.b}, 1)`);
    gradient.addColorStop(1, `rgba(${color.r - 30}, ${color.g - 30}, ${color.b - 30}, 1)`);
    
    // Glow effect
    ctx.shadowColor = `rgba(${color.r}, ${color.g}, ${color.b}, 0.8)`;
    ctx.shadowBlur = isSelected ? 20 : isHovered ? 15 : 8;
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(node.x!, node.y!, finalRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // Inner highlight
    ctx.shadowBlur = 0;
    const highlightGradient = ctx.createRadialGradient(
      node.x! - finalRadius * 0.5, node.y! - finalRadius * 0.5, 0,
      node.x!, node.y!, finalRadius * 0.6
    );
    highlightGradient.addColorStop(0, `rgba(255, 255, 255, 0.4)`);
    highlightGradient.addColorStop(1, `rgba(255, 255, 255, 0)`);
    
    ctx.fillStyle = highlightGradient;
    ctx.beginPath();
    ctx.arc(node.x!, node.y!, finalRadius * 0.6, 0, Math.PI * 2);
    ctx.fill();
    
    // Rotation effect for selected nodes
    if (isSelected) {
      const rotationPhase = time * 0.005;
      const spikesCount = 8;
      ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, 0.6)`;
      ctx.lineWidth = 1;
      
      for (let i = 0; i < spikesCount; i++) {
        const angle = (i / spikesCount) * Math.PI * 2 + rotationPhase;
        const innerRadius = finalRadius + 5;
        const outerRadius = finalRadius + 12;
        
        ctx.beginPath();
        ctx.moveTo(
          node.x! + Math.cos(angle) * innerRadius,
          node.y! + Math.sin(angle) * innerRadius
        );
        ctx.lineTo(
          node.x! + Math.cos(angle) * outerRadius,
          node.y! + Math.sin(angle) * outerRadius
        );
        ctx.stroke();
      }
    }

    // Draw title on high zoom with enhanced styling
    if (scale > 0.6) {
      ctx.shadowBlur = 0;
      const textColor = document.documentElement.classList.contains('dark') ? '#ffffff' : '#1a1a1a';
      
      // Text background
      ctx.fillStyle = `rgba(${document.documentElement.classList.contains('dark') ? '0, 0, 0' : '255, 255, 255'}, 0.8)`;
      ctx.font = `${Math.min(14 * scale, 14)}px Inter, sans-serif`;
      const textMetrics = ctx.measureText(node.title);
      const textWidth = textMetrics.width;
      const textHeight = 16;
      
      ctx.fillRect(
        node.x! - textWidth / 2 - 6,
        node.y! + finalRadius + 8,
        textWidth + 12,
        textHeight + 4
      );
      
      // Text
      ctx.fillStyle = textColor;
      ctx.textAlign = 'center';
      ctx.fillText(node.title, node.x!, node.y! + finalRadius + 20);
    }
  };

  const drawBackground = (ctx: CanvasRenderingContext2D, time: number) => {
    const canvas = ctx.canvas;
    
    // Cosmic background gradient
    const gradient = ctx.createRadialGradient(
      canvas.width / 2, canvas.height / 2, 0,
      canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height)
    );
    
    if (document.documentElement.classList.contains('dark')) {
      gradient.addColorStop(0, '#0B1426');
      gradient.addColorStop(0.5, '#1A2332');
      gradient.addColorStop(1, '#2C3E50');
    } else {
      gradient.addColorStop(0, '#f8fafc');
      gradient.addColorStop(0.5, '#e2e8f0');
      gradient.addColorStop(1, '#cbd5e1');
    }
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Floating particles
    particles.forEach(particle => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.life--;
      
      if (particle.life <= 0 || particle.x < 0 || particle.x > canvas.width || 
          particle.y < 0 || particle.y > canvas.height) {
        particle.x = Math.random() * canvas.width;
        particle.y = Math.random() * canvas.height;
        particle.life = particle.maxLife;
      }
      
      const alpha = (particle.life / particle.maxLife) * 0.6;
      const twinkle = Math.sin(time * 0.01 + particle.x * 0.01) * 0.3 + 0.7;
      
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha * twinkle})`;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
    });
  };

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || nodes.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const time = Date.now();
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background
    drawBackground(ctx, time);
    
    // Set transform
    ctx.save();
    ctx.translate(canvas.width / 2 + offset.x, canvas.height / 2 + offset.y);
    ctx.scale(scale, scale);

    // Draw connections with animation
    nodes.forEach(node => {
      node.children.forEach(child => {
        const childNode = nodes.find(n => n.id === child.id);
        if (childNode) {
          const pulsePhase = time * 0.004 + node.depth;
          drawCurvedConnection(ctx, node.x!, node.y!, childNode.x!, childNode.y!, pulsePhase);
        }
      });
    });

    // Draw nodes
    nodes.forEach(node => {
      drawNode(ctx, node, time);
    });

    ctx.restore();
    
    animationRef.current = requestAnimationFrame(animate);
  }, [nodes, scale, offset, selectedNodeId, hoveredNode, particles]);

  useEffect(() => {
    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [animate]);

  const handleMouseDown = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const clickedNode = getNodeAtPosition(mouseX, mouseY);
    if (clickedNode) {
      onNodeClick(clickedNode);
      return;
    }

    setIsDragging(true);
    setLastMouse({ x: mouseX, y: mouseY });
    setVelocity({ x: 0, y: 0 });
  };

  const handleScaleChange = (newScale: number) => {
    setScale(newScale);
    onScaleChange?.(newScale);
  };

  const handleOffsetChange = (newOffset: { x: number; y: number }) => {
    setOffset(newOffset);
    onOffsetChange?.(newOffset);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const hoveredNode = getNodeAtPosition(mouseX, mouseY);
    setHoveredNode(hoveredNode?.id || null);

    if (isDragging) {
      const deltaX = mouseX - lastMouse.x;
      const deltaY = mouseY - lastMouse.y;
      
      setVelocity({ x: deltaX * 0.1, y: deltaY * 0.1 });
      const newOffset = {
        x: offset.x + deltaX,
        y: offset.y + deltaY
      };
      handleOffsetChange(newOffset);
      
      setLastMouse({ x: mouseX, y: mouseY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    
    // Apply inertia
    const applyInertia = () => {
      setVelocity(prev => {
        const newVel = { x: prev.x * 0.95, y: prev.y * 0.95 };
        if (Math.abs(newVel.x) > 0.1 || Math.abs(newVel.y) > 0.1) {
          setOffset(prevOffset => ({
            x: prevOffset.x + newVel.x,
            y: prevOffset.y + newVel.y
          }));
          requestAnimationFrame(applyInertia);
        }
        return newVel;
      });
    };
    
    if (Math.abs(velocity.x) > 1 || Math.abs(velocity.y) > 1) {
      requestAnimationFrame(applyInertia);
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.max(0.1, Math.min(3, scale * zoomFactor));
    handleScaleChange(newScale);
  };

  const getNodeAtPosition = (mouseX: number, mouseY: number): Note | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const canvasX = (mouseX - canvas.width / 2 - offset.x) / scale;
    const canvasY = (mouseY - canvas.height / 2 - offset.y) / scale;

    return nodes.find(node => {
      const distance = Math.sqrt(
        Math.pow(canvasX - node.x!, 2) + Math.pow(canvasY - node.y!, 2)
      );
      const radius = (8 + (5 - node.depth) * 2) * (node.id === hoveredNode ? 1.3 : 1);
      return distance <= radius;
    }) || null;
  };

  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full cursor-grab active:cursor-grabbing"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      style={{ display: 'block' }}
    />
  );
});

KnowledgeGalaxy.displayName = 'KnowledgeGalaxy';

export default KnowledgeGalaxy;

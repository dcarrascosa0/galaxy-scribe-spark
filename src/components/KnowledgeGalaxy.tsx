import React, { useEffect, useRef, useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronUp, ChevronRight, X } from 'lucide-react';

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
  importance?: number;
  tags?: string[];
  lastViewed?: Date;
  parent?: Note | null;
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
  showTutorial?: boolean;
  onNodeHover?: (note: Note | null) => void;
  onNodesPositioned?: (nodes: Note[]) => void;
  showIntegratedOverlay?: boolean;
}

interface CameraState {
  scale: number;
  offset: { x: number; y: number };
  targetScale: number;
  targetOffset: { x: number; y: number };
  isAnimating: boolean;
  animationStart: number;
  animationDuration: number;
}

interface NoteOverlay {
  note: Note;
  position: { x: number; y: number };
  visible: boolean;
}

const KnowledgeGalaxy = forwardRef<HTMLCanvasElement, KnowledgeGalaxyProps>(({ 
  notes, 
  onNodeClick, 
  selectedNodeId,
  focusMode = false,
  searchResults,
  onScaleChange,
  onOffsetChange,
  theme = 'cosmic',
  showTutorial = false,
  onNodeHover,
  onNodesPositioned,
  showIntegratedOverlay = true
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [nodes, setNodes] = useState<Note[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [lastMouse, setLastMouse] = useState({ x: 0, y: 0 });
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [velocity, setVelocity] = useState({ x: 0, y: 0 });
  const [interactionEffects, setInteractionEffects] = useState<Array<{
    x: number;
    y: number;
    life: number;
    maxLife: number;
    type: 'click' | 'hover' | 'pulse';
    color: string;
  }>>([]);
  const [particles, setParticles] = useState<Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    maxLife: number;
    size: number;
    color: string;
    type: 'star' | 'nebula' | 'comet';
  }>>([]);
  const [animationState, setAnimationState] = useState<Record<string, { startTime: number }>>({});

  // Enhanced camera state with smooth animation support (600ms duration)
  const [camera, setCamera] = useState<CameraState>({
    scale: 1,
    offset: { x: 0, y: 0 },
    targetScale: 1,
    targetOffset: { x: 0, y: 0 },
    isAnimating: false,
    animationStart: 0,
    animationDuration: 600 // 600ms as specified
  });

  // Note overlay state
  const [noteOverlay, setNoteOverlay] = useState<NoteOverlay | null>(null);

  // Expose canvas ref to parent
  useImperativeHandle(ref, () => canvasRef.current!);

  // Cubic-bezier easing function for smooth, professional animations
  // Equivalent to CSS cubic-bezier(0.25, 0.46, 0.45, 0.94) - easeOutQuad
  const cubicBezierEasing = (t: number): number => {
    return 1 - Math.pow(1 - t, 3);
  };

  // Camera animation system with optimized performance
  const animateCamera = useCallback(() => {
    if (!camera.isAnimating) return;

    const now = Date.now();
    const elapsed = now - camera.animationStart;
    const progress = Math.min(elapsed / camera.animationDuration, 1);
    const easedProgress = cubicBezierEasing(progress);

    // Interpolate camera properties with eased progress
    const currentScale = camera.scale + (camera.targetScale - camera.scale) * easedProgress;
    const currentOffsetX = camera.offset.x + (camera.targetOffset.x - camera.offset.x) * easedProgress;
    const currentOffsetY = camera.offset.y + (camera.targetOffset.y - camera.offset.y) * easedProgress;

    
    

    setCamera(prev => ({
      ...prev,
      scale: currentScale,
      offset: { x: currentOffsetX, y: currentOffsetY }
    }));

    // Notify parent components of camera changes
    onScaleChange?.(currentScale);
    onOffsetChange?.({ x: currentOffsetX, y: currentOffsetY });

    // Complete animation when progress reaches 1
    if (progress >= 1) {
      
      setCamera(prev => ({ ...prev, isAnimating: false }));
    }
  }, [camera.isAnimating, camera.animationStart, camera.animationDuration, camera.scale, camera.targetScale, camera.offset, camera.targetOffset, onScaleChange, onOffsetChange]);

  // Focus camera on specific node with smooth zoom and recenter
  // Performance: Calculates optimal zoom level and center position
  const focusOnNode = useCallback((node: Note) => {
    if (!node.x || !node.y) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    // Calculate optimal zoom level (1.8x to 2.2x current scale)
    const targetScale = Math.max(1.8, Math.min(2.2, camera.scale * 1.5));
    
    // Calculate center position to focus on the node
    const targetOffsetX = -node.x * targetScale + canvas.width / 2;
    const targetOffsetY = -node.y * targetScale + canvas.height / 2;

    
    

    // Start smooth animation
    setCamera(prev => {
      
      return {
        ...prev,
        targetScale,
        targetOffset: { x: targetOffsetX, y: targetOffsetY },
        isAnimating: true,
        animationStart: Date.now()
      };
    });
  }, [camera.scale]);

  // Dynamic overlay positioning with edge detection and adaptive placement
  // Performance: Cached calculations, minimal DOM queries
  const calculateOverlayPosition = useCallback((node: Note): { x: number; y: number } => {
    const canvas = canvasRef.current;
    if (!canvas || node.x == null || node.y == null) return { x: 20, y: 20 };
  
    const screenX = node.x * camera.scale + camera.offset.x + canvas.width  / 2;
    const screenY = node.y * camera.scale + camera.offset.y + canvas.height / 2;
    const overlayW = 320;
    const overlayH = 240;
    const offset   = 50;
  
    // try right‑side first
    let x = screenX + offset;
    let y = screenY - overlayH / 2;
  
    // if that would overflow right, put it on the left
    if (x + overlayW > canvas.width - 20) {
      x = screenX - overlayW - offset;
    }
    // only clamp *this* left‑side if it still overflows
    if (x < 20) {
      x = 20;
    }
  
    // vertically: clamp top and bottom
    if (y < 20) {
      y = 20;
    } else if (y + overlayH > canvas.height - 20) {
      y = canvas.height - overlayH - 20;
    }
  
    return { x, y };
  }, [camera.scale, camera.offset]);

  // Navigation utility functions with hierarchy traversal
  // Performance: O(1) parent lookup, O(n) sibling lookup where n = siblings count
  
  const findParentNode = useCallback((node: Note): Note | null => {
    return node.parent || null;
  }, []);

  const findNextSibling = useCallback((node: Note): Note | null => {
    const parent = findParentNode(node);
    if (!parent) return null;

    const siblings = parent.children;
    const currentIndex = siblings.findIndex(sibling => sibling.id === node.id);
    
    // Return next sibling or null if at end
    return (currentIndex !== -1 && currentIndex < siblings.length - 1) 
      ? siblings[currentIndex + 1] 
      : null;
  }, [findParentNode]);

  // Navigation handlers with smooth camera transitions
  
  const handleJumpToParent = useCallback(() => {
    if (!noteOverlay) return;
    
    const parent = findParentNode(noteOverlay.note);
    if (parent) {
      // Update overlay with new position
      const position = calculateOverlayPosition(parent);
      setNoteOverlay({
        note: parent,
        position,
        visible: true
      });
      
      // Notify parent component
      onNodeClick(parent);
    }
  }, [noteOverlay, findParentNode, calculateOverlayPosition, onNodeClick]);



  const handleCloseOverlay = useCallback(() => {
    setNoteOverlay(null);
  }, []);

  // Enhanced node click handler with integrated camera animation and overlay
  // Performance: Single event handler, batched state updates
  const handleNodeClick = useCallback((clickedNode: Note) => {
    console.log('Node clicked:', clickedNode.title);
    
    // Only show overlay if showIntegratedOverlay is true
    if (showIntegratedOverlay) {
      const position = calculateOverlayPosition(clickedNode);
      setNoteOverlay({
        note: clickedNode,
        position,
        visible: true
      });
    } else {
      // Clear any existing overlay when NoteInspector is open
      setNoteOverlay(null);
    }

    // Create visual interaction effect
    const themeColors = getThemeColors(theme);
    const color = themeColors.nodes[clickedNode.depth % themeColors.nodes.length];
    createInteractionEffect(
      clickedNode.x!,
      clickedNode.y!,
      'click',
      `rgb(${color.r}, ${color.g}, ${color.b})`
    );

    // Notify parent component
    onNodeClick(clickedNode);
  }, [calculateOverlayPosition, theme, onNodeClick, showIntegratedOverlay]);

  const handleAdvanceToNextSibling = useCallback(() => {
    if (!noteOverlay) return;
    const next = findNextSibling(noteOverlay.note);
    if (!next) return;
  
    // 1) act exactly like a real click:
    handleNodeClick(next);
  
    // 2) then start the camera animation
    focusOnNode(next);
  }, [
    noteOverlay,
    findNextSibling,
    handleNodeClick,
    focusOnNode
  ]);
  // Update overlay position during camera movements
  // Performance: Only updates when overlay is visible
  useEffect(() => {
    if (noteOverlay?.visible) {
      const newPos = calculateOverlayPosition(noteOverlay.note);
      // compare against the last position
      if (
        newPos.x !== noteOverlay.position.x ||
        newPos.y !== noteOverlay.position.y
      ) {
        setNoteOverlay(prev => prev && { ...prev, position: newPos });
      }
    }
  }, [camera.scale, camera.offset, noteOverlay, calculateOverlayPosition]);

  // Camera animation loop with RAF optimization and timeout safety
  useEffect(() => {
    if (camera.isAnimating) {
      const animate = () => {
        animateCamera();
        if (camera.isAnimating) {
          requestAnimationFrame(animate);
        }
      };
      requestAnimationFrame(animate);
      
      // Safety timeout to prevent stuck animations
      const timeout = setTimeout(() => {
        setCamera(prev => ({ ...prev, isAnimating: false }));
      }, camera.animationDuration + 100); // Add 100ms buffer
      
      return () => clearTimeout(timeout);
    }
  }, [camera.isAnimating, animateCamera, camera.animationDuration]);

  useEffect(() => {
    const now = Date.now();
    const nextAnimationState = {...animationState};
    let changed = false;

    const allNodes: Note[] = [];
    const traverse = (note: Note) => {
        allNodes.push(note);
        note.children.forEach(traverse);
    };
    notes.forEach(traverse);

    for (const node of allNodes) {
        if (node.content && !nextAnimationState[node.id]) {
            nextAnimationState[node.id] = { startTime: now };
            changed = true;
        }
    }
    
    if (changed) {
        setAnimationState(nextAnimationState);
    }
  }, [notes]);

  

  // Generate enhanced particle system
  useEffect(() => {
    const themeColors = getThemeColors(theme);
    const newParticles = Array.from({ length: 80 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.8,
      vy: (Math.random() - 0.5) * 0.8,
      life: Math.random() * 300,
      maxLife: 300,
      size: Math.random() * 3 + 1,
      color: themeColors.particles[Math.floor(Math.random() * themeColors.particles.length)],
      type: ['star', 'nebula', 'comet'][Math.floor(Math.random() * 3)] as 'star' | 'nebula' | 'comet'
    }));
    setParticles(newParticles);
  }, [theme]);

  const getThemeColors = (currentTheme: string) => {
    const themes = {
      cosmic: {
        background: ['#0B1426', '#1A2332', '#2C3E50'],
        nodes: [
          { r: 52, g: 152, b: 219 },
          { r: 142, g: 68, b: 173 },
          { r: 231, g: 76, b: 60 },
          { r: 241, g: 196, b: 15 },
          { r: 46, g: 204, b: 113 }
        ],
        particles: ['#3498DB', '#8E44AD', '#F1C40F', '#E74C3C', '#2ECC71'],
        connections: '#3498DB'
      },
      nebula: {
        background: ['#2C1810', '#4A2C2A', '#6A1B9A'],
        nodes: [
          { r: 142, g: 68, b: 173 },
          { r: 231, g: 76, b: 60 },
          { r: 243, g: 156, b: 18 },
          { r: 155, g: 89, b: 182 },
          { r: 52, g: 152, b: 219 }
        ],
        particles: ['#8E44AD', '#E74C3C', '#F39C12', '#9B59B6', '#3498DB'],
        connections: '#8E44AD'
      },
      solar: {
        background: ['#1A1A0A', '#2D1810', '#D35400'],
        nodes: [
          { r: 230, g: 126, b: 34 },
          { r: 211, g: 84, b: 0 },
          { r: 241, g: 196, b: 15 },
          { r: 231, g: 76, b: 60 },
          { r: 46, g: 204, b: 113 }
        ],
        particles: ['#E67E22', '#D35400', '#F1C40F', '#E74C3C', '#2ECC71'],
        connections: '#E67E22'
      },
      matrix: {
        background: ['#000000', '#001100', '#002200'],
        nodes: [
          { r: 0, g: 255, b: 0 },
          { r: 0, g: 204, b: 0 },
          { r: 255, g: 255, b: 0 },
          { r: 0, g: 150, b: 0 },
          { r: 50, g: 255, b: 50 }
        ],
        particles: ['#00FF00', '#00CC00', '#FFFF00', '#009600', '#32FF32'],
        connections: '#00FF00'
      }
    };
    return themes[currentTheme as keyof typeof themes] || themes.cosmic;
  };

  useEffect(() => {
    if (notes.length > 0) {
      generateNodePositions(notes);
    }
  }, [notes]);

  const generateNodePositions = (noteData: Note[]) => {
    const allNodes: Note[] = [];

    // --- Automatic Layout Logic ---
    // 1. First, analyze the tree to find the maximum depth of a node that has children.
    // This helps determine the overall scale of the graph.
    let maxBranchingDepth = 0;
    const findMaxBranchingDepth = (node: Note, depth: number) => {
      if (node.children.length > 0) {
        maxBranchingDepth = Math.max(maxBranchingDepth, depth);
        node.children.forEach(child => findMaxBranchingDepth(child, depth + 1));
      }
    };
    noteData.forEach(note => findMaxBranchingDepth(note, 0));

    // 2. Define layout parameters based on the tree's structure.
    // More complex trees (deeper branching) will get more space.
    const scaleFactor = 1 + maxBranchingDepth;
    const baseRadius = 250 * scaleFactor;
    const depthIncrement = 50 * scaleFactor;
    const leafPullIn = 200 * scaleFactor;
    
    const traverse = (note: Note, depth: number, parentX = 0, parentY = 0, angle = 0, parent: Note | null = null) => {
      const isRoot = depth === 0;

      // 3. Calculate radius for the current node.
      let radius = baseRadius + (depth - 1) * depthIncrement;
      
      // If a node is a "leaf" (has no children), pull it closer to its parent.
      // We give depth 1 nodes (main points) space as if they had children, so we only apply this for nodes deeper than level 1.
      if (depth > 1 && note.children.length === 0) {
        radius -= leafPullIn;
      }
      
      const nodeX = isRoot ? parentX : parentX + Math.cos(angle) * radius;
      const nodeY = isRoot ? parentY : parentY + Math.sin(angle) * radius;

      const importance = note.importance || (5 - depth);
      const nodeWithPosition = {
        ...note,
        depth,
        importance,
        x: nodeX,
        y: nodeY,
        targetX: nodeX,
        targetY: nodeY,
        vx: 0,
        vy: 0,
        parent: parent
      };
      
      allNodes.push(nodeWithPosition);
      
      const childrenCount = note.children.length;
      if (childrenCount > 0) {
        const effectiveChildrenCount = isRoot ? childrenCount : childrenCount + 1;
        const angleStep = (2 * Math.PI) / effectiveChildrenCount;
        
        const backAngle = (angle + Math.PI) % (2 * Math.PI);
        const forbiddenSlot = isRoot ? -1 : Math.round(backAngle / angleStep);

        let currentSlot = 0;
        note.children.forEach((child) => {
          if (currentSlot === forbiddenSlot) {
            currentSlot++;
          }
          const childAngle = currentSlot * angleStep;
          traverse(child, depth + 1, nodeX, nodeY, childAngle, nodeWithPosition);
          currentSlot++;
        });
      }
    };

    noteData.forEach((note) => {
      traverse(note, 0, 0, 0, 0, null); 
    });

    setNodes(allNodes);
    onNodesPositioned?.(allNodes);
  };

  const createInteractionEffect = (x: number, y: number, type: 'click' | 'hover' | 'pulse', color: string) => {
    const effect = {
      x: x,
      y: y,
      life: type === 'click' ? 60 : type === 'hover' ? 30 : 40,
      maxLife: type === 'click' ? 60 : type === 'hover' ? 30 : 40,
      type,
      color
    };
    
    setInteractionEffects(prev => [...prev.slice(-10), effect]);
  };

  const drawEnhancedConnection = (
    ctx: CanvasRenderingContext2D, 
    x1: number, y1: number, 
    x2: number, y2: number, 
    pulsePhase: number,
    isHighlighted: boolean = false
  ) => {
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;
    const distance = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    const offset = Math.min(distance * 0.3, 80);
    
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const perpAngle = angle + Math.PI / 2;
    const controlX = midX + Math.cos(perpAngle) * offset;
    const controlY = midY + Math.sin(perpAngle) * offset;

    const themeColors = getThemeColors(theme);
    const pulseIntensity = (Math.sin(pulsePhase) + 1) / 2;
    const baseOpacity = isHighlighted ? 0.8 : 0.3;
    const pulseOpacity = baseOpacity + pulseIntensity * 0.4;
    
    // Draw connection flow effect
    const flowPhase = pulsePhase * 2;
    const flowPosition = (Math.sin(flowPhase) + 1) / 2;
    
    // Main connection
    ctx.strokeStyle = `rgba(${themeColors.connections === '#3498DB' ? '52, 152, 219' : themeColors.connections === '#8E44AD' ? '142, 68, 173' : themeColors.connections === '#E67E22' ? '230, 126, 34' : '0, 255, 0'}, ${pulseOpacity})`;
    ctx.lineWidth = isHighlighted ? 2 + pulseIntensity : 1 + pulseIntensity * 0.5;
    ctx.shadowColor = themeColors.connections;
    ctx.shadowBlur = isHighlighted ? 8 : 3 + pulseIntensity * 2;

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.quadraticCurveTo(controlX, controlY, x2, y2);
    ctx.stroke();
    
    // Flow indicator
    if (isHighlighted) {
      const t = flowPosition;
      const flowX = (1 - t) * (1 - t) * x1 + 2 * (1 - t) * t * controlX + t * t * x2;
      const flowY = (1 - t) * (1 - t) * y1 + 2 * (1 - t) * t * controlY + t * t * y2;
      
      ctx.shadowBlur = 10;
      ctx.fillStyle = themeColors.connections;
      ctx.beginPath();
      ctx.arc(flowX, flowY, 3, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.shadowBlur = 0;
  };

  const drawEnhancedNode = (ctx: CanvasRenderingContext2D, node: Note, time: number) => {
    const animState = animationState[node.id];
    let animProgress = node.content ? 1 : 0;
    const animationDuration = 500;

    if (animState) {
        const elapsed = time - animState.startTime;
        if (elapsed < animationDuration) {
            animProgress = elapsed / animationDuration;
        } else {
            animProgress = 1;
        }
    }

    if (animProgress <= 0) {
        return;
    }
    
    const isSelected = node.id === selectedNodeId;
    const isHovered = node.id === hoveredNode;
    const isSearchResult = searchResults?.some(n => n.id === node.id);
    const isDimmed = focusMode && selectedNodeId && !isSelected && !isSearchResult;
    
    const themeColors = getThemeColors(theme);
    const colors = themeColors.nodes;
    const color = colors[node.depth % colors.length];
    
    const baseRadius = 8 + (node.importance || 5 - node.depth) * 2;
    const breathingPhase = time * 0.003 + node.depth * 0.5;
    const breathingEffect = Math.sin(breathingPhase) * 0.2 + 1;
    const radius = baseRadius * breathingEffect;
    
    const interactionScale = isSelected ? 1.8 : isHovered ? 1.4 : 1;
    const finalRadius = radius * interactionScale * animProgress;
    const opacity = isDimmed ? 0.3 * animProgress : 1 * animProgress;
    
    // Enhanced glow rings for selection/hover
    if (isSelected || isHovered) {
      const ringCount = isSelected ? 4 : 2;
      for (let i = 0; i < ringCount; i++) {
        const ringRadius = finalRadius + (i + 1) * 12;
        const ringOpacity = (0.4 - i * 0.08) * opacity;
        const pulsePhase = time * 0.008 - i * 0.3;
        const pulseBrightness = (Math.sin(pulsePhase) + 1) / 2;
        
        ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${ringOpacity * pulseBrightness})`;
        ctx.lineWidth = 3 - i * 0.4;
        ctx.beginPath();
        ctx.arc(node.x!, node.y!, ringRadius, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    
    // Search result highlight
    if (isSearchResult && !isSelected) {
      const pulsePhase = time * 0.01;
      const pulseBrightness = (Math.sin(pulsePhase) + 1) / 2;
      ctx.strokeStyle = `rgba(241, 196, 15, ${0.8 * pulseBrightness * opacity})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(node.x!, node.y!, finalRadius + 8, 0, Math.PI * 2);
      ctx.stroke();
    }
    
    // Enhanced node gradient with multiple layers
    const gradient = ctx.createRadialGradient(
      node.x! - finalRadius * 0.3, node.y! - finalRadius * 0.3, 0,
      node.x!, node.y!, finalRadius
    );
    gradient.addColorStop(0, `rgba(${Math.min(255, color.r + 80)}, ${Math.min(255, color.g + 80)}, ${Math.min(255, color.b + 80)}, ${opacity})`);
    gradient.addColorStop(0.4, `rgba(${color.r + 30}, ${color.g + 30}, ${color.b + 30}, ${opacity})`);
    gradient.addColorStop(0.8, `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity})`);
    gradient.addColorStop(1, `rgba(${Math.max(0, color.r - 40)}, ${Math.max(0, color.g - 40)}, ${Math.max(0, color.b - 40)}, ${opacity})`);
    
    // Enhanced glow effect
    ctx.shadowColor = `rgba(${color.r}, ${color.g}, ${color.b}, ${0.8 * opacity})`;
    ctx.shadowBlur = isSelected ? 25 : isHovered ? 18 : 10;
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(node.x!, node.y!, finalRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // Multiple highlight layers
    ctx.shadowBlur = 0;
    const highlightGradient = ctx.createRadialGradient(
      node.x! - finalRadius * 0.6, node.y! - finalRadius * 0.6, 0,
      node.x!, node.y!, finalRadius * 0.8
    );
    highlightGradient.addColorStop(0, `rgba(255, 255, 255, ${0.6 * opacity})`);
    highlightGradient.addColorStop(0.5, `rgba(255, 255, 255, ${0.2 * opacity})`);
    highlightGradient.addColorStop(1, `rgba(255, 255, 255, 0)`);
    
    ctx.fillStyle = highlightGradient;
    ctx.beginPath();
    ctx.arc(node.x!, node.y!, finalRadius * 0.8, 0, Math.PI * 2);
    ctx.fill();
    
    // Depth indicator (small inner circle)
    if (node.depth > 0) {
      const innerRadius = finalRadius * 0.3;
      ctx.fillStyle = `rgba(255, 255, 255, ${0.4 * opacity})`;
      ctx.beginPath();
      ctx.arc(node.x!, node.y!, innerRadius, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Importance indicators (small dots around the node)
    const importance = node.importance || (5 - node.depth);
    if (importance > 3) {
      const dotCount = Math.min(importance - 3, 8);
      const dotRadius = 2;
      const orbitRadius = finalRadius + 15;
      
      for (let i = 0; i < dotCount; i++) {
        const dotAngle = (i / dotCount) * Math.PI * 2 + time * 0.002;
        const dotX = node.x! + Math.cos(dotAngle) * orbitRadius;
        const dotY = node.y! + Math.sin(dotAngle) * orbitRadius;
        
        ctx.fillStyle = `rgba(241, 196, 15, ${0.8 * opacity})`;
        ctx.beginPath();
        ctx.arc(dotX, dotY, dotRadius, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    
    // Enhanced rotation effect for selected nodes
    if (isSelected) {
      const rotationPhase = time * 0.008;
      const spikesCount = 12;
      ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${0.7 * opacity})`;
      ctx.lineWidth = 1.5;
      
      for (let i = 0; i < spikesCount; i++) {
        const angle = (i / spikesCount) * Math.PI * 2 + rotationPhase;
        const innerRadius = finalRadius + 8;
        const outerRadius = finalRadius + 18;
        const spikeIntensity = Math.sin(time * 0.02 + i) * 0.3 + 0.7;
        
        ctx.globalAlpha = spikeIntensity * opacity;
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
      ctx.globalAlpha = 1;
    }

    // Enhanced title rendering with better styling
    if (camera.scale > 0.5) {
      ctx.shadowBlur = 0;
      const isDark = document.documentElement.classList.contains('dark');
      const textColor = isDark ? '#ffffff' : '#1a1a1a';
      
      const fontSize = Math.min(16 * camera.scale, 16);
      const fontWeight = isSelected ? 'bold' : 'normal';
      ctx.font = `${fontWeight} ${fontSize}px "Inter", -apple-system, BlinkMacSystemFont, sans-serif`;
      
      const textMetrics = ctx.measureText(node.title);
      const textWidth = textMetrics.width;
      const textHeight = fontSize + 4;
      
      // Enhanced text background with better styling
      const bgGradient = ctx.createLinearGradient(
        node.x! - textWidth / 2 - 8,
        node.y! + finalRadius + 12,
        node.x! + textWidth / 2 + 8,
        node.y! + finalRadius + 12 + textHeight
      );
      
      if (isDark) {
        bgGradient.addColorStop(0, `rgba(0, 0, 0, ${0.8 * opacity})`);
        bgGradient.addColorStop(1, `rgba(30, 30, 30, ${0.9 * opacity})`);
      } else {
        bgGradient.addColorStop(0, `rgba(255, 255, 255, ${0.9 * opacity})`);
        bgGradient.addColorStop(1, `rgba(240, 240, 240, ${0.95 * opacity})`);
      }
      
      ctx.fillStyle = bgGradient;
      ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${0.3 * opacity})`;
      ctx.lineWidth = 1;
      
      const rectX = node.x! - textWidth / 2 - 8;
      const rectY = node.y! + finalRadius + 12;
      const rectWidth = textWidth + 16;
      const rectHeight = textHeight;
      
      ctx.beginPath();
      ctx.roundRect(rectX, rectY, rectWidth, rectHeight, 6);
      ctx.fill();
      ctx.stroke();
      
      // Text with enhanced styling
      ctx.fillStyle = `rgba(${textColor === '#ffffff' ? '255, 255, 255' : '26, 26, 26'}, ${opacity})`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      if (isSelected || isHovered) {
        ctx.shadowColor = `rgba(${color.r}, ${color.g}, ${color.b}, 0.5)`;
        ctx.shadowBlur = 2;
      }
      
      ctx.fillText(node.title, node.x!, node.y! + finalRadius + 12 + textHeight / 2);
      ctx.shadowBlur = 0;
    }
  };

  const drawEnhancedBackground = (ctx: CanvasRenderingContext2D, time: number) => {
    const canvas = ctx.canvas;
    const themeColors = getThemeColors(theme);
    
    // Multi-layer background gradient
    const gradient = ctx.createRadialGradient(
      canvas.width / 2, canvas.height / 2, 0,
      canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height) * 0.8
    );
    
    themeColors.background.forEach((color, index) => {
      gradient.addColorStop(index / (themeColors.background.length - 1), color);
    });
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Enhanced particle system
    particles.forEach(particle => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.life--;
      
      if (particle.life <= 0 || particle.x < -50 || particle.x > canvas.width + 50 || 
          particle.y < -50 || particle.y > canvas.height + 50) {
        particle.x = Math.random() * canvas.width;
        particle.y = Math.random() * canvas.height;
        particle.life = particle.maxLife;
      }
      
      const alpha = (particle.life / particle.maxLife) * 0.8;
      const twinkle = Math.sin(time * 0.008 + particle.x * 0.01) * 0.4 + 0.6;
      
      ctx.save();
      
      if (particle.type === 'star') {
        ctx.fillStyle = `${particle.color}${Math.floor(alpha * twinkle * 255).toString(16).padStart(2, '0')}`;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
      } else if (particle.type === 'nebula') {
        const nebulGradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, particle.size * 3
        );
        nebulGradient.addColorStop(0, `${particle.color}${Math.floor(alpha * twinkle * 100).toString(16).padStart(2, '0')}`);
        nebulGradient.addColorStop(1, `${particle.color}00`);
        
        ctx.fillStyle = nebulGradient;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * 3, 0, Math.PI * 2);
        ctx.fill();
      } else if (particle.type === 'comet') {
        const tailLength = 15;
        const tailGradient = ctx.createLinearGradient(
          particle.x, particle.y,
          particle.x - particle.vx * tailLength, particle.y - particle.vy * tailLength
        );
        tailGradient.addColorStop(0, `${particle.color}${Math.floor(alpha * twinkle * 255).toString(16).padStart(2, '0')}`);
        tailGradient.addColorStop(1, `${particle.color}00`);
        
        ctx.strokeStyle = tailGradient;
        ctx.lineWidth = particle.size;
        ctx.beginPath();
        ctx.moveTo(particle.x, particle.y);
        ctx.lineTo(particle.x - particle.vx * tailLength, particle.y - particle.vy * tailLength);
        ctx.stroke();
        
        ctx.fillStyle = `${particle.color}${Math.floor(alpha * twinkle * 255).toString(16).padStart(2, '0')}`;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
      }
      
      ctx.restore();
    });
    
    // Draw interaction effects
    interactionEffects.forEach((effect, index) => {
      const alpha = effect.life / effect.maxLife;
      const scale = 1 + (1 - alpha) * 2;
      
      ctx.save();
      ctx.globalAlpha = alpha;
      
      if (effect.type === 'click') {
        ctx.strokeStyle = effect.color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, 20 * scale, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, 35 * scale, 0, Math.PI * 2);
        ctx.stroke();
      } else if (effect.type === 'hover') {
        const gradient = ctx.createRadialGradient(
          effect.x, effect.y, 0,
          effect.x, effect.y, 15 * scale
        );
        gradient.addColorStop(0, effect.color);
        gradient.addColorStop(1, `${effect.color}00`);
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, 15 * scale, 0, Math.PI * 2);
        ctx.fill();
      }
      
      ctx.restore();
      
      effect.life--;
      if (effect.life <= 0) {
        setInteractionEffects(prev => prev.filter((_, i) => i !== index));
      }
    });
  };

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || nodes.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const time = Date.now();
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw enhanced background
    drawEnhancedBackground(ctx, time);
    
    // Set transform
    ctx.save();
    ctx.translate(canvas.width / 2 + camera.offset.x, canvas.height / 2 + camera.offset.y);
    ctx.scale(camera.scale, camera.scale);

    // Draw enhanced connections
    nodes.forEach(node => {
      node.children.forEach(child => {
        const childNode = nodes.find(n => n.id === child.id);
        if (childNode && node.content && childNode.content) {
          const pulsePhase = time * 0.004 + node.depth;
          const isHighlighted = (node.id === selectedNodeId || childNode.id === selectedNodeId) ||
                               (node.id === hoveredNode || childNode.id === hoveredNode);
          drawEnhancedConnection(ctx, node.x!, node.y!, childNode.x!, childNode.y!, pulsePhase, isHighlighted);
        }
      });
    });

    // Draw enhanced nodes
    nodes.forEach(node => {
      drawEnhancedNode(ctx, node, time);
    });

    ctx.restore();
    
    animationRef.current = requestAnimationFrame(animate);
  }, [nodes, camera.scale, camera.offset, selectedNodeId, hoveredNode, particles, interactionEffects, focusMode, searchResults, theme, animationState]);

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
      handleNodeClick(clickedNode);
      return;
    }

    setIsDragging(true);
    setLastMouse({ x: mouseX, y: mouseY });
    setVelocity({ x: 0, y: 0 });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const hoveredNode = getNodeAtPosition(mouseX, mouseY);
    const newHoveredId = hoveredNode?.id || null;
    
    if (newHoveredId !== hoveredNode?.id) {
      setHoveredNode(newHoveredId);
      onNodeHover?.(hoveredNode);
      
      if (hoveredNode) {
        const themeColors = getThemeColors(theme);
        const color = themeColors.nodes[hoveredNode.depth % themeColors.nodes.length];
        createInteractionEffect(
          (mouseX - canvas.width / 2 - camera.offset.x) / camera.scale,
          (mouseY - canvas.height / 2 - camera.offset.y) / camera.scale,
          'hover',
          `rgb(${color.r}, ${color.g}, ${color.b})`
        );
      }
    }

    if (isDragging) {
      const deltaX = mouseX - lastMouse.x;
      const deltaY = mouseY - lastMouse.y;
      
      setVelocity({ x: deltaX * 0.1, y: deltaY * 0.1 });
      const newOffset = {
        x: camera.offset.x + deltaX,
        y: camera.offset.y + deltaY
      };
      
      setCamera(prev => ({ ...prev, offset: newOffset }));
      onOffsetChange?.(newOffset);
      
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
          setCamera(prevCamera => ({
            ...prevCamera,
            offset: {
              x: prevCamera.offset.x + newVel.x,
              y: prevCamera.offset.y + newVel.y
            }
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
    const newScale = Math.max(0.1, Math.min(3, camera.scale * zoomFactor));
    
    setCamera(prev => ({ ...prev, scale: newScale }));
    onScaleChange?.(newScale);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
  
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      handleWheel(e as any);
    };
  
    canvas.addEventListener('wheel', onWheel, { passive: false });
  
    return () => {
      canvas.removeEventListener('wheel', onWheel);
    };
  }, [handleWheel]);

  const getNodeAtPosition = (mouseX: number, mouseY: number): Note | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const canvasX = (mouseX - canvas.width / 2 - camera.offset.x) / camera.scale;
    const canvasY = (mouseY - canvas.height / 2 - camera.offset.y) / camera.scale;

    return nodes.find(node => {
      const distance = Math.sqrt(
        Math.pow(canvasX - node.x!, 2) + Math.pow(canvasY - node.y!, 2)
      );
      const radius = (8 + (node.importance || 5 - node.depth) * 2) * (node.id === hoveredNode ? 1.4 : 1);
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
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ display: 'block', pointerEvents: 'auto' }}
      />
      
      {/* Galaxy-Themed Integrated Note Overlay */}
      {noteOverlay && noteOverlay.visible && showIntegratedOverlay && (
        <div
          className="fixed z-50 w-80 max-h-96 glass-panel rounded-xl shadow-2xl animate-scale-in border border-white/10 pointer-events-none"
          style={{
            left: `${noteOverlay.position.x}px`,
            top: `${noteOverlay.position.y}px`,
            background: 'linear-gradient(135deg, rgba(11, 20, 38, 0.95) 0%, rgba(26, 35, 50, 0.95) 50%, rgba(44, 62, 80, 0.95) 100%)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 30px rgba(52, 152, 219, 0.2)',
          }}
        >
          {/* Cosmic Header with Gradient Border */}
          <div className="relative p-4 border-b border-white/10">
            <div 
              className="absolute inset-0 rounded-t-xl opacity-30"
              style={{
                background: 'linear-gradient(90deg, rgba(52, 152, 219, 0.3) 0%, rgba(142, 68, 173, 0.3) 50%, rgba(241, 196, 15, 0.3) 100%)'
              }}
            />
            <div className="relative flex items-center justify-between pointer-events-auto">
              <h3 className="font-semibold text-lg text-white truncate pr-2 drop-shadow-lg">
                {noteOverlay.note.title}
              </h3>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 flex-shrink-0 text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200"
                onClick={handleCloseOverlay}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Note Content with Cosmic Styling */}
          <div className="p-4 max-h-48 overflow-y-auto custom-scrollbar">
            <p className="text-sm text-white/90 leading-relaxed">
              {noteOverlay.note.content}
            </p>
          </div>
          
          {/* Navigation Controls with Galaxy Theme */}
          <div className="flex gap-2 p-4 border-t border-white/10 pointer-events-auto">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 flex items-center gap-2 bg-white/5 border-white/20 text-white hover:bg-white/10 hover:border-white/30 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
              onClick={handleJumpToParent}
              disabled={!findParentNode(noteOverlay.note)}
            >
              <ChevronUp className="h-4 w-4" />
              Jump to Parent
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 flex items-center gap-2 bg-white/5 border-white/20 text-white hover:bg-white/10 hover:border-white/30 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
              onClick={handleAdvanceToNextSibling}
              disabled={!findNextSibling(noteOverlay.note)}
            >
              <ChevronRight className="h-4 w-4" />
              Next Sibling
            </Button>
          </div>
          
          {/* Depth and Stats Indicator */}
          <div className="px-4 pb-3">
            <div className="flex items-center justify-between text-xs text-white/60">
              <span>Depth Level: {noteOverlay.note.depth + 1}</span>
              <span>{noteOverlay.note.children.length} children</span>
            </div>
          </div>
          
          {/* Cosmic Glow Effect */}
          <div 
            className="absolute inset-0 rounded-xl pointer-events-none opacity-20"
            style={{
              background: 'radial-gradient(circle at 50% 0%, rgba(52, 152, 219, 0.3) 0%, transparent 70%)',
            }}
          />
        </div>
      )}
      
      {/* Custom Scrollbar Styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(52, 152, 219, 0.6);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(52, 152, 219, 0.8);
        }
      `}</style>
    </div>
  );
});

KnowledgeGalaxy.displayName = 'KnowledgeGalaxy';

export default KnowledgeGalaxy;

import React, { useEffect, useRef, useState } from 'react';

interface Note {
  id: string;
  title: string;
  content: string;
  children: Note[];
  x?: number;
  y?: number;
  depth: number;
}

interface KnowledgeGalaxyProps {
  notes: Note[];
  onNodeClick: (note: Note) => void;
  selectedNodeId?: string;
}

const KnowledgeGalaxy: React.FC<KnowledgeGalaxyProps> = ({ 
  notes, 
  onNodeClick, 
  selectedNodeId 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [nodes, setNodes] = useState<Note[]>([]);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastMouse, setLastMouse] = useState({ x: 0, y: 0 });
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  useEffect(() => {
    if (notes.length > 0) {
      generateNodePositions(notes);
    }
  }, [notes]);

  const generateNodePositions = (noteData: Note[]) => {
    const allNodes: Note[] = [];
    
    const traverse = (note: Note, depth: number, parentX = 0, parentY = 0, angle = 0) => {
      const nodeWithPosition = {
        ...note,
        depth,
        x: parentX + Math.cos(angle) * (100 + depth * 80),
        y: parentY + Math.sin(angle) * (100 + depth * 80)
      };
      
      allNodes.push(nodeWithPosition);
      
      note.children.forEach((child, index) => {
        const childAngle = angle + (index - (note.children.length - 1) / 2) * (Math.PI / 3);
        traverse(child, depth + 1, nodeWithPosition.x!, nodeWithPosition.y!, childAngle);
      });
    };

    noteData.forEach((note, index) => {
      const startAngle = (index / noteData.length) * 2 * Math.PI;
      traverse(note, 0, 0, 0, startAngle);
    });

    setNodes(allNodes);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || nodes.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Set transform
      ctx.save();
      ctx.translate(canvas.width / 2 + offset.x, canvas.height / 2 + offset.y);
      ctx.scale(scale, scale);

      // Draw connections first
      ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--primary').includes('hsl') 
        ? 'rgba(52, 152, 219, 0.3)' 
        : 'rgba(52, 152, 219, 0.3)';
      ctx.lineWidth = 1;

      nodes.forEach(node => {
        node.children.forEach(child => {
          const childNode = nodes.find(n => n.id === child.id);
          if (childNode) {
            ctx.beginPath();
            ctx.moveTo(node.x!, node.y!);
            ctx.lineTo(childNode.x!, childNode.y!);
            ctx.stroke();
          }
        });
      });

      // Draw nodes
      nodes.forEach(node => {
        const isSelected = node.id === selectedNodeId;
        const isHovered = node.id === hoveredNode;
        
        // Node color based on depth
        const colors = [
          '#3498DB', // Galaxy blue
          '#8E44AD', // Nebula purple
          '#E74C3C', // Star red
          '#F1C40F', // Cosmic gold
          '#2ECC71'  // Space green
        ];
        
        const nodeColor = colors[node.depth % colors.length];
        const radius = 8 + (5 - node.depth) * 2;

        // Glow effect for selected/hovered nodes
        if (isSelected || isHovered) {
          ctx.shadowColor = nodeColor;
          ctx.shadowBlur = isSelected ? 20 : 15;
        } else {
          ctx.shadowBlur = 0;
        }

        ctx.fillStyle = nodeColor;
        ctx.beginPath();
        ctx.arc(node.x!, node.y!, radius, 0, Math.PI * 2);
        ctx.fill();

        // Draw title on high zoom
        if (scale > 0.8) {
          ctx.shadowBlur = 0;
          ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--foreground').includes('hsl')
            ? '#fff'
            : '#333';
          ctx.font = `${12 * scale}px Inter, sans-serif`;
          ctx.textAlign = 'center';
          ctx.fillText(node.title, node.x!, node.y! + radius + 15);
        }
      });

      ctx.restore();
    };

    draw();
  }, [nodes, scale, offset, selectedNodeId, hoveredNode]);

  const handleMouseDown = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Check if clicking on a node
    const clickedNode = getNodeAtPosition(mouseX, mouseY);
    if (clickedNode) {
      onNodeClick(clickedNode);
      return;
    }

    setIsDragging(true);
    setLastMouse({ x: mouseX, y: mouseY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Check for hovered node
    const hoveredNode = getNodeAtPosition(mouseX, mouseY);
    setHoveredNode(hoveredNode?.id || null);

    if (isDragging) {
      const deltaX = mouseX - lastMouse.x;
      const deltaY = mouseY - lastMouse.y;
      
      setOffset(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }));
      
      setLastMouse({ x: mouseX, y: mouseY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    setScale(prev => Math.max(0.1, Math.min(3, prev * zoomFactor)));
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
      const radius = 8 + (5 - node.depth) * 2;
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
};

export default KnowledgeGalaxy;

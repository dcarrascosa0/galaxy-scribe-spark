
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, Star, Eye } from 'lucide-react';

interface Note {
  id: string;
  title: string;
  content: string;
  depth: number;
  children: Note[];
  tags?: string[];
  lastViewed?: Date;
  importance?: number;
}

interface NodePreviewProps {
  note: Note | null;
  position: { x: number; y: number };
  isVisible: boolean;
}

const NodePreview: React.FC<NodePreviewProps> = ({ note, position, isVisible }) => {
  if (!note || !isVisible) return null;

  const truncateContent = (content: string, maxLength: number = 200) => {
    return content.length > maxLength ? content.substring(0, maxLength) + '...' : content;
  };

  const getImportanceStars = (importance: number = 1) => {
    return Array.from({ length: Math.min(importance, 5) }, (_, i) => (
      <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
    ));
  };

  return (
    <div
      className="fixed z-50 pointer-events-none"
      style={{
        left: position.x + 20,
        top: position.y - 10,
        transform: 'translateY(-50%)'
      }}
    >
      <Card className="w-80 shadow-2xl border-2 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm animate-scale-in">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <CardTitle className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">
              {note.title}
            </CardTitle>
            <Badge variant="outline" className="text-xs ml-2 flex-shrink-0">
              Level {note.depth}
            </Badge>
          </div>
          
          {/* Importance Stars */}
          {note.importance && note.importance > 1 && (
            <div className="flex items-center gap-1 mt-1">
              {getImportanceStars(note.importance)}
            </div>
          )}
        </CardHeader>
        
        <CardContent className="pt-0 space-y-3">
          {/* Content Preview */}
          <div className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
            {truncateContent(note.content)}
          </div>
          
          {/* Tags */}
          {note.tags && note.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {note.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs px-2 py-0">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
          
          {/* Metadata */}
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-2 border-t">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                <span>{note.children.length} children</span>
              </div>
              
              {note.lastViewed && (
                <div className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  <span>
                    {new Date(note.lastViewed).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>
                {Math.ceil(note.content.length / 200)} min read
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NodePreview;

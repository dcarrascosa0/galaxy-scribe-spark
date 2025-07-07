
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { X, Sparkles } from 'lucide-react';

interface GeneratePanelProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (config: GenerateConfig) => void;
}

export interface GenerateConfig {
  topic: string;
  description: string;
  depth: number;
  style: string;
}

const GeneratePanel: React.FC<GeneratePanelProps> = ({ isOpen, onClose, onGenerate }) => {
  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');
  const [depth, setDepth] = useState([3]);
  const [style, setStyle] = useState('comprehensive');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    onGenerate({
      topic: topic.trim(),
      description: description.trim(),
      depth: depth[0],
      style
    });
  };

  const styles = [
    { id: 'comprehensive', label: 'Comprehensive', description: 'Detailed and thorough coverage' },
    { id: 'concise', label: 'Concise', description: 'Brief and to the point' },
    { id: 'academic', label: 'Academic', description: 'Scholarly and research-focused' },
    { id: 'creative', label: 'Creative', description: 'Imaginative and engaging' }
  ];

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
              <Sparkles className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Generate Notes</h2>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-6">
            <div className="space-y-2">
              <Label htmlFor="topic">Topic *</Label>
              <Input
                id="topic"
                placeholder="e.g., Machine Learning, Quantum Physics, Ancient History"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Provide additional context or specific aspects you'd like to focus on..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-4">
              <div className="flex justify-between">
                <Label>Depth Level</Label>
                <span className="text-sm text-muted-foreground">{depth[0]} levels</span>
              </div>
              <Slider
                value={depth}
                onValueChange={setDepth}
                max={5}
                min={1}
                step={1}
                className="w-full"
              />
              <div className="text-xs text-muted-foreground">
                Higher depth creates more detailed sub-topics
              </div>
            </div>

            <div className="space-y-3">
              <Label>Style</Label>
              <div className="grid grid-cols-2 gap-2">
                {styles.map((styleOption) => (
                  <button
                    key={styleOption.id}
                    type="button"
                    onClick={() => setStyle(styleOption.id)}
                    className={`
                      p-3 rounded-lg border text-left transition-all
                      ${style === styleOption.id 
                        ? 'border-primary bg-primary/10 text-primary' 
                        : 'border-border hover:border-primary/50'
                      }
                    `}
                  >
                    <div className="font-medium text-sm">{styleOption.label}</div>
                    <div className="text-xs text-muted-foreground">{styleOption.description}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-auto">
              <Button type="submit" className="w-full" disabled={!topic.trim()}>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Knowledge Galaxy
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default GeneratePanel;

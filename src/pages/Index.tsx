
import React, { useState } from 'react';
import KnowledgeGalaxy from '@/components/KnowledgeGalaxy';
import GalaxyPlaceholder from '@/components/GalaxyPlaceholder';
import LoadingProgress from '@/components/LoadingProgress';
import SpeedDial from '@/components/SpeedDial';
import GeneratePanel, { GenerateConfig } from '@/components/GeneratePanel';
import HistoryPanel from '@/components/HistoryPanel';
import NoteInspector from '@/components/NoteInspector';
import { toast } from '@/hooks/use-toast';

interface Note {
  id: string;
  title: string;
  content: string;
  children: Note[];
  depth: number;
}

interface HistoryItem {
  id: string;
  topic: string;
  createdAt: Date;
  noteCount: number;
  depth: number;
  notes: Note[];
}

const Index = () => {
  const [currentNotes, setCurrentNotes] = useState<Note[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationPhase, setGenerationPhase] = useState('');
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationStatus, setGenerationStatus] = useState('');
  
  const [showGeneratePanel, setShowGeneratePanel] = useState(false);
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);
  const [showNoteInspector, setShowNoteInspector] = useState(false);
  
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Mock data for demonstration
  const mockNotes: Note[] = [
    {
      id: '1',
      title: 'Machine Learning Fundamentals',
      content: 'Machine Learning is a subset of artificial intelligence that enables computers to learn and make decisions from data without being explicitly programmed for every scenario.\n\nKey concepts include:\n- Supervised Learning: Learning from labeled data\n- Unsupervised Learning: Finding patterns in unlabeled data\n- Reinforcement Learning: Learning through interaction and feedback\n\nApplications span across industries from healthcare to finance, making it one of the most transformative technologies of our time.',
      depth: 0,
      children: [
        {
          id: '2',
          title: 'Supervised Learning',
          content: 'Supervised learning uses labeled training data to learn a mapping from inputs to outputs. The algorithm learns from examples where both the input and correct output are provided.\n\nTypes include:\n- Classification: Predicting categories (spam vs. not spam)\n- Regression: Predicting continuous values (house prices)\n\nCommon algorithms: Linear Regression, Decision Trees, Random Forest, Support Vector Machines, Neural Networks.',
          depth: 1,
          children: [
            {
              id: '3',
              title: 'Linear Regression',
              content: 'Linear regression is a fundamental supervised learning algorithm that models the relationship between a dependent variable and independent variables using a linear equation.\n\nKey concepts:\n- Simple Linear Regression: One independent variable\n- Multiple Linear Regression: Multiple independent variables\n- Assumptions: Linearity, independence, homoscedasticity\n\nUse cases: Predicting sales, analyzing relationships between variables, forecasting trends.',
              depth: 2,
              children: []
            }
          ]
        },
        {
          id: '4',
          title: 'Unsupervised Learning',
          content: 'Unsupervised learning finds hidden patterns in data without labeled examples. The algorithm must discover structure in the input data on its own.\n\nMain types:\n- Clustering: Grouping similar data points\n- Association Rules: Finding relationships between variables\n- Dimensionality Reduction: Simplifying data while preserving important information\n\nApplications: Customer segmentation, anomaly detection, data compression.',
          depth: 1,
          children: []
        }
      ]
    }
  ];

  const simulateGeneration = async (config: GenerateConfig) => {
    setIsGenerating(true);
    setShowGeneratePanel(false);
    
    const phases = [
      { name: 'Initializing', duration: 1000, status: 'Setting up AI models...' },
      { name: 'Building Structure', duration: 2000, status: 'Creating knowledge hierarchy...' },
      { name: 'Generating Content', duration: 3000, status: 'Writing comprehensive notes...' },
      { name: 'Complete', duration: 500, status: 'Finalizing knowledge galaxy...' }
    ];

    let totalProgress = 0;
    const progressIncrement = 100 / phases.length;

    for (const phase of phases) {
      setGenerationPhase(phase.name);
      setGenerationStatus(phase.status);
      
      const startProgress = totalProgress;
      const endProgress = totalProgress + progressIncrement;
      
      await new Promise(resolve => {
        const interval = setInterval(() => {
          totalProgress += 2;
          if (totalProgress >= endProgress) {
            totalProgress = endProgress;
            setGenerationProgress(totalProgress);
            clearInterval(interval);
            resolve(void 0);
          } else {
            setGenerationProgress(totalProgress);
          }
        }, phase.duration / (progressIncrement / 2));
      });
    }

    // Simulate generated notes
    const newHistoryItem: HistoryItem = {
      id: Date.now().toString(),
      topic: config.topic,
      createdAt: new Date(),
      noteCount: 4,
      depth: config.depth,
      notes: mockNotes
    };

    setHistory(prev => [newHistoryItem, ...prev]);
    setCurrentNotes(mockNotes);
    setIsGenerating(false);
    
    toast({
      title: "Knowledge Galaxy Generated!",
      description: `Successfully created notes for "${config.topic}"`,
    });
  };

  const handleNodeClick = (note: Note) => {
    setSelectedNote(note);
    setShowNoteInspector(true);
  };

  const handleLoadHistory = (id: string) => {
    const historyItem = history.find(item => item.id === id);
    if (historyItem) {
      setCurrentNotes(historyItem.notes);
      setShowHistoryPanel(false);
      toast({
        title: "History Loaded",
        description: `Loaded "${historyItem.topic}" from history`,
      });
    }
  };

  const handleDeleteHistory = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
    toast({
      title: "History Deleted",
      description: "Successfully removed from history",
    });
  };

  const getBreadcrumbs = (note: Note): Note[] => {
    // Simple breadcrumb generation - in a real app, you'd track the full path
    return [note];
  };

  const renderMainContent = () => {
    if (isGenerating) {
      return (
        <LoadingProgress
          phase={generationPhase}
          progress={generationProgress}
          status={generationStatus}
        />
      );
    }

    if (currentNotes.length === 0) {
      return <GalaxyPlaceholder />;
    }

    return (
      <KnowledgeGalaxy
        notes={currentNotes}
        onNodeClick={handleNodeClick}
        selectedNodeId={selectedNote?.id}
      />
    );
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden">
      {/* Main Content Area */}
      <main className="h-screen w-full">
        {renderMainContent()}
      </main>

      {/* Speed Dial */}
      <SpeedDial
        onGenerateClick={() => setShowGeneratePanel(true)}
        onHistoryClick={() => setShowHistoryPanel(true)}
        onSearchClick={() => toast({ title: "Search", description: "Focus search coming soon!" })}
        onExportClick={() => toast({ title: "Export", description: "Export functionality coming soon!" })}
        onSettingsClick={() => toast({ title: "Settings", description: "Settings panel coming soon!" })}
        onHelpClick={() => toast({ title: "Help", description: "Help documentation coming soon!" })}
      />

      {/* Side Panels */}
      <GeneratePanel
        isOpen={showGeneratePanel}
        onClose={() => setShowGeneratePanel(false)}
        onGenerate={simulateGeneration}
      />

      <HistoryPanel
        isOpen={showHistoryPanel}
        onClose={() => setShowHistoryPanel(false)}
        history={history}
        onLoadHistory={handleLoadHistory}
        onDeleteHistory={handleDeleteHistory}
      />

      <NoteInspector
        isOpen={showNoteInspector}
        onClose={() => setShowNoteInspector(false)}
        note={selectedNote}
        breadcrumbs={selectedNote ? getBreadcrumbs(selectedNote) : []}
      />
    </div>
  );
};

export default Index;

import React, { useState, useEffect, useRef } from 'react';
import KnowledgeGalaxy from '@/components/KnowledgeGalaxy';
import GalaxyPlaceholder from '@/components/GalaxyPlaceholder';
import LoadingProgress from '@/components/LoadingProgress';
import SpeedDial from '@/components/SpeedDial';
import GeneratePanel, { GenerateConfig } from '@/components/GeneratePanel';
import HistoryPanel from '@/components/HisotryPanel';
import NoteInspector from '@/components/NoteInspector';
import GalaxySearch from '@/components/GalaxySearch';
import FocusMode from '@/components/FocusMode';
import GalaxyMiniMap from '@/components/GalaxyMiniMap';
import KeyboardShortcuts from '@/components/KeyboardShorcut';
import ThemeSelector from '@/components/ThemeSelector';
import ExportGalaxy from '@/components/ExportGalaxy';
import AchievementSystem from '@/components/AchievementSystem';
import NodePreview from '@/components/NodePreview';
import UserNav from '@/components/UserNav';
import { toast } from '@/hooks/use-toast';
import { 
  generateNotes, 
  NoteGenerationRequest, 
  ProgressUpdate,
  NoteNode,
  Language,
  DepthLevel,
  TopicComplexity,
  GenerationType,
  ProgressType
} from '@/lib/api';
import { v4 as uuidv4 } from 'uuid';

interface Note {
  id: string;
  title: string;
  content: string;
  children: Note[];
  depth: number;
  parent?: Note | null;
  importance?: number;
  tags?: string[];
  lastViewed?: Date;
  x?: number;
  y?: number;
}

interface HistoryItem {
  id: string;
  topic: string;
  createdAt: Date;
  noteCount: number;
  depth: number;
  notes: Note[];
}

interface UserStats {
  notesCreated: number;
  sessionsCount: number;
  totalTimeSpent: number;
  deepestDepth: number;
  themesUsed: number;
  exportsCount: number;
}

const Index = () => {
  const [currentNotes, setCurrentNotes] = useState<Note[]>([]);
  const [positionedNotes, setPositionedNotes] = useState<Note[]>([]);
  const [searchResults, setSearchResults] = useState<Note[]>([]);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('cosmic');
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationPhase, setGenerationPhase] = useState('');
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationStatus, setGenerationStatus] = useState('');
  const [isShowingPartialGraph, setIsShowingPartialGraph] = useState(false);
  
  const [showGeneratePanel, setShowGeneratePanel] = useState(false);
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);
  const [showNoteInspector, setShowNoteInspector] = useState(false);
  
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [hoveredNote, setHoveredNote] = useState<Note | null>(null);
  const [nodePreviewPosition, setNodePreviewPosition] = useState({ x: 0, y: 0 });
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [userStats, setUserStats] = useState<UserStats>({
    notesCreated: 0,
    sessionsCount: 0,
    totalTimeSpent: 0,
    deepestDepth: 0,
    themesUsed: 1,
    exportsCount: 0
  });

  // Galaxy control states
  const [galaxyScale, setGalaxyScale] = useState(1);
  const [galaxyOffset, setGalaxyOffset] = useState({ x: 0, y: 0 });
  const galaxyRef = useRef<any>(null);
  const sessionStartTime = useRef<Date>(new Date());

  // Add scratch data on component mount
  useEffect(() => {
    // Create enhanced scratch data for testing with depth 3
    const createScratchData = (): Note => {
      const rootNote: Note = {
        id: 'scratch-root',
        title: 'Advanced Machine Learning Systems',
        content: 'Advanced Machine Learning encompasses deep learning architectures, distributed training systems, and production-scale ML pipelines that power modern AI applications.',
        depth: 0,
        children: [],
        importance: 5,
        tags: ['AI', 'Deep Learning', 'Production ML', 'Systems']
      };

      // Depth 1 nodes
      const neuralNetworks: Note = {
        id: 'scratch-neural',
        title: 'Neural Network Architectures',
        content: 'Neural networks form the backbone of modern deep learning, with various architectures optimized for different types of data and tasks.',
        depth: 1,
        parent: rootNote,
        children: [],
        importance: 4,
        tags: ['Neural Networks', 'Architecture', 'Deep Learning']
      };

      const distributedTraining: Note = {
        id: 'scratch-distributed',
        title: 'Distributed Training Systems',
        content: 'Large-scale machine learning requires distributed training across multiple GPUs and machines to handle massive datasets and complex models.',
        depth: 1,
        parent: rootNote,
        children: [],
        importance: 4,
        tags: ['Distributed Systems', 'GPU', 'Scalability']
      };

      const mlOps: Note = {
        id: 'scratch-mlops',
        title: 'MLOps and Production Pipelines',
        content: 'MLOps practices ensure reliable deployment, monitoring, and maintenance of machine learning models in production environments.',
        depth: 1,
        parent: rootNote,
        children: [],
        importance: 4,
        tags: ['MLOps', 'Production', 'DevOps', 'Monitoring']
      };

      // Depth 2 nodes under Neural Networks
      const transformers: Note = {
        id: 'scratch-transformers',
        title: 'Transformer Architecture',
        content: 'Transformers revolutionized NLP and beyond with their attention mechanism, enabling models like BERT, GPT, and Vision Transformers.',
        depth: 2,
        parent: neuralNetworks,
        children: [],
        importance: 3,
        tags: ['Transformers', 'Attention', 'NLP', 'Vision']
      };

      const convNets: Note = {
        id: 'scratch-convnets',
        title: 'Convolutional Neural Networks',
        content: 'CNNs excel at processing grid-like data such as images, using convolution operations to detect local features and patterns.',
        depth: 2,
        parent: neuralNetworks,
        children: [],
        importance: 3,
        tags: ['CNN', 'Computer Vision', 'Feature Detection']
      };

      const rnnLstm: Note = {
        id: 'scratch-rnn',
        title: 'RNNs and LSTMs',
        content: 'Recurrent Neural Networks and Long Short-Term Memory networks process sequential data by maintaining hidden states across time steps.',
        depth: 2,
        parent: neuralNetworks,
        children: [],
        importance: 3,
        tags: ['RNN', 'LSTM', 'Sequential Data', 'Time Series']
      };

      // Depth 3 nodes under Transformers
      const attention: Note = {
        id: 'scratch-attention',
        title: 'Multi-Head Attention Mechanism',
        content: 'Multi-head attention allows the model to jointly attend to information from different representation subspaces at different positions.',
        depth: 3,
        parent: transformers,
        children: [],
        importance: 2,
        tags: ['Attention', 'Multi-Head', 'Representation', 'Parallel Processing']
      };

      const positionalEncoding: Note = {
        id: 'scratch-positional',
        title: 'Positional Encoding',
        content: 'Positional encodings provide the model with information about the position of tokens in a sequence, crucial for transformer performance.',
        depth: 3,
        parent: transformers,
        children: [],
        importance: 2,
        tags: ['Position', 'Encoding', 'Sequence', 'Sine Cosine']
      };

      const layerNorm: Note = {
        id: 'scratch-layernorm',
        title: 'Layer Normalization',
        content: 'Layer normalization stabilizes training in deep networks by normalizing inputs across features rather than batch dimensions.',
        depth: 3,
        parent: transformers,
        children: [],
        importance: 2,
        tags: ['Normalization', 'Stability', 'Training', 'Deep Networks']
      };

      // Depth 3 nodes under CNNs
      const convolution: Note = {
        id: 'scratch-convolution',
        title: 'Convolution Operations',
        content: 'Convolution operations apply filters across input data to detect features like edges, textures, and patterns in images.',
        depth: 3,
        parent: convNets,
        children: [],
        importance: 2,
        tags: ['Convolution', 'Filters', 'Feature Maps', 'Kernels']
      };

      const pooling: Note = {
        id: 'scratch-pooling',
        title: 'Pooling Layers',
        content: 'Pooling layers reduce spatial dimensions while retaining important information, helping with translation invariance and computational efficiency.',
        depth: 3,
        parent: convNets,
        children: [],
        importance: 2,
        tags: ['Pooling', 'Max Pooling', 'Average Pooling', 'Dimensionality Reduction']
      };

      const batchNorm: Note = {
        id: 'scratch-batchnorm',
        title: 'Batch Normalization',
        content: 'Batch normalization normalizes layer inputs by adjusting and scaling activations, accelerating training and improving stability.',
        depth: 3,
        parent: convNets,
        children: [],
        importance: 2,
        tags: ['Batch Norm', 'Training Acceleration', 'Stability', 'Normalization']
      };

      // Build the hierarchy
      attention.parent = transformers;
      positionalEncoding.parent = transformers;
      layerNorm.parent = transformers;
      transformers.children = [attention, positionalEncoding, layerNorm];

      convolution.parent = convNets;
      pooling.parent = convNets;
      batchNorm.parent = convNets;
      convNets.children = [convolution, pooling, batchNorm];

      transformers.parent = neuralNetworks;
      convNets.parent = neuralNetworks;
      rnnLstm.parent = neuralNetworks;
      neuralNetworks.children = [transformers, convNets, rnnLstm];

      distributedTraining.parent = rootNote;
      mlOps.parent = rootNote;
      rootNote.children = [neuralNetworks, distributedTraining, mlOps];

      return rootNote;
    };

    const scratchData = createScratchData();
    const scratchHistoryItem: HistoryItem = {
      id: 'scratch-data-' + Date.now(),
      topic: 'Advanced ML Systems (Depth 3 Scratch Data)',
      createdAt: new Date(),
      noteCount: 12,
      depth: 3,
      notes: [scratchData]
    };

    setHistory(prev => [scratchHistoryItem, ...prev]);
  }, []);


  const convertNoteNodeToNote = (node: NoteNode, depth = 0, parent: Note | null = null): Note => {
    const newNote: Note = {
      id: uuidv4(),
      title: node.title,
      content: node.content,
      depth: depth,
      tags: node.key_terms || [],
      parent: parent,
      children: []
    };

    newNote.children = node.children.map(child => convertNoteNodeToNote(child, depth + 1, newNote));

    return newNote;
  }

  const countNodes = (note: Note): number => {
    return 1 + note.children.reduce((acc, child) => acc + countNodes(child), 0);
  }

  // Track session time
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const sessionTime = Math.floor((now.getTime() - sessionStartTime.current.getTime()) / 60000);
      setUserStats(prev => ({ ...prev, totalTimeSpent: prev.totalTimeSpent + 1 }));
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case '?':
          e.preventDefault();
          setShowKeyboardShortcuts(true);
          break;
        case ' ':
          e.preventDefault();
          // Toggle speed dial functionality can be added here
          break;
        case 'Escape':
          e.preventDefault();
          setShowGeneratePanel(false);
          setShowHistoryPanel(false);
          setShowNoteInspector(false);
          setShowKeyboardShortcuts(false);
          setShowAchievements(false);
          break;
        case 'g':
        case 'G':
          e.preventDefault();
          setShowGeneratePanel(true);
          break;
        case 'h':
        case 'H':
          e.preventDefault();
          setShowHistoryPanel(true);
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          setIsFocusMode(!isFocusMode);
          break;
        case 'r':
        case 'R':
          e.preventDefault();
          handleResetGalaxy();
          break;
        case 'a':
        case 'A':
          e.preventDefault();
          setShowAchievements(true);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFocusMode]);

  const updateUserStats = (updates: Partial<UserStats>) => {
    setUserStats(prev => ({ ...prev, ...updates }));
  };

  const handleGenerate = async (config: GenerateConfig) => {
    setIsGenerating(true);
    setShowGeneratePanel(false);
    setGenerationProgress(0);
    setGenerationPhase('Initializing');
    setGenerationStatus('Starting generation process...');
    setIsShowingPartialGraph(false);
    let partialGraphShown = false;

    const generationMap = {
      'comprehensive': { depth_level: DepthLevel.DEEP_DIVE, topic_complexity: TopicComplexity.COMPLEX },
      'concise': { depth_level: DepthLevel.BASIC, topic_complexity: TopicComplexity.SIMPLE },
      'academic': { depth_level: DepthLevel.DEEP_DIVE, topic_complexity: TopicComplexity.COMPLEX },
      'creative': { depth_level: DepthLevel.INTERMEDIATE, topic_complexity: TopicComplexity.MEDIUM },
    }

    const { depth_level, topic_complexity } = generationMap[config.style as keyof typeof generationMap] || generationMap.comprehensive;

    const request: NoteGenerationRequest = {
      topic: config.topic,
      generation_type: GenerationType.TOPIC,
      language: Language.ENGLISH, // Or make this configurable
      max_depth: config.depth,
      depth_level,
      topic_complexity,
    };
    
    try {
      await generateNotes(request, (update: ProgressUpdate) => {
        if(update.progress) setGenerationProgress(update.progress * 100);
        if(update.message) setGenerationStatus(update.message);

        if (update.data && (update.type === 'progress' || update.type === 'result')) {
          const notes = [convertNoteNodeToNote(update.data)];
          setCurrentNotes(notes);
          if (!partialGraphShown && update.type === 'progress') {
            const hasContent = (note: Note): boolean => {
              if (note.content) return true;
              return note.children.some(hasContent);
            }
            if (notes.length > 0 && hasContent(notes[0])) {
              partialGraphShown = true;
              setIsShowingPartialGraph(true);
            }
          }
        }

        switch (update.type) {
          case "status":
            if (update.message) {
              if (update.message.includes("structure")) {
                setGenerationPhase('Building Structure');
              } else if (update.message.includes("content")) {
                setGenerationPhase('Generating Content');
              } else {
                setGenerationPhase(update.message);
              }
            } else {
              setGenerationPhase('Updating...');
            }
            break;
          case "progress":
            // The data handling is now done above the switch
            break;
          case "result":
            if (update.data) {
              const notes = [convertNoteNodeToNote(update.data)];
              setCurrentNotes(notes);

              const totalNodes = notes.length > 0 ? countNodes(notes[0]) : 0;
              const newHistoryItem: HistoryItem = {
                id: Date.now().toString(),
                topic: config.topic,
                createdAt: new Date(),
                noteCount: totalNodes,
                depth: config.depth,
                notes: notes
              };
          
              setHistory(prev => [newHistoryItem, ...prev]);
              
              updateUserStats({
                notesCreated: userStats.notesCreated + 1,
                sessionsCount: userStats.sessionsCount + 1,
                deepestDepth: Math.max(userStats.deepestDepth, config.depth)
              });

              toast({
                title: "Knowledge Galaxy Generated! ✨",
                description: `Successfully created notes for "${config.topic}"`,
              });
            }
            setIsGenerating(false);
            setIsShowingPartialGraph(false);
            setGenerationPhase('Complete');
            break;
          case "error":
            toast({
              title: "Generation Error 😭",
              description: update.message,
              variant: "destructive",
            });
            setIsGenerating(false);
            setIsShowingPartialGraph(false);
            break;
        }
      });
    } catch (error) {
      console.error("Generation failed:", error);
      toast({
        title: "Generation Failed 😭",
        description: "An unexpected error occurred. Check the console for details.",
        variant: "destructive",
      });
      setIsGenerating(false);
      setIsShowingPartialGraph(false);
    }
  };


  const handleNodeClick = (note: Note) => {
    setSelectedNote(note);
    setShowNoteInspector(true);
    
    // Update last viewed
    const updatedNote = { ...note, lastViewed: new Date() };
    // In a real app, you'd update the note in your data store
  };

  const handleNodeHover = (note: Note | null) => {
    setHoveredNote(note);
    if (note) {
      // Get mouse position for preview
      const handleMouseMove = (e: MouseEvent) => {
        setNodePreviewPosition({ x: e.clientX, y: e.clientY });
      };
      
      window.addEventListener('mousemove', handleMouseMove);
      return () => window.removeEventListener('mousemove', handleMouseMove);
    }
  };

  const handleLoadHistory = (id: string) => {
    const historyItem = history.find(item => item.id === id);
    if (historyItem) {
      setCurrentNotes(historyItem.notes);
      setShowHistoryPanel(false);
      toast({
        title: "History Loaded ⏰",
        description: `Loaded "${historyItem.topic}" from history`,
      });
    }
  };

  const handleDeleteHistory = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
    toast({
      title: "History Deleted 🗑️",
      description: "Successfully removed from history",
    });
  };

  const handleSearchResults = (results: Note[]) => {
    setSearchResults(results);
    setIsSearchActive(true);
  };

  const handleClearSearch = () => {
    setSearchResults([]);
    setIsSearchActive(false);
  };

  const handleNavigateToNode = (x: number, y: number) => {
    setGalaxyOffset({ x, y });
  };

  const handleResetGalaxy = () => {
    setGalaxyScale(1);
    setGalaxyOffset({ x: 0, y: 0 });
    toast({
      title: "Galaxy Reset 🔄",
      description: "Returned to default view",
    });
  };

  const handleThemeChange = (themeId: string) => {
    setCurrentTheme(themeId);
    document.documentElement.setAttribute('data-theme', themeId);
    
    // Update theme usage stats
    const themesUsed = new Set([...Array(userStats.themesUsed), themeId]).size;
    updateUserStats({ themesUsed });
    
    toast({
      title: "Theme Changed 🎨",
      description: `Switched to ${themeId} theme`,
    });
  };

  const handleExport = () => {
    updateUserStats({ exportsCount: userStats.exportsCount + 1 });
    toast({
      title: "Export Successful 📤",
      description: "Your knowledge galaxy has been exported",
    });
  };

  const getBreadcrumbs = (note: Note): Note[] => {
    const crumbs: Note[] = [];
    let current: Note | null | undefined = note;
    while(current) {
      crumbs.unshift(current);
      current = current.parent;
    }
    return crumbs;
  };

  const renderMainContent = () => {
    if (isGenerating) {
      if (isShowingPartialGraph) {
        return (
          <>
            <KnowledgeGalaxy
              ref={galaxyRef}
              notes={currentNotes}
              onNodeClick={handleNodeClick}
              onNodeHover={handleNodeHover}
              selectedNodeId={selectedNote?.id}
              focusMode={isFocusMode}
              searchResults={isSearchActive ? searchResults : undefined}
              onScaleChange={setGalaxyScale}
              onOffsetChange={setGalaxyOffset}
              onNodesPositioned={setPositionedNotes}
              theme={currentTheme}
            />
            <div className="fixed top-4 left-4 z-50 w-full max-w-sm animate-fade-in">
              <LoadingProgress
                compact
                phase={generationPhase}
                progress={generationProgress}
                status={generationStatus}
              />
            </div>
          </>
        );
      }
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
    const displayNotes = isSearchActive ? searchResults : currentNotes;
    return (
      <KnowledgeGalaxy
        ref={galaxyRef}
        notes={displayNotes}
        onNodeClick={handleNodeClick}
        onNodeHover={handleNodeHover}
        selectedNodeId={selectedNote?.id}
        focusMode={isFocusMode}
        searchResults={isSearchActive ? searchResults : undefined}
        onScaleChange={setGalaxyScale}
        onOffsetChange={setGalaxyOffset}
        onNodesPositioned={setPositionedNotes}
        theme={currentTheme}
      />
    );
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-gradient-to-br from-background via-background/95 to-background/90">
      {/* Main Content Area */}
      <main className="h-screen w-full relative">
        {renderMainContent()}
        
        {/* Node Preview Overlay */}
        <NodePreview
          note={hoveredNote}
          position={nodePreviewPosition}
          isVisible={!!hoveredNote && !showNoteInspector}
        />
      </main>

      <div className="fixed top-4 right-4 z-40 flex items-center gap-2">
        {currentNotes.length > 0 && (
          <FocusMode
            isActive={isFocusMode}
            onToggle={() => setIsFocusMode(!isFocusMode)}
          />
        )}
        <ThemeSelector
          currentTheme={currentTheme}
          onThemeChange={handleThemeChange}
        />
        <UserNav />
      </div>

      {/* Enhanced Search Bar */}
      {currentNotes.length > 0 && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-40">
          <GalaxySearch
            notes={currentNotes}
            onSearchResults={handleSearchResults}
            onClearSearch={handleClearSearch}
          />
        </div>
      )}

      {/* Focus Mode Toggle */}
      {/* This is now part of the top-right container */}

      {/* Theme Selector */}
      {/* This is now part of the top-right container */}

      {/* Enhanced Mini Map */}
      {currentNotes.length > 0 && (
        <GalaxyMiniMap
          notes={positionedNotes}
          scale={galaxyScale}
          offset={galaxyOffset}
          onNavigate={handleNavigateToNode}
          onReset={handleResetGalaxy}
        />
      )}

      {/* Enhanced Speed Dial */}
      <SpeedDial
        onGenerateClick={() => setShowGeneratePanel(true)}
        onHistoryClick={() => setShowHistoryPanel(true)}
        onSearchClick={() => toast({ title: "Search 🔍", description: "Use the search bar at the top!" })}
        onExportClick={handleExport}
        onSettingsClick={() => toast({ title: "Settings ⚙️", description: "Use the theme selector!" })}
        onHelpClick={() => setShowKeyboardShortcuts(true)}
        onAchievementClick={() => setShowAchievements(true)}
        additionalActions={[
          {
            component: <ExportGalaxy notes={currentNotes} galaxyCanvasRef={galaxyRef} />,
            position: 'top'
          }
        ]}
      />

      {/* Side Panels */}
      <GeneratePanel
        isOpen={showGeneratePanel}
        onClose={() => setShowGeneratePanel(false)}
        onGenerate={handleGenerate}
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

      {/* Achievement System */}
      <AchievementSystem
        isOpen={showAchievements}
        onClose={() => setShowAchievements(false)}
        userStats={userStats}
      />

      {/* Keyboard Shortcuts Dialog */}
      <KeyboardShortcuts
        isOpen={showKeyboardShortcuts}
        onClose={() => setShowKeyboardShortcuts(false)}
      />
    </div>
  );
};

export default Index;
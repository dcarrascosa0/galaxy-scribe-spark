
import React, { useState, useEffect, useRef } from 'react';
import KnowledgeGalaxy from '@/components/KnowledgeGalaxy';
import GalaxyPlaceholder from '@/components/GalaxyPlaceholder';
import LoadingProgress from '@/components/LoadingProgress';
import SpeedDial from '@/components/SpeedDial';
import GeneratePanel, { GenerateConfig } from '@/components/GeneratePanel';
import HistoryPanel from '@/components/HistoryPanel';
import NoteInspector from '@/components/NoteInspector';
import GalaxySearch from '@/components/GalaxySearch';
import FocusMode from '@/components/FocusMode';
import GalaxyMiniMap from '@/components/GalaxyMiniMap';
import KeyboardShortcuts from '@/components/KeyboardShortcuts';
import ThemeSelector from '@/components/ThemeSelector';
import ExportGalaxy from '@/components/ExportGalaxy';
import AchievementSystem from '@/components/AchievementSystem';
import NodePreview from '@/components/NodePreview';
import { toast } from '@/hooks/use-toast';

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

  // Enhanced mock data with importance and tags
  const mockNotes: Note[] = [
    {
      id: '1',
      title: 'Machine Learning Fundamentals',
      content: 'Machine Learning is a subset of artificial intelligence that enables computers to learn and make decisions from data without being explicitly programmed for every scenario.\n\nKey concepts include:\n- Supervised Learning: Learning from labeled data\n- Unsupervised Learning: Finding patterns in unlabeled data\n- Reinforcement Learning: Learning through interaction and feedback\n\nApplications span across industries from healthcare to finance, making it one of the most transformative technologies of our time.',
      depth: 0,
      importance: 5,
      tags: ['AI', 'Technology', 'Data Science'],
      lastViewed: new Date(),
      children: [
        {
          id: '2',
          title: 'Supervised Learning',
          content: 'Supervised learning uses labeled training data to learn a mapping from inputs to outputs. The algorithm learns from examples where both the input and correct output are provided.\n\nTypes include:\n- Classification: Predicting categories (spam vs. not spam)\n- Regression: Predicting continuous values (house prices)\n\nCommon algorithms: Linear Regression, Decision Trees, Random Forest, Support Vector Machines, Neural Networks.',
          depth: 1,
          importance: 4,
          tags: ['Machine Learning', 'Algorithms'],
          children: [
            {
              id: '3',
              title: 'Linear Regression',
              content: 'Linear regression is a fundamental supervised learning algorithm that models the relationship between a dependent variable and independent variables using a linear equation.\n\nKey concepts:\n- Simple Linear Regression: One independent variable\n- Multiple Linear Regression: Multiple independent variables\n- Assumptions: Linearity, independence, homoscedasticity\n\nUse cases: Predicting sales, analyzing relationships between variables, forecasting trends.',
              depth: 2,
              importance: 3,
              tags: ['Regression', 'Statistics'],
              children: []
            }
          ]
        },
        {
          id: '4',
          title: 'Unsupervised Learning',
          content: 'Unsupervised learning finds hidden patterns in data without labeled examples. The algorithm must discover structure in the input data on its own.\n\nMain types:\n- Clustering: Grouping similar data points\n- Association Rules: Finding relationships between variables\n- Dimensionality Reduction: Simplifying data while preserving important information\n\nApplications: Customer segmentation, anomaly detection, data compression.',
          depth: 1,
          importance: 4,
          tags: ['Machine Learning', 'Clustering'],
          children: []
        }
      ]
    }
  ];

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

  const simulateGeneration = async (config: GenerateConfig) => {
    setIsGenerating(true);
    setShowGeneratePanel(false);
    
    const phases = [
      { name: 'Initializing AI', duration: 1200, status: 'Preparing advanced neural networks...' },
      { name: 'Analyzing Context', duration: 1800, status: 'Understanding knowledge domain...' },
      { name: 'Building Structure', duration: 2500, status: 'Creating interconnected hierarchy...' },
      { name: 'Generating Content', duration: 3500, status: 'Writing comprehensive notes...' },
      { name: 'Optimizing Layout', duration: 1000, status: 'Positioning nodes in space...' },
      { name: 'Finalizing Galaxy', duration: 800, status: 'Adding visual enhancements...' }
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
          totalProgress += 1.5;
          if (totalProgress >= endProgress) {
            totalProgress = endProgress;
            setGenerationProgress(totalProgress);
            clearInterval(interval);
            resolve(void 0);
          } else {
            setGenerationProgress(totalProgress);
          }
        }, phase.duration / (progressIncrement / 1.5));
      });
    }

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
    
    // Update user stats
    updateUserStats({
      notesCreated: userStats.notesCreated + 1,
      sessionsCount: userStats.sessionsCount + 1,
      deepestDepth: Math.max(userStats.deepestDepth, config.depth)
    });
    
    toast({
      title: "Knowledge Galaxy Generated! ✨",
      description: `Successfully created notes for "${config.topic}" with enhanced AI`,
    });
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
      {currentNotes.length > 0 && (
        <FocusMode
          isActive={isFocusMode}
          onToggle={() => setIsFocusMode(!isFocusMode)}
        />
      )}

      {/* Theme Selector */}
      <div className="fixed top-4 right-20 z-40">
        <ThemeSelector
          currentTheme={currentTheme}
          onThemeChange={handleThemeChange}
        />
      </div>

      {/* Enhanced Mini Map */}
      {currentNotes.length > 0 && (
        <GalaxyMiniMap
          notes={currentNotes}
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

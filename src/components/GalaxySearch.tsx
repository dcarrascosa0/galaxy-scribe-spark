
import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Note {
  id: string;
  title: string;
  content: string;
  children: Note[];
  depth: number;
}

interface GalaxySearchProps {
  notes: Note[];
  onSearchResults: (results: Note[]) => void;
  onClearSearch: () => void;
}

const GalaxySearch: React.FC<GalaxySearchProps> = ({
  notes,
  onSearchResults,
  onClearSearch
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  const searchNotes = (term: string, noteList: Note[]): Note[] => {
    const results: Note[] = [];
    
    const searchRecursive = (note: Note) => {
      if (note.title.toLowerCase().includes(term.toLowerCase()) ||
          note.content.toLowerCase().includes(term.toLowerCase())) {
        results.push(note);
      }
      note.children.forEach(searchRecursive);
    };
    
    noteList.forEach(searchRecursive);
    return results;
  };

  useEffect(() => {
    if (searchTerm.trim()) {
      const results = searchNotes(searchTerm, notes);
      onSearchResults(results);
    } else {
      onClearSearch();
    }
  }, [searchTerm, notes, onSearchResults, onClearSearch]);

  const handleClear = () => {
    setSearchTerm('');
    onClearSearch();
  };

  return (
    <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-40 transition-all duration-300 ${
      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
    }`}>
      <div className="glass-panel rounded-full px-4 py-2 flex items-center gap-2 min-w-[300px]">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search your knowledge galaxy..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsVisible(true)}
          className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-muted-foreground"
        />
        {searchTerm && (
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6"
            onClick={handleClear}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default GalaxySearch;

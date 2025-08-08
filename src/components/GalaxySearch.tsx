import React, { useState, useEffect, useMemo } from 'react';
import { Input } from '@/components/ui/input';

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

interface GalaxySearchProps {
  notes: Note[];
  onSearchResults: (results: Note[]) => void;
  onClearSearch: () => void;
}

// Recursively flatten notes
const flattenNotes = (notes: Note[]): Note[] => {
  return notes.reduce<Note[]>((acc, note) => {
    acc.push(note);
    if (note.children && note.children.length > 0) {
      acc.push(...flattenNotes(note.children));
    }
    return acc;
  }, []);
};

const GalaxySearch: React.FC<GalaxySearchProps> = ({ notes, onSearchResults, onClearSearch }) => {
  const [query, setQuery] = useState('');

  const allNotes = useMemo(() => flattenNotes(notes), [notes]);

  useEffect(() => {
    const handler = setTimeout(() => {
      const value = query.trim();
      if (value === '') {
        onClearSearch();
        return;
      }
      const results = allNotes.filter((note) =>
        note.title.toLowerCase().includes(value.toLowerCase())
      );
      onSearchResults(results);
    }, 300);

    return () => clearTimeout(handler);
  }, [query, allNotes, onSearchResults, onClearSearch]);

  return (
    <Input
      type="text"
      className="w-80"
      placeholder="Search notes by title..."
      aria-label="Search notes by title"
      value={query}
      onChange={(e) => setQuery(e.target.value)}
    />
  );
};

export default GalaxySearch;

import React, { useState } from 'react';

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    if (value.trim() === '') {
      onClearSearch();
      return;
    }
    const allNotes = flattenNotes(notes);
    const results = allNotes.filter(note =>
      note.title.toLowerCase().includes(value.toLowerCase())
    );
    onSearchResults(results);
  };

  return (
    <input
      type="text"
      className="input input-bordered w-80"
      placeholder="Search notes by title..."
      value={query}
      onChange={handleChange}
      style={{ padding: '0.5rem 1rem', borderRadius: 8, border: '1px solid #ccc' }}
    />
  );
};

export default GalaxySearch;

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchResult } from '../types/search';
import { fetchGlobalSearch } from '../lib/api';

export function useSearch(initialQuery = '') {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const navigate = useNavigate();

  // PRODUCTION: Connect to backend search API
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim()) {
        try {
          const found = await fetchGlobalSearch(query);
          setResults(found);
          setSelectedIndex(-1);
        } catch (err) {
          console.error('Search failure:', err);
        }
      } else {
        setResults([]);
      }
    }, 150); // 150ms debounce

    return () => clearTimeout(timer);
  }, [query]);

  const handleKeyDown = useCallback((e: KeyboardEvent | React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === 'Enter') {
      if (selectedIndex >= 0) {
        navigate(results[selectedIndex].url);
        setIsOpen(false);
      } else if (query.trim()) {
        navigate(`/search?q=${encodeURIComponent(query)}`);
        setIsOpen(false);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  }, [results, selectedIndex, query, navigate]);

  // Global shortcut: ⌘K / Ctrl+K
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  return {
    query,
    setQuery,
    results,
    isOpen,
    setIsOpen,
    selectedIndex,
    setSelectedIndex,
    handleKeyDown
  };
}

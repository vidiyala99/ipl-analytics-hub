import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSearch } from '../../hooks/useSearch';

const GlobalSearch: React.FC = () => {
  const {
    query,
    setQuery,
    results,
    isOpen,
    setIsOpen,
    selectedIndex,
    setSelectedIndex,
    handleKeyDown
  } = useSearch();
  
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setIsOpen]);

  return (
    <div className={`relative w-full max-w-md ${isOpen ? 'z-50' : ''}`} ref={containerRef}>
      <div className="topbar-search">
        <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>⌕</span>
        <input
          ref={inputRef}
          type="text"
          placeholder="Search player, team, venue…"
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => handleKeyDown(e)}
        />
        <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', border: '1px solid var(--border)', padding: '2px 6px', borderRadius: '4px' }}>
          {navigator.platform.indexOf('Mac') > -1 ? '⌘K' : 'Ctrl+K'}
        </span>
      </div>

      {isOpen && (query.trim() || results.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-stadium-mid/95 backdrop-blur-xl border border-pitch/30 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
            {results.length > 0 ? (
              results.map((result, index) => (
                <div
                  key={result.id}
                  onClick={() => {
                    const targetUrl = result.type === 'player' 
                      ? `/player/${encodeURIComponent(result.title)}` 
                      : result.url;
                    navigate(targetUrl);
                    setIsOpen(false);
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`p-4 cursor-pointer border-l-4 transition-all ${
                    selectedIndex === index 
                      ? 'bg-white/10 border-pitch active-search-item' 
                      : 'border-transparent hover:bg-white/5'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-bebas text-lg tracking-wider text-white">
                        {result.title}
                      </div>
                      <div className="text-xs text-text-muted uppercase font-mono tracking-tighter">
                        {result.subtitle}
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                      result.type === 'player' ? 'bg-ember/20 text-ember' :
                      result.type === 'team' ? 'bg-pitch/20 text-pitch' :
                      result.type === 'venue' ? 'bg-neon-green/20 text-neon-green' : 'bg-white/10 text-white'
                    }`}>
                      {result.type}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-text-muted">
                <div className="text-2xl mb-2">🕵️‍♂️</div>
                <div className="font-mono text-sm">No encrypted records match "{query}"</div>
              </div>
            )}
          </div>
          
          <div className="p-3 bg-white/5 border-t border-white/5 flex justify-between items-center text-[10px] text-text-muted font-mono uppercase tracking-widest">
            <div>↑↓ to navigate</div>
            <div>↵ to select</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GlobalSearch;

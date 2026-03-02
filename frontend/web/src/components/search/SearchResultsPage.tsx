import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams, Link } from 'react-router-dom';
import { fetchGlobalSearch } from '../../lib/api';
import { SearchResult, SearchResultType } from '../../types/search';

const SearchResultsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [activeTab, setActiveTab] = useState<SearchResultType>('all');

  const { data: results = [], isLoading } = useQuery<SearchResult[]>({
    queryKey: ['globalSearch', query],
    queryFn: () => fetchGlobalSearch(query),
    enabled: !!query,
  });
  
  const filteredResults = useMemo(() => {
    if (activeTab === 'all') return results;
    return results.filter(r => r.type === activeTab);
  }, [results, activeTab]);

  const tabs: { id: SearchResultType; label: string }[] = [
    { id: 'all', label: 'All Results' },
    { id: 'player', label: 'Players' },
    { id: 'team', label: 'Teams' },
    { id: 'venue', label: 'Venues' },
  ];

  return (
    <div className="page-content">
      <div className="section-card">
        <div className="section-card-header">
          <div className="section-card-title">
            <div className="section-card-title-icon icon-pitch">🔍</div>
            <div>
              <h3>Search Intelligence</h3>
              <p>Analyzing matching sequences for "{query}"</p>
            </div>
          </div>
          <div className="flex gap-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-xl border transition-all text-xs font-mono uppercase tracking-widest ${
                  activeTab === tab.id
                    ? 'bg-pitch/20 border-pitch text-white shadow-[0_0_15px_rgba(200,169,110,0.2)]'
                    : 'bg-white/5 border-border/50 text-text-muted hover:bg-white/10'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8">
          {filteredResults.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResults.map(result => (
                <Link
                  key={result.id}
                  to={result.type === 'player' ? `/player/${encodeURIComponent(result.title)}` : result.url}
                  className="bg-white/5 border border-border/30 rounded-2xl p-6 hover:border-pitch/50 transition-all group overflow-hidden relative"
                >
                  <div className="absolute top-0 right-0 p-3">
                    <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                      result.type === 'player' ? 'bg-ember/20 text-ember' :
                      result.type === 'team' ? 'bg-pitch/20 text-pitch' :
                      result.type === 'venue' ? 'bg-neon-green/20 text-neon-green' : 'bg-white/10 text-white'
                    }`}>
                      {result.type}
                    </div>
                  </div>

                  <div className="font-bebas text-2xl tracking-wider text-white group-hover:text-pitch transition-colors">
                    {result.title}
                  </div>
                  <div className="text-xs text-text-muted uppercase font-mono tracking-widest mb-4">
                    {result.subtitle}
                  </div>

                  <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-2 gap-4">
                    {result.type === 'player' && result.metadata?.runs && (
                      <div>
                        <div className="text-[10px] text-text-muted uppercase font-mono">Total Runs</div>
                        <div className="text-xl font-bebas text-white">{result.metadata.runs.toLocaleString()}</div>
                      </div>
                    )}
                    {result.type === 'player' && result.metadata?.wickets && (
                      <div>
                        <div className="text-[10px] text-text-muted uppercase font-mono">Total Wickets</div>
                        <div className="text-xl font-bebas text-white">{result.metadata.wickets}</div>
                      </div>
                    )}
                    {result.type === 'team' && result.metadata?.wins && (
                      <div>
                        <div className="text-[10px] text-text-muted uppercase font-mono">Total Wins</div>
                        <div className="text-xl font-bebas text-white">{result.metadata.wins}</div>
                      </div>
                    )}
                    {result.type === 'venue' && result.metadata?.city && (
                      <div>
                        <div className="text-[10px] text-text-muted uppercase font-mono">City</div>
                        <div className="text-xl font-bebas text-white">{result.metadata.city}</div>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-6 flex items-center text-xs font-mono text-pitch opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-10px] group-hover:translate-x-0">
                    ACCESS SOURCE PROTOCOL →
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center">
              <div className="text-6xl mb-6 grayscale opacity-30">📡</div>
              <h4 className="text-xl font-bebas text-white mb-2">No Match in Local Frequency</h4>
              <p className="text-text-muted max-w-md mx-auto font-mono text-sm uppercase tracking-wider">
                Encryption key "{query}" produced zero valid data sectors. Broaden your query or try a different filter.
              </p>
              
              <div className="mt-12">
                <p className="text-[10px] text-text-muted uppercase tracking-[0.3em] font-mono mb-6">Suggested Sequences</p>
                <div className="flex flex-wrap justify-center gap-3">
                  {['Kohli', 'Iyer', 'Mumbai Indians', 'Eden Gardens', '2024'].map(term => (
                    <Link
                      key={term}
                      to={`/search?q=${term}`}
                      className="px-4 py-2 rounded-full border border-border/50 bg-white/5 text-xs text-white hover:border-pitch hover:bg-pitch/10 transition-all font-mono"
                    >
                      {term}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchResultsPage;

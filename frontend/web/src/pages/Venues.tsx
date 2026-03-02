import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchVenues, VenueStats } from '../lib/api';
import { useSearch } from '../App';

const Venues: React.FC = () => {
  const { searchQuery } = useSearch();
  const { data: venues, isLoading, isError } = useQuery<VenueStats[]>({
    queryKey: ['venues', searchQuery],
    queryFn: () => fetchVenues(searchQuery),
  });

  return (
    <div className="page-content">
      <div className="section-card">
        <div className="section-card-header">
          <div className="section-card-title">
            <div className="section-card-title-icon icon-pitch">🗺️</div>
            <div>
              <h3>Stadium Intelligence</h3>
              <p>Venue-specific scoring patterns & toss advantage</p>
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            <div className="col-span-full py-20 text-center text-text-muted">Loading venue records...</div>
          ) : isError ? (
            <div className="col-span-full py-20 text-center text-ember">Problem loading stadium data.</div>
          ) : (
            venues?.map((venue) => (
              <div key={venue.venue} className="bg-white/5 border border-border/30 rounded-2xl overflow-hidden hover:border-pitch/50 transition-all group">
                <div className="h-32 bg-stadium-mid flex items-center justify-center text-4xl group-hover:bg-stadium-dark transition-colors">
                  🏟️
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-xl font-bebas tracking-wide text-white">{venue.venue}</h4>
                      <p className="text-xs text-text-muted font-mono uppercase tracking-widest">{venue.city}, {venue.country}</p>
                    </div>
                    <div className="bg-pitch/20 text-pitch px-3 py-1 rounded-full text-xs font-bold border border-pitch/30">
                      {venue.total_matches} MTCH
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-4">
                    <div className="bg-white/5 p-3 rounded-xl border border-border/20">
                      <div className="text-[10px] text-text-muted uppercase font-mono">Run Rate</div>
                      <div className="text-xl font-bebas text-white">{venue.avg_runs_per_over?.toFixed(2) || 'N/A'}</div>
                    </div>
                    <div className="bg-white/5 p-3 rounded-xl border border-border/20">
                      <div className="text-[10px] text-text-muted uppercase font-mono">Avg/Wkt</div>
                      <div className="text-xl font-bebas text-white">{venue.avg_runs_per_wicket?.toFixed(2) || 'N/A'}</div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <div className="flex justify-between text-xs font-mono text-text-muted mb-1">
                      <span>Toss Winner Win %</span>
                      <span className="text-pitch font-bold">{(venue.toss_winner_win_percentage * 100).toFixed(1)}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-stadium-dark rounded-full overflow-hidden border border-border/20">
                      <div 
                        className="h-full bg-pitch" 
                        style={{ width: `${venue.toss_winner_win_percentage * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Venues;

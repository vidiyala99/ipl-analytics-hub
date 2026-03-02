import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchBattingLeaderboard, PlayerBatting } from '../lib/api';
import { useSearch } from '../App';

const Batting: React.FC = () => {
  const [sortBy, setSortBy] = useState('total_runs');
  const [limit, setLimit] = useState(25);
  const { searchQuery } = useSearch();

  const { data: players, isLoading, isError } = useQuery<PlayerBatting[]>({
    queryKey: ['batting', sortBy, limit, searchQuery],
    queryFn: () => fetchBattingLeaderboard(sortBy, limit, searchQuery),
  });

  return (
    <div className="page-content">
      <div className="section-card">
        <div className="section-card-header">
          <div className="section-card-title">
            <div className="section-card-title-icon icon-ember">🏏</div>
            <div>
              <h3>Batting Leaderboard</h3>
              <p>Performance analysis across all seasons</p>
            </div>
          </div>
          <div className="flex gap-4 items-center">
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="topbar-btn btn-ghost"
            >
              <option value="total_runs">Total Runs</option>
              <option value="average">Batting Average</option>
              <option value="strike_rate">Strike Rate</option>
              <option value="hundreds">Hundreds</option>
              <option value="fifties">Fifties</option>
            </select>
            <select 
              value={limit} 
              onChange={(e) => setLimit(Number(e.target.value))}
              className="topbar-btn btn-ghost"
            >
              <option value={10}>Top 10</option>
              <option value={25}>Top 25</option>
              <option value={50}>Top 50</option>
              <option value={100}>Top 100</option>
            </select>
          </div>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border text-text-muted text-sm uppercase tracking-wider font-mono">
                <th className="pb-4 pl-4 font-normal">Rank</th>
                <th className="pb-4 font-normal">Player</th>
                <th className="pb-4 font-normal text-right">Runs</th>
                <th className="pb-4 font-normal text-right">Avg</th>
                <th className="pb-4 font-normal text-right">SR</th>
                <th className="pb-4 font-normal text-right">100s</th>
                <th className="pb-4 font-normal text-right pr-4">50s</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-20 text-center text-text-muted">
                    Decrypting performance data...
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={7} className="py-20 text-center text-ember">
                    Error loading database. Check connection.
                  </td>
                </tr>
              ) : (
                players?.map((player, index) => (
                  <tr key={player.player_name} className="hover:bg-white/5 transition-colors group">
                    <td className="py-4 pl-4 font-mono text-text-muted">#{index + 1}</td>
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs lb-avatar-bg-${(index % 5) + 1}`}>
                          {player.player_name.charAt(0)}
                        </div>
                        <div>
                        <Link to={`/player/${encodeURIComponent(player.player_name)}`}>
                          <div className="font-semibold text-white group-hover:text-pitch transition-colors underline decoration-pitch/0 hover:decoration-pitch/100">{player.player_name}</div>
                          <div className="text-xs text-text-muted">IPL Legend</div>
                        </Link>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 text-right font-mono text-pitch font-bold">{player.total_runs.toLocaleString()}</td>
                    <td className="py-4 text-right font-mono text-white">{player.batting_average?.toFixed(2) || '0.00'}</td>
                    <td className="py-4 text-right font-mono text-white">{player.strike_rate?.toFixed(2) || '0.00'}</td>
                    <td className="py-4 text-right font-mono text-ember">{player.hundreds}</td>
                    <td className="py-4 text-right font-mono text-amber-400 pr-4">{player.fifties}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Batting;

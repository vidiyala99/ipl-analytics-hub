import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchBowlingLeaderboard } from '../lib/api';
import { useSearch } from '../App';

interface PlayerBowling {
  player_name: string;
  total_wickets: number;
  bowling_average: number;
  economy_rate: number;
  bowling_strike_rate: number;
  four_wicket_hauls: number;
  five_wicket_hauls: number;
}

const Bowling: React.FC = () => {
  const [sortBy, setSortBy] = useState('wickets');
  const [limit, setLimit] = useState(25);
  const { searchQuery } = useSearch();

  const { data: players, isLoading, isError } = useQuery<PlayerBowling[]>({
    queryKey: ['bowling', sortBy, limit, searchQuery],
    queryFn: () => fetchBowlingLeaderboard(sortBy, limit, searchQuery),
  });

  return (
    <div className="page-content">
      <div className="section-card">
        <div className="section-card-header">
          <div className="section-card-title">
            <div className="section-card-title-icon icon-pitch">🎳</div>
            <div>
              <h3>Bowling Leaderboard</h3>
              <p>Wicket-takers and economy specialists</p>
            </div>
          </div>
          <div className="flex gap-4 items-center">
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="topbar-btn btn-ghost"
            >
              <option value="wickets">Most Wickets</option>
              <option value="economy">Economy Rate</option>
              <option value="average">Bowling Average</option>
              <option value="strike_rate">Strike Rate</option>
              <option value="five_wkt_hauls">5-Wkt Hauls</option>
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
                <th className="pb-4 font-normal text-right">Wkts</th>
                <th className="pb-4 font-normal text-right">Econ</th>
                <th className="pb-4 font-normal text-right">Avg</th>
                <th className="pb-4 font-normal text-right">SR</th>
                <th className="pb-4 font-normal text-right pr-4">5W</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-20 text-center text-text-muted">
                    Syncing bowling statistics...
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={7} className="py-20 text-center text-ember">
                    Failed to retrieve bowling data.
                  </td>
                </tr>
              ) : (
                players?.map((player, index) => (
                  <tr key={player.player_name} className="hover:bg-white/5 transition-colors group">
                    <td className="py-4 pl-4 font-mono text-text-muted">#{index + 1}</td>
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs lb-avatar-bg-${((index + 2) % 5) + 1}`}>
                          {player.player_name.charAt(0)}
                        </div>
                        <div>
                        <Link to={`/player/${encodeURIComponent(player.player_name)}`}>
                          <div className="font-semibold text-white group-hover:text-neon-green transition-colors underline decoration-neon-green/0 hover:decoration-neon-green/100">{player.player_name}</div>
                          <div className="text-xs text-text-muted">Strike Bowler</div>
                        </Link>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 text-right font-mono text-neon-green font-bold">{player.total_wickets}</td>
                    <td className="py-4 text-right font-mono text-white">{player.economy_rate?.toFixed(2) || '0.00'}</td>
                    <td className="py-4 text-right font-mono text-white">{player.bowling_average?.toFixed(2) || '0.00'}</td>
                    <td className="py-4 text-right font-mono text-white">{player.bowling_strike_rate?.toFixed(2) || '0.00'}</td>
                    <td className="py-4 text-right font-mono text-ember pr-4">{player.five_wicket_hauls}</td>
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

export default Bowling;

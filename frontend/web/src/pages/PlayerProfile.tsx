import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchPlayerProfile, PlayerProfile as PlayerProfileData } from '../lib/api';

const PlayerProfile: React.FC = () => {
  const { playerName } = useParams<{ playerName: string }>();

  const { data: profile, isLoading, isError } = useQuery<PlayerProfileData>({
    queryKey: ['playerProfile', playerName],
    queryFn: () => fetchPlayerProfile(playerName || ''),
    enabled: !!playerName,
  });

  if (isLoading) return <div className="page-content text-center py-20 text-text-muted">Accessing encrypted player records...</div>;
  if (isError || !profile) return <div className="page-content text-center py-20 text-ember">Failed to decrypt player profile. Connection lost.</div>;

  return (
    <div className="page-content">
      {/* Player Header Card */}
      <div className="section-card mb-8 p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-pitch/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
        
        <div className="flex flex-col md:flex-row gap-8 items-center relative z-10">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-pitch to-pitch-dark flex items-center justify-center text-4xl font-bebas text-stadium-dark shadow-[0_0_30px_rgba(200,169,110,0.3)]">
            {profile.player.player_name.charAt(0)}
          </div>
          
          <div className="text-center md:text-left flex-1">
            <h2 className="text-5xl font-bebas tracking-wider text-white mb-2">{profile.player.player_name}</h2>
            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
              {profile.player.teams.map(team => (
                <span key={team} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] uppercase font-mono tracking-widest text-text-muted">
                  {team}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-[10px] text-text-muted uppercase font-mono mb-1">Matches</div>
              <div className="text-3xl font-bebas text-white">{profile.player.matches}</div>
            </div>
            <div className="text-center">
              <div className="text-[10px] text-pitch uppercase font-mono mb-1">Runs</div>
              <div className="text-3xl font-bebas text-white">{profile.player.total_runs.toLocaleString()}</div>
            </div>
            <div className="text-center">
              <div className="text-[10px] text-neon-green uppercase font-mono mb-1">Wickets</div>
              <div className="text-3xl font-bebas text-white">{profile.player.total_wickets}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Batting History */}
        {profile.batting.length > 0 && (
          <div className="section-card">
            <div className="section-card-header">
              <div className="section-card-title">
                <div className="section-card-title-icon icon-ember">🏏</div>
                <h3>Batting Trajectory</h3>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-sm">
                <thead>
                  <tr className="border-b border-white/5 text-text-muted">
                    <th className="py-4">Season</th>
                    <th className="py-4">Team</th>
                    <th className="py-4 text-right">Runs</th>
                    <th className="py-4 text-right">Avg</th>
                    <th className="py-4 text-right">SR</th>
                    <th className="py-4 text-right">100/50</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {profile.batting.map(row => (
                    <tr key={row.season} className="hover:bg-white/5 transition-colors">
                      <td className="py-4 text-white font-bold">{row.season}</td>
                      <td className="py-4 text-text-muted text-xs">{row.team}</td>
                      <td className="py-4 text-right text-pitch">{row.total_runs}</td>
                      <td className="py-4 text-right text-white">{row.average}</td>
                      <td className="py-4 text-right text-white">{row.strike_rate}</td>
                      <td className="py-4 text-right text-ember">{row.hundreds}/{row.fifties}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Bowling History */}
        {profile.bowling.length > 0 && (
          <div className="section-card">
            <div className="section-card-header">
              <div className="section-card-title">
                <div className="section-card-title-icon icon-pitch">🎳</div>
                <h3>Bowling Protocol</h3>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-sm">
                <thead>
                  <tr className="border-b border-white/5 text-text-muted">
                    <th className="py-4">Season</th>
                    <th className="py-4">Team</th>
                    <th className="py-4 text-right">Wkts</th>
                    <th className="py-4 text-right">Econ</th>
                    <th className="py-4 text-right">Avg</th>
                    <th className="py-4 text-right">5W</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {profile.bowling.map(row => (
                    <tr key={row.season} className="hover:bg-white/5 transition-colors">
                      <td className="py-4 text-white font-bold">{row.season}</td>
                      <td className="py-4 text-text-muted text-xs">{row.team}</td>
                      <td className="py-4 text-right text-neon-green font-bold">{row.wickets}</td>
                      <td className="py-4 text-right text-white">{row.economy}</td>
                      <td className="py-4 text-right text-white">{row.average}</td>
                      <td className="py-4 text-right text-ember">{row.five_w}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayerProfile;

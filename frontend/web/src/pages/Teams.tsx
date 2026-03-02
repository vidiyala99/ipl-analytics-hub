import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchTeams, fetchTeamSeasons, TeamStats, TeamSeason } from '../lib/api';
import { useSearch } from '../App';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const Teams: React.FC = () => {
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const { searchQuery } = useSearch();

  const { data: teams, isLoading: isTeamsLoading } = useQuery<TeamStats[]>({
    queryKey: ['teams', searchQuery],
    queryFn: () => fetchTeams(searchQuery),
  });

  // Use useEffect to handle initial selection since onSuccess is removed in v5
  React.useEffect(() => {
    if (Array.isArray(teams) && teams.length > 0 && !selectedTeam) {
      setSelectedTeam(teams[0].team);
    }
  }, [teams, selectedTeam]);

  const { data: seasonStats, isLoading: isSeasonsLoading } = useQuery<TeamSeason[]>({
    queryKey: ['teamSeasons', selectedTeam],
    queryFn: () => fetchTeamSeasons(selectedTeam!),
    enabled: !!selectedTeam,
  });

  return (
    <div className="page-content">
      <div className="two-col" style={{ gridTemplateColumns: '1fr 2fr' }}>
        {/* Teams List */}
        <div className="section-card">
          <div className="section-card-header">
            <div className="section-card-title">
              <div className="section-card-title-icon icon-pitch">🛡️</div>
              <div>
                <h3>IPL Franchises</h3>
                <p>All-time win statistics</p>
              </div>
            </div>
          </div>
          <div className="mt-4 space-y-2 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {isTeamsLoading ? (
              <div className="p-8 text-center text-text-muted">Loading teams...</div>
            ) : (
              Array.isArray(teams) && teams.map((team) => (
                <button
                  key={team.team}
                  onClick={() => setSelectedTeam(team.team)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    selectedTeam === team.team
                      ? 'bg-pitch/20 border-pitch shadow-[0_0_20px_rgba(200,169,110,0.2)]'
                      : 'bg-white/5 border-border/50 hover:bg-white/10 hover:border-pitch/50'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div className="font-bebas text-xl tracking-wider text-white">{team.team}</div>
                    <div className="text-pitch font-mono font-bold">{((team.wins / team.matches) * 100).toFixed(1)}%</div>
                  </div>
                  <div className="flex gap-3 mt-2 text-xs font-mono text-text-muted">
                    <span>M: {team.matches}</span>
                    <span>W: {team.wins}</span>
                    <span>L: {team.losses}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Team Season Performance */}
        <div className="section-card">
          <div className="section-card-header">
            <div className="section-card-title">
              <div className="section-card-title-icon icon-ember">📈</div>
              <div>
                <h3>{selectedTeam || 'Select a Team'} Performance</h3>
                <p>Season-by-season breakdown</p>
              </div>
            </div>
          </div>

          <div className="mt-8 h-[400px] w-full bg-stadium-mid/30 rounded-2xl p-6 border border-border/50">
            {isSeasonsLoading ? (
              <div className="h-full flex items-center justify-center text-text-muted">Analyzing historical records...</div>
            ) : Array.isArray(seasonStats) ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={seasonStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis 
                    dataKey="season" 
                    stroke="rgba(255,255,255,0.4)" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false}
                    tick={{ fill: 'rgba(255,255,255,0.6)' }}
                  />
                  <YAxis 
                    stroke="rgba(255,255,255,0.4)" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false}
                    tick={{ fill: 'rgba(255,255,255,0.6)' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                        backgroundColor: 'rgba(13, 21, 32, 0.95)', 
                        borderColor: 'var(--pitch)',
                        borderRadius: '12px',
                        borderWidth: '2px',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                        backdropFilter: 'blur(10px)'
                    }}
                    itemStyle={{ color: 'white' }}
                  />
                  <Legend verticalAlign="top" height={36}/>
                  <Bar name="Wins" dataKey="total_wins" fill="var(--neon-green)" radius={[4, 4, 0, 0]} />
                  <Bar name="Losses" dataKey="total_losses" fill="var(--ember)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-text-muted">No season data found for this team.</div>
            )}
          </div>

          <div className="mt-8 grid grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-white/5 border border-border/30">
                <div className="text-xs text-text-muted uppercase tracking-widest font-mono">Best Season</div>
                <div className="text-2xl font-bebas text-white mt-1">
                    {Array.isArray(seasonStats) && [...seasonStats].sort((a,b) => b.win_percentage - a.win_percentage)[0]?.season || 'N/A'}
                </div>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-border/30">
                <div className="text-xs text-text-muted uppercase tracking-widest font-mono">Total Wins</div>
                <div className="text-2xl font-bebas text-neon-green mt-1">
                    {Array.isArray(teams) && teams.find(t => t.team === selectedTeam)?.wins || 0}
                </div>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-border/30">
                <div className="text-xs text-text-muted uppercase tracking-widest font-mono">Win Rate</div>
                <div className="text-2xl font-bebas text-pitch mt-1">
                    {Array.isArray(teams) && teams.find(t => t.team === selectedTeam) ? 
                      (teams.find(t => t.team === selectedTeam)!.matches > 0 
                        ? ((teams.find(t => t.team === selectedTeam)!.wins / teams.find(t => t.team === selectedTeam)!.matches)*100).toFixed(1) + '%' 
                        : '0.0%')
                      : '0.0%'}
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Teams;

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchBattingLeaderboard, fetchBowlingLeaderboard, PlayerBatting, PlayerBowling } from './lib/api';
import Batting from './pages/Batting';
import Bowling from './pages/Bowling';
import Teams from './pages/Teams';
import Venues from './pages/Venues';
import PlayerProfile from './pages/PlayerProfile';
import GlobalSearch from './components/search/GlobalSearch';
import SearchResultsPage from './components/search/SearchResultsPage';

// Search Context
const SearchContext = React.createContext<{
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}>({
  searchQuery: '',
  setSearchQuery: () => {},
});

export const useSearch = () => React.useContext(SearchContext);

function Dashboard() {
  const { searchQuery } = useSearch();

  const { data: battingData, isLoading: isBattingLoading } = useQuery<PlayerBatting[]>({
    queryKey: ['battingLeaderboard', 'total_runs', 5, searchQuery],
    queryFn: () => fetchBattingLeaderboard('total_runs', 5, searchQuery),
  });

  const { data: bowlingData, isLoading: isBowlingLoading } = useQuery<PlayerBowling[]>({
    queryKey: ['bowlingLeaderboard', 'wickets', 5, searchQuery],
    queryFn: () => fetchBowlingLeaderboard('wickets', 5, searchQuery),
  });

  return (
    <div className="page-content">
      {/* Hero */}
      <div className="hero-header">
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div className="hero-eyebrow">
            <div className="live-chip">
              <div className="season-dot" style={{ width: '6px', height: '6px' }}></div>
              Live Data
            </div>
            <span className="season-tag">17 Seasons · 2008–2024</span>
          </div>
          <div className="hero-title">
            <div className="t-white">Cricket</div>
            <div className="t-ember">Intelligence</div>
            <div className="t-pitch">Hub</div>
          </div>
          <p className="hero-sub">
            Every delivery bowled. Every run scored. Every wicket taken. All 17 IPL seasons dissected into actionable intelligence.
          </p>
          <div className="hero-stats">
            <div className="hero-stat">
              <div className="hero-stat-num">1,169</div>
              <div className="hero-stat-label">Matches</div>
            </div>
            <div className="hero-stat-divider"></div>
            <div className="hero-stat">
              <div className="hero-stat-num">276K+</div>
              <div className="hero-stat-label">Deliveries</div>
            </div>
            <div className="hero-stat-divider"></div>
            <div className="hero-stat">
              <div className="hero-stat-num">700+</div>
              <div className="hero-stat-label">Players</div>
            </div>
            <div className="hero-stat-divider"></div>
            <div className="hero-stat">
              <div className="hero-stat-num">35</div>
              <div className="hero-stat-label">Venues</div>
            </div>
          </div>
        </div>
        <div className="cricket-ball-graphic">
          <div className="ball-outer"></div>
        </div>
        <div className="hero-bg-number">17</div>
      </div>

      {/* KPI Cards */}
      <div className="stats-grid">
        <div className="stat-card stat-card-1">
          <span className="stat-card-icon">🏆</span>
          <div className="stat-card-num">890</div>
          <div className="stat-card-label">Total Sixes Hit</div>
          <div className="stat-card-delta delta-up">↑ 12% vs 2023</div>
        </div>
        <div className="stat-card stat-card-2">
          <span className="stat-card-icon">🎯</span>
          <div className="stat-card-num">9.24</div>
          <div className="stat-card-label">Avg Run Rate</div>
          <div className="stat-card-delta delta-up">↑ Season high</div>
        </div>
        <div className="stat-card stat-card-3">
          <span className="stat-card-icon">⚡</span>
          <div className="stat-card-num">58%</div>
          <div className="stat-card-label">Chase Win Rate</div>
          <div className="stat-card-delta delta-neutral">→ Historical avg</div>
        </div>
        <div className="stat-card stat-card-4">
          <span className="stat-card-icon">🔮</span>
          <div className="stat-card-num">86%</div>
          <div className="stat-card-label">Model Accuracy</div>
          <div className="stat-card-delta delta-up">↑ Win Predictor</div>
        </div>
      </div>

      {/* Two Column: Leaderboard + Win Predictor */}
      <div className="stats-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
        {/* Top Run Scorers */}
        <div className="section-card">
          <div className="section-card-header">
            <div className="section-card-title">
              <div className="section-card-title-icon icon-ember">🏏</div>
              <div>
                <h3>Top Run Scorers</h3>
                <p>All-time IPL leaderboard</p>
              </div>
            </div>
            <Link to="/batting" className="view-all-btn">View All →</Link>
          </div>
          <div className="leaderboard">
            {isBattingLoading ? (
              <div className="p-8 text-center text-text-muted">Loading leaderboard...</div>
            ) : (
              battingData?.map((player, index) => (
                <Link to={`/player/${encodeURIComponent(player.player_name)}`} key={player.player_name} className="lb-row hover:bg-white/5 transition-colors cursor-pointer group">
                  <div className="lb-rank">#{index + 1}</div>
                  <div className="lb-player">
                    <div className={`lb-avatar lb-avatar-bg-${(index % 5) + 1}`}>
                      {index === 0 ? '🧔' : index === 1 ? '😎' : index === 2 ? '🧢' : '🏏'}
                    </div>
                    <div className="lb-player-info">
                        <div className="lb-player-name group-hover:text-pitch transition-colors">{player.player_name}</div>
                        <div className="lb-player-team">IPL Franchise</div>
                    </div>
                  </div>
                  <div className="lb-bar-container">
                    <div 
                      className="lb-bar" 
                      style={{ width: `${(player.total_runs / (battingData[0]?.total_runs || 1)) * 100}%` }}
                    ></div>
                  </div>
                  <div className="lb-value">{player.total_runs.toLocaleString()}<span>Runs</span></div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Top Wicket Takers */}
        <div className="section-card">
          <div className="section-card-header">
            <div className="section-card-title">
              <div className="section-card-title-icon icon-pitch">🎳</div>
              <div>
                <h3>Top Wicket Takers</h3>
                <p>Strike bowlers leaderboard</p>
              </div>
            </div>
            <Link to="/bowling" className="view-all-btn">View All →</Link>
          </div>
          <div className="leaderboard">
            {isBowlingLoading ? (
              <div className="p-8 text-center text-text-muted">Loading leaderboard...</div>
            ) : (
              bowlingData?.map((player, index) => (
                <Link to={`/player/${encodeURIComponent(player.player_name)}`} key={player.player_name} className="lb-row hover:bg-white/5 transition-colors cursor-pointer group">
                  <div className="lb-rank">#{index + 1}</div>
                  <div className="lb-player">
                    <div className={`lb-avatar lb-avatar-bg-${((index + 2) % 5) + 1}`}>
                      {index === 0 ? '🔥' : index === 1 ? '🎯' : index === 2 ? '⚡' : '🎳'}
                    </div>
                    <div className="lb-player-info">
                        <div className="lb-player-name group-hover:text-neon-green transition-colors">{player.player_name}</div>
                        <div className="lb-player-team">IPL Franchise</div>
                    </div>
                  </div>
                  <div className="lb-bar-container">
                    <div 
                      className="lb-bar bg-pitch" 
                      style={{ width: `${(player.total_wickets / (bowlingData[0]?.total_wickets || 1)) * 100}%` }}
                    ></div>
                  </div>
                  <div className="lb-value text-neon-green">{player.total_wickets}<span>Wkts</span></div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Phase Analysis */}
      <div className="section-card">
        <div className="section-card-header">
          <div className="section-card-title">
            <div className="section-card-title-icon icon-pitch">📊</div>
            <div>
              <h3>Phase Analysis — 2024 Season Avg</h3>
              <p>Run rate and economy by match phase</p>
            </div>
          </div>
          <button className="view-all-btn">Deep Dive →</button>
        </div>
        <div className="phase-grid">
          <div className="phase-block">
            <div className="phase-label">⚡ Powerplay (Ov 1–6)</div>
            <div className="phase-rr" style={{ color: 'var(--neon-green)' }}>8.94</div>
            <div className="phase-rr-label">Run Rate</div>
            <div className="phase-sparkline">
              <svg viewBox="0 0 100 32" preserveAspectRatio="none">
                <defs><linearGradient id="g1" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#FF4D00"/><stop offset="100%" stopColor="#C8A96E"/></linearGradient></defs>
                <polyline points="0,28 12,22 25,18 38,24 50,14 62,10 75,16 88,8 100,12"
                  fill="none" stroke="url(#g1)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <polyline points="0,32 0,28 12,22 25,18 38,24 50,14 62,10 75,16 88,8 100,12 100,32"
                  fill="url(#g1)" opacity="0.1"/>
              </svg>
            </div>
          </div>
          <div className="phase-block">
            <div className="phase-label">⚔ Middle (Ov 7–15)</div>
            <div className="phase-rr" style={{ color: 'var(--pitch)' }}>8.21</div>
            <div className="phase-rr-label">Run Rate</div>
            <div className="phase-sparkline">
              <svg viewBox="0 0 100 32" preserveAspectRatio="none">
                <polyline points="0,20 12,24 25,18 38,22 50,16 62,20 75,14 88,18 100,16"
                  fill="none" stroke="#C8A96E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <polyline points="0,32 0,20 12,24 25,18 38,22 50,16 62,20 75,14 88,18 100,16 100,32"
                  fill="#C8A96E" opacity="0.1"/>
              </svg>
            </div>
          </div>
          <div className="phase-block">
            <div className="phase-label">💀 Death (Ov 16–20)</div>
            <div className="phase-rr" style={{ color: 'var(--ember)' }}>11.48</div>
            <div className="phase-rr-label">Run Rate</div>
            <div className="phase-sparkline">
              <svg viewBox="0 0 100 32" preserveAspectRatio="none">
                <polyline points="0,26 12,22 25,26 38,18 50,14 62,8 75,12 88,4 100,6"
                  fill="none" stroke="#FF4D00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <polyline points="0,32 0,26 12,22 25,26 38,18 50,14 62,8 75,12 88,4 100,6 100,32"
                  fill="#FF4D00" opacity="0.1"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Matches */}
      <div className="section-card">
        <div className="section-card-header">
          <div className="section-card-title">
            <div className="section-card-title-icon icon-green">🗓</div>
            <div>
              <h3>Recent Matches</h3>
              <p>IPL 2024 results</p>
            </div>
          </div>
          <button className="view-all-btn">All Matches →</button>
        </div>
        <div className="match-ticker">
          <div className="match-card">
            <div className="match-card-season">IPL 2024 · Final</div>
            <div className="match-teams">
              <div className="match-team">
                <span className="match-team-name">🦁 KKR</span>
                <span className="match-team-score score-winner">222/3</span>
              </div>
              <div className="match-team">
                <span className="match-team-name">🏏 SRH</span>
                <span className="match-team-score score-loser">113/10</span>
              </div>
            </div>
            <div className="match-result">KKR won by 8 wickets</div>
          </div>
          <div className="match-card">
            <div className="match-card-season">IPL 2024 · QF1</div>
            <div className="match-teams">
              <div className="match-team">
                <span className="match-team-name">☀️ SRH</span>
                <span className="match-team-score score-winner">175/4</span>
              </div>
              <div className="match-team">
                <span className="match-team-name">🦁 RR</span>
                <span className="match-team-score score-loser">152/9</span>
              </div>
            </div>
            <div className="match-result">SRH won by 36 runs (DLS)</div>
          </div>
          <div className="match-card">
            <div className="match-card-season">IPL 2024 · QF2</div>
            <div className="match-teams">
              <div className="match-team">
                <span className="match-team-name">🦅 CSK</span>
                <span className="match-team-score score-loser">168/5</span>
              </div>
              <div className="match-team">
                <span className="match-team-name">🦁 KKR</span>
                <span className="match-team-score score-winner">169/4</span>
              </div>
            </div>
            <div className="match-result">KKR won by 6 wickets</div>
          </div>
        </div>
      </div>

      {/* Platform Sections Grid */}
      <div>
        <div className="section-eyebrow">
          <div className="section-eyebrow-line"></div>
          <div className="section-eyebrow-text">Explore Platform</div>
        </div>
        <div className="platform-sections">
          <Link to="/batting" className="platform-section-tile tile-1">
            <div className="tile-icon">🏏</div>
            <div className="tile-name">Batting</div>
          </Link>
          <Link to="/bowling" className="platform-section-tile tile-2">
            <div className="tile-icon">🎳</div>
            <div className="tile-name">Bowling</div>
          </Link>
          <Link to="/keeping" className="platform-section-tile tile-3">
            <div className="tile-icon">🧤</div>
            <div className="tile-name">Keeping</div>
          </Link>
          <Link to="/venues" className="platform-section-tile tile-4">
            <div className="tile-icon">🗺️</div>
            <div className="tile-name">Venues</div>
          </Link>
          <div className="platform-section-tile tile-5">
            <div className="tile-icon">⚡</div>
            <div className="tile-name">Impact Player</div>
            <span className="tile-badge badge-new">2023+</span>
          </div>
          <div className="platform-section-tile tile-6">
            <div className="tile-icon">🔮</div>
            <div className="tile-name">Simulate</div>
            <span className="tile-badge badge-ml">ML</span>
          </div>
        </div>
      </div>

    </div>
  );
}

function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  
  const getNavClass = (path: string) => {
    return location.pathname === path ? 'nav-item active' : 'nav-item';
  };

  const getBreadcrumb = () => {
    const path = location.pathname.substring(1);
    if (!path) return 'Dashboard';
    return path.charAt(0).toUpperCase() + path.slice(1).replace('-', ' ');
  };

  const breadcrumb = getBreadcrumb();

  return (
    <div className="layout">
      {/* Background & FX */}
      <div className="bg-canvas">
        <div className="bg-pitch-oval"></div>
      </div>
      <div className="scanlines"></div>

      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">🏏</div>
          <div className="logo-text">
            <div className="logo-name">IPL Analytics</div>
            <div className="logo-sub">All Seasons · All Data</div>
          </div>
        </div>

        <div className="sidebar-section">
          <div className="sidebar-section-label">Overview</div>
          <Link className={getNavClass('/')} to="/">
            <span className="nav-icon">◈</span>
            <span className="nav-label">Dashboard</span>
          </Link>
          <Link className={getNavClass('/teams')} to="/teams">
            <span className="nav-icon">◉</span>
            <span className="nav-label">Teams</span>
          </Link>
        </div>

        <div className="sidebar-section">
          <div className="sidebar-section-label">Player Analysis</div>
          <Link className={getNavClass('/batting')} to="/batting">
            <span className="nav-icon">⬡</span>
            <span className="nav-label">Batting</span>
          </Link>
          <Link className={getNavClass('/bowling')} to="/bowling">
            <span className="nav-icon">◎</span>
            <span className="nav-label">Bowling</span>
          </Link>
          <Link className={getNavClass('/keeping')} to="/keeping">
            <span className="nav-icon">◇</span>
            <span className="nav-label">Wicket Keeping</span>
          </Link>
          <a className="nav-item" href="#">
            <span className="nav-icon">⊕</span>
            <span className="nav-label">Head-to-Head</span>
            <span className="nav-badge badge-new">New</span>
          </a>
        </div>

        <div className="sidebar-section">
          <div className="sidebar-section-label">Match Intelligence</div>
          <Link className={getNavClass('/venues')} to="/venues">
            <span className="nav-icon">▲</span>
            <span className="nav-label">Venues</span>
          </Link>
          <a className="nav-item" href="#">
            <span className="nav-icon">⊞</span>
            <span className="nav-label">Phase Analysis</span>
          </a>
          <a className="nav-item" href="#">
            <span className="nav-icon">≋</span>
            <span className="nav-label">Duckworth–Lewis</span>
          </a>
          <a className="nav-item" href="#">
            <span className="nav-icon">⚡</span>
            <span className="nav-label">Impact Player</span>
            <span className="nav-badge badge-new">2023+</span>
          </a>
        </div>

        <div className="sidebar-section">
          <div className="sidebar-section-label">AI & Predictions</div>
          <a className="nav-item" href="#">
            <span className="nav-icon">◈</span>
            <span className="nav-label">Win Predictor</span>
            <span className="nav-badge badge-ml">ML</span>
          </a>
          <a className="nav-item" href="#">
            <span className="nav-icon">⬣</span>
            <span className="nav-label">Simulations</span>
            <span className="nav-badge badge-ml">ML</span>
          </a>
        </div>

        <div className="sidebar-bottom">
          <div className="season-pill">
            <div className="status-dot online" style={{ marginRight: '8px' }}></div>
            <div className="season-text">Coverage: <strong>2008 – 2024</strong></div>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <main className="main">
        {/* Topbar */}
        <div className="topbar">
          <div className="topbar-breadcrumb">
            IPL Analytics <span>/</span> <span>{breadcrumb}</span>
          </div>

          <GlobalSearch />

          <div className="topbar-actions">
            <button className="topbar-btn btn-ghost">2024 Season ▾</button>
            <button className="topbar-btn btn-primary">⚡ Predict Match</button>
          </div>
        </div>

        {/* Dynamic Route Content */}
        {children}
      </main>
    </div>
  );
}

function SearchProvider({ children }: { children: React.ReactNode }) {
  const [searchQuery, setSearchQuery] = React.useState('');
  return (
    <SearchContext.Provider value={{ searchQuery, setSearchQuery }}>
      {children}
    </SearchContext.Provider>
  );
}

function App() {
  return (
    <Router>
      <SearchProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/teams" element={<Teams />} />
            <Route path="/batting" element={<Batting />} />
            <Route path="/bowling" element={<Bowling />} />
            <Route path="/venues" element={<Venues />} />
            <Route path="/search" element={<SearchResultsPage />} />
            <Route path="/player/:playerName" element={<PlayerProfile />} />
            <Route path="/keeping" element={<div className="page-content text-white text-2xl">Keeping Analysis (Coming Soon)</div>} />
          </Routes>
        </Layout>
      </SearchProvider>
    </Router>
  );
}

export default App;

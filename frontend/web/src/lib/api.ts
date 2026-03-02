import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface TeamPerformance {
  team: string;
  season: string;
  matches_played: number;
  wins: number;
  losses: number;
  win_percentage: number;
}

export interface PlayerBatting {
  player_name: string;
  total_runs: number;
  batting_average: number;
  avg_runs_per_dismissal?: number; // alias if needed, but backend gives batting_average
  strike_rate: number;
  hundreds: number;
  fifties: number;
}

export interface PlayerBowling {
  player_name: string;
  total_wickets: number;
  bowling_average: number;
  economy_rate: number;
  bowling_strike_rate: number;
  four_wicket_hauls: number;
  five_wicket_hauls: number;
}

export interface TeamStats {
  team: string;
  matches: number;
  wins: number;
  losses: number;
}

export interface TeamSeason {
  season: string;
  total_matches: number;
  total_wins: number;
  total_losses: number;
  win_percentage: number;
}

export const fetchTeams = async (search?: string) => {
  const { data } = await api.get('/teams', {
    params: { search },
  });
  return data.data;
};

export const fetchTeamSeasons = async (teamName: string) => {
  const { data } = await api.get(`/teams/${teamName}/seasons`);
  return data.data;
};

export interface VenueStats {
  venue: string;
  city: string;
  country: string;
  total_matches: number;
  avg_runs_per_wicket: number;
  avg_runs_per_over: number;
  toss_winner_win_percentage: number;
}

export const fetchVenues = async (search?: string) => {
  const { data } = await api.get('/venues', {
    params: { search },
  });
  return data.data;
};

export const fetchBattingLeaderboard = async (sortBy = 'total_runs', limit = 10, search?: string) => {
  const { data } = await api.get('/batting/leaderboard', {
    params: { sort_by: sortBy, limit, search },
  });
  return data.data;
};

export const fetchBowlingLeaderboard = async (sortBy = 'wickets', limit = 10, search?: string) => {
  const { data } = await api.get('/bowling/leaderboard', {
    params: { sort_by: sortBy, limit, search },
  });
  return data.data;
};

export const fetchGlobalSearch = async (query: string) => {
  if (!query.trim()) return [];
  const { data } = await api.get('/search', {
    params: { q: query },
  });
  return data.data;
};

export interface PlayerProfile {
  player: {
    player_name: string;
    total_runs: number;
    total_wickets: number;
    matches: number;
    teams: string[];
  };
  batting: Array<{
    season: string;
    team: string;
    matches_played: number;
    total_runs: number;
    average: number;
    strike_rate: number;
    hundreds: number;
    fifties: number;
  }>;
  bowling: Array<{
    season: string;
    team: string;
    matches_played: number;
    wickets: number;
    economy: number;
    average: number;
    five_w: number;
  }>;
}

export const fetchPlayerProfile = async (playerName: string) => {
  const { data } = await api.get(`/players/${encodeURIComponent(playerName)}`);
  return data as PlayerProfile;
};

export type SearchResultType = 'all' | 'player' | 'team' | 'venue' | 'season';

export interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  type: Exclude<SearchResultType, 'all'>;
  url: string;
  metadata?: {
    runs?: number;
    wickets?: number;
    city?: string;
    wins?: number;
    year?: string;
    image?: string;
  };
  score?: number;
}

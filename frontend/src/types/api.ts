/**
 * API response types matching the backend Pydantic schemas.
 */

export interface Pitcher {
  id: number;
  mlbam_id: number;
  name: string;
  first_name?: string;
  last_name?: string;
  team?: string;
  throws?: string;
  is_starter: boolean;
  is_active: boolean;
}

export interface PitcherSearchResult {
  id: number;
  mlbam_id: number;
  name: string;
  team?: string;
  throws?: string;
}

export interface PitcherDetail extends Pitcher {
  seasons: number[];
  career_stats?: PitcherSeasonStats;
}

export interface PitchTypeStats {
  pitch_type: string;
  pitch_name?: string;
  count: number;
  usage_pct: number;
  avg_velocity?: number;
  min_velocity?: number;
  max_velocity?: number;
  avg_spin_rate?: number;
  avg_pfx_x?: number;
  avg_pfx_z?: number;
  whiff_pct?: number;
  called_strike_pct?: number;
  ball_pct?: number;
  in_play_pct?: number;
}

export interface PitcherSeasonStats {
  year: number;
  total_pitches: number;
  games: number;
  avg_velocity?: number;
  max_velocity?: number;
  strike_pct?: number;
  ball_pct?: number;
  whiff_pct?: number;
  in_play_pct?: number;
  pitch_types: PitchTypeStats[];
}

export interface Pitch {
  id: number;
  game_pk: number;
  game_date: string;
  game_year: number;
  pitch_type?: string;
  pitch_name?: string;
  batter_stand?: string;
  balls?: number;
  strikes?: number;
  inning?: number;
  release_speed?: number;
  release_spin_rate?: number;
  pfx_x?: number;
  pfx_z?: number;
  plate_x?: number;
  plate_z?: number;
  zone?: number;
  type?: string;
  description?: string;
  events?: string;
  launch_speed?: number;
  launch_angle?: number;
}

export interface GameLog {
  game_pk: number;
  date: string;
  total_pitches: number;
  innings_pitched: number;
  avg_velocity?: number;
  strikes: number;
  whiffs: number;
  strikeouts: number;
  walks: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface LeaderboardEntry {
  rank: number;
  pitcher_id: number;
  name: string;
  team?: string;
  is_starter: boolean;
  value?: number;
  games: number;
  pitch_count: number;
}

export interface LeaderboardResponse {
  stat: string;
  stat_name: string;
  stat_description: string;
  unit: string;
  year: number;
  min_pitches?: number;
  is_starter?: boolean;
  entries: LeaderboardEntry[];
}

export interface LeaderboardStat {
  id: string;
  name: string;
  description: string;
  unit: string;
}

// Discover (Statistical Analysis) Types

export interface DiscoverStat {
  id: string;
  name: string;
  description: string;
  category: string;
}

export interface ScatterPoint {
  pitcher_id: number;
  name: string;
  team?: string;
  x?: number;
  y?: number;
}

export interface RegressionLine {
  slope: number;
  intercept: number;
  equation: string;
}

export interface CorrelationResponse {
  stat_x: string;
  stat_x_name: string;
  stat_y: string;
  stat_y_name: string;
  year?: number;
  is_starter?: boolean;
  min_innings?: number;
  correlation_r: number;
  r_squared: number;
  p_value: number;
  sample_size: number;
  regression: RegressionLine;
  scatter_data: ScatterPoint[];
}

export interface StickinessEntry {
  rank: number;
  stat: string;
  stat_name: string;
  category: string;
  r_squared: number;
  sample_size: number;
  years_analyzed: number;
}

export interface StickinessResponse {
  is_starter?: boolean;
  min_innings?: number;
  entries: StickinessEntry[];
}

export interface PredictiveEntry {
  rank: number;
  stat: string;
  stat_name: string;
  category: string;
  stickiness_r2: number;
  predictive_r2: number;
  combined_score: number;
  sample_size: number;
}

export interface PredictiveResponse {
  target_stat: string;
  target_stat_name: string;
  is_starter?: boolean;
  min_innings?: number;
  entries: PredictiveEntry[];
}

export interface TrendPoint {
  year: number;
  r_squared: number;
  correlation_r: number;
  sample_size: number;
}

export interface TrendsResponse {
  stat_x: string;
  stat_x_name: string;
  stat_y: string;
  stat_y_name: string;
  is_starter?: boolean;
  min_innings?: number;
  trend_data: TrendPoint[];
  avg_r_squared: number;
  trend_direction: "increasing" | "decreasing" | "stable";
}

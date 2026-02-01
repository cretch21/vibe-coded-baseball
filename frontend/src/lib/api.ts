/**
 * API client for the Vibe-Coded Baseball backend.
 */

import type {
  Pitcher,
  PitcherSearchResult,
  PitcherDetail,
  PitcherSeasonStats,
  Pitch,
  GameLog,
  PaginatedResponse,
  LeaderboardResponse,
  LeaderboardStat,
  DiscoverStat,
  CorrelationResponse,
  StickinessResponse,
  PredictiveResponse,
  TrendsResponse,
} from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/**
 * Generic fetch wrapper with error handling.
 */
async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || `API error: ${response.status}`);
  }

  return response.json();
}

/**
 * Pitcher API endpoints
 */
export const pitchersApi = {
  /**
   * Get paginated list of all pitchers.
   */
  list: (params?: {
    page?: number;
    page_size?: number;
    team?: string;
    is_active?: boolean;
    is_starter?: boolean;
  }): Promise<PaginatedResponse<Pitcher>> => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.page_size) searchParams.set("page_size", params.page_size.toString());
    if (params?.team) searchParams.set("team", params.team);
    if (params?.is_active !== undefined) searchParams.set("is_active", params.is_active.toString());
    if (params?.is_starter !== undefined) searchParams.set("is_starter", params.is_starter.toString());

    const query = searchParams.toString();
    return fetchApi(`/api/pitchers${query ? `?${query}` : ""}`);
  },

  /**
   * Search pitchers by name for autocomplete.
   */
  search: (query: string, limit = 10): Promise<PitcherSearchResult[]> => {
    return fetchApi(`/api/pitchers/search?q=${encodeURIComponent(query)}&limit=${limit}`);
  },

  /**
   * Get single pitcher details.
   */
  get: (id: number): Promise<PitcherDetail> => {
    return fetchApi(`/api/pitchers/${id}`);
  },

  /**
   * Get pitch-by-pitch data for a pitcher.
   */
  getPitches: (
    id: number,
    params?: {
      year?: number;
      pitch_type?: string;
      page?: number;
      page_size?: number;
    }
  ): Promise<PaginatedResponse<Pitch>> => {
    const searchParams = new URLSearchParams();
    if (params?.year) searchParams.set("year", params.year.toString());
    if (params?.pitch_type) searchParams.set("pitch_type", params.pitch_type);
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.page_size) searchParams.set("page_size", params.page_size.toString());

    const query = searchParams.toString();
    return fetchApi(`/api/pitchers/${id}/pitches${query ? `?${query}` : ""}`);
  },

  /**
   * Get aggregated stats for a pitcher.
   */
  getStats: (id: number, year?: number): Promise<PitcherSeasonStats> => {
    const query = year ? `?year=${year}` : "";
    return fetchApi(`/api/pitchers/${id}/stats${query}`);
  },

  /**
   * Get game log for a pitcher.
   */
  getGames: (id: number, params?: { year?: number; limit?: number }): Promise<GameLog[]> => {
    const searchParams = new URLSearchParams();
    if (params?.year) searchParams.set("year", params.year.toString());
    if (params?.limit) searchParams.set("limit", params.limit.toString());

    const query = searchParams.toString();
    return fetchApi(`/api/pitchers/${id}/games${query ? `?${query}` : ""}`);
  },
};

/**
 * Leaderboards API endpoints
 */
export const leaderboardsApi = {
  /**
   * Get leaderboard rankings for a specific stat.
   */
  get: (params?: {
    stat?: string;
    year?: number;
    limit?: number;
    is_starter?: boolean;
    min_pitches?: number;
  }): Promise<LeaderboardResponse> => {
    const searchParams = new URLSearchParams();
    if (params?.stat) searchParams.set("stat", params.stat);
    if (params?.year) searchParams.set("year", params.year.toString());
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    if (params?.is_starter !== undefined) searchParams.set("is_starter", params.is_starter.toString());
    if (params?.min_pitches) searchParams.set("min_pitches", params.min_pitches.toString());

    const query = searchParams.toString();
    return fetchApi(`/api/leaderboards${query ? `?${query}` : ""}`);
  },

  /**
   * Get available stats for leaderboards.
   */
  getStats: (): Promise<LeaderboardStat[]> => {
    return fetchApi("/api/leaderboards/stats");
  },
};

/**
 * Discover (Statistical Analysis) API endpoints
 */
export const discoverApi = {
  /**
   * Get available stats for analysis.
   */
  getStats: (): Promise<DiscoverStat[]> => {
    return fetchApi("/api/discover/stats");
  },

  /**
   * Get correlation between two stats.
   */
  getCorrelations: (params: {
    stat_x: string;
    stat_y: string;
    year?: number;
    is_starter?: boolean;
    min_innings?: number;
  }): Promise<CorrelationResponse> => {
    const searchParams = new URLSearchParams();
    searchParams.set("stat_x", params.stat_x);
    searchParams.set("stat_y", params.stat_y);
    if (params.year) searchParams.set("year", params.year.toString());
    if (params.is_starter !== undefined) searchParams.set("is_starter", params.is_starter.toString());
    if (params.min_innings) searchParams.set("min_innings", params.min_innings.toString());

    return fetchApi(`/api/discover/correlations?${searchParams}`);
  },

  /**
   * Get stickiness rankings.
   */
  getStickiness: (params?: {
    is_starter?: boolean;
    min_innings?: number;
  }): Promise<StickinessResponse> => {
    const searchParams = new URLSearchParams();
    if (params?.is_starter !== undefined) searchParams.set("is_starter", params.is_starter.toString());
    if (params?.min_innings) searchParams.set("min_innings", params.min_innings.toString());

    const query = searchParams.toString();
    return fetchApi(`/api/discover/stickiness${query ? `?${query}` : ""}`);
  },

  /**
   * Get predictive power rankings.
   */
  getPredictive: (params?: {
    target_stat?: string;
    is_starter?: boolean;
    min_innings?: number;
  }): Promise<PredictiveResponse> => {
    const searchParams = new URLSearchParams();
    if (params?.target_stat) searchParams.set("target_stat", params.target_stat);
    if (params?.is_starter !== undefined) searchParams.set("is_starter", params.is_starter.toString());
    if (params?.min_innings) searchParams.set("min_innings", params.min_innings.toString());

    const query = searchParams.toString();
    return fetchApi(`/api/discover/predictive${query ? `?${query}` : ""}`);
  },

  /**
   * Get trend data across years.
   */
  getTrends: (params: {
    stat_x: string;
    stat_y: string;
    is_starter?: boolean;
    min_innings?: number;
  }): Promise<TrendsResponse> => {
    const searchParams = new URLSearchParams();
    searchParams.set("stat_x", params.stat_x);
    searchParams.set("stat_y", params.stat_y);
    if (params.is_starter !== undefined) searchParams.set("is_starter", params.is_starter.toString());
    if (params.min_innings) searchParams.set("min_innings", params.min_innings.toString());

    return fetchApi(`/api/discover/trends?${searchParams}`);
  },
};

/**
 * Health check
 */
export const healthApi = {
  check: (): Promise<{ status: string; service: string }> => {
    return fetchApi("/health");
  },
};

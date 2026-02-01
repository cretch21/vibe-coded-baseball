/**
 * React Query hooks for leaderboard data fetching.
 */

"use client";

import { useQuery } from "@tanstack/react-query";
import { leaderboardsApi } from "@/lib/api";

/**
 * Hook to get leaderboard data.
 */
export function useLeaderboard(params?: {
  stat?: string;
  year?: number;
  limit?: number;
  is_starter?: boolean;
  min_pitches?: number;
}) {
  return useQuery({
    queryKey: ["leaderboards", params],
    queryFn: () => leaderboardsApi.get(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to get available stats for leaderboards.
 */
export function useLeaderboardStats() {
  return useQuery({
    queryKey: ["leaderboards", "stats"],
    queryFn: () => leaderboardsApi.getStats(),
    staleTime: 1000 * 60 * 60, // 1 hour (stats don't change)
  });
}

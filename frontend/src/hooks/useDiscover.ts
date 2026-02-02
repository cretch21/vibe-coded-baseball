/**
 * React Query hooks for Discover (Statistical Analysis) data fetching.
 */

"use client";

import { useQuery } from "@tanstack/react-query";
import { discoverApi } from "@/lib/api";

/**
 * Hook to get available stats for analysis.
 */
export function useDiscoverStats() {
  return useQuery({
    queryKey: ["discover", "stats"],
    queryFn: () => discoverApi.getStats(),
    staleTime: 1000 * 60 * 60, // 1 hour (stats don't change)
  });
}

/**
 * Hook to get correlation data between two stats.
 */
export function useCorrelations(params: {
  stat_x: string;
  stat_y: string;
  year?: number;
  is_starter?: boolean;
  min_innings?: number;
}) {
  return useQuery({
    queryKey: ["discover", "correlations", params],
    queryFn: () => discoverApi.getCorrelations(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!params.stat_x && !!params.stat_y,
  });
}

/**
 * Hook to get correlation rankings for a target stat.
 */
export function useCorrelationRankings(params: {
  target_stat: string;
  year?: number;
  is_starter?: boolean;
  min_innings?: number;
}) {
  return useQuery({
    queryKey: ["discover", "correlation-rankings", params],
    queryFn: () => discoverApi.getCorrelationRankings(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!params.target_stat,
  });
}

/**
 * Hook to get stickiness rankings.
 */
export function useStickiness(params?: {
  is_starter?: boolean;
  min_innings?: number;
}) {
  return useQuery({
    queryKey: ["discover", "stickiness", params],
    queryFn: () => discoverApi.getStickiness(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to get predictive power rankings.
 */
export function usePredictive(params?: {
  target_stat?: string;
  is_starter?: boolean;
  min_innings?: number;
}) {
  return useQuery({
    queryKey: ["discover", "predictive", params],
    queryFn: () => discoverApi.getPredictive(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to get trend data across years.
 */
export function useTrends(params: {
  stat_x: string;
  stat_y: string;
  is_starter?: boolean;
  min_innings?: number;
}) {
  return useQuery({
    queryKey: ["discover", "trends", params],
    queryFn: () => discoverApi.getTrends(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!params.stat_x && !!params.stat_y,
  });
}

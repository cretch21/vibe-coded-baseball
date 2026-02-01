/**
 * React Query hooks for pitcher data fetching.
 */

"use client";

import { useQuery } from "@tanstack/react-query";
import { pitchersApi } from "@/lib/api";

/**
 * Hook to search pitchers by name (for autocomplete).
 */
export function usePitcherSearch(query: string, enabled = true) {
  return useQuery({
    queryKey: ["pitchers", "search", query],
    queryFn: () => pitchersApi.search(query),
    enabled: enabled && query.length >= 2,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to get paginated list of pitchers.
 */
export function usePitchersList(params?: {
  page?: number;
  page_size?: number;
  team?: string;
  is_active?: boolean;
  is_starter?: boolean;
}) {
  return useQuery({
    queryKey: ["pitchers", "list", params],
    queryFn: () => pitchersApi.list(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to get single pitcher details.
 */
export function usePitcher(id: number | null) {
  return useQuery({
    queryKey: ["pitchers", id],
    queryFn: () => pitchersApi.get(id!),
    enabled: id !== null,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to get pitcher stats.
 */
export function usePitcherStats(id: number | null, year?: number) {
  return useQuery({
    queryKey: ["pitchers", id, "stats", year],
    queryFn: () => pitchersApi.getStats(id!, year),
    enabled: id !== null,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to get pitcher game log.
 */
export function usePitcherGames(
  id: number | null,
  params?: { year?: number; limit?: number }
) {
  return useQuery({
    queryKey: ["pitchers", id, "games", params],
    queryFn: () => pitchersApi.getGames(id!, params),
    enabled: id !== null,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to get pitcher pitches.
 */
export function usePitcherPitches(
  id: number | null,
  params?: {
    year?: number;
    pitch_type?: string;
    page?: number;
    page_size?: number;
  }
) {
  return useQuery({
    queryKey: ["pitchers", id, "pitches", params],
    queryFn: () => pitchersApi.getPitches(id!, params),
    enabled: id !== null,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

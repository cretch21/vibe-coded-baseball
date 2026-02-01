"use client";

import { useState } from "react";
import Link from "next/link";
import { useLeaderboard, useLeaderboardStats } from "@/hooks";
import { cn } from "@/lib/utils";

type PitcherFilter = "all" | "starters" | "relievers";
type LimitOption = 10 | 25 | 50;

export default function LeaderboardsPage() {
  // Filter state
  const [selectedStat, setSelectedStat] = useState("velocity");
  const [limit, setLimit] = useState<LimitOption>(25);
  const [pitcherFilter, setPitcherFilter] = useState<PitcherFilter>("all");
  const [minPitches, setMinPitches] = useState(500);

  // Convert pitcher filter to API param
  const isStarter =
    pitcherFilter === "all" ? undefined : pitcherFilter === "starters";

  // Fetch data
  const { data: stats } = useLeaderboardStats();
  const { data: leaderboard, isLoading, error } = useLeaderboard({
    stat: selectedStat,
    limit,
    is_starter: isStarter,
    min_pitches: minPitches,
  });

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Leaderboards</h1>
        <p className="text-gray-400">
          Rankings of pitchers by any statistic. Filter by starter/reliever and
          minimum pitches.
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 p-4 rounded-lg bg-primary-800 border border-primary-700">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Stat Selector */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Statistic</label>
            <select
              value={selectedStat}
              onChange={(e) => setSelectedStat(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-primary-900 border border-primary-700 text-white focus:outline-none focus:border-accent"
            >
              {stats?.map((stat) => (
                <option key={stat.id} value={stat.id}>
                  {stat.name}
                </option>
              )) ?? (
                <>
                  <option value="velocity">Avg Fastball Velocity</option>
                  <option value="max_velocity">Max Velocity</option>
                  <option value="spin_rate">Avg Spin Rate</option>
                  <option value="whiff_pct">Whiff %</option>
                  <option value="strikeout_pct">K %</option>
                  <option value="h_movement">Horizontal Movement</option>
                  <option value="v_movement">Vertical Movement</option>
                  <option value="strike_pct">Strike %</option>
                </>
              )}
            </select>
          </div>

          {/* Limit Toggle */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Show Top</label>
            <div className="flex rounded-lg overflow-hidden border border-primary-700">
              {([10, 25, 50] as LimitOption[]).map((opt) => (
                <button
                  key={opt}
                  onClick={() => setLimit(opt)}
                  className={cn(
                    "flex-1 px-3 py-2 text-sm transition-colors",
                    limit === opt
                      ? "bg-accent text-primary-900 font-medium"
                      : "bg-primary-900 text-gray-400 hover:text-white"
                  )}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Starter/Reliever Filter */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Pitcher Type
            </label>
            <div className="flex rounded-lg overflow-hidden border border-primary-700">
              {(["all", "starters", "relievers"] as PitcherFilter[]).map(
                (opt) => (
                  <button
                    key={opt}
                    onClick={() => setPitcherFilter(opt)}
                    className={cn(
                      "flex-1 px-3 py-2 text-sm transition-colors capitalize",
                      pitcherFilter === opt
                        ? "bg-accent text-primary-900 font-medium"
                        : "bg-primary-900 text-gray-400 hover:text-white"
                    )}
                  >
                    {opt}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Minimum Pitches */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Min Pitches: {minPitches}
            </label>
            <input
              type="range"
              min={100}
              max={2000}
              step={100}
              value={minPitches}
              onChange={(e) => setMinPitches(parseInt(e.target.value, 10))}
              className="w-full h-2 bg-primary-900 rounded-lg appearance-none cursor-pointer accent-accent"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>100</span>
              <span>2000</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stat Description */}
      {leaderboard && (
        <div className="mb-6 p-4 rounded-lg bg-primary-800/50 border border-primary-700/50">
          <div className="flex items-center gap-2 text-accent font-medium mb-1">
            <span>{leaderboard.stat_name}</span>
            <span className="text-gray-500 text-sm">({leaderboard.unit})</span>
          </div>
          <p className="text-gray-400 text-sm">{leaderboard.stat_description}</p>
          <p className="text-gray-500 text-xs mt-2">
            Season: {leaderboard.year} | Minimum {leaderboard.min_pitches} pitches
          </p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="p-6 rounded-lg bg-red-900/20 border border-red-800 text-red-300">
          <p>Failed to load leaderboard data. Please try again.</p>
        </div>
      )}

      {/* Leaderboard Table */}
      {leaderboard && leaderboard.entries.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-primary-700">
          <table className="w-full">
            <thead className="bg-primary-800">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400 w-16">
                  Rank
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">
                  Pitcher
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400 w-20">
                  Team
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400 w-24">
                  Type
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-accent w-28">
                  {leaderboard.stat_name}
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-400 w-20">
                  Games
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-400 w-24">
                  Pitches
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary-700">
              {leaderboard.entries.map((entry) => (
                <tr
                  key={entry.pitcher_id}
                  className="bg-primary-900 hover:bg-primary-800 transition-colors"
                >
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold",
                        entry.rank === 1 && "bg-yellow-500/20 text-yellow-400",
                        entry.rank === 2 && "bg-gray-400/20 text-gray-300",
                        entry.rank === 3 && "bg-amber-700/20 text-amber-600",
                        entry.rank > 3 && "text-gray-400"
                      )}
                    >
                      {entry.rank}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/pitchers/${entry.pitcher_id}`}
                      className="text-white hover:text-accent transition-colors font-medium"
                    >
                      {entry.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-400">
                    {entry.team || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "inline-block px-2 py-1 text-xs rounded",
                        entry.is_starter
                          ? "bg-blue-900/30 text-blue-400"
                          : "bg-purple-900/30 text-purple-400"
                      )}
                    >
                      {entry.is_starter ? "Starter" : "Reliever"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-white font-mono font-medium">
                      {entry.value !== null && entry.value !== undefined
                        ? `${entry.value}${leaderboard.unit === "%" ? "%" : ""}`
                        : "—"}
                    </span>
                    {leaderboard.unit !== "%" && (
                      <span className="text-gray-500 text-sm ml-1">
                        {leaderboard.unit}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-400">
                    {entry.games}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-400">
                    {entry.pitch_count.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Empty State */}
      {leaderboard && leaderboard.entries.length === 0 && (
        <div className="p-6 rounded-lg bg-primary-800/50 border border-primary-700/50 text-center">
          <p className="text-gray-400">
            No pitchers found matching these criteria. Try adjusting the filters.
          </p>
        </div>
      )}
    </div>
  );
}

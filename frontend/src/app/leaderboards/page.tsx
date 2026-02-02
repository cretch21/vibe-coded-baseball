"use client";

import { useState } from "react";
import Link from "next/link";
import { useLeaderboard, useLeaderboardStats } from "@/hooks";
import { cn } from "@/lib/utils";

type LimitOption = 10 | 25 | 50;

export default function LeaderboardsPage() {
  // Filter state
  const [selectedStat, setSelectedStat] = useState("velocity");
  const [limit, setLimit] = useState<LimitOption>(25);
  const [minPitches, setMinPitches] = useState(500);

  // Fetch data
  const { data: stats } = useLeaderboardStats();
  const { data: leaderboard, isLoading, error } = useLeaderboard({
    stat: selectedStat,
    limit,
    min_pitches: minPitches,
  });

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="rounded-lg p-4 mb-6 border-2" style={{ backgroundColor: '#D9D8D8', borderColor: '#E1C825' }}>
        <h1 className="text-3xl font-bold text-black mb-2">Leaderboards</h1>
        <p className="text-gray-600">
          Rankings of pitchers by any statistic. Use minimum pitches to filter.
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 p-4 rounded-lg border-2" style={{ backgroundColor: '#D9D8D8', borderColor: '#E1C825' }}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Stat Selector */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">Statistic</label>
            <select
              value={selectedStat}
              onChange={(e) => setSelectedStat(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white border text-gray-900 focus:outline-none"
              style={{ borderColor: '#E1C825' }}
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
            <label className="block text-sm text-gray-700 mb-2">Show Top</label>
            <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: '#E1C825' }}>
              {([10, 25, 50] as LimitOption[]).map((opt) => (
                <button
                  key={opt}
                  onClick={() => setLimit(opt)}
                  className={cn(
                    "flex-1 px-3 py-2 text-sm transition-colors",
                    limit === opt
                      ? "text-black font-medium"
                      : "bg-white text-gray-600 hover:bg-gray-50"
                  )}
                  style={limit === opt ? { backgroundColor: '#E1C825' } : {}}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Minimum Pitches */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Min Pitches: {minPitches}
            </label>
            <input
              type="range"
              min={100}
              max={2000}
              step={100}
              value={minPitches}
              onChange={(e) => setMinPitches(parseInt(e.target.value, 10))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              style={{ accentColor: '#E1C825' }}
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
        <div className="mb-6 p-4 rounded-lg border-2" style={{ backgroundColor: '#D9D8D8', borderColor: '#E1C825' }}>
          <div className="flex items-center gap-2 font-medium mb-1" style={{ color: '#183521' }}>
            <span>{leaderboard.stat_name}</span>
            <span className="text-gray-500 text-sm">({leaderboard.unit})</span>
          </div>
          <p className="text-gray-700 text-sm">{leaderboard.stat_description}</p>
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
        <div className="overflow-x-auto rounded-lg border-2" style={{ borderColor: '#E1C825' }}>
          <table className="w-full">
            <thead style={{ backgroundColor: '#183521' }}>
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-300 w-16">
                  Rank
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">
                  Pitcher
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-300 w-20">
                  Team
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium w-28" style={{ color: '#E1C825' }}>
                  {leaderboard.stat_name}
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-300 w-20">
                  Games
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-300 w-24">
                  Pitches
                </th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ backgroundColor: '#D9D8D8' }}>
              {leaderboard.entries.map((entry) => (
                <tr
                  key={entry.pitcher_id}
                  className="hover:bg-gray-200 transition-colors"
                >
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold",
                        entry.rank === 1 && "bg-yellow-500/30 text-yellow-700",
                        entry.rank === 2 && "bg-gray-400/30 text-gray-600",
                        entry.rank === 3 && "bg-amber-700/30 text-amber-800",
                        entry.rank > 3 && "text-gray-600"
                      )}
                    >
                      {entry.rank}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/pitchers/${entry.pitcher_id}`}
                      className="text-gray-900 hover:underline transition-colors font-medium"
                    >
                      {entry.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {entry.team || "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-gray-900 font-mono font-medium">
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
                  <td className="px-4 py-3 text-right text-gray-600">
                    {entry.games}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600">
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
        <div className="p-6 rounded-lg border-2 text-center" style={{ backgroundColor: '#D9D8D8', borderColor: '#E1C825' }}>
          <p className="text-gray-600">
            No pitchers found matching these criteria. Try adjusting the filters.
          </p>
        </div>
      )}
    </div>
  );
}

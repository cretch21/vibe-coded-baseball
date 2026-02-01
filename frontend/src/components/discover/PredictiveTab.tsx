"use client";

import { useState } from "react";
import { useDiscoverStats, usePredictive } from "@/hooks";
import { cn } from "@/lib/utils";

type PitcherFilter = "all" | "starters" | "relievers";

export function PredictiveTab() {
  const [targetStat, setTargetStat] = useState("era");
  const [pitcherFilter, setPitcherFilter] = useState<PitcherFilter>("all");
  const [minInnings, setMinInnings] = useState(50);

  const isStarter = pitcherFilter === "all" ? undefined : pitcherFilter === "starters";

  const { data: stats } = useDiscoverStats();
  const { data, isLoading, error } = usePredictive({
    target_stat: targetStat,
    is_starter: isStarter,
    min_innings: minInnings,
  });

  return (
    <div className="space-y-6">
      {/* Explanation */}
      <div className="p-4 rounded-lg bg-primary-800/50 border border-primary-700/50">
        <h3 className="text-lg font-semibold text-white mb-2">What is Predictive Power?</h3>
        <p className="text-gray-400 text-sm">
          Predictive Power combines two factors: how <strong>sticky</strong> a stat is (consistent
          year-to-year) AND how well it <strong>predicts</strong> the target stat in the following
          year. Stats that are both repeatable and predictive are the most valuable for forecasting.
        </p>
      </div>

      {/* Filters */}
      <div className="p-4 rounded-lg bg-primary-800 border border-primary-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Target Stat Selector */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Predict This Stat</label>
            <select
              value={targetStat}
              onChange={(e) => setTargetStat(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-primary-900 border border-primary-700 text-white focus:outline-none focus:border-accent"
            >
              {stats?.map((stat) => (
                <option key={stat.id} value={stat.id}>
                  {stat.name}
                </option>
              )) ?? (
                <>
                  <option value="era">ERA</option>
                  <option value="fip">FIP</option>
                  <option value="whiff_pct">Whiff %</option>
                </>
              )}
            </select>
          </div>

          {/* Pitcher Type Filter */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Pitcher Type</label>
            <div className="flex rounded-lg overflow-hidden border border-primary-700">
              {(["all", "starters", "relievers"] as PitcherFilter[]).map((opt) => (
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
                  {opt === "all" ? "All" : opt === "starters" ? "SP" : "RP"}
                </button>
              ))}
            </div>
          </div>

          {/* Minimum Innings */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Min IP: {minInnings}
            </label>
            <input
              type="range"
              min={20}
              max={200}
              step={10}
              value={minInnings}
              onChange={(e) => setMinInnings(parseInt(e.target.value, 10))}
              className="w-full h-2 bg-primary-900 rounded-lg appearance-none cursor-pointer accent-accent"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>20</span>
              <span>200</span>
            </div>
          </div>
        </div>
      </div>

      {/* Target Info */}
      {data && (
        <div className="p-3 rounded-lg bg-accent/10 border border-accent/30">
          <span className="text-accent font-medium">
            Finding stats that predict next year&apos;s {data.target_stat_name}
          </span>
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
          <p>Failed to load predictive data. Please try again.</p>
        </div>
      )}

      {/* Rankings Table */}
      {data && data.entries.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-primary-700">
          <table className="w-full">
            <thead className="bg-primary-800">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400 w-16">
                  Rank
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">
                  Predictor Stat
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400 w-28">
                  Category
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-400 w-24">
                  Sticky R²
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-400 w-24">
                  Predict R²
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-accent w-24">
                  Combined
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-400 w-20">
                  Sample
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary-700">
              {data.entries.map((entry) => (
                <tr
                  key={entry.stat}
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
                  <td className="px-4 py-3 text-white font-medium">
                    {entry.stat_name}
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 text-xs rounded bg-primary-700 text-gray-300">
                      {entry.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-gray-300 font-mono">
                    {entry.stickiness_r2.toFixed(3)}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-300 font-mono">
                    {entry.predictive_r2.toFixed(3)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <CombinedScoreBar value={entry.combined_score} />
                  </td>
                  <td className="px-4 py-3 text-right text-gray-400">
                    {entry.sample_size}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Empty State */}
      {data && data.entries.length === 0 && (
        <div className="p-6 rounded-lg bg-primary-800/50 border border-primary-700/50 text-center">
          <p className="text-gray-400">
            No predictive data available. This requires multiple consecutive seasons of data.
          </p>
        </div>
      )}
    </div>
  );
}

function CombinedScoreBar({ value }: { value: number }) {
  const percentage = Math.round(value * 100);
  const color =
    value >= 0.3
      ? "bg-green-500"
      : value >= 0.15
        ? "bg-yellow-500"
        : "bg-red-500";

  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-2 bg-primary-700 rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full", color)}
          style={{ width: `${Math.min(percentage * 2, 100)}%` }}
        />
      </div>
      <span className="text-accent font-mono text-sm font-bold w-12 text-right">
        {value.toFixed(3)}
      </span>
    </div>
  );
}

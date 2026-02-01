"use client";

import { useState } from "react";
import { useStickiness } from "@/hooks";
import { cn } from "@/lib/utils";

type PitcherFilter = "all" | "starters" | "relievers";

export function StickinessTab() {
  const [pitcherFilter, setPitcherFilter] = useState<PitcherFilter>("all");
  const [minInnings, setMinInnings] = useState(50);

  const isStarter = pitcherFilter === "all" ? undefined : pitcherFilter === "starters";

  const { data, isLoading, error } = useStickiness({
    is_starter: isStarter,
    min_innings: minInnings,
  });

  return (
    <div className="space-y-6">
      {/* Explanation */}
      <div className="p-4 rounded-lg bg-primary-800/50 border border-primary-700/50">
        <h3 className="text-lg font-semibold text-white mb-2">What is Stickiness?</h3>
        <p className="text-gray-400 text-sm">
          Stickiness measures how consistent a stat is from year to year for the same pitcher.
          A &quot;sticky&quot; stat (high R²) is more skill-based and predictable, while a
          &quot;non-sticky&quot; stat is more random or context-dependent.
        </p>
      </div>

      {/* Filters */}
      <div className="p-4 rounded-lg bg-primary-800 border border-primary-700">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="p-6 rounded-lg bg-red-900/20 border border-red-800 text-red-300">
          <p>Failed to load stickiness data. Please try again.</p>
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
                  Statistic
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-400 w-32">
                  Category
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-accent w-24">
                  R²
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-400 w-24">
                  Sample
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-400 w-20">
                  Years
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
                  <td className="px-4 py-3 text-right">
                    <StickinessBar value={entry.r_squared} />
                  </td>
                  <td className="px-4 py-3 text-right text-gray-400">
                    {entry.sample_size}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-400">
                    {entry.years_analyzed}
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
            No stickiness data available. This requires multiple consecutive seasons of data.
          </p>
        </div>
      )}
    </div>
  );
}

function StickinessBar({ value }: { value: number }) {
  const percentage = Math.round(value * 100);
  const color =
    value >= 0.5
      ? "bg-green-500"
      : value >= 0.25
        ? "bg-yellow-500"
        : "bg-red-500";

  return (
    <div className="flex items-center gap-2">
      <div className="w-24 h-2 bg-primary-700 rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full", color)}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-white font-mono text-sm w-12 text-right">
        {value.toFixed(3)}
      </span>
    </div>
  );
}

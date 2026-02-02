"use client";

import { useState } from "react";
import { useStickiness } from "@/hooks";
import { cn } from "@/lib/utils";

export function StickinessTab() {
  const [minInnings, setMinInnings] = useState(50);

  const { data, isLoading, error } = useStickiness({
    min_innings: minInnings,
  });

  return (
    <div className="space-y-6">
      {/* Explanation */}
      <div className="p-4 rounded-lg border-2" style={{ backgroundColor: '#D9D8D8', borderColor: '#E1C825' }}>
        <h3 className="text-lg font-semibold text-black mb-2">What is Stickiness?</h3>
        <p className="text-gray-600 text-sm">
          Stickiness measures how consistent a stat is from year to year for the same pitcher.
          A &quot;sticky&quot; stat (high R²) is more skill-based and predictable, while a
          &quot;non-sticky&quot; stat is more random or context-dependent.
        </p>
      </div>

      {/* Filters */}
      <div className="p-4 rounded-lg border-2" style={{ backgroundColor: '#D9D8D8', borderColor: '#E1C825' }}>
        <div className="max-w-md">
          {/* Minimum Innings */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Min IP: {minInnings}
            </label>
            <input
              type="range"
              min={20}
              max={200}
              step={10}
              value={minInnings}
              onChange={(e) => setMinInnings(parseInt(e.target.value, 10))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              style={{ accentColor: '#E1C825' }}
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
        <div className="p-6 rounded-lg bg-red-100 border-2 border-red-300 text-red-700">
          <p>Failed to load stickiness data. Please try again.</p>
        </div>
      )}

      {/* Rankings Table */}
      {data && data.entries.length > 0 && (
        <div className="overflow-x-auto rounded-lg border-2" style={{ borderColor: '#E1C825' }}>
          <table className="w-full">
            <thead style={{ backgroundColor: '#183521' }}>
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-300 w-16">
                  Rank
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">
                  Statistic
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-300 w-32">
                  Category
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium w-24" style={{ color: '#E1C825' }}>
                  R²
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-300 w-24">
                  Sample
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-300 w-20">
                  Years
                </th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ backgroundColor: '#D9D8D8' }}>
              {data.entries.map((entry) => (
                <tr
                  key={entry.stat}
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
                  <td className="px-4 py-3 text-gray-900 font-medium">
                    {entry.stat_name}
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 text-xs rounded bg-white text-gray-600 border border-gray-300">
                      {entry.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <StickinessBar value={entry.r_squared} />
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600">
                    {entry.sample_size}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600">
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
        <div className="p-6 rounded-lg border-2 text-center" style={{ backgroundColor: '#D9D8D8', borderColor: '#E1C825' }}>
          <p className="text-gray-600">
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
      <div className="w-24 h-2 bg-gray-300 rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full", color)}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="font-mono text-sm w-12 text-right" style={{ color: '#183521' }}>
        {value.toFixed(3)}
      </span>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useDiscoverStats, usePredictive } from "@/hooks";
import { cn } from "@/lib/utils";

export function PredictiveTab() {
  const [targetStat, setTargetStat] = useState("era");
  const [minInnings, setMinInnings] = useState(50);

  const { data: stats } = useDiscoverStats();
  const { data, isLoading, error } = usePredictive({
    target_stat: targetStat,
    min_innings: minInnings,
  });

  return (
    <div className="space-y-6">
      {/* Explanation */}
      <div className="p-4 rounded-lg border-2" style={{ backgroundColor: '#D9D8D8', borderColor: '#E1C825' }}>
        <h3 className="text-lg font-semibold text-black mb-2">What is Predictive Power?</h3>
        <p className="text-gray-600 text-sm">
          Predictive Power combines two factors: how <strong>sticky</strong> a stat is (consistent
          year-to-year) AND how well it <strong>predicts</strong> the target stat in the following
          year. Stats that are both repeatable and predictive are the most valuable for forecasting.
        </p>
      </div>

      {/* Filters */}
      <div className="p-4 rounded-lg border-2" style={{ backgroundColor: '#D9D8D8', borderColor: '#E1C825' }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Target Stat Selector */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">Predict This Stat</label>
            <select
              value={targetStat}
              onChange={(e) => setTargetStat(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white border text-gray-900 focus:outline-none"
              style={{ borderColor: '#E1C825' }}
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

      {/* Target Info */}
      {data && (
        <div className="p-3 rounded-lg border-2" style={{ backgroundColor: '#D9D8D8', borderColor: '#E1C825' }}>
          <span className="font-medium" style={{ color: '#183521' }}>
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
        <div className="p-6 rounded-lg bg-red-100 border-2 border-red-300 text-red-700">
          <p>Failed to load predictive data. Please try again.</p>
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
                  Predictor Stat
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-300 w-28">
                  Category
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-300 w-24">
                  Sticky R²
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-300 w-24">
                  Predict R²
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium w-24" style={{ color: '#E1C825' }}>
                  Combined
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-300 w-20">
                  Sample
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
                  <td className="px-4 py-3 text-right text-gray-700 font-mono">
                    {entry.stickiness_r2.toFixed(3)}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-700 font-mono">
                    {entry.predictive_r2.toFixed(3)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <CombinedScoreBar value={entry.combined_score} />
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600">
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
        <div className="p-6 rounded-lg border-2 text-center" style={{ backgroundColor: '#D9D8D8', borderColor: '#E1C825' }}>
          <p className="text-gray-600">
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
      <div className="w-20 h-2 bg-gray-300 rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full", color)}
          style={{ width: `${Math.min(percentage * 2, 100)}%` }}
        />
      </div>
      <span className="font-mono text-sm font-bold w-12 text-right" style={{ color: '#183521' }}>
        {value.toFixed(3)}
      </span>
    </div>
  );
}

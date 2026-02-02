"use client";

import { useState } from "react";
import { useDiscoverStats, useTrends } from "@/hooks";
import { ChartPanel } from "@/components/charts/ChartPanel";
import { TrendChart } from "@/components/charts/TrendChart";
import { cn } from "@/lib/utils";

export function TrendsTab() {
  const [statX, setStatX] = useState("avg_velocity");
  const [statY, setStatY] = useState("whiff_pct");
  const [minInnings, setMinInnings] = useState(50);

  const { data: stats } = useDiscoverStats();
  const { data: trends, isLoading, error } = useTrends({
    stat_x: statX,
    stat_y: statY,
    min_innings: minInnings,
  });

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case "increasing":
        return "↗";
      case "decreasing":
        return "↘";
      default:
        return "→";
    }
  };

  const getTrendColor = (direction: string) => {
    switch (direction) {
      case "increasing":
        return "text-green-600";
      case "decreasing":
        return "text-red-600";
      default:
        return "text-yellow-600";
    }
  };

  return (
    <div className="space-y-6">
      {/* Explanation */}
      <div className="p-4 rounded-lg border-2" style={{ backgroundColor: '#D9D8D8', borderColor: '#E1C825' }}>
        <h3 className="text-lg font-semibold text-black mb-2">Correlation Trends</h3>
        <p className="text-gray-600 text-sm">
          Track how the relationship between two stats has changed over the years (2015-present).
          This reveals whether certain relationships are becoming stronger or weaker as the game evolves.
        </p>
      </div>

      {/* Filters */}
      <div className="p-4 rounded-lg border-2" style={{ backgroundColor: '#D9D8D8', borderColor: '#E1C825' }}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* X-Axis Stat Selector */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">X-Axis Stat</label>
            <select
              value={statX}
              onChange={(e) => setStatX(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white border text-gray-900 focus:outline-none"
              style={{ borderColor: '#E1C825' }}
            >
              {stats?.map((stat) => (
                <option key={stat.id} value={stat.id}>
                  {stat.name}
                </option>
              )) ?? (
                <>
                  <option value="avg_velocity">Avg Fastball Velocity</option>
                  <option value="whiff_pct">Whiff %</option>
                </>
              )}
            </select>
          </div>

          {/* Y-Axis Stat Selector */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">Y-Axis Stat</label>
            <select
              value={statY}
              onChange={(e) => setStatY(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white border text-gray-900 focus:outline-none"
              style={{ borderColor: '#E1C825' }}
            >
              {stats?.map((stat) => (
                <option key={stat.id} value={stat.id}>
                  {stat.name}
                </option>
              )) ?? (
                <>
                  <option value="avg_velocity">Avg Fastball Velocity</option>
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

      {/* Chart */}
      <ChartPanel
        title={`${trends?.stat_x_name ?? statX} vs ${trends?.stat_y_name ?? statY} Over Time`}
        description={
          trends
            ? `Avg R² = ${trends.avg_r_squared.toFixed(3)} | Trend: ${trends.trend_direction}`
            : "Loading..."
        }
        explanation={{
          whatItShows: `This line chart shows how the correlation (R²) between ${trends?.stat_x_name ?? statX} and ${trends?.stat_y_name ?? statY} has changed from 2015 to present.`,
          howToRead: `Higher R² means a stronger relationship that year. Look for patterns: is the relationship getting stronger, weaker, or staying stable over time?`,
          whyItMatters: `Changing correlations can indicate how the game is evolving. For example, if velocity's relationship with strikeouts is increasing, it means velocity is becoming more important.`,
        }}
      >
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-64 text-red-400 text-sm">
            Failed to load trend data
          </div>
        ) : trends ? (
          <TrendChart
            data={trends.trend_data}
            statXName={trends.stat_x_name}
            statYName={trends.stat_y_name}
          />
        ) : null}
      </ChartPanel>

      {/* Summary Stats */}
      {trends && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg border-2" style={{ backgroundColor: '#D9D8D8', borderColor: '#E1C825' }}>
            <div className="text-sm text-gray-600 mb-1">Average R²</div>
            <div className="text-2xl font-bold font-mono" style={{ color: '#183521' }}>
              {trends.avg_r_squared.toFixed(4)}
            </div>
          </div>
          <div className="p-4 rounded-lg border-2" style={{ backgroundColor: '#D9D8D8', borderColor: '#E1C825' }}>
            <div className="text-sm text-gray-600 mb-1">Trend Direction</div>
            <div className={cn("text-2xl font-bold capitalize", getTrendColor(trends.trend_direction))}>
              {getTrendIcon(trends.trend_direction)} {trends.trend_direction}
            </div>
          </div>
          <div className="p-4 rounded-lg border-2" style={{ backgroundColor: '#D9D8D8', borderColor: '#E1C825' }}>
            <div className="text-sm text-gray-600 mb-1">Years Analyzed</div>
            <div className="text-2xl font-bold" style={{ color: '#183521' }}>
              {trends.trend_data.length}
            </div>
          </div>
        </div>
      )}

      {/* Year-by-Year Table */}
      {trends && trends.trend_data.length > 0 && (
        <div className="overflow-x-auto rounded-lg border-2" style={{ borderColor: '#E1C825' }}>
          <table className="w-full">
            <thead style={{ backgroundColor: '#183521' }}>
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Year</th>
                <th className="px-4 py-3 text-right text-sm font-medium" style={{ color: '#E1C825' }}>R²</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-300">Correlation (r)</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-300">Sample Size</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ backgroundColor: '#D9D8D8' }}>
              {trends.trend_data.map((point) => (
                <tr
                  key={point.year}
                  className="hover:bg-gray-200 transition-colors"
                >
                  <td className="px-4 py-3 text-gray-900 font-medium">{point.year}</td>
                  <td className="px-4 py-3 text-right font-mono" style={{ color: '#183521' }}>
                    {point.r_squared.toFixed(4)}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-700 font-mono">
                    {point.correlation_r.toFixed(4)}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600">
                    {point.sample_size}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { useDiscoverStats, useCorrelations, useCorrelationRankings } from "@/hooks";
import { cn } from "@/lib/utils";
import { ChartPanel } from "@/components/charts/ChartPanel";
import { ScatterPlot } from "@/components/charts/ScatterPlot";
export function CorrelationsTab() {
  const [statX, setStatX] = useState("avg_velocity");
  const [statY, setStatY] = useState("whiff_pct");
  const [minInnings, setMinInnings] = useState(50);

  const { data: stats } = useDiscoverStats();
  const { data: correlation, isLoading, error } = useCorrelations({
    stat_x: statX,
    stat_y: statY,
    min_innings: minInnings,
  });

  const { data: rankings, isLoading: rankingsLoading } = useCorrelationRankings({
    target_stat: statY,
    min_innings: minInnings,
  });

  return (
    <div className="space-y-6">
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

      {/* Chart with explanation panel */}
      <ChartPanel
        title={`${correlation?.stat_x_name ?? statX} vs ${correlation?.stat_y_name ?? statY}`}
        description={
          correlation
            ? `r = ${correlation.correlation_r.toFixed(3)} | R² = ${correlation.r_squared.toFixed(3)} | n = ${correlation.sample_size}`
            : "Loading..."
        }
        explanation={{
          whatItShows: `This scatter plot shows the relationship between ${correlation?.stat_x_name ?? statX} and ${correlation?.stat_y_name ?? statY} for all qualified pitchers. Each dot represents one pitcher's season.`,
          howToRead: `The orange trend line shows the average relationship. Points above the line performed better than expected in ${correlation?.stat_y_name ?? statY} given their ${correlation?.stat_x_name ?? statX}. The R² value tells you how strong the relationship is (0 = none, 1 = perfect).`,
          whyItMatters: `Understanding which stats correlate helps identify what skills lead to success. Strong correlations suggest a skill matters; weak correlations suggest the stat might be noise or context-dependent.`,
        }}
      >
        {isLoading ? (
          <div className="flex items-center justify-center h-80">
            <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-80 text-red-400 text-sm">
            Failed to load correlation data
          </div>
        ) : correlation ? (
          <ScatterPlot
            data={correlation.scatter_data}
            xLabel={correlation.stat_x_name}
            yLabel={correlation.stat_y_name}
            regressionLine={correlation.regression}
          />
        ) : null}
      </ChartPanel>

      {/* Stats Summary Cards */}
      {correlation && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Correlation (r)"
            value={correlation.correlation_r.toFixed(4)}
            description="Strength and direction of relationship (-1 to 1)"
          />
          <StatCard
            label="R²"
            value={correlation.r_squared.toFixed(4)}
            description="Percentage of variance explained (0 to 1)"
          />
          <StatCard
            label="P-value"
            value={correlation.p_value < 0.001 ? "< 0.001" : correlation.p_value.toFixed(4)}
            description="Statistical significance (< 0.05 is significant)"
          />
          <StatCard
            label="Sample Size"
            value={correlation.sample_size.toString()}
            description="Number of pitcher seasons analyzed"
          />
        </div>
      )}

      {/* Regression Equation */}
      {correlation && (
        <div className="p-4 rounded-lg border-2" style={{ backgroundColor: '#D9D8D8', borderColor: '#E1C825' }}>
          <div className="text-sm text-gray-600 mb-1">Regression Equation</div>
          <div className="text-lg font-mono text-black">{correlation.regression.equation}</div>
        </div>
      )}

      {/* Correlation Rankings Table */}
      <div className="p-4 rounded-lg border-2" style={{ backgroundColor: '#D9D8D8', borderColor: '#E1C825' }}>
        <h3 className="text-lg font-semibold text-black mb-3">
          Stats Most Correlated with {rankings?.target_stat_name ?? statY}
        </h3>
        <p className="text-gray-600 text-sm mb-4">
          Rankings of all stats by how strongly they correlate with the selected Y-axis stat.
          Click any row to view that correlation.
        </p>

        {rankingsLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        ) : rankings && rankings.entries.length > 0 ? (
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
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-300 w-28">
                    Category
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium w-24" style={{ color: '#E1C825' }}>
                    r
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-300 w-24">
                    R²
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-300 w-20">
                    n
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ backgroundColor: '#D9D8D8' }}>
                {rankings.entries.map((entry) => (
                  <tr
                    key={entry.stat}
                    onClick={() => setStatX(entry.stat)}
                    className={cn(
                      "hover:bg-gray-200 transition-colors cursor-pointer",
                      entry.stat === statX && "bg-yellow-100"
                    )}
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
                      <span
                        className={cn(
                          "font-mono font-medium",
                          entry.correlation_r > 0 ? "text-green-700" : "text-red-700"
                        )}
                      >
                        {entry.correlation_r > 0 ? "+" : ""}{entry.correlation_r.toFixed(3)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-gray-700">
                      {entry.r_squared.toFixed(3)}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600">
                      {entry.sample_size}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No correlation data available</p>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  description,
}: {
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="p-4 rounded-lg border-2" style={{ backgroundColor: '#D9D8D8', borderColor: '#E1C825' }}>
      <div className="text-sm text-gray-600 mb-1">{label}</div>
      <div className="text-2xl font-bold font-mono" style={{ color: '#183521' }}>{value}</div>
      <div className="text-xs text-gray-500 mt-1">{description}</div>
    </div>
  );
}

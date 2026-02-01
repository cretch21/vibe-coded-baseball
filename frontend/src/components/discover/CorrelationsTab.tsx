"use client";

import { useState } from "react";
import { useDiscoverStats, useCorrelations } from "@/hooks";
import { ChartPanel } from "@/components/charts/ChartPanel";
import { ScatterPlot } from "@/components/charts/ScatterPlot";
import { cn } from "@/lib/utils";

type PitcherFilter = "all" | "starters" | "relievers";

export function CorrelationsTab() {
  const [statX, setStatX] = useState("avg_velocity");
  const [statY, setStatY] = useState("whiff_pct");
  const [pitcherFilter, setPitcherFilter] = useState<PitcherFilter>("all");
  const [minInnings, setMinInnings] = useState(50);

  const isStarter = pitcherFilter === "all" ? undefined : pitcherFilter === "starters";

  const { data: stats } = useDiscoverStats();
  const { data: correlation, isLoading, error } = useCorrelations({
    stat_x: statX,
    stat_y: statY,
    is_starter: isStarter,
    min_innings: minInnings,
  });

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="p-4 rounded-lg bg-primary-800 border border-primary-700">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* X-Axis Stat Selector */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">X-Axis Stat</label>
            <select
              value={statX}
              onChange={(e) => setStatX(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-primary-900 border border-primary-700 text-white focus:outline-none focus:border-accent"
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
            <label className="block text-sm text-gray-400 mb-2">Y-Axis Stat</label>
            <select
              value={statY}
              onChange={(e) => setStatY(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-primary-900 border border-primary-700 text-white focus:outline-none focus:border-accent"
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
        <div className="p-4 rounded-lg bg-primary-800/50 border border-primary-700/50">
          <div className="text-sm text-gray-400 mb-1">Regression Equation</div>
          <div className="text-lg font-mono text-white">{correlation.regression.equation}</div>
        </div>
      )}
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
    <div className="p-4 rounded-lg bg-primary-800 border border-primary-700">
      <div className="text-sm text-gray-400 mb-1">{label}</div>
      <div className="text-2xl font-bold text-white font-mono">{value}</div>
      <div className="text-xs text-gray-500 mt-1">{description}</div>
    </div>
  );
}

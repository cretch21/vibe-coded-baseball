"use client";

import { use, useState } from "react";
import Link from "next/link";
import { usePitcher, usePitcherStats } from "@/hooks";
import { GameLogTable, VelocityChart, StrikeZoneHeatmap, ChartPanel } from "@/components/charts";
import { cn } from "@/lib/utils";

export default function PitcherDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const pitcherId = parseInt(id, 10);

  const { data: pitcher, isLoading: pitcherLoading } = usePitcher(pitcherId);

  // Use first available season as default
  const [selectedYear, setSelectedYear] = useState<number | undefined>(undefined);
  const yearToUse = selectedYear ?? pitcher?.seasons?.[0];

  const { data: stats, isLoading: statsLoading } = usePitcherStats(
    pitcherId,
    yearToUse
  );

  // Heatmap controls
  const [heatmapMetric, setHeatmapMetric] = useState<"usage" | "whiff" | "velocity">("usage");
  const [batterHand, setBatterHand] = useState<"L" | "R" | null>(null);

  const isLoading = pitcherLoading || statsLoading;

  if (isLoading && !pitcher) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!pitcher) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="p-6 rounded-lg bg-red-900/20 border border-red-800 text-red-300">
          <p>Pitcher not found.</p>
          <Link href="/pitchers" className="text-accent hover:underline mt-2 inline-block">
            Back to Pitchers
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link href="/pitchers" className="text-gray-400 hover:text-accent transition-colors">
          Pitchers
        </Link>
        <span className="text-gray-600 mx-2">/</span>
        <span className="text-white">{pitcher.name}</span>
      </div>

      {/* Header with Season Selector */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">{pitcher.name}</h1>
            <div className="flex items-center gap-4 text-gray-400">
              <span>{pitcher.team || "Free Agent"}</span>
              <span>•</span>
              <span>{pitcher.throws === "L" ? "Left-handed" : "Right-handed"}</span>
              <span>•</span>
              <span>{pitcher.is_starter ? "Starter" : "Reliever"}</span>
              {pitcher.is_active && (
                <>
                  <span>•</span>
                  <span className="text-green-400">Active</span>
                </>
              )}
            </div>
          </div>

          {/* Season Selector */}
          {pitcher.seasons && pitcher.seasons.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-gray-400 text-sm">Season:</span>
              <select
                value={yearToUse ?? ""}
                onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
                className="px-3 py-2 rounded-lg bg-primary-800 border border-primary-700 text-white focus:outline-none focus:border-accent"
              >
                {pitcher.seasons.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Season Stats */}
      {stats && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-accent mb-4">
            {stats.year} Season Overview
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <StatCard label="Games" value={stats.games} />
            <StatCard label="Total Pitches" value={stats.total_pitches.toLocaleString()} />
            <StatCard label="Avg Velocity" value={stats.avg_velocity ? `${stats.avg_velocity} mph` : "—"} />
            <StatCard label="Max Velocity" value={stats.max_velocity ? `${stats.max_velocity} mph` : "—"} />
            <StatCard label="Strike %" value={stats.strike_pct ? `${stats.strike_pct}%` : "—"} />
            <StatCard label="Whiff %" value={stats.whiff_pct ? `${stats.whiff_pct}%` : "—"} />
          </div>
        </div>
      )}

      {/* Pitch Arsenal */}
      {stats && stats.pitch_types.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-accent mb-4">Pitch Arsenal</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.pitch_types.map((pitch) => (
              <div
                key={pitch.pitch_type}
                className="p-4 rounded-lg bg-primary-800 border border-primary-700"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-medium text-white">
                    {pitch.pitch_name || pitch.pitch_type}
                  </h3>
                  <span className="text-accent font-mono">{pitch.usage_pct}%</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500">Velocity</span>
                    <p className="text-white">
                      {pitch.avg_velocity ? `${pitch.avg_velocity} mph` : "—"}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Spin Rate</span>
                    <p className="text-white">
                      {pitch.avg_spin_rate ? `${pitch.avg_spin_rate} rpm` : "—"}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Whiff %</span>
                    <p className="text-white">
                      {pitch.whiff_pct ? `${pitch.whiff_pct}%` : "—"}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Movement (H/V)</span>
                    <p className="text-white">
                      {pitch.avg_pfx_x && pitch.avg_pfx_z
                        ? `${pitch.avg_pfx_x}" / ${pitch.avg_pfx_z}"`
                        : "—"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Velocity Trend Chart */}
        <ChartPanel
          title="Velocity Trend"
          description="Average fastball velocity by game"
          explanation={{
            whatItShows: "This chart shows the pitcher's average velocity for each game across the season, displayed chronologically from left to right.",
            howToRead: "Each point represents one game. Look for trends like declining velocity (fatigue) or improving velocity (mechanical improvements).",
            whyItMatters: "Velocity trends can indicate arm health, fatigue patterns, or mechanical changes that affect performance.",
          }}
        >
          <VelocityChart pitcherId={pitcherId} year={yearToUse} />
        </ChartPanel>

        {/* Strike Zone Heatmap */}
        <ChartPanel
          title="Strike Zone Heatmap"
          description="Pitch location frequency and effectiveness"
          explanation={{
            whatItShows: "A 5x5 grid showing where the pitcher throws, from the catcher's perspective. The dashed gold line indicates the strike zone.",
            howToRead: "Brighter colors indicate higher values. Usage shows where pitches are thrown most; Whiff shows swing-and-miss zones; Velocity shows speed by location.",
            whyItMatters: "Understanding pitch location patterns helps identify command strengths and areas opponents might exploit.",
          }}
        >
          <div className="space-y-4">
            {/* Controls */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-sm">Metric:</span>
                <div className="flex rounded-lg overflow-hidden border border-primary-700">
                  {(["usage", "whiff", "velocity"] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setHeatmapMetric(m)}
                      className={cn(
                        "px-3 py-1 text-sm transition-colors",
                        heatmapMetric === m
                          ? "bg-accent text-primary-900"
                          : "bg-primary-800 text-gray-400 hover:text-white"
                      )}
                    >
                      {m.charAt(0).toUpperCase() + m.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-sm">vs:</span>
                <div className="flex rounded-lg overflow-hidden border border-primary-700">
                  {([null, "L", "R"] as const).map((hand) => (
                    <button
                      key={hand ?? "all"}
                      onClick={() => setBatterHand(hand)}
                      className={cn(
                        "px-3 py-1 text-sm transition-colors",
                        batterHand === hand
                          ? "bg-accent text-primary-900"
                          : "bg-primary-800 text-gray-400 hover:text-white"
                      )}
                    >
                      {hand === null ? "All" : hand === "L" ? "LHB" : "RHB"}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <StrikeZoneHeatmap
              pitcherId={pitcherId}
              year={yearToUse}
              metric={heatmapMetric}
              batterHand={batterHand}
            />
          </div>
        </ChartPanel>
      </div>

      {/* Game Log */}
      <ChartPanel
        title="Game Log"
        description={`Last 30 games${yearToUse ? ` in ${yearToUse}` : ""}`}
        className="mb-8"
      >
        <GameLogTable pitcherId={pitcherId} year={yearToUse} limit={30} />
      </ChartPanel>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="p-4 rounded-lg bg-primary-800 border border-primary-700 text-center">
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-gray-500 text-sm">{label}</p>
    </div>
  );
}

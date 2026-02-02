"use client";

import { useState } from "react";
import Link from "next/link";
import { usePitcher, usePitcherStats } from "@/hooks";
import { GameLogTable, VelocityChart, StrikeZoneHeatmap, ChartPanel } from "@/components/charts";
import { cn } from "@/lib/utils";

export default function PitcherDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const pitcherId = parseInt(params.id, 10);

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
      <div className="container mx-auto px-4 py-4">
        <div className="rounded-lg p-8 flex items-center justify-center border-2" style={{ backgroundColor: '#D9D8D8', borderColor: '#E1C825' }}>
          <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#E1C825', borderTopColor: 'transparent' }} />
        </div>
      </div>
    );
  }

  if (!pitcher) {
    return (
      <div className="container mx-auto px-4 py-4">
        <div className="rounded-lg p-6 border-2" style={{ backgroundColor: '#D9D8D8', borderColor: '#E1C825' }}>
          <p className="text-red-600 mb-2">Pitcher not found.</p>
          <Link href="/pitchers" className="hover:underline" style={{ color: '#E1C825' }}>
            Back to Pitchers
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-4">
      {/* Header Card */}
      <div className="rounded-lg p-4 mb-4 border-2" style={{ backgroundColor: '#D9D8D8', borderColor: '#E1C825' }}>
        {/* Breadcrumb */}
        <div className="mb-4 text-sm">
          <Link href="/pitchers" className="text-gray-600 hover:text-accent transition-colors">
            Pitchers
          </Link>
          <span className="text-gray-400 mx-2">/</span>
          <span className="text-black font-medium">{pitcher.name}</span>
        </div>

        {/* Header with Season Selector */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-black mb-1">{pitcher.name}</h1>
            <div className="flex items-center gap-3 text-gray-600 text-sm">
              <span className="font-medium">{pitcher.team || "Free Agent"}</span>
              <span>•</span>
              <span>{pitcher.throws === "L" ? "Left-handed" : "Right-handed"}</span>
              <span>•</span>
              <span>{pitcher.is_starter ? "Starter" : "Reliever"}</span>
              {pitcher.is_active && (
                <>
                  <span>•</span>
                  <span className="text-green-600 font-medium">Active</span>
                </>
              )}
            </div>
          </div>

          {/* Season Selector */}
          {pitcher.seasons && pitcher.seasons.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-gray-600 text-sm">Season:</span>
              <select
                value={yearToUse ?? ""}
                onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
                className="px-3 py-2 rounded border border-gray-300 bg-white text-gray-900 focus:outline-none"
                style={{ borderColor: '#E1C825' }}
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

      {/* Season Stats Card */}
      {stats && (
        <div className="rounded-lg p-4 mb-4 text-white border-2" style={{ backgroundColor: '#183521', borderColor: '#E1C825' }}>
          <h2 className="font-bold mb-4" style={{ color: '#E1C825' }}>
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
        <div className="rounded-lg p-4 mb-4 border-2" style={{ backgroundColor: '#D9D8D8', borderColor: '#E1C825' }}>
          <h2 className="text-lg font-bold text-black mb-4">Pitch Arsenal</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {stats.pitch_types.map((pitch) => (
              <div
                key={pitch.pitch_type}
                className="p-4 rounded bg-white border border-gray-200"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900">
                    {pitch.pitch_name || pitch.pitch_type}
                  </h3>
                  <span className="font-mono font-bold" style={{ color: '#E1C825' }}>{pitch.usage_pct}%</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500">Velocity</span>
                    <p className="text-gray-900 font-medium">
                      {pitch.avg_velocity ? `${pitch.avg_velocity} mph` : "—"}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Spin Rate</span>
                    <p className="text-gray-900 font-medium">
                      {pitch.avg_spin_rate ? `${pitch.avg_spin_rate} rpm` : "—"}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Whiff %</span>
                    <p className="text-gray-900 font-medium">
                      {pitch.whiff_pct ? `${pitch.whiff_pct}%` : "—"}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Movement (H/V)</span>
                    <p className="text-gray-900 font-medium">
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* Velocity Trend Chart */}
        <div className="rounded-lg p-4 border-2" style={{ backgroundColor: '#D9D8D8', borderColor: '#E1C825' }}>
          <h3 className="font-bold text-black mb-2">Velocity Trend</h3>
          <p className="text-gray-500 text-sm mb-4">Average fastball velocity by game</p>
          <VelocityChart pitcherId={pitcherId} year={yearToUse} />
        </div>

        {/* Strike Zone Heatmap */}
        <div className="rounded-lg p-4 border-2" style={{ backgroundColor: '#D9D8D8', borderColor: '#E1C825' }}>
          <h3 className="font-bold text-black mb-2">Strike Zone Heatmap</h3>
          <p className="text-gray-500 text-sm mb-4">Pitch location frequency and effectiveness</p>
          <div className="space-y-4">
            {/* Controls */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-gray-600 text-sm">Metric:</span>
                <div className="flex rounded overflow-hidden border border-gray-300">
                  {(["usage", "whiff", "velocity"] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setHeatmapMetric(m)}
                      className={cn(
                        "px-3 py-1 text-sm transition-colors",
                        heatmapMetric === m
                          ? "text-black"
                          : "bg-white text-gray-600 hover:bg-gray-50"
                      )}
                      style={heatmapMetric === m ? { backgroundColor: '#E1C825' } : {}}
                    >
                      {m.charAt(0).toUpperCase() + m.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-600 text-sm">vs:</span>
                <div className="flex rounded overflow-hidden border border-gray-300">
                  {([null, "L", "R"] as const).map((hand) => (
                    <button
                      key={hand ?? "all"}
                      onClick={() => setBatterHand(hand)}
                      className={cn(
                        "px-3 py-1 text-sm transition-colors",
                        batterHand === hand
                          ? "text-black"
                          : "bg-white text-gray-600 hover:bg-gray-50"
                      )}
                      style={batterHand === hand ? { backgroundColor: '#E1C825' } : {}}
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
        </div>
      </div>

      {/* Game Log */}
      <div className="rounded-lg p-4 border-2" style={{ backgroundColor: '#D9D8D8', borderColor: '#E1C825' }}>
        <h3 className="font-bold text-black mb-2">Game Log</h3>
        <p className="text-gray-500 text-sm mb-4">Last 30 games{yearToUse ? ` in ${yearToUse}` : ""}</p>
        <GameLogTable pitcherId={pitcherId} year={yearToUse} limit={30} />
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="text-center">
      <p className="text-xl font-bold" style={{ color: '#E1C825' }}>{value}</p>
      <p className="text-gray-400 text-sm">{label}</p>
    </div>
  );
}

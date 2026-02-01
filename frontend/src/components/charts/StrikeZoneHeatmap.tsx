"use client";

import { useMemo } from "react";
import { usePitcherPitches } from "@/hooks";
import type { Pitch } from "@/types";

interface StrikeZoneHeatmapProps {
  pitcherId: number;
  year?: number;
  metric?: "whiff" | "usage" | "velocity";
  pitchType?: string;
  batterHand?: "L" | "R" | null;
}

// Strike zone dimensions (in feet, from catcher's perspective)
const ZONE = {
  left: -0.83,   // 10 inches from center
  right: 0.83,
  bottom: 1.5,   // Typical zone bottom
  top: 3.5,      // Typical zone top
};

// Grid configuration (5x5)
const GRID_SIZE = 5;
const CELL_SIZE = 50;
const PADDING = 20;
const SVG_WIDTH = GRID_SIZE * CELL_SIZE + PADDING * 2;
const SVG_HEIGHT = GRID_SIZE * CELL_SIZE + PADDING * 2;

export function StrikeZoneHeatmap({
  pitcherId,
  year,
  metric = "usage",
  pitchType,
  batterHand,
}: StrikeZoneHeatmapProps) {
  const { data, isLoading, error } = usePitcherPitches(pitcherId, {
    year,
    pitch_type: pitchType,
    page_size: 500,
  });

  // Process pitches into grid cells
  const gridData = useMemo(() => {
    if (!data?.items) return null;

    let pitches = data.items.filter(
      (p: Pitch) => p.plate_x !== null && p.plate_z !== null
    );

    // Filter by batter hand if specified
    if (batterHand) {
      pitches = pitches.filter((p: Pitch) => p.batter_stand === batterHand);
    }

    if (pitches.length === 0) return null;

    // Initialize grid
    const grid: {
      count: number;
      whiffs: number;
      totalVelo: number;
      veloCount: number;
    }[][] = Array.from({ length: GRID_SIZE }, () =>
      Array.from({ length: GRID_SIZE }, () => ({
        count: 0,
        whiffs: 0,
        totalVelo: 0,
        veloCount: 0,
      }))
    );

    // Extended zone for heatmap (wider than actual strike zone)
    const extLeft = -1.5;
    const extRight = 1.5;
    const extBottom = 1.0;
    const extTop = 4.0;
    const cellWidth = (extRight - extLeft) / GRID_SIZE;
    const cellHeight = (extTop - extBottom) / GRID_SIZE;

    // Populate grid
    pitches.forEach((pitch: Pitch) => {
      const col = Math.floor((pitch.plate_x! - extLeft) / cellWidth);
      const row = Math.floor((extTop - pitch.plate_z!) / cellHeight);

      if (col >= 0 && col < GRID_SIZE && row >= 0 && row < GRID_SIZE) {
        grid[row][col].count++;

        if (pitch.description?.includes("swinging_strike")) {
          grid[row][col].whiffs++;
        }

        if (pitch.release_speed) {
          grid[row][col].totalVelo += pitch.release_speed;
          grid[row][col].veloCount++;
        }
      }
    });

    // Calculate metric values
    const totalPitches = pitches.length;
    return grid.map((row) =>
      row.map((cell) => {
        let value = 0;
        switch (metric) {
          case "usage":
            value = totalPitches > 0 ? (cell.count / totalPitches) * 100 : 0;
            break;
          case "whiff":
            value = cell.count > 0 ? (cell.whiffs / cell.count) * 100 : 0;
            break;
          case "velocity":
            value = cell.veloCount > 0 ? cell.totalVelo / cell.veloCount : 0;
            break;
        }
        return { ...cell, value };
      })
    );
  }, [data, metric, batterHand]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !gridData) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
        {error ? "Failed to load pitch data" : "No pitch location data available"}
      </div>
    );
  }

  // Find max value for color scaling
  const maxValue = Math.max(...gridData.flat().map((c) => c.value));

  return (
    <div className="flex flex-col items-center">
      <svg
        width={SVG_WIDTH}
        height={SVG_HEIGHT}
        viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
        className="overflow-visible"
      >
        {/* Grid cells */}
        {gridData.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            const x = PADDING + colIndex * CELL_SIZE;
            const y = PADDING + rowIndex * CELL_SIZE;
            const intensity = maxValue > 0 ? cell.value / maxValue : 0;
            const color = getHeatColor(intensity, metric);

            return (
              <g key={`${rowIndex}-${colIndex}`}>
                <rect
                  x={x}
                  y={y}
                  width={CELL_SIZE}
                  height={CELL_SIZE}
                  fill={color}
                  stroke="#274b30"
                  strokeWidth={1}
                />
                {cell.count > 0 && (
                  <text
                    x={x + CELL_SIZE / 2}
                    y={y + CELL_SIZE / 2}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill={intensity > 0.5 ? "#000" : "#fff"}
                    fontSize={11}
                    fontWeight={500}
                  >
                    {formatValue(cell.value, metric)}
                  </text>
                )}
              </g>
            );
          })
        )}

        {/* Strike zone outline */}
        <rect
          x={PADDING + CELL_SIZE}
          y={PADDING + CELL_SIZE * 0.5}
          width={CELL_SIZE * 3}
          height={CELL_SIZE * 4}
          fill="none"
          stroke="#E1C825"
          strokeWidth={2}
          strokeDasharray="4 2"
        />
      </svg>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 text-xs text-gray-400">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: getHeatColor(0, metric) }} />
          <span>Low</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: getHeatColor(0.5, metric) }} />
          <span>Medium</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: getHeatColor(1, metric) }} />
          <span>High</span>
        </div>
      </div>
    </div>
  );
}

function getHeatColor(intensity: number, metric: string): string {
  // Different color schemes for different metrics
  if (metric === "whiff") {
    // Blue to red for whiff rate
    const r = Math.round(intensity * 220 + 30);
    const g = Math.round((1 - intensity) * 100 + 30);
    const b = Math.round((1 - intensity) * 150 + 50);
    return `rgb(${r}, ${g}, ${b})`;
  } else if (metric === "velocity") {
    // Purple to orange for velocity
    const r = Math.round(intensity * 200 + 50);
    const g = Math.round(intensity * 100 + 30);
    const b = Math.round((1 - intensity) * 150 + 50);
    return `rgb(${r}, ${g}, ${b})`;
  } else {
    // Green to gold for usage
    const r = Math.round(intensity * 200 + 30);
    const g = Math.round(intensity * 150 + 50);
    const b = Math.round((1 - intensity) * 50 + 30);
    return `rgb(${r}, ${g}, ${b})`;
  }
}

function formatValue(value: number, metric: string): string {
  if (metric === "velocity") {
    return value > 0 ? value.toFixed(0) : "";
  }
  return value > 0 ? `${value.toFixed(0)}%` : "";
}

"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { usePitcherGames } from "@/hooks";

interface VelocityChartProps {
  pitcherId: number;
  year?: number;
}

const COLORS = {
  velocity: "#E1C825", // Gold accent
  grid: "#274b30",
  text: "#9ca3af",
};

export function VelocityChart({ pitcherId, year }: VelocityChartProps) {
  const { data: games, isLoading, error } = usePitcherGames(pitcherId, { year, limit: 30 });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-red-400 text-sm">
        Failed to load velocity data
      </div>
    );
  }

  if (!games || games.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
        No velocity data available
      </div>
    );
  }

  // Transform data for chart (reverse to show chronological order)
  const chartData = [...games]
    .reverse()
    .map((game, index) => ({
      game: index + 1,
      date: formatDate(game.date),
      velocity: game.avg_velocity,
      pitches: game.total_pitches,
    }));

  // Calculate min/max for Y axis
  const velocities = chartData.map((d) => d.velocity).filter(Boolean) as number[];
  const minVelo = Math.floor(Math.min(...velocities) - 1);
  const maxVelo = Math.ceil(Math.max(...velocities) + 1);

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} />
          <XAxis
            dataKey="date"
            stroke={COLORS.text}
            tick={{ fill: COLORS.text, fontSize: 11 }}
            tickLine={{ stroke: COLORS.grid }}
          />
          <YAxis
            domain={[minVelo, maxVelo]}
            stroke={COLORS.text}
            tick={{ fill: COLORS.text, fontSize: 11 }}
            tickLine={{ stroke: COLORS.grid }}
            tickFormatter={(value) => `${value}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1a3220",
              border: "1px solid #274b30",
              borderRadius: "8px",
            }}
            labelStyle={{ color: "#E1C825" }}
            itemStyle={{ color: "#fff" }}
            formatter={(value: number) => [`${value} mph`, "Avg Velocity"]}
          />
          <Legend
            wrapperStyle={{ color: COLORS.text }}
          />
          <Line
            type="monotone"
            dataKey="velocity"
            name="Avg Velocity"
            stroke={COLORS.velocity}
            strokeWidth={2}
            dot={{ fill: COLORS.velocity, strokeWidth: 0, r: 4 }}
            activeDot={{ r: 6, fill: COLORS.velocity }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

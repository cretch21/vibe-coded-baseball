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
import type { TrendPoint } from "@/types";

interface TrendChartProps {
  data: TrendPoint[];
  statXName: string;
  statYName: string;
}

const COLORS = {
  primary: "#E1C825", // Gold accent
  grid: "#274b30",
  text: "#9ca3af",
};

export function TrendChart({ data, statXName, statYName }: TrendChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
        No trend data available
      </div>
    );
  }

  // Transform data for chart
  const chartData = data.map((point) => ({
    year: point.year,
    r_squared: point.r_squared,
    sample_size: point.sample_size,
  }));

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} />
          <XAxis
            dataKey="year"
            stroke={COLORS.text}
            tick={{ fill: COLORS.text, fontSize: 11 }}
            tickLine={{ stroke: COLORS.grid }}
          />
          <YAxis
            domain={[0, 1]}
            stroke={COLORS.text}
            tick={{ fill: COLORS.text, fontSize: 11 }}
            tickLine={{ stroke: COLORS.grid }}
            tickFormatter={(value) => value.toFixed(2)}
            label={{
              value: "R²",
              angle: -90,
              position: "insideLeft",
              fill: COLORS.text,
              fontSize: 12,
            }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1a3220",
              border: "1px solid #274b30",
              borderRadius: "8px",
            }}
            labelStyle={{ color: "#E1C825" }}
            itemStyle={{ color: "#fff" }}
            formatter={(value: number, name: string) => {
              if (name === "r_squared") {
                return [value.toFixed(4), "R²"];
              }
              return [value, name];
            }}
            labelFormatter={(label) => `Year: ${label}`}
          />
          <Legend wrapperStyle={{ color: COLORS.text }} />
          <Line
            type="monotone"
            dataKey="r_squared"
            name={`${statXName} vs ${statYName}`}
            stroke={COLORS.primary}
            strokeWidth={2}
            dot={{ fill: COLORS.primary, strokeWidth: 0, r: 4 }}
            activeDot={{ r: 6, fill: COLORS.primary }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

"use client";

import { useMemo } from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import Link from "next/link";
import type { ScatterPoint, RegressionLine } from "@/types";

interface ScatterPlotProps {
  data: ScatterPoint[];
  xLabel: string;
  yLabel: string;
  regressionLine?: RegressionLine;
}

const COLORS = {
  primary: "#E1C825", // Gold accent
  grid: "#274b30",
  text: "#9ca3af",
  regression: "#ff7300", // Orange for regression line
};

export function ScatterPlot({
  data,
  xLabel,
  yLabel,
  regressionLine,
}: ScatterPlotProps) {
  // Filter out points with missing values
  const validData = useMemo(() => {
    return data.filter((d) => d.x != null && d.y != null);
  }, [data]);

  // Calculate regression line endpoints
  const regressionData = useMemo(() => {
    if (!regressionLine || validData.length === 0) return [];

    const xValues = validData.map((d) => d.x as number);
    const xMin = Math.min(...xValues);
    const xMax = Math.max(...xValues);

    return [
      { x: xMin, y: regressionLine.slope * xMin + regressionLine.intercept },
      { x: xMax, y: regressionLine.slope * xMax + regressionLine.intercept },
    ];
  }, [regressionLine, validData]);

  // Calculate axis domains with padding
  const { xDomain, yDomain } = useMemo(() => {
    if (validData.length === 0) {
      return { xDomain: [0, 100], yDomain: [0, 100] };
    }

    const xValues = validData.map((d) => d.x as number);
    const yValues = validData.map((d) => d.y as number);

    const xMin = Math.min(...xValues);
    const xMax = Math.max(...xValues);
    const yMin = Math.min(...yValues);
    const yMax = Math.max(...yValues);

    const xPadding = (xMax - xMin) * 0.1 || 1;
    const yPadding = (yMax - yMin) * 0.1 || 1;

    return {
      xDomain: [Math.floor(xMin - xPadding), Math.ceil(xMax + xPadding)],
      yDomain: [Math.floor(yMin - yPadding), Math.ceil(yMax + yPadding)],
    };
  }, [validData]);

  if (validData.length === 0) {
    return (
      <div className="flex items-center justify-center h-80 text-gray-400 text-sm">
        No data available
      </div>
    );
  }

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 20, right: 20, bottom: 40, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} />
          <XAxis
            dataKey="x"
            type="number"
            domain={xDomain}
            name={xLabel}
            stroke={COLORS.text}
            tick={{ fill: COLORS.text, fontSize: 11 }}
            tickLine={{ stroke: COLORS.grid }}
            label={{
              value: xLabel,
              position: "bottom",
              offset: 0,
              fill: COLORS.text,
              fontSize: 12,
            }}
          />
          <YAxis
            dataKey="y"
            type="number"
            domain={yDomain}
            name={yLabel}
            stroke={COLORS.text}
            tick={{ fill: COLORS.text, fontSize: 11 }}
            tickLine={{ stroke: COLORS.grid }}
            label={{
              value: yLabel,
              angle: -90,
              position: "insideLeft",
              fill: COLORS.text,
              fontSize: 12,
            }}
          />
          <Tooltip
            cursor={{ strokeDasharray: "3 3", stroke: COLORS.text }}
            contentStyle={{
              backgroundColor: "#1a3220",
              border: "1px solid #274b30",
              borderRadius: "8px",
            }}
            content={({ active, payload }) => {
              if (!active || !payload || payload.length === 0) return null;
              const point = payload[0].payload as ScatterPoint;
              return (
                <div className="bg-primary-800 border border-primary-700 rounded-lg p-3 shadow-lg">
                  <Link
                    href={`/pitchers/${point.pitcher_id}`}
                    className="text-accent font-medium hover:underline"
                  >
                    {point.name}
                  </Link>
                  {point.team && (
                    <span className="text-gray-400 ml-2">({point.team})</span>
                  )}
                  <div className="mt-1 text-sm text-gray-300">
                    <div>
                      {xLabel}: {point.x?.toFixed(2)}
                    </div>
                    <div>
                      {yLabel}: {point.y?.toFixed(2)}
                    </div>
                  </div>
                </div>
              );
            }}
          />
          {/* Main scatter points */}
          <Scatter
            data={validData}
            fill={COLORS.primary}
            fillOpacity={0.7}
          />
          {/* Regression line */}
          {regressionData.length === 2 && (
            <Scatter
              data={regressionData}
              line={{ stroke: COLORS.regression, strokeWidth: 2 }}
              shape={<></>}
              legendType="none"
            />
          )}
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}

"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface ChartPanelProps {
  title: string;
  description?: string;
  explanation?: {
    whatItShows: string;
    howToRead: string;
    whyItMatters: string;
  };
  children: React.ReactNode;
  className?: string;
}

export function ChartPanel({
  title,
  description,
  explanation,
  children,
  className,
}: ChartPanelProps) {
  const [showExplanation, setShowExplanation] = useState(false);

  return (
    <div className={cn("rounded-lg bg-primary-800 border border-primary-700", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-primary-700">
        <div>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          {description && (
            <p className="text-gray-400 text-sm mt-1">{description}</p>
          )}
        </div>
        {explanation && (
          <button
            onClick={() => setShowExplanation(!showExplanation)}
            className={cn(
              "p-2 rounded-lg transition-colors",
              showExplanation
                ? "bg-accent text-primary-900"
                : "bg-primary-700 text-gray-400 hover:text-white"
            )}
            title="Show explanation"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Content area */}
      <div className="flex">
        {/* Chart */}
        <div className={cn("flex-1 p-4", showExplanation && "border-r border-primary-700")}>
          {children}
        </div>

        {/* Explanation panel */}
        {showExplanation && explanation && (
          <div className="w-72 p-4 text-sm space-y-4">
            <div>
              <h4 className="text-accent font-medium mb-1">What You&apos;re Looking At</h4>
              <p className="text-gray-400">{explanation.whatItShows}</p>
            </div>
            <div>
              <h4 className="text-accent font-medium mb-1">How to Read It</h4>
              <p className="text-gray-400">{explanation.howToRead}</p>
            </div>
            <div>
              <h4 className="text-accent font-medium mb-1">Why It Matters</h4>
              <p className="text-gray-400">{explanation.whyItMatters}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

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
  const [showExplanation, setShowExplanation] = useState(true);

  return (
    <div
      className={cn("rounded-lg border-2", className)}
      style={{ backgroundColor: '#D9D8D8', borderColor: '#E1C825' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: '#E1C825' }}>
        <div>
          <h3 className="text-lg font-semibold text-black">{title}</h3>
          {description && (
            <p className="text-gray-600 text-sm mt-1">{description}</p>
          )}
        </div>
        {explanation && (
          <button
            onClick={() => setShowExplanation(!showExplanation)}
            className={cn(
              "p-2 rounded-lg transition-colors",
              showExplanation
                ? "text-black"
                : "bg-white text-gray-600 hover:bg-gray-100"
            )}
            style={showExplanation ? { backgroundColor: '#E1C825' } : {}}
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
        <div className={cn("flex-1 p-4", showExplanation && "border-r")} style={showExplanation ? { borderColor: '#E1C825' } : {}}>
          {children}
        </div>

        {/* Explanation panel */}
        {showExplanation && explanation && (
          <div className="w-72 p-4 text-sm space-y-4">
            <div>
              <h4 className="font-medium mb-1" style={{ color: '#183521' }}>What You&apos;re Looking At</h4>
              <p className="text-gray-600">{explanation.whatItShows}</p>
            </div>
            <div>
              <h4 className="font-medium mb-1" style={{ color: '#183521' }}>How to Read It</h4>
              <p className="text-gray-600">{explanation.howToRead}</p>
            </div>
            <div>
              <h4 className="font-medium mb-1" style={{ color: '#183521' }}>Why It Matters</h4>
              <p className="text-gray-600">{explanation.whyItMatters}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

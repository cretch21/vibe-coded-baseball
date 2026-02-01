"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  CorrelationsTab,
  StickinessTab,
  PredictiveTab,
  TrendsTab,
} from "@/components/discover";

type DiscoverTab = "correlations" | "stickiness" | "predictive" | "trends";

const tabs: { id: DiscoverTab; label: string; description: string }[] = [
  {
    id: "correlations",
    label: "Correlations",
    description: "Analyze relationships between any two statistics",
  },
  {
    id: "stickiness",
    label: "Stickiness",
    description: "Year-over-year consistency of stats",
  },
  {
    id: "predictive",
    label: "Predictive Power",
    description: "Stats that are both sticky AND predictive",
  },
  {
    id: "trends",
    label: "Trends",
    description: "How correlations change over 10+ years",
  },
];

export default function DiscoverPage() {
  const [activeTab, setActiveTab] = useState<DiscoverTab>("correlations");

  const currentTab = tabs.find((t) => t.id === activeTab);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Discover</h1>
        <p className="text-gray-400">
          Statistical analysis tools for exploring correlations, trends, and predictive metrics.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap border-b border-primary-700 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap",
              activeTab === tab.id
                ? "text-accent border-b-2 border-accent -mb-px"
                : "text-gray-400 hover:text-white"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Description */}
      {currentTab && (
        <div className="mb-6 text-sm text-gray-400">
          {currentTab.description}
        </div>
      )}

      {/* Tab Content */}
      <div>
        {activeTab === "correlations" && <CorrelationsTab />}
        {activeTab === "stickiness" && <StickinessTab />}
        {activeTab === "predictive" && <PredictiveTab />}
        {activeTab === "trends" && <TrendsTab />}
      </div>
    </div>
  );
}

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
      <div className="rounded-lg p-4 mb-6 border-2" style={{ backgroundColor: '#D9D8D8', borderColor: '#E1C825' }}>
        <h1 className="text-3xl font-bold text-black mb-2">Discover</h1>
        <p className="text-gray-600">
          Statistical analysis tools for exploring correlations, trends, and predictive metrics.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap mb-6 gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap rounded border-2",
              activeTab === tab.id
                ? "text-black"
                : "bg-white text-gray-700 hover:bg-gray-50"
            )}
            style={activeTab === tab.id
              ? { backgroundColor: '#E1C825', borderColor: '#E1C825' }
              : { borderColor: '#E1C825' }
            }
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

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { statsApi, DatabaseStats } from "@/lib/api";

const quickLinks = [
  {
    title: "Discover",
    description: "Statistical analysis & correlations",
    href: "/discover",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    title: "Pitchers",
    description: "Individual pitcher profiles",
    href: "/pitchers",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    title: "Leaderboards",
    description: "Rankings by any stat",
    href: "/leaderboards",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
      </svg>
    ),
  },
  {
    title: "Compare",
    description: "Side-by-side comparison",
    href: "/compare",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
      </svg>
    ),
  },
];

function formatNumber(num: number): string {
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1) + "M";
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(0) + "K";
  }
  return num.toLocaleString();
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function Dashboard() {
  const [stats, setStats] = useState<DatabaseStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    statsApi.getDatabase()
      .then(setStats)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container mx-auto px-4 py-4">
      {/* Quick Links Card */}
      <div className="rounded-lg p-4 mb-4 border-2 border-[#E1C825]" style={{ backgroundColor: '#D9D8D8' }}>
        <h2 className="text-lg font-bold text-black mb-4">Quick Navigation</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickLinks.map((link) => (
            <Link
              key={link.title}
              href={link.href}
              className="group block p-4 rounded bg-white border border-gray-200 hover:border-accent transition-all"
            >
              <div className="text-primary-800 mb-2 group-hover:text-accent transition-colors">
                {link.icon}
              </div>
              <h3 className="font-semibold text-gray-900 group-hover:text-accent transition-colors">
                {link.title}
              </h3>
              <p className="text-gray-500 text-sm">{link.description}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Dashboard Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* What's Happening */}
        <div className="rounded-lg p-4 border-2 border-[#E1C825]" style={{ backgroundColor: '#D9D8D8' }}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-[#E1C825] animate-pulse" />
            <h2 className="text-lg font-bold text-black">
              What&apos;s Happening
            </h2>
          </div>
          <div className="space-y-3">
            <p className="text-gray-600 text-sm">
              Anomalies and notable changes will appear here once data is loaded.
            </p>
            <div className="pt-3 border-t border-gray-300">
              <p className="text-gray-500 text-xs">
                Tracking velocity changes, new pitches, and performance trends
              </p>
            </div>
          </div>
        </div>

        {/* This Week in MLB */}
        <div className="rounded-lg p-4 border-2 border-[#E1C825]" style={{ backgroundColor: '#D9D8D8' }}>
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-5 h-5 text-[#183521]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h2 className="text-lg font-bold text-black">
              This Week in MLB
            </h2>
          </div>
          <div className="space-y-3">
            <p className="text-gray-600 text-sm">
              Weekly summary will appear here once data is loaded.
            </p>
            <div className="pt-3 border-t border-gray-300">
              <p className="text-gray-500 text-xs">
                Auto-generated reports highlighting top performers and trends
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="rounded-lg p-4 border-2 border-[#E1C825]" style={{ backgroundColor: '#D9D8D8' }}>
        <h3 className="font-bold mb-4 text-black">Database Stats</h3>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-4">
            <p className="text-red-400 text-sm">{error}</p>
            <p className="text-gray-400 text-xs mt-1">Make sure the API is running</p>
          </div>
        ) : stats ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold" style={{ color: '#183521' }}>{formatNumber(stats.pitchers)}</p>
              <p className="text-gray-600 text-sm">Pitchers</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold" style={{ color: '#183521' }}>{formatNumber(stats.pitches)}</p>
              <p className="text-gray-600 text-sm">Total Pitches</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold" style={{ color: '#183521' }}>
                {stats.years.length > 0 ? stats.years.join(", ") : "—"}
              </p>
              <p className="text-gray-600 text-sm">Seasons</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold" style={{ color: '#183521' }}>{formatDate(stats.last_updated)}</p>
              <p className="text-gray-600 text-sm">Last Updated</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Pitchers", value: "—" },
              { label: "Total Pitches", value: "—" },
              { label: "Seasons", value: "—" },
              { label: "Last Updated", value: "—" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl font-bold" style={{ color: '#183521' }}>{stat.value}</p>
                <p className="text-gray-600 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

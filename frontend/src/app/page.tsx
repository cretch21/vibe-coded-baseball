import Link from "next/link";

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

export default function Dashboard() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
          MLB Pitch Analytics
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Explore Statcast data, analyze pitcher performance, and discover
          statistical insights across the league.
        </p>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {quickLinks.map((link) => (
          <Link
            key={link.title}
            href={link.href}
            className="group block p-6 rounded-lg bg-primary-800 border border-primary-700 hover:border-accent transition-all hover:shadow-lg hover:shadow-accent/10"
          >
            <div className="text-accent mb-4 group-hover:scale-110 transition-transform">
              {link.icon}
            </div>
            <h2 className="text-xl font-semibold text-white mb-2 group-hover:text-accent transition-colors">
              {link.title}
            </h2>
            <p className="text-gray-400 text-sm">{link.description}</p>
          </Link>
        ))}
      </div>

      {/* Dashboard Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* What's Happening */}
        <div className="p-6 rounded-lg bg-primary-800 border border-primary-700">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <h2 className="text-xl font-semibold text-accent">
              What&apos;s Happening
            </h2>
          </div>
          <div className="space-y-3">
            <p className="text-gray-400 text-sm">
              Anomalies and notable changes will appear here once data is loaded.
            </p>
            <div className="pt-4 border-t border-primary-700">
              <p className="text-gray-500 text-xs">
                Tracking velocity changes, new pitches, and performance trends
              </p>
            </div>
          </div>
        </div>

        {/* This Week in MLB */}
        <div className="p-6 rounded-lg bg-primary-800 border border-primary-700">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h2 className="text-xl font-semibold text-accent">
              This Week in MLB
            </h2>
          </div>
          <div className="space-y-3">
            <p className="text-gray-400 text-sm">
              Weekly summary will appear here once data is loaded.
            </p>
            <div className="pt-4 border-t border-primary-700">
              <p className="text-gray-500 text-xs">
                Auto-generated reports highlighting top performers and trends
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview (placeholder for future) */}
      <div className="mt-8 p-6 rounded-lg bg-primary-800/50 border border-primary-700/50">
        <h3 className="text-lg font-medium text-gray-300 mb-4">Quick Stats</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Pitchers", value: "—" },
            { label: "Total Pitches", value: "—" },
            { label: "Seasons", value: "2015-2025" },
            { label: "Last Updated", value: "—" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-gray-500 text-sm">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

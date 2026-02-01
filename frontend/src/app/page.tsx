export default function Dashboard() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white mb-2">
          Vibe-Coded Baseball
        </h1>
        <p className="text-accent text-lg">
          Robert Stock's For Fun, Entirely Vibe-Coded App
        </p>
      </div>

      {/* Quick Search */}
      <div className="max-w-2xl mx-auto mb-12">
        <div className="relative">
          <input
            type="text"
            placeholder="Search for a pitcher..."
            className="w-full px-6 py-4 rounded-lg bg-primary-800 border border-primary-700 text-white placeholder-gray-400 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
          />
          <svg
            className="absolute right-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {[
          {
            title: "Discover",
            description: "Statistical analysis & correlations",
            href: "/discover",
          },
          {
            title: "Pitchers",
            description: "Individual pitcher profiles",
            href: "/pitchers",
          },
          {
            title: "Leaderboards",
            description: "Rankings by any stat",
            href: "/leaderboards",
          },
          {
            title: "Compare",
            description: "Side-by-side comparison",
            href: "/compare",
          },
        ].map((link) => (
          <a
            key={link.title}
            href={link.href}
            className="block p-6 rounded-lg bg-primary-800 border border-primary-700 hover:border-accent transition-colors"
          >
            <h2 className="text-xl font-semibold text-white mb-2">
              {link.title}
            </h2>
            <p className="text-gray-400">{link.description}</p>
          </a>
        ))}
      </div>

      {/* What's Happening - Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-lg bg-primary-800 border border-primary-700">
          <h2 className="text-xl font-semibold text-accent mb-4">
            What's Happening
          </h2>
          <p className="text-gray-400">
            Anomalies and notable changes will appear here once data is loaded.
          </p>
        </div>

        <div className="p-6 rounded-lg bg-primary-800 border border-primary-700">
          <h2 className="text-xl font-semibold text-accent mb-4">
            This Week in MLB
          </h2>
          <p className="text-gray-400">
            Weekly summary will appear here once data is loaded.
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-12 pt-6 border-t border-primary-700 text-center text-gray-500 text-sm">
        <p>Data powered by Statcast via pybaseball</p>
        <p className="mt-1">Last updated: Not yet loaded</p>
      </footer>
    </div>
  );
}

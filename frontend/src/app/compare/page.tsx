import Link from "next/link";

export default function ComparePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Compare</h1>
        <p className="text-gray-400">
          Side-by-side comparison of 2-4 pitchers. Compare arsenals, velocity trends, and stats.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map((slot) => (
          <div
            key={slot}
            className="aspect-square rounded-lg bg-primary-800 border border-primary-700 border-dashed flex items-center justify-center opacity-60"
          >
            <div className="text-center">
              <div className="text-4xl text-gray-600 mb-2">+</div>
              <p className="text-gray-500 text-sm">Add Pitcher {slot}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="p-6 rounded-lg bg-primary-800/50 border border-primary-700/50 text-center">
        <p className="text-gray-400 mb-4">
          Pitcher comparison will be available in Phase 6 of development.
        </p>
        <Link
          href="/"
          className="inline-block px-4 py-2 rounded bg-accent text-primary-900 font-medium hover:bg-accent/90 transition-colors"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}

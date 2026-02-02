import Link from "next/link";

export default function ComparePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="rounded-lg p-4 mb-6 border-2" style={{ backgroundColor: '#D9D8D8', borderColor: '#E1C825' }}>
        <h1 className="text-3xl font-bold text-black mb-2">Compare</h1>
        <p className="text-gray-600">
          Side-by-side comparison of 2-4 pitchers. Compare arsenals, velocity trends, and stats.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map((slot) => (
          <div
            key={slot}
            className="aspect-square rounded-lg border-2 border-dashed flex items-center justify-center opacity-60"
            style={{ backgroundColor: '#D9D8D8', borderColor: '#E1C825' }}
          >
            <div className="text-center">
              <div className="text-4xl text-gray-500 mb-2">+</div>
              <p className="text-gray-600 text-sm">Add Pitcher {slot}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="p-6 rounded-lg border-2 text-center" style={{ backgroundColor: '#D9D8D8', borderColor: '#E1C825' }}>
        <p className="text-gray-600 mb-4">
          Pitcher comparison will be available in Phase 6 of development.
        </p>
        <Link
          href="/"
          className="inline-block px-4 py-2 rounded font-medium transition-colors text-black"
          style={{ backgroundColor: '#E1C825' }}
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}

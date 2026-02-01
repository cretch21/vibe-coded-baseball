"use client";

import Link from "next/link";
import { usePitchersList } from "@/hooks";

export default function PitchersPage() {
  const { data, isLoading, error } = usePitchersList({ page_size: 50 });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Pitchers</h1>
        <p className="text-gray-400">
          Browse all pitchers in the database. Click a pitcher to view their detailed profile.
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="p-6 rounded-lg bg-red-900/20 border border-red-800 text-red-300">
          <p>Failed to load pitchers. Make sure the API is running.</p>
          <p className="text-sm text-red-400 mt-2">{String(error)}</p>
        </div>
      ) : data && data.items.length > 0 ? (
        <>
          <div className="mb-4 text-gray-400 text-sm">
            Showing {data.items.length} of {data.total} pitchers
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.items.map((pitcher) => (
              <Link
                key={pitcher.id}
                href={`/pitchers/${pitcher.id}`}
                className="block p-4 rounded-lg bg-primary-800 border border-primary-700 hover:border-accent transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-medium text-white">
                      {pitcher.name}
                    </h2>
                    <p className="text-gray-400 text-sm">
                      {pitcher.team || "—"} • {pitcher.throws === "L" ? "LHP" : "RHP"}
                    </p>
                  </div>
                  <div className="text-gray-500">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </>
      ) : (
        <div className="p-6 rounded-lg bg-primary-800 border border-primary-700 text-center">
          <p className="text-gray-400">
            No pitchers found. Load some data first using the data ingestion scripts.
          </p>
        </div>
      )}
    </div>
  );
}

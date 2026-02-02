"use client";

import { useState } from "react";
import Link from "next/link";
import { usePitcherSearch } from "@/hooks";
import { useLeaderboard } from "@/hooks";

// Component for displaying a single leaderboard category
function TopPerformersCard({
  title,
  stat,
  label,
}: {
  title: string;
  stat: string;
  label: string;
}) {
  const { data, isLoading } = useLeaderboard({ stat, limit: 10 });

  return (
    <div className="rounded-lg p-4 text-white border-2" style={{ backgroundColor: '#183521', borderColor: '#E1C825' }}>
      <div className="mb-3">
        <span className="text-xs font-bold uppercase tracking-wide" style={{ color: '#E1C825' }}>
          {label}
        </span>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-6">
          <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      ) : data?.entries && data.entries.length > 0 ? (
        <div>
          {/* Top performer highlight */}
          <Link
            href={`/pitchers/${data.entries[0].pitcher_id}`}
            className="block mb-3 group"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-bold text-white group-hover:text-accent transition-colors">
                  {data.entries[0].name}
                </p>
                <p className="text-gray-400 text-xs">
                  {data.entries[0].team} • {data.entries[0].games} G
                </p>
              </div>
              <p className="text-2xl font-mono font-bold" style={{ color: '#E1C825' }}>
                {data.entries[0].value}
                <span className="text-xs text-gray-400 ml-1">{data.unit}</span>
              </p>
            </div>
          </Link>

          {/* Rest of top 5 */}
          <div className="border-t border-primary-700 pt-2 space-y-1">
            {data.entries.slice(1, 5).map((entry) => (
              <Link
                key={entry.pitcher_id}
                href={`/pitchers/${entry.pitcher_id}`}
                className="flex items-center justify-between py-1 text-sm hover:bg-primary-700 px-2 -mx-2 rounded transition-colors"
              >
                <span className="text-gray-300">{entry.name}</span>
                <span className="font-mono" style={{ color: '#E1C825' }}>{entry.value}</span>
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-gray-500 text-center py-4">No data available</p>
      )}
    </div>
  );
}

export default function PitchersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const isSearching = searchQuery.length >= 2;

  const { data: searchData, isLoading: searchLoading } = usePitcherSearch(
    searchQuery,
    isSearching
  );

  const searchResults = searchData || [];

  return (
    <div className="container mx-auto px-4 py-4">
      {/* Search Card */}
      <div className="rounded-lg p-4 mb-4 border-2" style={{ backgroundColor: '#D9D8D8', borderColor: '#E1C825' }}>
        <div className="flex items-center gap-2 mb-3">
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <h2 className="text-lg font-bold text-black">Search Pitcher</h2>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Enter pitcher name (e.g., Gerrit Cole, Blake Snell)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-2 rounded border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:border-accent"
          />
          <button className="px-6 py-2 bg-accent text-gray-900 font-medium rounded hover:bg-accent-400 transition-colors">
            Search
          </button>
        </div>

        {searchQuery.length === 1 && (
          <p className="text-gray-500 text-sm mt-2">Type at least 2 characters to search</p>
        )}
      </div>

      {/* Search Results */}
      {isSearching && (
        <div className="rounded-lg p-4 mb-4 border-2" style={{ backgroundColor: '#D9D8D8', borderColor: '#E1C825' }}>
          {searchLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            </div>
          ) : searchResults.length > 0 ? (
            <>
              <h3 className="text-lg font-bold text-black mb-3">
                Search Results ({searchResults.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {searchResults.map((pitcher) => (
                  <Link
                    key={pitcher.id}
                    href={`/pitchers/${pitcher.id}`}
                    className="flex items-center justify-between p-3 rounded bg-white border border-gray-200 hover:border-accent transition-colors"
                  >
                    <div>
                      <p className="text-gray-900 font-medium">{pitcher.name}</p>
                      <p className="text-gray-500 text-sm">
                        {pitcher.team || "—"} • {pitcher.throws === "L" ? "LHP" : "RHP"}
                      </p>
                    </div>
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                ))}
              </div>
            </>
          ) : (
            <p className="text-gray-500 text-center py-4">
              No pitchers found matching &ldquo;{searchQuery}&rdquo;
            </p>
          )}
        </div>
      )}

      {/* Top Performers Section */}
      {!isSearching && (
        <div className="rounded-lg p-4 border-2" style={{ backgroundColor: '#D9D8D8', borderColor: '#E1C825' }}>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">🏆</span>
            <h2 className="text-xl font-bold text-black">
              Top Performers - 2025 Season
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <TopPerformersCard
              title="Hardest Throwers"
              stat="velocity"
              label="Fastest Velocity"
            />
            <TopPerformersCard
              title="Strikeout Leaders"
              stat="strikeout_pct"
              label="Highest K%"
            />
            <TopPerformersCard
              title="Best Whiff Rate"
              stat="whiff_pct"
              label="Best Whiff%"
            />
          </div>

          {/* Link to full leaderboards */}
          <div className="mt-4 text-center">
            <Link
              href="/leaderboards"
              className="inline-flex items-center gap-2 font-medium transition-colors"
              style={{ color: '#183521' }}
            >
              View Full Leaderboards
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

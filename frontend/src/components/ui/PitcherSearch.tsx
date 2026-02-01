"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePitcherSearch } from "@/hooks";
import { cn } from "@/lib/utils";

export function PitcherSearch() {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const { data: results, isLoading } = usePitcherSearch(query, isOpen);

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [results]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (inputRef.current && !inputRef.current.parentElement?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (pitcherId: number) => {
    setQuery("");
    setIsOpen(false);
    router.push(`/pitchers/${pitcherId}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!results || results.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
        break;
      case "Enter":
        e.preventDefault();
        if (results[selectedIndex]) {
          handleSelect(results[selectedIndex].id);
        }
        break;
      case "Escape":
        setIsOpen(false);
        inputRef.current?.blur();
        break;
    }
  };

  return (
    <div className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search pitchers..."
          className="w-full px-4 py-2 pl-10 rounded-lg bg-primary-800 border border-primary-700 text-white placeholder-gray-400 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent text-sm"
        />
        <svg
          className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
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
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && query.length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-primary-800 border border-primary-700 rounded-lg shadow-xl overflow-hidden z-50">
          {isLoading ? (
            <div className="px-4 py-3 text-gray-400 text-sm">Searching...</div>
          ) : results && results.length > 0 ? (
            <ul>
              {results.map((pitcher, index) => (
                <li key={pitcher.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(pitcher.id)}
                    className={cn(
                      "w-full px-4 py-2 text-left text-sm transition-colors flex items-center justify-between",
                      index === selectedIndex
                        ? "bg-primary-700 text-white"
                        : "text-gray-300 hover:bg-primary-700 hover:text-white"
                    )}
                  >
                    <span>{pitcher.name}</span>
                    <span className="text-gray-500 text-xs">
                      {pitcher.team} • {pitcher.throws === "L" ? "LHP" : "RHP"}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-3 text-gray-400 text-sm">
              No pitchers found
            </div>
          )}
        </div>
      )}
    </div>
  );
}

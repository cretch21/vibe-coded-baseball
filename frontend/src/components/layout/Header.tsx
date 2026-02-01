"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { PitcherSearch } from "@/components/ui/PitcherSearch";

const navLinks = [
  { href: "/", label: "Dashboard" },
  { href: "/discover", label: "Discover" },
  { href: "/pitchers", label: "Pitchers" },
  { href: "/leaderboards", label: "Leaderboards" },
  { href: "/compare", label: "Compare" },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 bg-primary-900/95 backdrop-blur border-b border-primary-700">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-white">
              Vibe-Coded
            </span>
            <span className="text-xl font-bold text-accent">Baseball</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  pathname === link.href
                    ? "bg-primary-800 text-accent"
                    : "text-gray-300 hover:text-white hover:bg-primary-800"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Search */}
          <div className="w-64">
            <PitcherSearch />
          </div>
        </div>
      </div>
    </header>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

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
    <header className="pt-4 px-4">
      <div className="container mx-auto">
        {/* Title Card */}
        <div className="rounded-lg p-4 mb-4 border-2" style={{ backgroundColor: '#D9D8D8', borderColor: '#E1C825' }}>
          <Link href="/" className="flex items-center justify-center gap-2">
            <h1 className="text-2xl font-bold" style={{ color: '#183521' }}>
              Robert Stock's Vibe-Coded Baseball App
            </h1>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex flex-wrap items-center justify-center gap-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "px-4 py-2 rounded text-sm font-medium transition-colors border-2",
                pathname === link.href
                  ? "text-black"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              )}
              style={pathname === link.href
                ? { backgroundColor: '#E1C825', borderColor: '#E1C825' }
                : { borderColor: '#E1C825' }
              }
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

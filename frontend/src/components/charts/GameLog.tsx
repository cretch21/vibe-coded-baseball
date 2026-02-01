"use client";

import { usePitcherGames } from "@/hooks";
import type { GameLog } from "@/types";

interface GameLogProps {
  pitcherId: number;
  year?: number;
  limit?: number;
}

export function GameLogTable({ pitcherId, year, limit = 30 }: GameLogProps) {
  const { data: games, isLoading, error } = usePitcherGames(pitcherId, { year, limit });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded bg-red-900/20 border border-red-800 text-red-300 text-sm">
        Failed to load game log
      </div>
    );
  }

  if (!games || games.length === 0) {
    return (
      <div className="p-4 rounded bg-primary-800 border border-primary-700 text-gray-400 text-sm text-center">
        No games found for this period
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-primary-700">
            <th className="text-left py-3 px-2 text-gray-400 font-medium">Date</th>
            <th className="text-right py-3 px-2 text-gray-400 font-medium">Pitches</th>
            <th className="text-right py-3 px-2 text-gray-400 font-medium">IP</th>
            <th className="text-right py-3 px-2 text-gray-400 font-medium">Velo</th>
            <th className="text-right py-3 px-2 text-gray-400 font-medium">K</th>
            <th className="text-right py-3 px-2 text-gray-400 font-medium">BB</th>
            <th className="text-right py-3 px-2 text-gray-400 font-medium">Whiffs</th>
          </tr>
        </thead>
        <tbody>
          {games.map((game: GameLog) => (
            <tr
              key={game.game_pk}
              className="border-b border-primary-700/50 hover:bg-primary-800/50 transition-colors"
            >
              <td className="py-2 px-2 text-white">
                {formatDate(game.date)}
              </td>
              <td className="py-2 px-2 text-right text-gray-300">
                {game.total_pitches}
              </td>
              <td className="py-2 px-2 text-right text-gray-300">
                {game.innings_pitched}
              </td>
              <td className="py-2 px-2 text-right text-gray-300">
                {game.avg_velocity ? `${game.avg_velocity}` : "—"}
              </td>
              <td className="py-2 px-2 text-right text-gray-300">
                {game.strikeouts}
              </td>
              <td className="py-2 px-2 text-right text-gray-300">
                {game.walks}
              </td>
              <td className="py-2 px-2 text-right text-gray-300">
                {game.whiffs}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

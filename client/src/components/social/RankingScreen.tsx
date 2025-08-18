import { X, Star, Users } from "lucide-react";

const leaderboardData = [
  { rank: 1, username: "0xceso", level: 91, xp: "XP:273,330", avatar: "🎮" },
  { rank: 2, username: "so", level: 19, xp: "XP:273,247", avatar: "🌍" },
  { rank: 3, username: "itsmide.eth", level: 16, xp: "XP:237,951", avatar: "🎯" },
  { rank: 4, username: "andreap", level: 18, xp: "XP:236,329", avatar: "👨" },
  { rank: 5, username: "especulacion", level: 13, xp: "XP:232,555", avatar: "🎲" },
  { rank: 6, username: "biancS", level: 18, xp: "XP:229,698", avatar: "🌟" },
  { rank: 7, username: "victoctero", level: 0, xp: "", avatar: "🎪" }
];

export default function RankingScreen() {
  return (
    <div className="flex-1 bg-gradient-to-b from-orange-400 to-orange-600 text-white relative">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <X size={24} className="text-white/80" />
        <div className="text-center">
          <h1 className="text-lg font-semibold">FarVille</h1>
          <p className="text-xs text-white/80">built by Farcaster garden</p>
        </div>
        <div className="w-6"></div>
      </div>

      {/* Ranking Title */}
      <div className="px-4 mb-6">
        <div className="flex items-center gap-2">
          <Star className="text-yellow-300" size={24} />
          <h2 className="text-2xl font-bold">Ranking</h2>
          <X size={20} className="ml-auto text-white/80" />
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="px-4 mb-6">
        <div className="flex gap-4">
          <button className="flex items-center gap-2 bg-yellow-500 px-4 py-2 rounded-full text-sm font-medium">
            XP
          </button>
          <button className="flex items-center gap-2 text-white/80 text-sm">
            ✓ Quests
          </button>
          <button className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full text-sm ml-auto">
            <Users size={16} />
            Friends
          </button>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="flex-1 bg-white/10 backdrop-blur-sm rounded-t-3xl p-6">
        <div className="space-y-4">
          {leaderboardData.map((player) => (
            <div key={player.rank} className="flex items-center gap-4 p-3 bg-white/10 rounded-2xl">
              <div className="text-xl font-bold text-yellow-300 w-8">
                #{player.rank}
              </div>
              <div className="text-2xl">{player.avatar}</div>
              <div className="flex-1">
                <div className="font-medium">{player.username}</div>
                <div className="text-sm text-white/80">
                  Lvl {player.level} {player.xp}
                </div>
              </div>
              {player.rank === 7 && (
                <button className="bg-yellow-500 text-black px-3 py-1 rounded-full text-xs font-medium">
                  Share
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
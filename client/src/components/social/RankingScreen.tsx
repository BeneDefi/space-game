
import { X, Star, Users, Trophy, Clock, Target, Loader2, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import { useFarcaster } from "../../lib/stores/useFarcaster";

interface LeaderboardEntry {
  fid: number;
  username: string;
  displayName?: string;
  pfpUrl?: string;
  score: number;
  level: number;
  gamesPlayed: number;
  rank: number;
}

interface LeaderboardResponse {
  leaderboard: LeaderboardEntry[];
  timeframe: string;
  count: number;
  timestamp: string;
}

export default function RankingScreen() {
  const { user } = useFarcaster();
  const [activeTab, setActiveTab] = useState<'scores' | 'games'>('scores');
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'all'>('all');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [playerRank, setPlayerRank] = useState<number | null>(null);

  const fetchLeaderboard = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const endpoint = activeTab === 'scores' 
        ? `/api/leaderboard/scores?timeframe=${timeframe}&limit=50`
        : '/api/leaderboard/games?limit=50';
      
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error(`Failed to fetch leaderboard: ${response.statusText}`);
      }
      
      const data: LeaderboardResponse = await response.json();
      setLeaderboard(data.leaderboard);
      setLastUpdated(new Date(data.timestamp).toLocaleTimeString());
      
      // Fetch current player's rank if logged in
      if (user?.fid) {
        fetchPlayerRank(user.fid);
      }
      
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      setError(err instanceof Error ? err.message : 'Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  const fetchPlayerRank = async (fid: number) => {
    try {
      const response = await fetch(`/api/player/${fid}/rank`);
      if (response.ok) {
        const data = await response.json();
        setPlayerRank(data.rank);
      }
    } catch (err) {
      console.error('Error fetching player rank:', err);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [activeTab, timeframe]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(fetchLeaderboard, 30000);
    return () => clearInterval(interval);
  }, [activeTab, timeframe]);

  const getTimeframeLabel = (tf: string) => {
    switch (tf) {
      case 'daily': return '24h';
      case 'weekly': return '7d';
      default: return 'All Time';
    }
  };

  const formatScore = (score: number) => {
    if (score >= 1000000) return `${(score / 1000000).toFixed(1)}M`;
    if (score >= 1000) return `${(score / 1000).toFixed(1)}K`;
    return score.toLocaleString();
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return "🥇";
      case 2: return "🥈";
      case 3: return "🥉";
      default: return "🏅";
    }
  };

  const getAvatar = (entry: LeaderboardEntry) => {
    if (entry.pfpUrl) {
      return (
        <img 
          src={entry.pfpUrl} 
          alt={entry.displayName || entry.username}
          className="w-10 h-10 rounded-full object-cover border-2 border-white/20"
        />
      );
    }
    return (
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold">
        {(entry.displayName || entry.username).charAt(0).toUpperCase()}
      </div>
    );
  };

  return (
    <div className="flex-1 bg-gradient-to-b from-orange-400 to-orange-600 text-white relative max-h-[calc(100vh-80px)] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <X size={24} className="text-white/80" />
        <div className="text-center">
          <h1 className="text-lg font-semibold">Space Dodger</h1>
          <p className="text-xs text-white/80">Live Leaderboard</p>
        </div>
        <button onClick={fetchLeaderboard} disabled={loading} className="p-1">
          <RefreshCw size={20} className={`text-white/80 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Title and Player Rank */}
      <div className="px-4 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Star className="text-yellow-300" size={24} />
          <h2 className="text-2xl font-bold">Rankings</h2>
        </div>
        {playerRank && user && (
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 mb-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/80">Your Current Rank</span>
              <div className="flex items-center gap-2">
                <Trophy className="text-yellow-400" size={16} />
                <span className="font-bold text-yellow-400">#{playerRank}</span>
              </div>
            </div>
          </div>
        )}
        {lastUpdated && (
          <p className="text-xs text-white/60">Last updated: {lastUpdated}</p>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="px-4 mb-4">
        <div className="flex gap-2 mb-3">
          <button 
            onClick={() => setActiveTab('scores')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeTab === 'scores' 
                ? 'bg-yellow-500 text-black' 
                : 'text-white/80 hover:bg-white/10'
            }`}
          >
            <Trophy size={16} />
            High Scores
          </button>
          <button 
            onClick={() => setActiveTab('games')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeTab === 'games' 
                ? 'bg-yellow-500 text-black' 
                : 'text-white/80 hover:bg-white/10'
            }`}
          >
            <Target size={16} />
            Most Games
          </button>
        </div>

        {/* Timeframe Filter (only for scores) */}
        {activeTab === 'scores' && (
          <div className="flex gap-2">
            {(['daily', 'weekly', 'all'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  timeframe === tf
                    ? 'bg-white/20 text-white'
                    : 'text-white/60 hover:bg-white/10'
                }`}
              >
                {getTimeframeLabel(tf)}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Leaderboard Content */}
      <div className="flex-1 bg-white/10 backdrop-blur-sm rounded-t-3xl overflow-hidden">
        <div className="p-6 h-full overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="animate-spin text-white" size={32} />
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-300 mb-4">⚠️ {error}</p>
              <button 
                onClick={fetchLeaderboard}
                className="bg-yellow-500 text-black px-4 py-2 rounded-lg font-medium"
              >
                Try Again
              </button>
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="mx-auto mb-4 text-white/50" size={48} />
              <h3 className="text-xl font-bold mb-2">No Rankings Yet</h3>
              <p className="text-white/70">Be the first to play and set a score!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {leaderboard.map((entry) => (
                <div 
                  key={`${entry.fid}-${entry.rank}`} 
                  className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${
                    entry.rank <= 3 
                      ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30' 
                      : 'bg-white/10 hover:bg-white/15'
                  }`}
                >
                  {/* Rank */}
                  <div className="flex items-center justify-center w-12">
                    {entry.rank <= 3 ? (
                      <span className="text-2xl">{getRankIcon(entry.rank)}</span>
                    ) : (
                      <span className="text-xl font-bold text-yellow-300">#{entry.rank}</span>
                    )}
                  </div>

                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    {getAvatar(entry)}
                  </div>

                  {/* Player Info */}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">
                      {entry.displayName || entry.username}
                    </div>
                    <div className="text-sm text-white/70 flex items-center gap-2">
                      {activeTab === 'scores' ? (
                        <>
                          <span>Level {entry.level}</span>
                          <span>•</span>
                          <span>{entry.gamesPlayed} games</span>
                        </>
                      ) : (
                        <>
                          <span>Best: {formatScore(entry.score)}</span>
                          <span>•</span>
                          <span>Level {entry.level}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Score/Games */}
                  <div className="text-right flex-shrink-0">
                    <div className="font-bold text-yellow-400">
                      {activeTab === 'scores' ? formatScore(entry.score) : `${entry.gamesPlayed} games`}
                    </div>
                    {activeTab === 'scores' && (
                      <div className="text-xs text-white/60">points</div>
                    )}
                  </div>

                  {/* Highlight current user */}
                  {user?.fid === entry.fid && (
                    <div className="text-green-400 font-bold text-xs">YOU</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

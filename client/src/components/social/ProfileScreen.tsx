
import { useState, useEffect } from "react";
import { Edit3, Trophy, Target, Clock, Zap, Settings, Star, Wallet, LogOut, Coins, Award } from "lucide-react";
import { useGameState } from "../../lib/stores/useGameState";
import { useWallet } from "../../lib/stores/useWallet";
import { useFarcaster } from "../../lib/stores/useFarcaster";

interface GameStats {
  totalGamesPlayed: number;
  totalTimePlayed: number;
  totalScore: number;
  bestSurvivalTime: number;
  maxLevel: number;
  totalCoinsEarned: number;
  lastPlayDate: string;
  gameHistory: Array<{
    score: number;
    timeAlive: number;
    level: number;
    date: string;
  }>;
}

interface UserAchievements {
  [key: string]: {
    unlocked: boolean;
    unlockedAt?: string;
  };
}

export default function ProfileScreen() {
  const { highScore, timeAlive, difficultyLevel, score, gamePhase } = useGameState();
  const { address, disconnect } = useWallet();
  const { user: farcasterUser, isAuthenticated: isFarcasterAuthenticated } = useFarcaster();
  const [username, setUsername] = useState("SpacePilot");
  const [isEditing, setIsEditing] = useState(false);
  const [gameStats, setGameStats] = useState<GameStats>({
    totalGamesPlayed: 0,
    totalTimePlayed: 0,
    totalScore: 0,
    bestSurvivalTime: 0,
    maxLevel: 1,
    totalCoinsEarned: 0,
    lastPlayDate: "",
    gameHistory: []
  });
  const [userAchievements, setUserAchievements] = useState<UserAchievements>({});

  // Generate user-specific storage keys
  const getUserKey = (key: string) => {
    const userIdentifier = address || 'anonymous';
    return `${key}_${userIdentifier}`;
  };

  // Validation functions
  const validateGameScore = (score: number, timeAlive: number): number | null => {
    if (typeof score !== 'number' || isNaN(score) || score < 0) return null;
    if (score > 1000000) return null; // Max reasonable score
    
    // Score should be reasonable for time played (max ~100 points/second on average)
    const maxReasonable = timeAlive * 100;
    if (score > maxReasonable) {
      console.warn('Score too high for time played:', { score, timeAlive, maxReasonable });
      return Math.min(score, maxReasonable);
    }
    
    return score;
  };

  const validateTimeAlive = (timeAlive: number): number | null => {
    if (typeof timeAlive !== 'number' || isNaN(timeAlive) || timeAlive < 0) return null;
    if (timeAlive > 3600) return null; // Max 1 hour per game
    return timeAlive;
  };

  const validateDifficultyLevel = (level: number, timeAlive: number): number | null => {
    if (typeof level !== 'number' || isNaN(level) || level < 1) return null;
    
    // Level should correlate with time alive (level increases every 10 seconds)
    const maxExpectedLevel = Math.floor(timeAlive / 10) + 1;
    if (level > maxExpectedLevel + 5) { // Allow some tolerance
      console.warn('Level too high for time played:', { level, timeAlive, maxExpected: maxExpectedLevel });
      return Math.min(level, maxExpectedLevel + 2);
    }
    
    return level;
  };

  // Load user-specific data from localStorage with validation
  useEffect(() => {
    if (!address) return;

    const savedStats = localStorage.getItem(getUserKey('gameStats'));
    const savedAchievements = localStorage.getItem(getUserKey('achievements'));
    const savedUsername = localStorage.getItem(getUserKey('username'));

    if (savedStats) {
      try {
        const parsedStats = JSON.parse(savedStats);
        // Validate loaded stats
        if (validateGameStats(parsedStats)) {
          setGameStats(parsedStats);
        } else {
          console.warn('Invalid saved stats detected, resetting');
          localStorage.removeItem(getUserKey('gameStats'));
        }
      } catch (error) {
        console.error('Error parsing saved stats:', error);
        localStorage.removeItem(getUserKey('gameStats'));
      }
    }
    
    if (savedAchievements) {
      try {
        const parsedAchievements = JSON.parse(savedAchievements);
        if (typeof parsedAchievements === 'object') {
          setUserAchievements(parsedAchievements);
        }
      } catch (error) {
        console.error('Error parsing saved achievements:', error);
        localStorage.removeItem(getUserKey('achievements'));
      }
    }
    
    // Use Farcaster username if available, otherwise saved username, otherwise default
    if (isFarcasterAuthenticated && farcasterUser?.username) {
      setUsername(farcasterUser.username);
    } else if (savedUsername && typeof savedUsername === 'string' && savedUsername.length <= 50) {
      setUsername(savedUsername);
    }
  }, [address, isFarcasterAuthenticated, farcasterUser]);

  const validateGameStats = (stats: any): boolean => {
    if (!stats || typeof stats !== 'object') return false;
    
    // Check required fields and types
    const requiredFields = ['totalGamesPlayed', 'totalTimePlayed', 'totalScore', 'bestSurvivalTime', 'maxLevel', 'totalCoinsEarned'];
    for (const field of requiredFields) {
      if (typeof stats[field] !== 'number' || isNaN(stats[field]) || stats[field] < 0) {
        return false;
      }
    }
    
    // Reasonable limits
    if (stats.totalGamesPlayed > 100000) return false;
    if (stats.totalTimePlayed > 360000) return false; // 100 hours max
    if (stats.totalScore > 100000000) return false;
    if (stats.bestSurvivalTime > 3600) return false;
    if (stats.maxLevel > 1000) return false;
    
    // Validate game history if present
    if (stats.gameHistory && Array.isArray(stats.gameHistory)) {
      for (const game of stats.gameHistory) {
        if (!game || typeof game.score !== 'number' || typeof game.timeAlive !== 'number') {
          return false;
        }
      }
    }
    
    return true;
  };

  // Save username when changed (only save custom usernames, not Farcaster ones)
  useEffect(() => {
    if (address && username !== "SpacePilot" && !isFarcasterAuthenticated) {
      localStorage.setItem(getUserKey('username'), username);
    }
  }, [username, address, isFarcasterAuthenticated]);

  // Update stats when game ends
  useEffect(() => {
    const handleGameEnd = () => {
      if (!address || gamePhase !== 'ended') return;

      // Validate game data before saving
      const validatedScore = validateGameScore(score, timeAlive);
      const validatedTimeAlive = validateTimeAlive(timeAlive);
      const validatedLevel = validateDifficultyLevel(difficultyLevel, validatedTimeAlive);

      if (!validatedScore || !validatedTimeAlive || !validatedLevel) {
        console.warn('Invalid game data detected, not saving to profile');
        return;
      }

      const gameData = {
        score: validatedScore,
        timeAlive: validatedTimeAlive,
        level: validatedLevel,
        date: new Date().toISOString()
      };

      // Additional integrity check - compare with existing data
      if (gameStats.gameHistory.length > 0) {
        const avgScore = gameStats.totalScore / gameStats.totalGamesPlayed;
        if (validatedScore > avgScore * 10 && validatedScore > 10000) {
          console.warn('Suspicious score detected:', validatedScore, 'vs avg:', avgScore);
          // Still save but flag it
          gameData.score = Math.min(validatedScore, avgScore * 5);
        }
      }

      const newStats: GameStats = {
        totalGamesPlayed: gameStats.totalGamesPlayed + 1,
        totalTimePlayed: gameStats.totalTimePlayed + validatedTimeAlive,
        totalScore: gameStats.totalScore + gameData.score,
        bestSurvivalTime: Math.max(gameStats.bestSurvivalTime, validatedTimeAlive),
        maxLevel: Math.max(gameStats.maxLevel, validatedLevel),
        totalCoinsEarned: gameStats.totalCoinsEarned + Math.floor(gameData.score / 10),
        lastPlayDate: new Date().toISOString(),
        gameHistory: [...gameStats.gameHistory, gameData].slice(-50) // Keep last 50 games
      };

      setGameStats(newStats);
      localStorage.setItem(getUserKey('gameStats'), JSON.stringify(newStats));

      // Update achievements
      updateAchievements(newStats);
    };

    // Listen for game phase changes
    if (gamePhase === 'ended') {
      handleGameEnd();
    }
  }, [gamePhase, score, timeAlive, difficultyLevel, address]);

  const updateAchievements = (stats: GameStats) => {
    const newAchievements = { ...userAchievements };
    let updated = false;

    achievements.forEach(achievement => {
      if (!newAchievements[achievement.id]?.unlocked && achievement.isUnlocked(stats)) {
        newAchievements[achievement.id] = {
          unlocked: true,
          unlockedAt: new Date().toISOString()
        };
        updated = true;
      }
    });

    if (updated) {
      setUserAchievements(newAchievements);
      localStorage.setItem(getUserKey('achievements'), JSON.stringify(newAchievements));
    }
  };
  
  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };
  
  // Calculate derived stats
  const averageScore = gameStats.totalGamesPlayed > 0 
    ? Math.floor(gameStats.totalScore / gameStats.totalGamesPlayed) 
    : 0;
  const currentHighScore = Math.max(highScore, gameStats.gameHistory.reduce((max, game) => Math.max(max, game.score), 0));
  const level = Math.floor(currentHighScore / 1000) + 1;
  const rank = Math.max(1, 1000 - Math.floor(currentHighScore / 100));

  // Achievement definitions with real conditions
  const achievements = [
    { 
      id: "first_game", 
      name: "First Flight", 
      description: "Play your first game", 
      icon: "🚀",
      isUnlocked: (stats: GameStats) => stats.totalGamesPlayed >= 1,
      progress: Math.min(gameStats.totalGamesPlayed, 1),
      maxProgress: 1
    },
    { 
      id: "score_1k", 
      name: "Rising Star", 
      description: "Score 1,000 points in a single game", 
      icon: "⭐",
      isUnlocked: (stats: GameStats) => stats.gameHistory.some(game => game.score >= 1000),
      progress: Math.min(currentHighScore, 1000),
      maxProgress: 1000
    },
    { 
      id: "score_10k", 
      name: "Space Ace", 
      description: "Score 10,000 points in a single game", 
      icon: "🌟",
      isUnlocked: (stats: GameStats) => stats.gameHistory.some(game => game.score >= 10000),
      progress: Math.min(currentHighScore, 10000),
      maxProgress: 10000
    },
    { 
      id: "survive_60s", 
      name: "Survivor", 
      description: "Survive 60 seconds in a single game", 
      icon: "🛡️",
      isUnlocked: (stats: GameStats) => stats.bestSurvivalTime >= 60,
      progress: Math.min(gameStats.bestSurvivalTime, 60),
      maxProgress: 60
    },
    { 
      id: "level_10", 
      name: "Veteran Pilot", 
      description: "Reach level 10 in a single game", 
      icon: "👨‍✈️",
      isUnlocked: (stats: GameStats) => stats.maxLevel >= 10,
      progress: Math.min(gameStats.maxLevel, 10),
      maxProgress: 10
    },
    { 
      id: "score_100k", 
      name: "Legendary", 
      description: "Score 100,000 points in a single game", 
      icon: "👑",
      isUnlocked: (stats: GameStats) => stats.gameHistory.some(game => game.score >= 100000),
      progress: Math.min(currentHighScore, 100000),
      maxProgress: 100000
    },
    {
      id: "marathoner",
      name: "Marathon Runner",
      description: "Play for 30 minutes total",
      icon: "🏃",
      isUnlocked: (stats: GameStats) => stats.totalTimePlayed >= 1800,
      progress: Math.min(gameStats.totalTimePlayed, 1800),
      maxProgress: 1800
    },
    {
      id: "dedicated",
      name: "Dedicated Pilot",
      description: "Play 50 games",
      icon: "🎯",
      isUnlocked: (stats: GameStats) => stats.totalGamesPlayed >= 50,
      progress: Math.min(gameStats.totalGamesPlayed, 50),
      maxProgress: 50
    },
    {
      id: "coin_collector",
      name: "Coin Collector",
      description: "Earn 1,000 total coins",
      icon: "💰",
      isUnlocked: (stats: GameStats) => stats.totalCoinsEarned >= 1000,
      progress: Math.min(gameStats.totalCoinsEarned, 1000),
      maxProgress: 1000
    },
    {
      id: "consistency",
      name: "Consistent Player",
      description: "Play 10 games in a row with score over 500",
      icon: "🎯",
      isUnlocked: (stats: GameStats) => {
        const recent10 = stats.gameHistory.slice(-10);
        return recent10.length >= 10 && recent10.every(game => game.score >= 500);
      },
      progress: gameStats.gameHistory.slice(-10).filter(game => game.score >= 500).length,
      maxProgress: 10
    }
  ];

  const equippedSkins = [
    { name: "Default Ship", type: "ship", icon: "🚀" },
    { name: "Starfield", type: "background", icon: "⭐" },
    { name: "None", type: "effect", icon: "✨" }
  ];

  const unlockedAchievements = achievements.filter(a => userAchievements[a.id]?.unlocked).length;

  if (!address) {
    return (
      <div className="flex-1 bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 text-white flex items-center justify-center">
        <div className="text-center p-8">
          <Wallet className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-2xl font-bold mb-2">Connect Wallet</h2>
          <p className="text-gray-400">Connect your wallet to view your profile and track your progress</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 text-white">
      {/* Header */}
      <div className="p-4 border-b border-indigo-500/30 bg-black/20 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">Profile</h1>
          <div className="flex gap-2">
            <button className="p-2 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-600/30 hover:bg-gray-700/50 transition-all">
              <Settings size={20} />
            </button>
            <button 
              onClick={disconnect}
              className="p-2 bg-red-600/80 hover:bg-red-700 rounded-xl transition-colors border border-red-500/30"
              title="Disconnect Wallet"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>

        {/* User Info */}
        <div className="flex items-center gap-4 mb-4">
          {isFarcasterAuthenticated && farcasterUser?.pfpUrl ? (
            <img 
              src={farcasterUser.pfpUrl} 
              alt="Profile" 
              className="w-16 h-16 rounded-full shadow-lg object-cover border-2 border-purple-500/30"
              onError={(e) => {
                // Fallback to emoji avatar if image fails to load
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.style.setProperty('display', 'flex');
              }}
            />
          ) : null}
          <div 
            className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-2xl shadow-lg"
            style={{ display: isFarcasterAuthenticated && farcasterUser?.pfpUrl ? 'none' : 'flex' }}
          >
            🚀
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              {isEditing && !isFarcasterAuthenticated ? (
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onBlur={() => setIsEditing(false)}
                  className="bg-gray-800/50 backdrop-blur-sm px-3 py-1 rounded-lg text-lg font-bold border border-gray-600/30"
                  autoFocus
                />
              ) : (
                <>
                  <h2 className="text-xl font-bold">{username}</h2>
                  {isFarcasterAuthenticated && farcasterUser?.displayName && farcasterUser.displayName !== username && (
                    <span className="text-sm text-gray-400">({farcasterUser.displayName})</span>
                  )}
                  {!isFarcasterAuthenticated && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="p-1 text-gray-400 hover:text-white transition-colors"
                    >
                      <Edit3 size={16} />
                    </button>
                  )}
                </>
              )}
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              {isFarcasterAuthenticated && (
                <span className="flex items-center gap-1 text-purple-400">
                  🟪 Farcaster
                </span>
              )}
              <span className="flex items-center gap-1">
                <Zap size={12} />
                Level {level}
              </span>
              <span className="flex items-center gap-1">
                <Target size={12} />
                Rank #{rank.toLocaleString()}
              </span>
              <span className="flex items-center gap-1">
                <Trophy size={12} />
                {unlockedAchievements}/{achievements.length}
              </span>
            </div>
          </div>
        </div>

        {/* Coins Display */}
        <div className="mb-4 p-3 bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border border-yellow-500/30 rounded-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Coins size={16} className="text-yellow-400" />
              <span className="text-sm font-medium text-yellow-400">Total Coins Earned</span>
            </div>
            <span className="text-lg font-bold text-yellow-300">{gameStats.totalCoinsEarned.toLocaleString()}</span>
          </div>
        </div>
        
        {/* Wallet Info */}
        <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl">
          <div className="flex items-center gap-2 mb-1">
            <Wallet size={16} className="text-blue-400" />
            <span className="text-sm font-medium text-blue-400">Base Wallet</span>
          </div>
          <div className="text-xs text-gray-400 font-mono">{formatAddress(address)}</div>
        </div>
      </div>

      {/* Stats */}
      <div className="p-4 max-h-[calc(100vh-200px)] overflow-y-auto">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 text-center border border-gray-600/30">
            <Trophy className="text-yellow-500 mx-auto mb-2" size={24} />
            <div className="text-2xl font-bold">{currentHighScore.toLocaleString()}</div>
            <div className="text-xs text-gray-400">High Score</div>
          </div>
          
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 text-center border border-gray-600/30">
            <Target className="text-green-500 mx-auto mb-2" size={24} />
            <div className="text-2xl font-bold">{averageScore.toLocaleString()}</div>
            <div className="text-xs text-gray-400">Average Score</div>
          </div>
          
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 text-center border border-gray-600/30">
            <Clock className="text-blue-500 mx-auto mb-2" size={24} />
            <div className="text-2xl font-bold">{Math.floor(gameStats.totalTimePlayed / 60)}m</div>
            <div className="text-xs text-gray-400">Total Playtime</div>
          </div>
          
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 text-center border border-gray-600/30">
            <Zap className="text-purple-500 mx-auto mb-2" size={24} />
            <div className="text-2xl font-bold">{gameStats.totalGamesPlayed}</div>
            <div className="text-xs text-gray-400">Games Played</div>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 text-center border border-gray-600/30">
            <div className="text-2xl font-bold text-orange-400">{Math.floor(gameStats.bestSurvivalTime)}s</div>
            <div className="text-xs text-gray-400">Best Survival Time</div>
          </div>
          
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 text-center border border-gray-600/30">
            <div className="text-2xl font-bold text-cyan-400">{gameStats.maxLevel}</div>
            <div className="text-xs text-gray-400">Max Level Reached</div>
          </div>
        </div>

        {/* Recent Games */}
        {gameStats.gameHistory.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-bold mb-3">Recent Games</h3>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {gameStats.gameHistory.slice(-5).reverse().map((game, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-800/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="text-sm">
                      <span className="font-bold text-yellow-400">{game.score.toLocaleString()}</span>
                      <span className="text-gray-400 ml-2">{Math.floor(game.timeAlive)}s</span>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(game.date).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Achievements */}
        <div className="mb-6">
          <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
            <Award size={20} className="text-yellow-500" />
            Achievements ({unlockedAchievements}/{achievements.length})
          </h3>
          <div className="grid grid-cols-1 gap-3">
            {achievements.map((achievement) => {
              const isUnlocked = userAchievements[achievement.id]?.unlocked || false;
              return (
                <div
                  key={achievement.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                    isUnlocked
                      ? "bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/30"
                      : "bg-gray-800/50 border-gray-600/30"
                  }`}
                >
                  <div className="text-2xl">{achievement.icon}</div>
                  <div className="flex-1">
                    <h4 className={`font-medium ${isUnlocked ? "text-yellow-400" : "text-gray-400"}`}>
                      {achievement.name}
                    </h4>
                    <p className="text-sm text-gray-500 mb-1">{achievement.description}</p>
                    {!isUnlocked && (
                      <div className="w-full bg-gray-700 rounded-full h-1.5">
                        <div 
                          className="bg-gradient-to-r from-purple-500 to-blue-500 h-1.5 rounded-full transition-all duration-300" 
                          style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                        ></div>
                      </div>
                    )}
                    {isUnlocked && userAchievements[achievement.id]?.unlockedAt && (
                      <p className="text-xs text-yellow-500">
                        Unlocked {new Date(userAchievements[achievement.id].unlockedAt!).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  {isUnlocked && (
                    <Star className="text-yellow-500" size={16} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Equipped Items */}
        <div>
          <h3 className="text-lg font-bold mb-3">Equipped Items</h3>
          <div className="space-y-3">
            {equippedSkins.map((item, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-600/30">
                <div className="text-2xl">{item.icon}</div>
                <div className="flex-1">
                  <h4 className="font-medium">{item.name}</h4>
                  <p className="text-sm text-gray-400 capitalize">{item.type}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

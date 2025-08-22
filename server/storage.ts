import { 
  users, 
  gameScores, 
  playerStats,
  type User, 
  type InsertUser, 
  type GameScore, 
  type PlayerStats, 
  type InsertGameScore,
  type InsertPlayerStats 
} from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByFid(fid: number): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Game scores
  saveGameScore(score: InsertGameScore): Promise<GameScore>;
  getPlayerScores(fid: number, limit?: number): Promise<GameScore[]>;
  
  // Player stats
  getPlayerStats(fid: number): Promise<PlayerStats | undefined>;
  updatePlayerStats(fid: number, stats: Partial<InsertPlayerStats>): Promise<PlayerStats>;
  
  // Leaderboard
  getTopPlayersByScore(limit?: number, timeframe?: 'daily' | 'weekly' | 'all'): Promise<LeaderboardEntry[]>;
  getTopPlayersByGames(limit?: number): Promise<LeaderboardEntry[]>;
  getPlayerRank(fid: number): Promise<number>;
}

export interface LeaderboardEntry {
  fid: number;
  username: string;
  displayName?: string;
  pfpUrl?: string;
  score: number;
  level: number;
  gamesPlayed: number;
  rank: number;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private gameScores: Map<number, GameScore>;
  private playerStats: Map<number, PlayerStats>;
  private fidToUserId: Map<number, number>;
  currentId: number;
  currentScoreId: number;
  currentStatsId: number;

  constructor() {
    this.users = new Map();
    this.gameScores = new Map();
    this.playerStats = new Map();
    this.fidToUserId = new Map();
    this.currentId = 1;
    this.currentScoreId = 1;
    this.currentStatsId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByFid(fid: number): Promise<User | undefined> {
    const userId = this.fidToUserId.get(fid);
    if (!userId) return undefined;
    return this.users.get(userId);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const now = new Date();
    const user: User = { 
      ...insertUser, 
      id, 
      farcasterFid: null,
      displayName: null,
      pfpUrl: null,
      createdAt: now
    };
    this.users.set(id, user);
    return user;
  }

  async saveGameScore(scoreData: InsertGameScore): Promise<GameScore> {
    const id = this.currentScoreId++;
    const now = new Date();
    const score: GameScore = {
      ...scoreData,
      id,
      createdAt: now
    };
    
    this.gameScores.set(id, score);
    
    // Update player stats
    if (scoreData.farcasterFid) {
      await this.updatePlayerStatsAfterGame(scoreData.farcasterFid, score);
    }
    
    return score;
  }

  async getPlayerScores(fid: number, limit: number = 10): Promise<GameScore[]> {
    return Array.from(this.gameScores.values())
      .filter(score => score.farcasterFid === fid)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
      .slice(0, limit);
  }

  async getPlayerStats(fid: number): Promise<PlayerStats | undefined> {
    return Array.from(this.playerStats.values()).find(
      stats => stats.farcasterFid === fid
    );
  }

  async updatePlayerStats(fid: number, updates: Partial<InsertPlayerStats>): Promise<PlayerStats> {
    let stats = await this.getPlayerStats(fid);
    
    if (!stats) {
      const id = this.currentStatsId++;
      const now = new Date();
      stats = {
        id,
        userId: null,
        farcasterFid: fid,
        totalGamesPlayed: 0,
        totalScore: 0,
        highestScore: 0,
        totalTimeAlive: 0,
        bestSurvivalTime: 0,
        maxLevel: 0,
        totalCoinsEarned: 0,
        lastPlayedAt: null,
        updatedAt: now,
        ...updates
      };
    } else {
      stats = {
        ...stats,
        ...updates,
        updatedAt: new Date()
      };
    }
    
    this.playerStats.set(stats.id, stats);
    return stats;
  }

  private async updatePlayerStatsAfterGame(fid: number, score: GameScore): Promise<void> {
    const currentStats = await this.getPlayerStats(fid);
    
    const updates: Partial<InsertPlayerStats> = {
      totalGamesPlayed: (currentStats?.totalGamesPlayed || 0) + 1,
      totalScore: (currentStats?.totalScore || 0) + score.score,
      highestScore: Math.max(currentStats?.highestScore || 0, score.score),
      totalTimeAlive: (currentStats?.totalTimeAlive || 0) + score.timeAlive,
      bestSurvivalTime: Math.max(currentStats?.bestSurvivalTime || 0, score.timeAlive),
      maxLevel: Math.max(currentStats?.maxLevel || 0, score.level),
      totalCoinsEarned: (currentStats?.totalCoinsEarned || 0) + (score.coinsEarned || 0),
      lastPlayedAt: new Date()
    };
    
    await this.updatePlayerStats(fid, updates);
  }

  async getTopPlayersByScore(limit: number = 50, timeframe: 'daily' | 'weekly' | 'all' = 'all'): Promise<LeaderboardEntry[]> {
    const now = new Date();
    let timeFilter: Date | null = null;
    
    if (timeframe === 'daily') {
      timeFilter = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    } else if (timeframe === 'weekly') {
      timeFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }
    
    // Get scores within timeframe
    let relevantScores = Array.from(this.gameScores.values());
    if (timeFilter) {
      relevantScores = relevantScores.filter(score => 
        score.createdAt && new Date(score.createdAt) >= timeFilter!
      );
    }
    
    // Group by player and get their best score
    const playerBestScores = new Map<number, GameScore>();
    relevantScores.forEach(score => {
      if (score.farcasterFid) {
        const existing = playerBestScores.get(score.farcasterFid);
        if (!existing || score.score > existing.score) {
          playerBestScores.set(score.farcasterFid, score);
        }
      }
    });
    
    // Create leaderboard entries
    const entries: LeaderboardEntry[] = [];
    for (const [fid, bestScore] of playerBestScores) {
      const user = await this.getUserByFid(fid);
      const stats = await this.getPlayerStats(fid);
      
      entries.push({
        fid,
        username: user?.username || `Player ${fid}`,
        displayName: user?.displayName || undefined,
        pfpUrl: user?.pfpUrl || undefined,
        score: bestScore.score,
        level: bestScore.level,
        gamesPlayed: stats?.totalGamesPlayed || 1,
        rank: 0 // Will be set after sorting
      });
    }
    
    // Sort by score and assign ranks
    entries.sort((a, b) => b.score - a.score);
    entries.forEach((entry, index) => {
      entry.rank = index + 1;
    });
    
    return entries.slice(0, limit);
  }

  async getTopPlayersByGames(limit: number = 50): Promise<LeaderboardEntry[]> {
    const allStats = Array.from(this.playerStats.values())
      .filter(stats => stats.farcasterFid)
      .sort((a, b) => (b.totalGamesPlayed || 0) - (a.totalGamesPlayed || 0));
    
    const entries: LeaderboardEntry[] = [];
    for (let i = 0; i < Math.min(allStats.length, limit); i++) {
      const stats = allStats[i];
      const user = await this.getUserByFid(stats.farcasterFid!);
      
      entries.push({
        fid: stats.farcasterFid!,
        username: user?.username || `Player ${stats.farcasterFid}`,
        displayName: user?.displayName || undefined,
        pfpUrl: user?.pfpUrl || undefined,
        score: stats.highestScore || 0,
        level: stats.maxLevel || 0,
        gamesPlayed: stats.totalGamesPlayed || 0,
        rank: i + 1
      });
    }
    
    return entries;
  }

  async getPlayerRank(fid: number): Promise<number> {
    const topPlayers = await this.getTopPlayersByScore(1000);
    const playerEntry = topPlayers.find(entry => entry.fid === fid);
    return playerEntry?.rank || -1;
  }
}

export const storage = new MemStorage();

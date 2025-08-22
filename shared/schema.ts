import { pgTable, text, serial, integer, boolean, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  farcasterFid: integer("farcaster_fid"),
  displayName: text("display_name"),
  pfpUrl: text("pfp_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const gameScores = pgTable("game_scores", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  farcasterFid: integer("farcaster_fid"),
  score: integer("score").notNull(),
  timeAlive: integer("time_alive").notNull(), // in seconds
  level: integer("level").notNull(),
  coinsEarned: integer("coins_earned").default(0),
  gameData: text("game_data"), // JSON string for additional game data
  createdAt: timestamp("created_at").defaultNow(),
});

export const playerStats = pgTable("player_stats", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  farcasterFid: integer("farcaster_fid"),
  totalGamesPlayed: integer("total_games_played").default(0),
  totalScore: integer("total_score").default(0),
  highestScore: integer("highest_score").default(0),
  totalTimeAlive: integer("total_time_alive").default(0),
  bestSurvivalTime: integer("best_survival_time").default(0),
  maxLevel: integer("max_level").default(0),
  totalCoinsEarned: integer("total_coins_earned").default(0),
  lastPlayedAt: timestamp("last_played_at"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertGameScoreSchema = createInsertSchema(gameScores);
export const insertPlayerStatsSchema = createInsertSchema(playerStats);

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type GameScore = typeof gameScores.$inferSelect;
export type PlayerStats = typeof playerStats.$inferSelect;
export type InsertGameScore = z.infer<typeof insertGameScoreSchema>;
export type InsertPlayerStats = z.infer<typeof insertPlayerStatsSchema>;
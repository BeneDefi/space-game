
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import * as fs from 'fs';
import * as path from 'path';

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve the Farcaster manifest with dynamic URL replacement
  app.get('/.well-known/farcaster.json', (req, res) => {
    try {
      const manifestPath = path.join(process.cwd(), 'client/public/.well-known/farcaster.json');
      
      if (!fs.existsSync(manifestPath)) {
        return res.status(404).json({ error: 'Manifest not found' });
      }
      
      let manifest = fs.readFileSync(manifestPath, 'utf8');
      
      // Sanitize environment variables
      const replSlug = (process.env.REPL_SLUG || 'space-dodger').replace(/[^a-zA-Z0-9-]/g, '');
      const replOwner = (process.env.REPL_OWNER || 'user').replace(/[^a-zA-Z0-9-]/g, '');
      
      if (!replSlug || !replOwner) {
        return res.status(500).json({ error: 'Invalid environment configuration' });
      }
      
      manifest = manifest.replace(/\$\{REPL_SLUG\}\.\$\{REPL_OWNER\}\.repl\.co/g, `${replSlug}.${replOwner}.repl.co`);
      
      // Validate JSON before sending
      try {
        JSON.parse(manifest);
      } catch {
        return res.status(500).json({ error: 'Invalid manifest format' });
      }
      
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Cache-Control', 'public, max-age=3600');
      res.send(manifest);
    } catch (error) {
      console.error('Error serving farcaster.json:', error);
      res.status(500).json({ error: 'Failed to load manifest' });
    }
  });

  // Enhanced Farcaster webhook endpoint
  app.post('/api/webhooks/farcaster', async (req, res) => {
    try {
      const { type, data } = req.body;
      const timestamp = new Date().toISOString();
      
      console.log(`[${timestamp}] Farcaster webhook:`, { type, data });
      
      switch (type) {
        case 'miniapp.add':
          console.log('✅ User added Space Dodger mini app:', data);
          // Track user acquisition
          if (data?.fid) {
            await trackUserEvent(data.fid, 'miniapp_added');
          }
          break;
          
        case 'miniapp.remove':
          console.log('❌ User removed Space Dodger mini app:', data);
          if (data?.fid) {
            await trackUserEvent(data.fid, 'miniapp_removed');
          }
          break;
          
        case 'notifications.enable':
          console.log('🔔 Notifications enabled:', data);
          if (data?.fid && data?.token) {
            await storeNotificationToken(data.fid, data.token);
          }
          break;
          
        case 'notifications.disable':
          console.log('🔕 Notifications disabled:', data);
          if (data?.fid) {
            await removeNotificationToken(data.fid);
          }
          break;
          
        case 'frame.interaction':
          console.log('🖼️ Frame interaction:', data);
          break;
          
        default:
          console.log('❓ Unknown webhook type:', type);
      }
      
      res.status(200).json({ 
        success: true, 
        processed: type,
        timestamp 
      });
    } catch (error) {
      console.error('❌ Webhook error:', error);
      res.status(500).json({ 
        error: 'Webhook processing failed',
        details: error.message 
      });
    }
  });

  // Base network verification endpoint
  app.get('/api/base/verify', (req, res) => {
    res.json({
      chainId: 8453,
      name: "Base",
      supported: true,
      features: ["wallet", "transactions", "smart_contracts"],
      explorer: "https://basescan.org"
    });
  });

  // Enhanced user endpoints with Farcaster integration
  app.get('/api/user/:fid', async (req, res) => {
    try {
      const { fid } = req.params;
      const user = await storage.getUser(parseInt(fid));
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      res.json({
        ...user,
        farcaster: {
          fid: parseInt(fid),
          verified: true
        }
      });
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Create/update user with Farcaster data
  app.post('/api/user', async (req, res) => {
    try {
      const { fid, username, authToken, displayName, pfpUrl } = req.body;
      
      // Comprehensive validation
      if (!fid || typeof fid !== 'number' || fid <= 0) {
        return res.status(400).json({ error: 'Valid FID required' });
      }
      
      // Sanitize username
      const sanitizedUsername = username ? 
        username.replace(/[^a-zA-Z0-9_-]/g, '').substring(0, 30) : 
        `user_${fid}`;
      
      if (sanitizedUsername.length < 3) {
        return res.status(400).json({ error: 'Username must be at least 3 characters' });
      }
      
      // Validate displayName
      const sanitizedDisplayName = displayName ? 
        displayName.replace(/[<>\"'&]/g, '').substring(0, 50) : 
        sanitizedUsername;
      
      // Validate pfpUrl
      let validatedPfpUrl = null;
      if (pfpUrl && typeof pfpUrl === 'string') {
        try {
          const url = new URL(pfpUrl);
          if (['http:', 'https:'].includes(url.protocol)) {
            validatedPfpUrl = pfpUrl.substring(0, 500);
          }
        } catch {
          // Invalid URL, ignore
        }
      }
      
      // Validate authToken
      if (!authToken || typeof authToken !== 'string' || authToken.length < 10) {
        return res.status(400).json({ error: 'Valid auth token required' });
      }
      
      let user = await storage.getUserByFid(fid);
      if (!user) {
        user = await storage.getUserByUsername(sanitizedUsername);
        if (!user) {
          user = await storage.createUser({ 
            username: sanitizedUsername, 
            password: authToken.substring(0, 255) // Limit password length
          });
        }
        
        // Update user with Farcaster data
        user = {
          ...user,
          farcasterFid: fid,
          displayName: sanitizedDisplayName,
          pfpUrl: validatedPfpUrl
        };
        
        // In a real implementation, this would update the database
        // For now, we simulate updating the user record
      }
      
      res.json({
        ...user,
        farcaster: {
          fid,
          username: sanitizedUsername,
          displayName: sanitizedDisplayName,
          pfpUrl: validatedPfpUrl,
          verified: true
        }
      });
    } catch (error) {
      console.error('Error creating/updating user:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Game score submission with Farcaster sharing
  app.post('/api/game/score', async (req, res) => {
    try {
      const { fid, score, gameData } = req.body;
      
      // Comprehensive validation
      const validation = validateScoreSubmission(req.body);
      if (!validation.isValid) {
        console.warn('Invalid score submission:', validation.errors);
        return res.status(400).json({ 
          error: 'Invalid score data',
          details: validation.errors
        });
      }

      // Rate limiting per user
      const rateLimitKey = `score_${fid}`;
      const lastSubmission = await getRateLimitData(rateLimitKey);
      const now = Date.now();
      
      if (lastSubmission && (now - lastSubmission) < 5000) { // 5 second cooldown
        return res.status(429).json({ 
          error: 'Rate limit exceeded. Please wait before submitting another score.'
        });
      }

      await setRateLimitData(rateLimitKey, now);
      
      // Store validated score to leaderboard
      const scoreRecord = await storage.saveGameScore({
        farcasterFid: fid,
        score: validation.validatedScore,
        timeAlive: validation.validatedTimeAlive,
        level: validation.validatedLevel,
        coinsEarned: gameData?.coinsEarned || 0,
        gameData: JSON.stringify({
          timestamp: new Date().toISOString(),
          userAgent: req.headers['user-agent'],
          ip: req.ip,
          ...gameData
        })
      });

      await trackUserEvent(fid, 'score_achieved', scoreRecord);
      
      res.json({
        success: true,
        score: validation.validatedScore,
        shareText: `🚀 Just scored ${validation.validatedScore.toLocaleString()} points in Space Dodger on Base! Think you can beat it?`,
        shareUrl: `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`
      });
    } catch (error) {
      console.error('Error submitting score:', error);
      res.status(500).json({ error: 'Failed to submit score' });
    }
  });

  // Leaderboard endpoints
  app.get('/api/leaderboard/scores', async (req, res) => {
    try {
      const { timeframe = 'all', limit = 50 } = req.query;
      const validTimeframes = ['daily', 'weekly', 'all'];
      const validTimeframe = validTimeframes.includes(timeframe as string) 
        ? (timeframe as 'daily' | 'weekly' | 'all') 
        : 'all';
      const validLimit = Math.min(Math.max(parseInt(limit as string) || 50, 1), 100);
      
      const leaderboard = await storage.getTopPlayersByScore(validLimit, validTimeframe);
      
      res.json({
        leaderboard,
        timeframe: validTimeframe,
        count: leaderboard.length,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
  });

  app.get('/api/leaderboard/games', async (req, res) => {
    try {
      const { limit = 50 } = req.query;
      const validLimit = Math.min(Math.max(parseInt(limit as string) || 50, 1), 100);
      
      const leaderboard = await storage.getTopPlayersByGames(validLimit);
      
      res.json({
        leaderboard,
        count: leaderboard.length,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error fetching games leaderboard:', error);
      res.status(500).json({ error: 'Failed to fetch games leaderboard' });
    }
  });

  app.get('/api/player/:fid/rank', async (req, res) => {
    try {
      const { fid } = req.params;
      const parsedFid = parseInt(fid);
      
      if (isNaN(parsedFid) || parsedFid <= 0) {
        return res.status(400).json({ error: 'Invalid FID' });
      }
      
      const rank = await storage.getPlayerRank(parsedFid);
      const stats = await storage.getPlayerStats(parsedFid);
      
      res.json({
        fid: parsedFid,
        rank: rank > 0 ? rank : null,
        stats,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error fetching player rank:', error);
      res.status(500).json({ error: 'Failed to fetch player rank' });
    }
  });

  app.get('/api/player/:fid/scores', async (req, res) => {
    try {
      const { fid } = req.params;
      const { limit = 10 } = req.query;
      const parsedFid = parseInt(fid);
      
      if (isNaN(parsedFid) || parsedFid <= 0) {
        return res.status(400).json({ error: 'Invalid FID' });
      }
      
      const validLimit = Math.min(Math.max(parseInt(limit as string) || 10, 1), 50);
      const scores = await storage.getPlayerScores(parsedFid, validLimit);
      
      res.json({
        fid: parsedFid,
        scores,
        count: scores.length,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error fetching player scores:', error);
      res.status(500).json({ error: 'Failed to fetch player scores' });
    }
  });

  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      service: 'Space Dodger',
      network: 'Base',
      farcaster: 'enabled'
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Rate limiting storage (in production, use Redis or database)
const rateLimitStore = new Map<string, number>();

// Helper functions for tracking and notifications
async function trackUserEvent(fid: number, event: string, data?: any) {
  console.log(`📊 User event [${fid}]:`, event, data);
  // In production, save to database
}

async function getRateLimitData(key: string): Promise<number | null> {
  return rateLimitStore.get(key) || null;
}

async function setRateLimitData(key: string, value: number): Promise<void> {
  rateLimitStore.set(key, value);
  // Clean up old entries (simple cleanup)
  if (rateLimitStore.size > 10000) {
    const now = Date.now();
    for (const [k, v] of rateLimitStore.entries()) {
      if (now - v > 300000) { // 5 minutes old
        rateLimitStore.delete(k);
      }
    }
  }
}

function validateScoreSubmission(data: any): {
  isValid: boolean;
  errors: string[];
  validatedScore?: number;
  validatedTimeAlive?: number;
  validatedLevel?: number;
} {
  const errors: string[] = [];
  
  // Validate FID
  if (!data.fid || typeof data.fid !== 'number' || data.fid <= 0) {
    errors.push('Invalid or missing FID');
  }
  
  // Validate score with more realistic limits
  let validatedScore = 0;
  if (typeof data.score !== 'number' || isNaN(data.score) || data.score < 0) {
    errors.push('Invalid score: must be a positive number');
  } else if (data.score > 500000) { // Reduced from 1M
    errors.push('Score too high: maximum 500,000 points');
  } else if (data.score % 1 !== 0) { // Must be integer
    errors.push('Score must be a whole number');
  } else {
    validatedScore = Math.floor(data.score);
  }
  
  // Validate time alive with more strict limits
  let validatedTimeAlive = 0;
  if (data.gameData?.timeAlive !== undefined) {
    if (typeof data.gameData.timeAlive !== 'number' || isNaN(data.gameData.timeAlive) || data.gameData.timeAlive < 1) {
      errors.push('Invalid timeAlive: must be at least 1 second');
    } else if (data.gameData.timeAlive > 1800) { // 30 minutes max
      errors.push('Time alive too high: maximum 30 minutes');
    } else {
      validatedTimeAlive = Math.round(data.gameData.timeAlive * 10) / 10; // Round to 1 decimal
    }
  }
  
  // Validate level with progression logic
  let validatedLevel = 1;
  if (data.gameData?.level !== undefined) {
    if (typeof data.gameData.level !== 'number' || isNaN(data.gameData.level) || data.gameData.level < 1) {
      errors.push('Invalid level: must be at least 1');
    } else if (data.gameData.level > 100) { // More realistic max level
      errors.push('Level too high: maximum 100');
    } else {
      validatedLevel = Math.floor(data.gameData.level);
    }
  }
  
  // Enhanced cross-validation: score vs time (more realistic scoring)
  if (validatedScore > 0 && validatedTimeAlive > 0) {
    // Base scoring: 50 points/second, bonus for survival
    const baseScore = validatedTimeAlive * 50;
    const bonusMultiplier = Math.min(2.0, 1 + (validatedTimeAlive / 300)); // Max 2x bonus after 5 minutes
    const maxReasonableScore = Math.floor(baseScore * bonusMultiplier);
    
    if (validatedScore > maxReasonableScore * 1.5) { // Allow 50% variance
      errors.push(`Score unrealistic for time played: ${validatedScore} points in ${validatedTimeAlive} seconds`);
    }
  }
  
  // Enhanced level progression validation
  if (validatedLevel > 1 && validatedTimeAlive > 0) {
    // Level progression: ~1 level per 15 seconds
    const maxExpectedLevel = Math.floor(validatedTimeAlive / 15) + 1;
    if (validatedLevel > maxExpectedLevel + 3) {
      errors.push(`Level progression too fast: level ${validatedLevel} in ${validatedTimeAlive} seconds`);
    }
  }
  
  // Validate score vs level correlation
  if (validatedScore > 0 && validatedLevel > 0) {
    const minExpectedScore = (validatedLevel - 1) * 500; // Minimum 500 points per level
    const maxExpectedScore = validatedLevel * 10000; // Maximum 10k points per level
    
    if (validatedScore < minExpectedScore) {
      errors.push(`Score too low for level achieved: ${validatedScore} points at level ${validatedLevel}`);
    } else if (validatedScore > maxExpectedScore) {
      errors.push(`Score too high for level achieved: ${validatedScore} points at level ${validatedLevel}`);
    }
  }
  
  // Validate game data completeness
  if (!data.gameData || typeof data.gameData !== 'object') {
    errors.push('Game data required for validation');
  } else {
    // Check for required game metrics
    if (!data.gameData.timestamp) {
      errors.push('Game timestamp required');
    }
    
    // Validate timestamp freshness (within last 5 minutes)
    if (data.gameData.timestamp) {
      const gameTime = new Date(data.gameData.timestamp).getTime();
      const now = Date.now();
      if (now - gameTime > 300000) { // 5 minutes
        errors.push('Game session too old');
      }
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    validatedScore,
    validatedTimeAlive,
    validatedLevel
  };
}

async function storeNotificationToken(fid: number, token: string) {
  console.log(`🔔 Storing notification token for user ${fid}`);
  // In production, save to database
}

async function removeNotificationToken(fid: number) {
  console.log(`🔕 Removing notification token for user ${fid}`);
  // In production, remove from database
}

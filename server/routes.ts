
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
      let manifest = fs.readFileSync(manifestPath, 'utf8');
      
      // Replace placeholder URLs with actual Replit URLs
      const replSlug = process.env.REPL_SLUG || 'space-dodger';
      const replOwner = process.env.REPL_OWNER || 'user';
      const baseUrl = `https://${replSlug}.${replOwner}.repl.co`;
      
      manifest = manifest.replace(/\$\{REPL_SLUG\}\.\$\{REPL_OWNER\}\.repl\.co/g, `${replSlug}.${replOwner}.repl.co`);
      
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
      
      if (!fid) {
        return res.status(400).json({ error: 'FID required' });
      }
      
      let user = await storage.getUserByUsername(username || `user_${fid}`);
      if (!user) {
        user = await storage.createUser({ 
          username: username || `user_${fid}`, 
          password: authToken || 'farcaster_auth' 
        });
      }
      
      res.json({
        ...user,
        farcaster: {
          fid,
          username,
          displayName,
          pfpUrl,
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
      
      // Store validated score
      const validatedData = {
        score: validation.validatedScore,
        timeAlive: validation.validatedTimeAlive,
        level: validation.validatedLevel,
        timestamp: new Date().toISOString(),
        userAgent: req.headers['user-agent'],
        ip: req.ip,
        ...gameData
      };

      await trackUserEvent(fid, 'score_achieved', validatedData);
      
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
  
  // Validate score
  let validatedScore = 0;
  if (typeof data.score !== 'number' || isNaN(data.score) || data.score < 0) {
    errors.push('Invalid score: must be a positive number');
  } else if (data.score > 1000000) {
    errors.push('Score too high: maximum 1,000,000 points');
  } else {
    validatedScore = Math.floor(data.score);
  }
  
  // Validate time alive
  let validatedTimeAlive = 0;
  if (data.gameData?.timeAlive !== undefined) {
    if (typeof data.gameData.timeAlive !== 'number' || isNaN(data.gameData.timeAlive) || data.gameData.timeAlive < 0) {
      errors.push('Invalid timeAlive: must be a positive number');
    } else if (data.gameData.timeAlive > 3600) {
      errors.push('Time alive too high: maximum 1 hour');
    } else {
      validatedTimeAlive = data.gameData.timeAlive;
    }
  }
  
  // Validate level
  let validatedLevel = 1;
  if (data.gameData?.level !== undefined) {
    if (typeof data.gameData.level !== 'number' || isNaN(data.gameData.level) || data.gameData.level < 1) {
      errors.push('Invalid level: must be at least 1');
    } else if (data.gameData.level > 1000) {
      errors.push('Level too high: maximum 1000');
    } else {
      validatedLevel = Math.floor(data.gameData.level);
    }
  }
  
  // Cross-validation: score vs time
  if (validatedScore > 0 && validatedTimeAlive > 0) {
    const maxReasonableScore = validatedTimeAlive * 100; // ~100 points per second max
    if (validatedScore > maxReasonableScore) {
      errors.push(`Score too high for time played: ${validatedScore} points in ${validatedTimeAlive} seconds`);
      validatedScore = Math.min(validatedScore, maxReasonableScore);
    }
  }
  
  // Cross-validation: level vs time
  if (validatedLevel > 1 && validatedTimeAlive > 0) {
    const maxExpectedLevel = Math.floor(validatedTimeAlive / 10) + 1;
    if (validatedLevel > maxExpectedLevel + 5) {
      errors.push(`Level too high for time played: level ${validatedLevel} in ${validatedTimeAlive} seconds`);
      validatedLevel = Math.min(validatedLevel, maxExpectedLevel + 2);
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

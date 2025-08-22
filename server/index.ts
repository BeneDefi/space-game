import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import path from "path";
import net from 'net';

const app = express();

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

  // CORS for Farcaster
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  next();
});

// Body parsing with size limits
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false, limit: '1mb' }));

// Validate and set environment variables for Replit
const validateEnvVar = (name: string, defaultValue: string): string => {
  const value = process.env[name] || defaultValue;
  const sanitized = value.replace(/[^a-zA-Z0-9-]/g, '');
  if (!sanitized || sanitized.length < 3) {
    console.warn(`Warning: Invalid ${name}, using default`);
    return defaultValue;
  }
  return sanitized;
};

process.env.REPL_SLUG = validateEnvVar('REPL_SLUG', 'space-dodger');
process.env.REPL_OWNER = validateEnvVar('REPL_OWNER', 'user');
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

console.log(`🚀 Starting Space Dodger - ${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`);

// Serve static files including .well-known directory
app.use('/.well-known', express.static(path.join(process.cwd(), 'client/public/.well-known')));
app.use(express.static(path.join(process.cwd(), 'client/public')));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

async function startServer() {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const PORT = parseInt(process.env.PORT || "5000");

  // Function to find available port
  const findAvailablePort = async (startPort: number = 3000): Promise<number> => {
    const isPortAvailable = (port: number): Promise<boolean> => {
      return new Promise((resolve) => {
        const server = net.createServer();
        server.listen(port, () => {
          server.once('close', () => resolve(true));
          server.close();
        });
        server.on('error', () => resolve(false));
      });
    };

    for (let port = startPort; port < startPort + 100; port++) {
      if (await isPortAvailable(port)) {
        return port;
      }
    }

    return startPort;
  };

  const availablePort = await findAvailablePort(PORT);

  server.listen(availablePort, "0.0.0.0", () => {
    console.log(`🚀 Starting Space Dodger - ${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`);
    console.log(`🌐 Server running on http://0.0.0.0:${availablePort}`);
    console.log(`🎮 Game ready for Base network integration`);
    console.log(`📱 Farcaster Mini App enabled`);
  });
}

startServer().catch(console.error);
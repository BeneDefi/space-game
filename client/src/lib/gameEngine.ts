import { useGameState } from "./stores/useGameState";
import { useAudio } from "./stores/useAudio";
import { Spaceship, Asteroid, PowerUp } from "./gameObjects";
import { checkCollision } from "./collision";

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private animationId: number | null = null;
  private lastTime = 0;
  private keys: Record<string, boolean> = {};
  
  private spaceship: Spaceship;
  private asteroids: Asteroid[] = [];
  private powerUps: PowerUp[] = [];
  
  private lastAsteroidSpawn = 0;
  private lastPowerUpSpawn = 0;
  private asteroidSpawnInterval = 2000; // milliseconds
  private powerUpSpawnInterval = 15000; // 15 seconds
  
  private stars: Array<{ x: number; y: number; speed: number; size: number }> = [];

  constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    this.canvas = canvas;
    this.ctx = ctx;
    
    this.spaceship = new Spaceship(canvas.width / 2, canvas.height - 80);
    this.initializeStars();
    this.setupEventListeners();
  }

  private initializeStars() {
    // Create starfield background
    for (let i = 0; i < 200; i++) {
      this.stars.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        speed: Math.random() * 2 + 0.5,
        size: Math.random() * 2 + 1
      });
    }
  }

  private setupEventListeners() {
    const handleKeyDown = (event: KeyboardEvent) => {
      this.keys[event.code] = true;
      
      if (event.code === "Escape") {
        const gameState = useGameState.getState();
        if (gameState.gamePhase === "playing") {
          gameState.pause();
        } else if (gameState.gamePhase === "paused") {
          gameState.resume();
        }
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      this.keys[event.code] = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    // Store references for cleanup
    this.keyDownHandler = handleKeyDown;
    this.keyUpHandler = handleKeyUp;
  }

  private keyDownHandler!: (event: KeyboardEvent) => void;
  private keyUpHandler!: (event: KeyboardEvent) => void;

  start() {
    if (this.animationId === null) {
      this.lastTime = performance.now();
      this.gameLoop();
    }
  }

  stop() {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  destroy() {
    this.stop();
    window.removeEventListener("keydown", this.keyDownHandler);
    window.removeEventListener("keyup", this.keyUpHandler);
  }

  private gameLoop = (currentTime: number = performance.now()) => {
    const gameState = useGameState.getState();
    
    // Don't update game logic if paused
    if (gameState.gamePhase === "paused") {
      this.animationId = requestAnimationFrame(this.gameLoop);
      return;
    }
    
    const deltaTime = (currentTime - this.lastTime) / 1000; // Convert to seconds
    this.lastTime = currentTime;
    
    if (gameState.gamePhase !== "playing" || gameState.isPaused) {
      this.animationId = requestAnimationFrame(this.gameLoop);
      return;
    }

    this.update(deltaTime);
    this.render();

    this.animationId = requestAnimationFrame(this.gameLoop);
  };

  private update(deltaTime: number) {
    const gameState = useGameState.getState();
    
    // Update game time
    gameState.updateTime(deltaTime);
    gameState.updateDifficulty();
    gameState.updatePowerUps(deltaTime);

    // Handle input
    this.handleInput();

    // Update spaceship
    this.spaceship.update(deltaTime, this.canvas.width);

    // Spawn asteroids
    this.spawnAsteroids(gameState);

    // Spawn power-ups
    this.spawnPowerUps(gameState);

    // Update asteroids
    const slowTimeActive = gameState.activePowerUps.some(p => p.type === "slowTime");
    const speedMultiplier = slowTimeActive ? 0.5 : 1;

    this.asteroids.forEach(asteroid => {
      asteroid.update(deltaTime * speedMultiplier);
    });

    // Update power-ups
    this.powerUps.forEach(powerUp => {
      powerUp.update(deltaTime);
    });

    // Check collisions
    this.checkCollisions(gameState);

    // Remove off-screen objects
    this.asteroids = this.asteroids.filter(asteroid => asteroid.y < this.canvas.height + 50);
    this.powerUps = this.powerUps.filter(powerUp => powerUp.y < this.canvas.height + 50);

    // Update stars
    this.updateStars(deltaTime);

    // Add score for survival
    gameState.addScore(Math.floor(deltaTime * 10));
  }

  private handleInput() {
    const moveSpeed = 400; // pixels per second
    
    if (this.keys["ArrowLeft"] || this.keys["KeyA"]) {
      this.spaceship.moveLeft(moveSpeed);
    }
    if (this.keys["ArrowRight"] || this.keys["KeyD"]) {
      this.spaceship.moveRight(moveSpeed);
    }
  }

  private spawnAsteroids(gameState: any) {
    const now = performance.now();
    
    // Calculate spawn interval based on difficulty
    const baseInterval = 2000; // 2 seconds
    const minInterval = 300; // 0.3 seconds
    this.asteroidSpawnInterval = Math.max(
      minInterval,
      baseInterval - (gameState.difficultyLevel - 1) * 150
    );

    if (now - this.lastAsteroidSpawn > this.asteroidSpawnInterval) {
      const x = Math.random() * (this.canvas.width - 60) + 30;
      const speed = Math.min(400, 100 + (gameState.difficultyLevel - 1) * 20);
      const size = Math.random() * 30 + 20; // 20-50 pixels
      
      this.asteroids.push(new Asteroid(x, -size, size, speed));
      this.lastAsteroidSpawn = now;
    }
  }

  private spawnPowerUps(gameState: any) {
    const now = performance.now();
    
    // Only spawn power-ups after level 3
    if (gameState.difficultyLevel < 3) return;

    if (now - this.lastPowerUpSpawn > this.powerUpSpawnInterval) {
      const x = Math.random() * (this.canvas.width - 40) + 20;
      const types: ("shield" | "slowTime" | "scoreBoost")[] = ["shield", "slowTime", "scoreBoost"];
      const type = types[Math.floor(Math.random() * types.length)];
      
      this.powerUps.push(new PowerUp(x, -20, type));
      this.lastPowerUpSpawn = now;
    }
  }

  private checkCollisions(gameState: any) {
    const audioState = useAudio.getState();

    // Check asteroid collisions
    for (let i = this.asteroids.length - 1; i >= 0; i--) {
      const asteroid = this.asteroids[i];
      
      if (checkCollision(this.spaceship, asteroid)) {
        // Remove asteroid
        this.asteroids.splice(i, 1);
        
        if (gameState.hasShield) {
          // Shield absorbs the hit
          gameState.removeShield();
          audioState.playSuccess();
        } else {
          // Player takes damage
          gameState.loseLife();
          audioState.playHit();
          
          // Add temporary invincibility
          this.spaceship.setInvincible(1); // 1 second
        }
        break;
      }
    }

    // Check power-up collisions
    for (let i = this.powerUps.length - 1; i >= 0; i--) {
      const powerUp = this.powerUps[i];
      
      if (checkCollision(this.spaceship, powerUp)) {
        // Collect power-up
        this.powerUps.splice(i, 1);
        gameState.activatePowerUp(powerUp.type);
        audioState.playSuccess();
        
        // Bonus points
        gameState.addScore(100);
        break;
      }
    }
  }

  private updateStars(deltaTime: number) {
    this.stars.forEach(star => {
      star.y += star.speed * deltaTime * 60; // 60fps baseline
      
      if (star.y > this.canvas.height) {
        star.y = -star.size;
        star.x = Math.random() * this.canvas.width;
      }
    });
  }

  private render() {
    // Clear canvas
    this.ctx.fillStyle = "#000011";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw stars
    this.ctx.fillStyle = "white";
    this.stars.forEach(star => {
      this.ctx.fillRect(star.x, star.y, star.size, star.size);
    });

    // Draw game objects
    this.spaceship.render(this.ctx);
    this.asteroids.forEach(asteroid => asteroid.render(this.ctx));
    this.powerUps.forEach(powerUp => powerUp.render(this.ctx));

    // Draw power-up effects
    this.renderEffects();
  }

  private renderEffects() {
    const gameState = useGameState.getState();

    // Shield effect
    if (gameState.hasShield) {
      this.ctx.strokeStyle = "#00ffff";
      this.ctx.lineWidth = 3;
      this.ctx.beginPath();
      this.ctx.arc(this.spaceship.x + this.spaceship.width / 2, 
                  this.spaceship.y + this.spaceship.height / 2, 
                  35, 0, Math.PI * 2);
      this.ctx.stroke();
    }

    // Slow time effect
    if (gameState.activePowerUps.some(p => p.type === "slowTime")) {
      this.ctx.fillStyle = "rgba(255, 255, 0, 0.1)";
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }
}

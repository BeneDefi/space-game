import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { getLocalStorage, setLocalStorage } from "../utils";

export type GamePhase = "ready" | "playing" | "ended";
export type PowerUpType = "shield" | "slowTime" | "scoreBoost";

export interface PowerUp {
  id: string;
  type: PowerUpType;
  x: number;
  y: number;
  width: number;
  height: number;
  collected: boolean;
}

export interface ActivePowerUp {
  type: PowerUpType;
  timeRemaining: number;
}

interface GameState {
  // Game state
  gamePhase: GamePhase;
  score: number;
  lives: number;
  timeAlive: number;
  difficultyLevel: number;
  highScore: number;

  // Power-ups
  activePowerUps: ActivePowerUp[];
  hasShield: boolean;

  // Game settings
  isPaused: boolean;

  // Security tracking
  lastScoreTime: number;
  scoreEvents: number[];
  gameStartTime: number;

  // Actions
  start: () => void;
  restart: () => void;
  end: () => void;

  // Game actions
  addScore: (points: number) => void;
  loseLife: () => void;
  updateTime: (deltaTime: number) => void;
  updateDifficulty: () => void;

  // Power-up actions
  activatePowerUp: (type: PowerUpType) => void;
  updatePowerUps: (deltaTime: number) => void;
  removeShield: () => void;

  // Pause/resume
  pause: () => void;
  resume: () => void;
}

export const useGameState = create<GameState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    gamePhase: "ready",
    score: 0,
    lives: 3,
    timeAlive: 0,
    difficultyLevel: 1,
    highScore: 0,

    activePowerUps: [],
    hasShield: false,

    isPaused: false,

    // Security tracking
    lastScoreTime: 0,
    scoreEvents: [],
    gameStartTime: 0,

    start: () => {
      set((state) => {
        if (state.gamePhase === "ready") {
          return {
            gamePhase: "playing",
            isPaused: false,
            gameStartTime: Date.now(),
            scoreEvents: [],
            lastScoreTime: 0
          };
        }
        return {};
      });
    },

    restart: () => {
      set(() => ({
        gamePhase: "ready",
        score: 0,
        lives: 3,
        timeAlive: 0,
        difficultyLevel: 1,
        activePowerUps: [],
        hasShield: false,
        isPaused: false,
        lastScoreTime: 0,
        scoreEvents: [],
        gameStartTime: 0
      }));
    },

    end: () => {
      set((state) => {
        if (state.gamePhase === "playing") {
          const newHighScore = Math.max(state.score, state.highScore);
          if (newHighScore > state.highScore) {
            setLocalStorage("spaceDodgerHighScore", newHighScore);
          }

          // Dispatch a custom event to notify profile about game end
          window.dispatchEvent(new CustomEvent('gameEnd', {
            detail: {
              score: state.score,
              timeAlive: state.timeAlive,
              difficultyLevel: state.difficultyLevel
            }
          }));

          return {
            gamePhase: "ended",
            highScore: newHighScore
          };
        }
        return {};
      });
    },

    addScore: (points: number) => {
      set((state) => {
        const now = Date.now();
        
        // Basic input validation
        if (typeof points !== 'number' || isNaN(points) || points < 0) {
          console.warn('Invalid score points:', points);
          return {};
        }

        // Game must be playing
        if (state.gamePhase !== "playing") {
          console.warn('Score attempted while not playing');
          return {};
        }

        // Rate limiting - max 100 score events per second
        const recentEvents = state.scoreEvents.filter(time => now - time < 1000);
        if (recentEvents.length > 100) {
          console.warn('Score rate limit exceeded');
          return {};
        }

        // Reasonable score validation based on game time
        const gameTime = (now - state.gameStartTime) / 1000;
        const maxReasonableScore = gameTime * 50; // Max ~50 points per second
        
        if (state.score + points > maxReasonableScore) {
          console.warn('Unreasonable score detected:', { 
            gameTime, 
            currentScore: state.score, 
            addingPoints: points,
            maxReasonable: maxReasonableScore 
          });
          // Cap the points to reasonable amount
          points = Math.max(0, maxReasonableScore - state.score);
        }

        // Max single score addition (prevents massive point injections)
        const maxSingleScore = 50;
        if (points > maxSingleScore) {
          console.warn('Single score too high:', points);
          points = maxSingleScore;
        }

        // Apply score multiplier if active
        const multiplier = state.activePowerUps.some(p => p.type === "scoreBoost") ? 2 : 1;
        const finalPoints = points * multiplier;

        // Update score events for rate limiting
        const updatedScoreEvents = [...recentEvents, now];

        return {
          score: state.score + finalPoints,
          scoreEvents: updatedScoreEvents,
          lastScoreTime: now
        };
      });
    },

    loseLife: () => {
      set((state) => {
        const newLives = state.lives - 1;
        return {
          lives: newLives,
          ...(newLives <= 0 && { gamePhase: "ended" as GamePhase })
        };
      });
    },

    updateTime: (deltaTime: number) => {
      set((state) => {
        // Validate deltaTime is reasonable (prevent time manipulation)
        if (typeof deltaTime !== 'number' || isNaN(deltaTime) || deltaTime < 0 || deltaTime > 1) {
          console.warn('Invalid deltaTime:', deltaTime);
          return {};
        }

        // Game must be playing
        if (state.gamePhase !== "playing" || state.isPaused) {
          return {};
        }

        return {
          timeAlive: state.timeAlive + deltaTime
        };
      });
    },

    updateDifficulty: () => {
      set((state) => {
        const newLevel = Math.floor(state.timeAlive / 10) + 1;
        return {
          difficultyLevel: Math.max(newLevel, state.difficultyLevel)
        };
      });
    },

    activatePowerUp: (type: PowerUpType) => {
      set((state) => {
        // Validate power-up type
        const validTypes: PowerUpType[] = ["shield", "slowTime", "scoreBoost"];
        if (!validTypes.includes(type)) {
          console.warn('Invalid power-up type:', type);
          return {};
        }

        // Game must be playing
        if (state.gamePhase !== "playing") {
          console.warn('Power-up activated while not playing');
          return {};
        }

        if (type === "shield") {
          return { hasShield: true };
        }

        // Remove existing power-up of same type
        const filteredPowerUps = state.activePowerUps.filter(p => p.type !== type);

        const duration = type === "slowTime" ? 5 : 10; // slowTime: 5s, scoreBoost: 10s

        return {
          activePowerUps: [
            ...filteredPowerUps,
            { type, timeRemaining: duration }
          ]
        };
      });
    },

    updatePowerUps: (deltaTime: number) => {
      set((state) => ({
        activePowerUps: state.activePowerUps
          .map(powerUp => ({
            ...powerUp,
            timeRemaining: powerUp.timeRemaining - deltaTime
          }))
          .filter(powerUp => powerUp.timeRemaining > 0)
      }));
    },

    removeShield: () => {
      set(() => ({ hasShield: false }));
    },

    pause: () => {
      set((state) => ({
        isPaused: true
      }));
    },

    resume: () => {
      set(() => ({ isPaused: false }));
    }
  }))
);
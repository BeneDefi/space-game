import { useEffect, useRef } from "react";
import { useGameState } from "../lib/stores/useGameState";
import { GameEngine } from "../lib/gameEngine";

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameEngineRef = useRef<GameEngine | null>(null);
  const { gamePhase } = useGameState();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Initialize game engine
    gameEngineRef.current = new GameEngine(canvas, ctx);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (gameEngineRef.current) {
        gameEngineRef.current.destroy();
      }
    };
  }, []);

  useEffect(() => {
    if (gameEngineRef.current) {
      if (gamePhase === "playing") {
        gameEngineRef.current.start();
      } else {
        gameEngineRef.current.stop();
      }
    }
  }, [gamePhase]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ imageRendering: "pixelated" }}
    />
  );
}

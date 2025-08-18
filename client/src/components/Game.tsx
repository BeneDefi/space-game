import { useEffect, useRef } from "react";
import { useGameState } from "../lib/stores/useGameState";
import { useAudio } from "../lib/stores/useAudio";
import GameCanvas from "./GameCanvas";
import GameUI from "./GameUI";
import StartScreen from "./StartScreen";
import GameOverScreen from "./GameOverScreen";

export default function Game() {
  const { gamePhase, start } = useGameState();
  const { backgroundMusic, isMuted } = useAudio();
  const backgroundMusicRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    backgroundMusicRef.current = backgroundMusic;
  }, [backgroundMusic]);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.code === "Space" && gamePhase === "ready") {
        event.preventDefault();
        start();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [gamePhase, start]);

  useEffect(() => {
    // Manage background music
    if (backgroundMusicRef.current) {
      if (gamePhase === "playing" && !isMuted) {
        backgroundMusicRef.current.play().catch(console.error);
      } else {
        backgroundMusicRef.current.pause();
      }
    }
  }, [gamePhase, isMuted]);

  return (
    <div className="relative w-full h-full">
      <GameCanvas />
      
      {gamePhase === "ready" && <StartScreen />}
      {gamePhase === "playing" && <GameUI />}
      {gamePhase === "ended" && <GameOverScreen />}
    </div>
  );
}

import { useEffect, useRef, useState } from "react";
import { useGameState } from "../../lib/stores/useGameState";
import { useAudio } from "../../lib/stores/useAudio";
import GameCanvas from "../GameCanvas";
import GameUI from "../GameUI";
import StartScreen from "../StartScreen";
import GameOverScreen from "../GameOverScreen";
import { ArrowLeft, ChevronUp, ChevronDown } from "lucide-react";

interface GameScreenProps {
  onBack?: () => void;
}

export default function GameScreen({ onBack }: GameScreenProps) {
  const { gamePhase, start, pause, resume, restart } = useGameState();
  const { backgroundMusic, isMuted, setBackgroundMusic, setHitSound, setSuccessSound } = useAudio();
  const backgroundMusicRef = useRef<HTMLAudioElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollButtons, setShowScrollButtons] = useState(false);

  useEffect(() => {
    // Load audio assets if not already loaded
    const loadAudio = async () => {
      if (!backgroundMusic) {
        try {
          const bgMusic = new Audio("/sounds/background.mp3");
          const hitSound = new Audio("/sounds/hit.mp3");
          const successSound = new Audio("/sounds/success.mp3");

          bgMusic.loop = true;
          bgMusic.volume = 0.3;

          setBackgroundMusic(bgMusic);
          setHitSound(hitSound);
          setSuccessSound(successSound);
        } catch (error) {
          console.error("Failed to load audio assets:", error);
        }
      }
    };

    loadAudio();
  }, [backgroundMusic, setBackgroundMusic, setHitSound, setSuccessSound]);

  useEffect(() => {
    backgroundMusicRef.current = backgroundMusic;
  }, [backgroundMusic]);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.code === "Space" && gamePhase === "ready") {
        event.preventDefault();
        start();
      } else if (event.key === "Escape" && gamePhase === "playing") {
        pause();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [gamePhase, start, pause]);

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

  useEffect(() => {
    const checkScrollable = () => {
      if (scrollContainerRef.current) {
        const { scrollHeight, clientHeight } = scrollContainerRef.current;
        setShowScrollButtons(scrollHeight > clientHeight);
      }
    };

    checkScrollable();
    window.addEventListener("resize", checkScrollable);
    return () => window.removeEventListener("resize", checkScrollable);
  }, [gamePhase]);

  const scrollUp = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ top: -200, behavior: "smooth" });
    }
  };

  const scrollDown = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ top: 200, behavior: "smooth" });
    }
  };

  return (
    <div className="relative bg-black overflow-hidden h-full flex flex-col">
      {/* Back Button */}
      {(gamePhase === "ready" || gamePhase === "paused" || gamePhase === "ended") && (
        <button
          onClick={onBack}
          className="absolute top-4 left-4 z-20 text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
          title="Back"
        >
          <ArrowLeft size={24} />
        </button>
      )}

      <div
        ref={scrollContainerRef}
        className="flex-grow overflow-y-auto scrollbar-hide"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {gamePhase === "ready" && (
          <div className="h-full flex items-center justify-center">
            <StartScreen onStart={start} />
          </div>
        )}
        {gamePhase === "playing" && <GameCanvas />}
        {gamePhase === "paused" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-20">
            <div className="text-center text-white">
              <h2 className="text-4xl font-bold mb-4">PAUSED</h2>
              <p className="text-lg mb-4">Press ESC or click Resume to continue</p>
              <button
                onClick={resume}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors mr-2"
              >
                ▶️ Resume
              </button>
            </div>
          </div>
        )}
        {gamePhase === "ended" && <GameOverScreen />}
      </div>

      {/* Game UI and Controls */}
      {(gamePhase === "playing" || gamePhase === "paused") && (
        <>
          <GameUI />
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 flex gap-2">
            {gamePhase === "playing" && (
              <button
                onClick={pause}
                className="bg-black/50 backdrop-blur-sm rounded-lg p-2 text-white hover:bg-black/70 transition-colors"
                title="Pause"
              >
                ⏸️
              </button>
            )}
            {gamePhase === "paused" && (
              <button
                onClick={resume}
                className="bg-black/50 backdrop-blur-sm rounded-lg p-2 text-white hover:bg-black/70 transition-colors"
                title="Resume"
              >
                ▶️
              </button>
            )}
            <button
              onClick={restart}
              className="bg-black/50 backdrop-blur-sm rounded-lg p-2 text-white hover:bg-black/70 transition-colors"
              title="Restart"
            >
              🔄
            </button>
          </div>
        </>
      )}

      {/* Scroll Controls */}
      {showScrollButtons && (
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex flex-col gap-2 z-30">
          <button
            onClick={scrollUp}
            className="p-2 bg-white/10 backdrop-blur-sm rounded-full text-white hover:bg-white/20 transition-all"
          >
            <ChevronUp size={20} />
          </button>
          <button
            onClick={scrollDown}
            className="p-2 bg-white/10 backdrop-blur-sm rounded-full text-white hover:bg-white/20 transition-all"
          >
            <ChevronDown size={20} />
          </button>
        </div>
      )}
    </div>
  );
}
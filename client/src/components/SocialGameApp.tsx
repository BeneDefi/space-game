import { useState, useEffect } from "react";
import { useWallet } from "../lib/stores/useWallet";
import { useGameState } from "../lib/stores/useGameState";
import WalletConnect from "./WalletConnect";
import LeaderboardScreen from "./social/LeaderboardScreen";
import GameScreen from "./social/GameScreen";
import StoreScreen from "./social/StoreScreen";
import ProfileScreen from "./social/ProfileScreen";
import TaskScreen from "./social/TaskScreen";
import BottomNavigation from "./social/BottomNavigation";
import { useFarcaster } from "../lib/stores/useFarcaster";
import { Loader2 } from "lucide-react";

type Screen = "game" | "store" | "ranking" | "profile" | "tasks";

export default function SocialGameApp() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("game");
  const { isConnected } = useWallet();
  const [showGame, setShowGame] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { initialize } = useFarcaster();
  const { gamePhase } = useGameState();

  useEffect(() => {
    // Initialize Farcaster context when app loads
    initialize();
    
    // Simulate app loading
    const loadTimer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(loadTimer);
  }, [initialize]);

  const renderScreen = () => {
    switch (currentScreen) {
      case "game":
        return <GameScreen />;
      case "store":
        return <StoreScreen />;
      case "ranking":
        return <LeaderboardScreen />;
      case "profile":
        return <ProfileScreen />;
      case "tasks":
        return <TaskScreen />;
      default:
        return <GameScreen />;
    }
  };

  // Loading screen
  if (isLoading) {
    return (
      <div className="h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 flex items-center justify-center max-w-md mx-auto">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="w-20 h-20 mx-auto">
              <div className="absolute inset-0 rounded-full border-4 border-purple-500/30"></div>
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-500 animate-spin"></div>
              <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-blue-500 animate-spin animate-reverse"></div>
              <Loader2 className="absolute inset-0 m-auto text-white animate-pulse" size={32} />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Space Dodger</h2>
          <p className="text-purple-300 animate-pulse">Loading your cosmic adventure...</p>
        </div>
      </div>
    );
  }

  if (!isConnected || !showGame) {
    return <WalletConnect onConnected={() => setShowGame(true)} />;
  }

  return (
    <div className="h-screen bg-gray-900 flex flex-col max-w-md mx-auto">
      <div className="flex-1 overflow-hidden">
        {renderScreen()}
      </div>
      {!(currentScreen === "game" && gamePhase === "playing") && (
        <BottomNavigation activeTab={currentScreen} onTabChange={(tab) => setCurrentScreen(tab as Screen)} />
      )}
    </div>
  );
}
import { useState, useEffect } from "react";
import { useWallet } from "../lib/stores/useWallet";
import { useGameState } from "../lib/stores/useGameState";
import WalletConnect from "./WalletConnect";
import RankingScreen from './social/RankingScreen';
import GameScreen from "./social/GameScreen";
import StoreScreen from "./social/StoreScreen";
import ProfileScreen from "./social/ProfileScreen";
import TaskScreen from "./social/TaskScreen";
import BottomNavigation from "./social/BottomNavigation";
import { useFarcaster } from "../lib/stores/useFarcaster";
import { Loader2, Shield, AlertCircle } from "lucide-react";

type Screen = "game" | "store" | "ranking" | "profile" | "tasks";

export default function SocialGameApp() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("game");
  const { isConnected } = useWallet();
  const [showGame, setShowGame] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { initialize, isAuthenticated, user, signIn, error, isLoading: farcasterLoading } = useFarcaster();
  const { gamePhase } = useGameState();

  useEffect(() => {
    console.log('🚀 SocialGameApp mounting...');
    
    // Add error boundary for the whole app
    window.addEventListener('error', (event) => {
      console.error('Global error caught:', event.error);
    });

    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason);
    });
    
    // Initialize Farcaster context when app loads
    try {
      initialize();
    } catch (error) {
      console.error('Failed to initialize Farcaster:', error);
    }

    // Reduce loading time and make it more responsive
    const loadTimer = setTimeout(() => {
      console.log('⏰ Loading timeout complete');
      setIsLoading(false);
    }, 1500);

    return () => {
      clearTimeout(loadTimer);
      window.removeEventListener('error', () => {});
      window.removeEventListener('unhandledrejection', () => {});
    };
  }, [initialize]);

  // Debug logging
  useEffect(() => {
    console.log('📊 App state:', {
      isLoading,
      isConnected,
      showGame,
      isAuthenticated,
      user: user?.username,
      currentScreen,
      gamePhase,
      error
    });
  }, [isLoading, isConnected, showGame, isAuthenticated, user, currentScreen, gamePhase, error]);

  const renderScreen = () => {
    switch (currentScreen) {
      case "game":
        return <GameScreen />;
      case "store":
        return <StoreScreen />;
      case "ranking":
        return <RankingScreen />;
      case "profile":
        return <ProfileScreen />;
      case "tasks":
        return <TaskScreen />;
      default:
        return <GameScreen />;
    }
  };

  const showBottomNav = !(currentScreen === "game" && gamePhase === "playing");

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

  // Farcaster Authentication Check with better fallbacks
  // Skip auth screen if we're clearly in Farcaster context but auth is still loading
  const inFarcasterFrame = window.parent !== window;
  const shouldShowAuthScreen = !isAuthenticated && !inFarcasterFrame && !farcasterLoading;
  
  if (shouldShowAuthScreen) {
    return (
      <div className="h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 flex items-center justify-center max-w-md mx-auto p-4">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 text-center text-white border border-gray-700 max-w-sm w-full">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield size={32} />
          </div>
          
          <h2 className="text-2xl font-bold mb-2">Farcaster Required</h2>
          <p className="text-gray-300 mb-6">
            This game requires Farcaster authentication to access social features, leaderboards, and score submission.
          </p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4 flex items-center gap-2">
              <AlertCircle size={16} className="text-red-400" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <button
            onClick={signIn}
            disabled={farcasterLoading}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl py-3 px-6 font-medium transition-all duration-200 flex items-center justify-center gap-2 mb-3"
          >
            {farcasterLoading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Shield size={20} />
                Sign in with Farcaster
              </>
            )}
          </button>

          <button
            onClick={() => {
              console.log('🔧 Bypassing Farcaster auth - continuing to game');
              // Force continue to game
            }}
            className="w-full bg-gray-600 hover:bg-gray-700 rounded-xl py-2 px-4 text-sm font-medium transition-all duration-200"
          >
            Continue to Game
          </button>

          <p className="text-xs text-gray-500 mt-4">
            Best experience with Farcaster. Continue anyway to play offline.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-900 flex flex-col max-w-md mx-auto relative">
      {/* Main content area with proper spacing for navigation */}
      <div className={`flex-1 overflow-hidden ${showBottomNav ? 'pb-20' : ''}`}>
        <div className="h-full">
          {renderScreen()}
        </div>
      </div>

      {/* Bottom navigation - positioned at bottom */}
      {showBottomNav && (
        <div className="absolute bottom-0 left-0 right-0 z-50">
          <BottomNavigation 
            activeTab={currentScreen} 
            onTabChange={(tab) => setCurrentScreen(tab as Screen)} 
          />
        </div>
      )}
    </div>
  );
}
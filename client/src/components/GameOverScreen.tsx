import { useGameState } from "../lib/stores/useGameState";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { useFarcaster } from "../lib/stores/useFarcaster";
import { Share2, Trophy, Clock, Target, Crown, RotateCcw, Sparkles, TrendingUp } from "lucide-react";

export default function GameOverScreen() {
  const { score, timeAlive, difficultyLevel, restart, highScore } = useGameState();

  const isNewHighScore = score > highScore;

  const { shareScore, isAuthenticated } = useFarcaster();

  const handleShare = async () => {
    try {
      await shareScore(score, window.location.origin);
    } catch (error) {
      console.error('Failed to share score:', error);
    }
  };

  const getPerformanceData = () => {
    if (timeAlive < 10) return {
      message: "Keep practicing! You'll get the hang of it.",
      icon: TrendingUp,
      color: "from-blue-400 to-cyan-400"
    };
    if (timeAlive < 30) return {
      message: "Good effort! Try to survive longer.",
      icon: Target,
      color: "from-green-400 to-emerald-400"
    };
    if (timeAlive < 60) return {
      message: "Nice work! You're getting skilled.",
      icon: Trophy,
      color: "from-yellow-400 to-orange-400"
    };
    return {
      message: "Amazing survival skills! You're a space ace!",
      icon: Crown,
      color: "from-purple-400 to-pink-400"
    };
  };

  const performanceData = getPerformanceData();
  const PerformanceIcon = performanceData.icon;

  return (
    <div className="absolute inset-0 bg-gradient-to-b from-slate-900/95 to-black/95 backdrop-blur-md overflow-y-auto">
      <div className="min-h-full flex items-start justify-center py-4 px-4">
        <div className="text-center text-white max-w-2xl w-full">
          {/* Game Over Title */}
          <div className="mb-4 sm:mb-6">
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black mb-2 sm:mb-4 bg-gradient-to-r from-red-400 to-pink-500 bg-clip-text text-transparent">
              GAME OVER
            </h1>
            
            {/* New High Score */}
            {isNewHighScore && (
              <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4 p-3 sm:p-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-xl sm:rounded-2xl border border-yellow-500/30">
                <Sparkles className="w-5 h-5 sm:w-8 sm:h-8 text-yellow-400 animate-pulse" />
                <div className="text-lg sm:text-2xl lg:text-3xl font-bold text-yellow-400 animate-pulse">
                  NEW HIGH SCORE!
                </div>
                <Sparkles className="w-5 h-5 sm:w-8 sm:h-8 text-yellow-400 animate-pulse" />
              </div>
            )}
          </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
          {/* Final Score */}
          <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-md rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-yellow-500/30 shadow-2xl">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg sm:rounded-xl">
                <Trophy className="w-5 h-5 sm:w-8 sm:h-8 text-white" />
              </div>
              <div>
                <div className="text-sm sm:text-lg text-yellow-300 font-medium">Final Score</div>
                <div className="text-2xl sm:text-3xl lg:text-4xl font-black bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                  {score.toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* Time Survived */}
          <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-md rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-blue-500/30 shadow-2xl">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg sm:rounded-xl">
                <Clock className="w-5 h-5 sm:w-8 sm:h-8 text-white" />
              </div>
              <div>
                <div className="text-sm sm:text-lg text-blue-300 font-medium">Time Survived</div>
                <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-blue-100">
                  {Math.floor(timeAlive)}s
                </div>
              </div>
            </div>
          </div>

          {/* Level Reached */}
          <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-md rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-purple-500/30 shadow-2xl">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg sm:rounded-xl">
                <Target className="w-5 h-5 sm:w-8 sm:h-8 text-white" />
              </div>
              <div>
                <div className="text-sm sm:text-lg text-purple-300 font-medium">Level Reached</div>
                <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-purple-100">
                  {difficultyLevel}
                </div>
              </div>
            </div>
          </div>

          {/* High Score */}
          <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-md rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-emerald-500/30 shadow-2xl">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg sm:rounded-xl">
                <Crown className="w-5 h-5 sm:w-8 sm:h-8 text-white" />
              </div>
              <div>
                <div className="text-sm sm:text-lg text-emerald-300 font-medium">High Score</div>
                <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-emerald-100">
                  {Math.max(score, highScore).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Message */}
        <div className="mb-6 sm:mb-8 p-4 sm:p-6 bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-md rounded-xl sm:rounded-2xl border border-slate-600/50">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <div className={`p-2 sm:p-3 bg-gradient-to-r ${performanceData.color} rounded-lg sm:rounded-xl`}>
              <PerformanceIcon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <div className="text-base sm:text-xl font-semibold text-slate-200 text-center sm:text-left">
              {performanceData.message}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 sm:gap-4 items-center justify-center">
          <button
            onClick={restart}
            className="group relative bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-600 hover:from-emerald-400 hover:via-blue-400 hover:to-purple-500 text-white font-bold py-3 px-6 sm:py-4 sm:px-8 rounded-xl sm:rounded-2xl text-lg sm:text-xl transition-all duration-300 transform hover:scale-105 shadow-2xl w-full sm:w-auto"
          >
            <div className="flex items-center justify-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-white/20 rounded-lg sm:rounded-xl group-hover:bg-white/30 transition-all duration-300">
                <RotateCcw className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <span>Play Again</span>
            </div>
          </button>

          {isAuthenticated && (
            <Button
              onClick={handleShare}
              className="bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-500 hover:to-pink-500 text-white font-bold py-3 px-6 sm:py-4 sm:px-8 rounded-xl sm:rounded-2xl text-lg sm:text-xl transition-all duration-300 transform hover:scale-105 shadow-2xl w-full sm:w-auto"
            >
              <div className="flex items-center justify-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-white/20 rounded-lg sm:rounded-xl">
                  <Share2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <span>Share Score</span>
              </div>
            </Button>
          )}
        </div>

        <p className="mt-4 sm:mt-6 text-xs sm:text-sm text-slate-400 font-medium px-4 text-center">
            Press SPACE or click to start a new cosmic journey
          </p>
        </div>
      </div>
    </div>
  );
}
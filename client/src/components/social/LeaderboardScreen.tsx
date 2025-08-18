
import { Trophy, Medal, Award, Star, Loader2, Clock, Zap, Target } from "lucide-react";
import { useGameState } from "../../lib/stores/useGameState";

export default function LeaderboardScreen() {
  const { highScore, timeAlive } = useGameState();

  return (
    <div className="flex-1 bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 text-white max-h-[calc(100vh-80px)] relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/10 rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 p-4 border-b border-white/10 bg-black/20 backdrop-blur-xl">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Global Leaderboard
          </h1>
          <p className="text-gray-300 text-sm">Compete with space pilots worldwide</p>
        </div>

        {/* Player Quick Stats */}
        <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 backdrop-blur-sm rounded-2xl p-4 mb-6 border border-white/10">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <Trophy className="text-yellow-400 mr-2" size={20} />
                <span className="text-sm text-gray-300">Personal Best</span>
              </div>
              <p className="text-2xl font-bold text-yellow-400">{highScore.toLocaleString()}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <Clock className="text-blue-400 mr-2" size={20} />
                <span className="text-sm text-gray-300">Best Time</span>
              </div>
              <p className="text-2xl font-bold text-blue-400">{Math.floor(timeAlive)}s</p>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2">
          <button className="flex-1 py-3 px-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl text-sm font-medium shadow-lg">
            All Time
          </button>
          <button className="flex-1 py-3 px-4 bg-white/10 backdrop-blur-sm rounded-xl text-sm font-medium text-gray-300 hover:bg-white/20 transition-all">
            Weekly
          </button>
          <button className="flex-1 py-3 px-4 bg-white/10 backdrop-blur-sm rounded-xl text-sm font-medium text-gray-300 hover:bg-white/20 transition-all">
            Daily
          </button>
        </div>
      </div>

      {/* Coming Soon Content */}
      <div className="relative z-10 flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          {/* Animated loader */}
          <div className="relative mb-8">
            <div className="w-24 h-24 mx-auto">
              <div className="absolute inset-0 rounded-full border-4 border-purple-500/30"></div>
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-500 animate-spin"></div>
              <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-blue-500 animate-spin animate-reverse"></div>
              <Loader2 className="absolute inset-0 m-auto text-white animate-pulse" size={32} />
            </div>
          </div>

          {/* Coming Soon Text */}
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent animate-pulse">
            Coming Soon
          </h2>
          
          <p className="text-lg text-gray-300 mb-6 leading-relaxed">
            Global leaderboards are being prepared for launch. Soon you'll be able to compete with pilots from around the galaxy!
          </p>

          {/* Feature Preview */}
          <div className="space-y-4 text-left">
            <div className="flex items-center gap-3 p-3 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
              <Trophy className="text-yellow-400 flex-shrink-0" size={20} />
              <span className="text-sm text-gray-300">Real-time global rankings</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
              <Target className="text-green-400 flex-shrink-0" size={20} />
              <span className="text-sm text-gray-300">Weekly tournaments & prizes</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
              <Zap className="text-purple-400 flex-shrink-0" size={20} />
              <span className="text-sm text-gray-300">Achievement showcases</span>
            </div>
          </div>

          {/* Progress indicator */}
          <div className="mt-8">
            <div className="flex justify-between text-xs text-gray-400 mb-2">
              <span>Development Progress</span>
              <span>85%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full w-[85%] animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useGameState } from "../lib/stores/useGameState";
import { Rocket, Shield, Clock, TrendingUp, Gamepad2, Zap, Play, ArrowLeft, ArrowRight } from "lucide-react";

export default function StartScreen() {
  const { start } = useGameState();

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-slate-900 to-black backdrop-blur-sm overflow-y-auto">
      <div className="text-center text-white max-w-2xl mx-4 py-4 min-h-full flex flex-col justify-center">
        {/* Title */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 mb-4">
            <div className="p-2 sm:p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl">
              <Rocket className="w-8 h-8 sm:w-12 sm:h-12 text-white" />
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-black bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent leading-tight">
              SPACE DODGER
            </h1>
          </div>
          <p className="text-lg sm:text-xl text-slate-300 font-medium">Navigate the cosmic battlefield</p>
        </div>

        {/* Instructions */}
        <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-md rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6 border border-cyan-500/30 shadow-2xl">
          <div className="flex items-center gap-3 mb-4 sm:mb-6">
            <div className="p-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl">
              <Gamepad2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-cyan-100">How to Play</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 text-left">
            <div className="flex items-center gap-3 sm:gap-4 p-2 sm:p-3 bg-slate-700/50 rounded-xl border border-slate-600/50">
              <div className="flex gap-2">
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
              </div>
              <span className="text-sm sm:text-base text-slate-200">Use arrow keys or A/D to move</span>
            </div>
            
            <div className="flex items-center gap-3 sm:gap-4 p-2 sm:p-3 bg-slate-700/50 rounded-xl border border-slate-600/50">
              <div className="text-xl sm:text-2xl">☄️</div>
              <span className="text-sm sm:text-base text-slate-200">Dodge falling asteroids</span>
            </div>
            
            <div className="flex items-center gap-3 sm:gap-4 p-2 sm:p-3 bg-slate-700/50 rounded-xl border border-slate-600/50">
              <div className="text-xl sm:text-2xl">💎</div>
              <span className="text-sm sm:text-base text-slate-200">Collect power-ups</span>
            </div>
            
            <div className="flex items-center gap-3 sm:gap-4 p-2 sm:p-3 bg-slate-700/50 rounded-xl border border-slate-600/50">
              <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
              <span className="text-sm sm:text-base text-slate-200">Survive as long as possible</span>
            </div>
          </div>
        </div>

        {/* Power-ups Info */}
        <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-md rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 border border-purple-500/30 shadow-2xl">
          <div className="flex items-center gap-3 mb-4 sm:mb-6">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
              <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-purple-100">Power-ups</h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="flex flex-col items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-cyan-500/20 rounded-xl border border-cyan-500/30">
              <div className="p-2 sm:p-3 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-xl">
                <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="text-center">
                <div className="font-bold text-cyan-100 text-sm sm:text-base">Shield</div>
                <div className="text-xs sm:text-sm text-cyan-300">Blocks one hit</div>
              </div>
            </div>
            
            <div className="flex flex-col items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-yellow-500/20 rounded-xl border border-yellow-500/30">
              <div className="p-2 sm:p-3 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-xl">
                <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="text-center">
                <div className="font-bold text-yellow-100 text-sm sm:text-base">Slow Time</div>
                <div className="text-xs sm:text-sm text-yellow-300">5 seconds</div>
              </div>
            </div>
            
            <div className="flex flex-col items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-green-500/20 rounded-xl border border-green-500/30">
              <div className="p-2 sm:p-3 bg-gradient-to-r from-green-400 to-emerald-400 rounded-xl">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="text-center">
                <div className="font-bold text-green-100 text-sm sm:text-base">Score Boost</div>
                <div className="text-xs sm:text-sm text-green-300">2x points</div>
              </div>
            </div>
          </div>
        </div>

        {/* Start Button */}
        <button
          onClick={start}
          className="group relative bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-600 hover:from-emerald-400 hover:via-blue-400 hover:to-purple-500 text-white font-black py-4 sm:py-6 px-6 sm:px-12 rounded-2xl text-lg sm:text-2xl transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-emerald-500/25"
        >
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="p-1.5 sm:p-2 bg-white/20 rounded-xl group-hover:bg-white/30 transition-all duration-300">
              <Play className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <span>START GAME</span>
          </div>
          
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
        </button>
        
        <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-slate-400 font-medium">Press SPACE or click to begin your cosmic journey</p>
      </div>
    </div>
  );
}
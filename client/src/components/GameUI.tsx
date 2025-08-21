import { useGameState } from "../lib/stores/useGameState";
import { useAudio } from "../lib/stores/useAudio";
import { Volume2, VolumeX, Trophy, Clock, Target, Heart, Zap, Pause, Play } from "lucide-react";

export default function GameUI() {
  const { score, lives, timeAlive, difficultyLevel, isPaused, pause, resume, gamePhase } = useGameState();
  const { isMuted, toggleMute } = useAudio();

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Pause Overlay */}
      {isPaused && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 pointer-events-auto">
          <div className="text-center text-white">
            <h2 className="text-4xl font-bold mb-4">PAUSED</h2>
            <p className="text-lg mb-6">Tap Resume or press ESC to continue</p>
            <button
              onClick={resume}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 hover:scale-105 shadow-2xl shadow-green-500/30"
            >
              ▶️ Resume Game
            </button>
          </div>
        </div>
      )}

      {/* Top UI */}
      <div className="flex justify-between items-start p-4 text-white">
        {/* Score and Stats */}
        <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-md rounded-2xl p-4 border border-cyan-500/30 shadow-2xl shadow-cyan-500/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                {score.toLocaleString()}
              </div>
              <div className="text-xs text-cyan-300 font-medium">SCORE</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400" />
              <span className="text-blue-100">{Math.floor(timeAlive)}s</span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-purple-400" />
              <span className="text-purple-100">L{difficultyLevel}</span>
            </div>
          </div>
        </div>

        {/* Lives */}
        <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-md rounded-2xl p-4 border border-red-500/30 shadow-2xl shadow-red-500/20">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-lg font-bold text-red-100">{lives}</div>
              <div className="text-xs text-red-300 font-medium">LIVES</div>
            </div>
          </div>

          <div className="flex gap-2">
            {Array.from({ length: 3 }, (_, i) => (
              <div
                key={i}
                className={`w-4 h-4 rounded-full transition-all duration-300 ${i < lives
                    ? "bg-gradient-to-r from-red-400 to-pink-400 shadow-lg shadow-red-500/50 scale-110"
                    : "bg-gray-700 border border-gray-600"
                  }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Bottom UI */}
      <div className=" bottom-4 right-4 flex gap-3">
        {/* Pause/Resume Toggle */}
        <button
          onClick={isPaused ? resume : pause}
          className="pointer-events-auto group relative bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-md rounded-2xl p-4 border border-yellow-500/30 shadow-2xl shadow-yellow-500/20 text-white hover:border-yellow-400/50 transition-all duration-300 hover:scale-105"
        >
          <div className="p-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl group-hover:from-yellow-400 group-hover:to-orange-400 transition-all duration-300">
            {isPaused ? (
              <Play className="w-6 h-6 text-white" />
            ) : (
              <Pause className="w-6 h-6 text-white" />
            )}
          </div>

          <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            {isPaused ? "Resume" : "Pause"}
          </div>
        </button>

        {/* Sound Toggle */}
        <button
          onClick={toggleMute}
          className="pointer-events-auto group relative bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-md rounded-2xl p-4 border border-violet-500/30 shadow-2xl shadow-violet-500/20 text-white hover:border-violet-400/50 transition-all duration-300 hover:scale-105"
        >
          <div className="p-2 bg-gradient-to-r from-violet-500 to-purple-500 rounded-xl group-hover:from-violet-400 group-hover:to-purple-400 transition-all duration-300">
            {isMuted ? (
              <VolumeX className="w-6 h-6 text-white" />
            ) : (
              <Volume2 className="w-6 h-6 text-white" />
            )}
          </div>

          <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            {isMuted ? "Unmute" : "Mute"}
          </div>
        </button>
      </div>
    </div>
  );
}

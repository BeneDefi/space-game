import { X, Diamond } from "lucide-react";

const pollData = [
  {
    id: 1,
    question: "Cats or Dogs",
    options: [
      { text: "🐱", votes: "393 others voted", points: "💎 184.26" },
      { text: "🐶", votes: "", points: "" }
    ],
    timeLeft: "Apr 01"
  },
  {
    id: 2,
    question: "Pick your side",
    image: "🦸‍♂️",
    options: [
      { text: "Marvel", votes: "57 others voted", points: "💎 120.2" },
      { text: "DC", votes: "", points: "" }
    ],
    timeLeft: "Apr 01"
  },
  {
    id: 3,
    question: "Which FC feature is going to have the biggest impact on games",
    options: [
      { text: "⚡", votes: "53 others voted", points: "💎 76.65" },
      { text: "🎮", votes: "", points: "" }
    ],
    timeLeft: "12:09 am"
  },
  {
    id: 4,
    question: "Who's the NBA G.O.A.T.",
    image: "🏀",
    options: [
      { text: "Jordan", votes: "24 others voted", points: "💎 74.5" },
      { text: "LeBron", votes: "", points: "" }
    ],
    timeLeft: "Apr 01"
  }
];

export default function PonderScreen() {
  return (
    <div className="flex-1 bg-gray-900 text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <X size={24} className="text-white/80" />
        <div className="text-center">
          <h1 className="text-lg font-semibold">Ponder</h1>
          <p className="text-xs text-white/80">built by ponder</p>
        </div>
        <div className="w-6"></div>
      </div>

      {/* Balance */}
      <div className="px-4 mb-6 flex items-center justify-center gap-2">
        <div className="bg-blue-500 w-8 h-8 rounded-full flex items-center justify-center">
          <Diamond size={16} className="text-white" />
        </div>
        <span className="text-xl font-bold text-blue-400">3.77</span>
      </div>

      {/* Polls */}
      <div className="flex-1 space-y-4 px-4 pb-4 max-h-[calc(100vh-200px)] overflow-y-auto">
        {pollData.map((poll) => (
          <div key={poll.id} className="bg-gray-800 rounded-2xl p-4">
            <div className="flex items-start gap-3 mb-3">
              {poll.image && (
                <div className="text-2xl">{poll.image}</div>
              )}
              <h3 className="text-white font-medium flex-1">{poll.question}</h3>
            </div>
            
            <div className="space-y-2">
              {poll.options.map((option, index) => (
                <button
                  key={index}
                  className="w-full p-3 bg-gray-700 hover:bg-gray-600 rounded-xl flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{option.text}</span>
                    {option.votes && (
                      <span className="text-xs text-gray-400">{option.votes}</span>
                    )}
                  </div>
                  {option.points && (
                    <span className="text-blue-400 text-sm font-medium">{option.points}</span>
                  )}
                </button>
              ))}
            </div>
            
            <div className="mt-3 text-xs text-gray-500">
              {poll.timeLeft}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
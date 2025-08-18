import { Gamepad2, ShoppingBag, BarChart3, User, CheckSquare, Sparkles } from "lucide-react";

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: "game" | "store" | "ranking" | "profile" | "tasks") => void;
}

export default function BottomNavigation({ activeTab, onTabChange }: BottomNavigationProps) {
  const tabs = [
    { id: "game", label: "Game", icon: Gamepad2, color: "from-blue-500 to-cyan-500" },
    { id: "tasks", label: "Tasks", icon: CheckSquare, color: "from-green-500 to-emerald-500" },
    { id: "store", label: "Store", icon: ShoppingBag, color: "from-purple-500 to-pink-500" },
    { id: "ranking", label: "Ranking", icon: BarChart3, color: "from-yellow-500 to-orange-500" },
    { id: "profile", label: "Profile", icon: User, color: "from-indigo-500 to-purple-500" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900 via-slate-800/95 to-transparent backdrop-blur-xl border-t border-slate-700/50 z-50">
      <div className="flex justify-around items-center py-2 px-4 max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative flex flex-col items-center justify-center p-3 rounded-2xl transition-all duration-300 ${
                isActive 
                  ? "transform scale-110" 
                  : "hover:scale-105 opacity-70 hover:opacity-100"
              }`}
            >
              {/* Active Background */}
              {isActive && (
                <div className={`absolute inset-0 bg-gradient-to-r ${tab.color} rounded-2xl opacity-20 animate-pulse`} />
              )}
              
              {/* Icon Container */}
              <div className={`relative p-2 rounded-xl transition-all duration-300 ${
                isActive 
                  ? `bg-gradient-to-r ${tab.color} shadow-lg` 
                  : "bg-slate-700/50 hover:bg-slate-600/50"
              }`}>
                <Icon className={`w-6 h-6 transition-colors duration-300 ${
                  isActive ? "text-white" : "text-slate-300"
                }`} />
                
                {/* Active Indicator */}
                {isActive && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full opacity-80">
                    <Sparkles className="w-3 h-3 text-blue-500" />
                  </div>
                )}
              </div>
              
              {/* Label */}
              <span className={`text-xs font-medium mt-1 transition-colors duration-300 ${
                isActive ? "text-white" : "text-slate-400"
              }`}>
                {tab.label}
              </span>
              
              {/* Active Dot */}
              {isActive && (
                <div className={`absolute -bottom-1 w-2 h-2 bg-gradient-to-r ${tab.color} rounded-full`} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
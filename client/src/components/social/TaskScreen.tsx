
import { useState, useEffect } from "react";
import { CheckCircle, ExternalLink, Twitter, Instagram, Share2, Users, Gift, Calendar, Flame, Trophy } from "lucide-react";
import { useGameState } from "../../lib/stores/useGameState";

interface Task {
  id: string;
  title: string;
  description: string;
  reward: number;
  completed: boolean;
  category: "social" | "daily" | "referral";
  icon: React.ReactNode;
  action?: string;
  link?: string;
}

interface LoginStreak {
  currentStreak: number;
  lastLoginDate: string;
  totalDays: number;
  longestStreak: number;
}

export default function TaskScreen() {
  const { score, addScore } = useGameState();
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "follow_twitter",
      title: "Follow us on Twitter",
      description: "Follow our official Twitter account for updates",
      reward: 100,
      completed: false,
      category: "social",
      icon: <Twitter size={24} className="text-blue-400" />,
      link: "https://twitter.com/spacedodgergame"
    },
    {
      id: "follow_instagram", 
      title: "Follow us on Instagram",
      description: "Follow our Instagram for behind-the-scenes content",
      reward: 100,
      completed: false,
      category: "social",
      icon: <Instagram size={24} className="text-pink-400" />,
      link: "https://instagram.com/spacedodgergame"
    },
    {
      id: "share_game",
      title: "Share Space Dodger",
      description: "Share the game with your friends on social media",
      reward: 150,
      completed: false,
      category: "social", 
      icon: <Share2 size={24} className="text-green-400" />
    },
    {
      id: "daily_login",
      title: "Daily Login Bonus",
      description: "Log in daily to receive bonus points",
      reward: 50,
      completed: false,
      category: "daily",
      icon: <Calendar size={24} className="text-yellow-400" />
    },
    {
      id: "invite_friend",
      title: "Invite Friends",
      description: "Invite 3 friends to play Space Dodger",
      reward: 300,
      completed: false,
      category: "referral",
      icon: <Users size={24} className="text-purple-400" />
    },
    {
      id: "first_score",
      title: "Score Your First 1000 Points",
      description: "Reach 1000 points in a single game",
      reward: 200,
      completed: false,
      category: "daily",
      icon: <Gift size={24} className="text-orange-400" />
    }
  ]);

  const [totalEarned, setTotalEarned] = useState(0);
  const [completedToday, setCompletedToday] = useState(0);
  const [loginStreak, setLoginStreak] = useState<LoginStreak>({
    currentStreak: 0,
    lastLoginDate: "",
    totalDays: 0,
    longestStreak: 0
  });
  const [canClaimDaily, setCanClaimDaily] = useState(false);
  const [dailyReward, setDailyReward] = useState(50);

  useEffect(() => {
    // Load completed tasks from localStorage
    const savedTasks = localStorage.getItem('completedTasks');
    if (savedTasks) {
      const completedTaskIds = JSON.parse(savedTasks);
      setTasks(prevTasks => 
        prevTasks.map(task => ({
          ...task,
          completed: completedTaskIds.includes(task.id)
        }))
      );
    }

    // Initialize login streak system
    initializeLoginStreak();
  }, []);

  const initializeLoginStreak = () => {
    const today = new Date().toDateString();
    const savedStreak = localStorage.getItem('loginStreak');
    
    if (savedStreak) {
      const streak = JSON.parse(savedStreak) as LoginStreak;
      const lastLogin = new Date(streak.lastLoginDate);
      const todayDate = new Date(today);
      const daysDiff = Math.floor((todayDate.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24));

      if (daysDiff === 0) {
        // Already logged in today
        setLoginStreak(streak);
        setCanClaimDaily(false);
      } else if (daysDiff === 1) {
        // Consecutive day - can claim and increment streak
        setCanClaimDaily(true);
        setLoginStreak(streak);
      } else if (daysDiff > 1) {
        // Streak broken - reset to 0, can claim for new streak
        const resetStreak = {
          ...streak,
          currentStreak: 0,
          totalDays: streak.totalDays + 1
        };
        setLoginStreak(resetStreak);
        setCanClaimDaily(true);
      }
    } else {
      // First time user
      setCanClaimDaily(true);
      setLoginStreak({
        currentStreak: 0,
        lastLoginDate: "",
        totalDays: 0,
        longestStreak: 0
      });
    }

    // Calculate daily reward based on current streak
    updateDailyReward();
  };

  const updateDailyReward = () => {
    const baseReward = 50;
    const streakBonus = Math.min(loginStreak.currentStreak * 10, 200); // Max bonus of 200
    const milestoneBonus = getMilestoneBonus(loginStreak.currentStreak + 1);
    setDailyReward(baseReward + streakBonus + milestoneBonus);
  };

  const getMilestoneBonus = (streak: number): number => {
    if (streak >= 30) return 500; // Monthly milestone
    if (streak >= 14) return 200; // Bi-weekly milestone
    if (streak >= 7) return 100;  // Weekly milestone
    if (streak >= 3) return 50;   // 3-day milestone
    return 0;
  };

  const getStreakTier = (streak: number): string => {
    if (streak >= 30) return "🏆 Legend";
    if (streak >= 21) return "💎 Diamond";
    if (streak >= 14) return "🥇 Gold";
    if (streak >= 7) return "🥈 Silver";
    if (streak >= 3) return "🥉 Bronze";
    return "🌟 Novice";
  };

  const claimDailyLogin = () => {
    if (!canClaimDaily) return;

    const today = new Date().toDateString();
    const newStreak = loginStreak.currentStreak + 1;
    const newLoginStreak: LoginStreak = {
      currentStreak: newStreak,
      lastLoginDate: today,
      totalDays: loginStreak.totalDays + 1,
      longestStreak: Math.max(loginStreak.longestStreak, newStreak)
    };

    // Save streak data
    localStorage.setItem('loginStreak', JSON.stringify(newLoginStreak));
    setLoginStreak(newLoginStreak);
    setCanClaimDaily(false);

    // Award points
    addScore(dailyReward);
    setTotalEarned(prev => prev + dailyReward);
    setCompletedToday(prev => prev + 1);

    // Mark daily login task as completed
    completeTask('daily_login');

    // Show celebration for milestones
    if ([3, 7, 14, 21, 30].includes(newStreak)) {
      showMilestoneCelebration(newStreak);
    }
  };

  const showMilestoneCelebration = (streak: number) => {
    // Simple alert for now - could be enhanced with a modal
    const tier = getStreakTier(streak);
    const bonus = getMilestoneBonus(streak);
    alert(`🎉 Streak Milestone! ${tier}\n${streak} days in a row!\nBonus: +${bonus} points!`);
  };

  const completeTask = (taskId: string) => {
    setTasks(prevTasks => {
      const updatedTasks = prevTasks.map(task => {
        if (task.id === taskId && !task.completed) {
          // Add points to game score
          if (taskId !== 'daily_login') { // Daily login points already added
            addScore(task.reward);
            setTotalEarned(prev => prev + task.reward);
            setCompletedToday(prev => prev + 1);
          }
          
          // Save to localStorage
          const completedTaskIds = JSON.parse(localStorage.getItem('completedTasks') || '[]');
          completedTaskIds.push(taskId);
          localStorage.setItem('completedTasks', JSON.stringify(completedTaskIds));
          
          return { ...task, completed: true };
        }
        return task;
      });
      return updatedTasks;
    });
  };

  const handleTaskAction = (task: Task) => {
    if (task.link) {
      window.open(task.link, '_blank');
    }
    
    // Simulate task completion after a delay (in a real app, this would be verified)
    setTimeout(() => {
      completeTask(task.id);
    }, 2000);
  };

  const categorizedTasks = {
    social: tasks.filter(task => task.category === "social"),
    daily: tasks.filter(task => task.category === "daily"), 
    referral: tasks.filter(task => task.category === "referral")
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "social": return "from-blue-500 to-purple-600";
      case "daily": return "from-yellow-500 to-orange-600";
      case "referral": return "from-green-500 to-teal-600";
      default: return "from-gray-500 to-gray-600";
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-green-900 via-blue-900 to-gray-900 text-white">
      {/* Header */}
      <div className="flex-shrink-0 p-3 sm:p-4 border-b border-green-500/30 bg-black/20 backdrop-blur-sm">
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold mb-1">Earn Points</h1>
          <p className="text-gray-400 text-sm">Complete tasks to earn rewards</p>
        </div>

        {/* Login Streak Section */}
        <div className="mb-4 p-4 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-xl border border-orange-500/30">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Flame className="text-orange-400" size={20} />
              <h3 className="font-bold text-lg">Daily Login Streak</h3>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-300">{getStreakTier(loginStreak.currentStreak)}</div>
              <div className="text-2xl font-bold text-orange-400">{loginStreak.currentStreak}</div>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
            <div className="text-center">
              <div className="text-gray-400">Total Days</div>
              <div className="font-medium">{loginStreak.totalDays}</div>
            </div>
            <div className="text-center">
              <div className="text-gray-400">Best Streak</div>
              <div className="font-medium">{loginStreak.longestStreak}</div>
            </div>
            <div className="text-center">
              <div className="text-gray-400">Today's Reward</div>
              <div className="font-medium text-yellow-400">+{dailyReward}</div>
            </div>
          </div>

          {canClaimDaily ? (
            <button
              onClick={claimDailyLogin}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 py-2 px-4 rounded-lg font-medium transition-all duration-200 transform hover:scale-105"
            >
              🎁 Claim Daily Reward (+{dailyReward} points)
            </button>
          ) : (
            <div className="w-full bg-gray-600/50 py-2 px-4 rounded-lg text-center text-gray-400">
              ✅ Today's reward claimed! Come back tomorrow
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-gray-800/50 rounded-xl p-3 text-center">
            <div className="text-lg font-bold text-green-400">{totalEarned}</div>
            <div className="text-xs text-gray-400">Total Earned</div>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-3 text-center">
            <div className="text-lg font-bold text-blue-400">{completedToday}</div>
            <div className="text-xs text-gray-400">Today</div>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-3 text-center">
            <div className="text-lg font-bold text-yellow-400">{tasks.filter(t => t.completed).length}</div>
            <div className="text-xs text-gray-400">Completed</div>
          </div>
        </div>
      </div>

      {/* Tasks */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4">
        {Object.entries(categorizedTasks).map(([category, categoryTasks]) => (
          <div key={category} className="mb-6">
            <div className={`bg-gradient-to-r ${getCategoryColor(category)} rounded-lg p-3 mb-3`}>
              <h3 className="text-lg font-bold capitalize">{category} Tasks</h3>
              <p className="text-sm opacity-90">
                {category === "social" && "Connect with our community"}
                {category === "daily" && "Complete daily challenges"}
                {category === "referral" && "Invite friends and earn together"}
              </p>
            </div>
            
            <div className="space-y-3">
              {categoryTasks.map((task) => (
                <div
                  key={task.id}
                  className={`p-4 rounded-xl border transition-all ${
                    task.completed
                      ? "bg-green-500/10 border-green-500/30"
                      : "bg-gray-800/50 border-gray-700 hover:border-gray-600"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1">{task.icon}</div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{task.title}</h4>
                        {task.completed && <CheckCircle className="text-green-500" size={16} />}
                      </div>
                      <p className="text-sm text-gray-400 mb-2">{task.description}</p>
                      
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium text-yellow-400">
                          +{task.reward} points
                        </div>
                        
                        {!task.completed && (
                          <button
                            onClick={() => handleTaskAction(task)}
                            className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-lg text-sm font-medium transition-colors"
                          >
                            {task.link ? "Visit" : "Complete"}
                            {task.link && <ExternalLink size={14} />}
                          </button>
                        )}
                        
                        {task.completed && (
                          <div className="text-green-400 text-sm font-medium">
                            Completed ✓
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

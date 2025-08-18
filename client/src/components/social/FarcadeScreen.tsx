import { X, Search, Plus, Users, UserPlus, Bell } from "lucide-react";

const friendsData = [
  { username: "francescs", status: "Entered the Farcade", time: "04/07/25", avatar: "F" },
  { username: "mariasagomar", status: "@jgoebel", time: "03/25/25", avatar: "M" },
  { username: "annouschka.eth", status: "Played Blackhole", time: "03/04/25", avatar: "A" },
  { username: "chuckfresh", status: "Played Fleet Command", time: "4:00 AM", avatar: "C" }
];

export default function FarcadeScreen() {
  return (
    <div className="flex-1 bg-gray-900 text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <X size={24} className="text-white/80" />
        <div className="text-center">
          <h1 className="text-lg font-semibold">Farcade</h1>
          <p className="text-xs text-white/80">built by farcade</p>
        </div>
        <div className="w-6"></div>
      </div>

      {/* Navigation Tabs */}
      <div className="px-4 mb-4">
        <div className="flex bg-gray-800 rounded-xl p-1">
          <button className="flex-1 py-2 px-4 bg-gray-700 rounded-lg text-sm font-medium">
            Friends
          </button>
          <button className="flex-1 py-2 px-4 text-gray-400 text-sm">
            Find Friends
          </button>
          <button className="flex-1 py-2 px-4 text-gray-400 text-sm relative">
            Requests
            <span className="absolute -top-1 -right-1 bg-red-500 text-xs rounded-full w-5 h-5 flex items-center justify-center">
              1
            </span>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="px-4 mb-4">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search"
            className="w-full bg-gray-800 rounded-xl py-2 pl-10 pr-4 text-white placeholder-gray-400 text-sm"
          />
        </div>
      </div>

      {/* Invite Friends */}
      <div className="px-4 mb-6">
        <button className="w-full bg-blue-600 hover:bg-blue-700 rounded-xl p-4 flex items-center gap-3 transition-colors">
          <div className="bg-white/20 rounded-xl p-2">
            <UserPlus size={20} />
          </div>
          <div className="text-left">
            <div className="font-medium">Invite friends</div>
            <div className="text-sm text-blue-200">Share your link to add friends</div>
          </div>
          <Plus size={20} className="ml-auto" />
        </button>
      </div>

      {/* Friends List */}
      <div className="flex-1 space-y-3 px-4 max-h-[calc(100vh-300px)] overflow-y-auto">
        {friendsData.map((friend, index) => (
          <div key={index} className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-xl">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center font-medium">
              {friend.avatar}
            </div>
            <div className="flex-1">
              <div className="font-medium text-sm">{friend.username}</div>
              <div className="text-xs text-gray-400">{friend.status}</div>
            </div>
            <div className="text-xs text-gray-500">{friend.time}</div>
          </div>
        ))}
      </div>

      {/* Bottom Icons */}
      <div className="p-4">
        <div className="flex justify-center gap-8">
          <button className="p-3 bg-gray-800 rounded-xl">
            <Users size={24} className="text-gray-400" />
          </button>
          <button className="p-3 bg-gray-800 rounded-xl">
            <UserPlus size={24} className="text-gray-400" />
          </button>
          <button className="p-3 bg-gray-800 rounded-xl">
            <Bell size={24} className="text-gray-400" />
          </button>
          <button className="p-3 bg-yellow-500 rounded-xl">
            <span className="text-xl">😊</span>
          </button>
        </div>
      </div>
    </div>
  );
}
import { useState, useEffect } from "react";
import { ShoppingBag, Star, Lock, Coins } from "lucide-react";
import { useGameState } from "../../lib/stores/useGameState";
import { useFarcaster } from "../../lib/stores/useFarcaster";

const storeCategories = [
  { id: "skins", name: "Spaceship Skins", icon: "🚀" },
  { id: "backgrounds", name: "Backgrounds", icon: "🌌" },
  { id: "powerups", name: "Power-ups", icon: "⚡" },
  { id: "effects", name: "Visual Effects", icon: "✨" }
];

const storeItems = {
  skins: [
    { id: "red_fighter", name: "Red Fighter", price: 100, icon: "🔴", owned: false },
    { id: "blue_cruiser", name: "Blue Cruiser", price: 150, icon: "🔵", owned: false },
    { id: "golden_ship", name: "Golden Ship", price: 500, icon: "🟡", owned: false, premium: true },
    { id: "rainbow_ship", name: "Rainbow Ship", price: 1000, icon: "🌈", owned: false, premium: true }
  ],
  backgrounds: [
    { id: "nebula", name: "Nebula", price: 200, icon: "🌠", owned: false },
    { id: "galaxy", name: "Galaxy", price: 300, icon: "🌌", owned: false },
    { id: "black_hole", name: "Black Hole", price: 400, icon: "🕳️", owned: false, premium: true },
    { id: "wormhole", name: "Wormhole", price: 600, icon: "🌀", owned: false, premium: true }
  ],
  powerups: [
    { id: "shield_boost", name: "Shield Boost", price: 50, icon: "🛡️", owned: false },
    { id: "speed_boost", name: "Speed Boost", price: 75, icon: "💨", owned: false },
    { id: "magnet", name: "Score Magnet", price: 100, icon: "🧲", owned: false },
    { id: "invincible", name: "Invincibility", price: 200, icon: "✨", owned: false, premium: true }
  ],
  effects: [
    { id: "trail", name: "Particle Trail", price: 150, icon: "💫", owned: false },
    { id: "explosion", name: "Better Explosions", price: 200, icon: "💥", owned: false },
    { id: "glow", name: "Ship Glow", price: 250, icon: "✨", owned: false },
    { id: "lightning", name: "Lightning Effects", price: 300, icon: "⚡", owned: false, premium: true }
  ]
};

export default function StoreScreen() {
  const [selectedCategory, setSelectedCategory] = useState("skins");
  const { totalCoinsEarned, spendCoins, getAvailableCoins } = useGameState();
  const [ownedItems, setOwnedItems] = useState<string[]>([]);
  const { isAuthenticated, user } = useFarcaster();

  // Check authentication
  if (!isAuthenticated || !user) {
    return (
      <div className="h-full bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="text-center text-white">
          <ShoppingBag size={48} className="mx-auto mb-4 text-purple-400" />
          <h2 className="text-xl font-bold mb-2">Store Access Restricted</h2>
          <p className="text-gray-300">Please authenticate with Farcaster to access the store.</p>
        </div>
      </div>
    );
  }

  const availableCoins = getAvailableCoins();
  const spentCoins = totalCoinsEarned - availableCoins;

  // Load owned items on component mount
  useEffect(() => {
    const savedItems = localStorage.getItem('ownedStoreItems');
    if (savedItems) {
      setOwnedItems(JSON.parse(savedItems));
    }
  }, []);

  const handlePurchase = (item: any) => {
    if (availableCoins >= (item.price || 0) && !ownedItems.includes(item.id)) {
      const success = spendCoins(item.price || 0);
      if (success) {
        setOwnedItems(prev => [...prev, item.id]);

        // Save owned items to localStorage
        const updatedOwned = [...ownedItems, item.id];
        localStorage.setItem('ownedStoreItems', JSON.stringify(updatedOwned));

        // Show purchase confirmation
        console.log(`Successfully purchased ${item.name} for ${(item.price || 0)} coins!`);
      }
    }
  };

  const isItemOwned = (itemId: string) => ownedItems.includes(itemId);

  return (
    <div className="flex-1 bg-gradient-to-br from-purple-900 via-indigo-900 to-slate-900 text-white">
      {/* Header */}
      <div className="p-4 border-b border-purple-500/30 bg-black/20 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Cosmic Store
          </h1>
          <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-600 to-orange-600 px-4 py-2 rounded-full shadow-lg">
            <Coins size={18} className="text-yellow-100" />
            <span className="font-bold text-yellow-100">{(availableCoins || 0).toLocaleString()}</span>
          </div>
        </div>

        {/* Coin Info */}
        <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl">
          <div className="flex justify-between items-center text-sm">
            <span className="text-blue-300">Total Earned:</span>
            <span className="text-blue-200 font-medium">{(totalCoinsEarned || 0).toLocaleString()} coins</span>
          </div>
          <div className="flex justify-between items-center text-sm mt-1">
            <span className="text-gray-300">Spent:</span>
            <span className="text-red-300 font-medium">{(spentCoins || 0).toLocaleString()} coins</span>
          </div>
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {storeCategories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
                selectedCategory === category.id 
                  ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg" 
                  : "bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-gray-600/30"
              }`}
            >
              <span className="text-lg">{category.icon}</span>
              <span className="text-sm font-medium">{category.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Store Items */}
      <div className="flex-1 p-4 max-h-[calc(100vh-200px)] overflow-y-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {storeItems[selectedCategory as keyof typeof storeItems].map((item) => {
            const owned = isItemOwned(item.id);
            const canAfford = availableCoins >= (item.price || 0);

            return (
              <div key={item.id} className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-4 relative border border-gray-600/30 hover:border-purple-500/50 transition-all">
                {item.premium && (
                  <div className="absolute top-2 right-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-black px-2 py-1 rounded-full text-xs font-bold shadow-lg">
                    PREMIUM
                  </div>
                )}

                <div className="text-center mb-4">
                  <div className="text-4xl mb-3 transform hover:scale-110 transition-transform">{item.icon}</div>
                  <h3 className="font-medium text-sm mb-2 text-gray-100">{item.name}</h3>
                  <div className="flex items-center justify-center gap-1 text-yellow-400">
                    <Coins size={14} />
                    <span className="text-sm font-bold">{(item.price || 0).toLocaleString()}</span>
                  </div>
                </div>

                <button
                  onClick={() => handlePurchase(item)}
                  disabled={owned || !canAfford}
                  className={`w-full py-2 px-4 rounded-xl text-sm font-medium transition-all ${
                    owned
                      ? "bg-green-600/80 text-white cursor-not-allowed border border-green-500/50"
                      : canAfford
                      ? "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105"
                      : "bg-gray-600/50 text-gray-400 cursor-not-allowed border border-gray-500/30"
                  }`}
                >
                  {owned ? (
                    <div className="flex items-center justify-center gap-2">
                      <ShoppingBag size={14} />
                      Owned
                    </div>
                  ) : canAfford ? (
                    <div className="flex items-center justify-center gap-2">
                      <Coins size={14} />
                      Purchase
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <Lock size={14} />
                      Need {((item.price || 0) - availableCoins).toLocaleString()}
                    </div>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Earn More Coins Banner */}
        {availableCoins < 100 && (
          <div className="mt-6 p-4 bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 rounded-2xl text-center">
            <h3 className="font-bold text-purple-300 mb-2">Need More Coins?</h3>
            <p className="text-sm text-gray-300">
              Play the game to earn more coins! Every 100 points = 1 coin
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
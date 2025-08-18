import { useState, useEffect } from "react";
import { Wallet, Loader2, Shield, ChevronRight } from "lucide-react";
import { useWallet } from "../lib/stores/useWallet";

interface WalletConnectProps {
  onConnected: () => void;
}

export default function WalletConnect({ onConnected }: WalletConnectProps) {
  const { isConnected, address, isConnecting, error, connect, clearError } = useWallet();
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (isConnected && address) {
      onConnected();
    }
  }, [isConnected, address, onConnected]);

  const handleConnect = async () => {
    clearError();
    await connect();
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (isConnected && address) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-900 via-purple-900 to-gray-900 flex items-center justify-center p-4">
        <div className="text-center text-white">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield size={32} />
          </div>
          <h2 className="text-2xl font-bold mb-2">Wallet Connected!</h2>
          <p className="text-gray-300 mb-4">Address: {formatAddress(address)}</p>
          <div className="animate-pulse text-sm text-gray-400">Loading game...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-purple-900 to-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 sm:p-8 max-w-md w-full text-center text-white border border-gray-700">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <Wallet size={40} />
        </div>
        
        <h1 className="text-3xl font-bold mb-2">Welcome to Space Dodger</h1>
        <p className="text-gray-300 mb-6">
          Connect your wallet to start playing and earning rewards on Base
        </p>

        {/* Features */}
        <div className="space-y-3 mb-6 text-left">
          <div className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg">
            <div className="text-2xl">🎮</div>
            <div>
              <div className="font-medium">Play & Earn</div>
              <div className="text-sm text-gray-400">Earn points and rewards</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg">
            <div className="text-2xl">🛒</div>
            <div>
              <div className="font-medium">NFT Store</div>
              <div className="text-sm text-gray-400">Buy skins and power-ups</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg">
            <div className="text-2xl">🏆</div>
            <div>
              <div className="font-medium">Leaderboards</div>
              <div className="text-sm text-gray-400">Compete globally</div>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <button
          onClick={handleConnect}
          disabled={isConnecting}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl py-3 px-6 font-medium transition-all duration-200 flex items-center justify-center gap-2"
        >
          {isConnecting ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              <Wallet size={20} />
              Connect Wallet
              <ChevronRight size={16} />
            </>
          )}
        </button>

        <button
          onClick={() => setShowDetails(!showDetails)}
          className="mt-4 text-gray-400 text-sm hover:text-gray-300 transition-colors"
        >
          {showDetails ? 'Hide' : 'Show'} technical details
        </button>

        {showDetails && (
          <div className="mt-4 p-4 bg-gray-900/50 rounded-lg text-left">
            <h3 className="font-medium mb-2">Base Network Details:</h3>
            <div className="text-sm text-gray-400 space-y-1">
              <div>• Chain ID: 8453 (Base Mainnet)</div>
              <div>• RPC: https://mainnet.base.org</div>
              <div>• Explorer: basescan.org</div>
              <div>• Native Token: ETH</div>
            </div>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-gray-700">
          <p className="text-xs text-gray-500">
            By connecting your wallet, you agree to our Terms of Service and Privacy Policy.
            Your wallet is secured by Base's infrastructure.
          </p>
        </div>
      </div>
    </div>
  );
}
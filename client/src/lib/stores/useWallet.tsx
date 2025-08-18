import { create } from "zustand";

interface WalletState {
  isConnected: boolean;
  address: string | null;
  isConnecting: boolean;
  error: string | null;
  
  // Actions
  connect: () => Promise<void>;
  disconnect: () => void;
  clearError: () => void;
}

export const useWallet = create<WalletState>((set, get) => ({
  isConnected: false,
  address: null,
  isConnecting: false,
  error: null,

  connect: async () => {
    set({ isConnecting: true, error: null });
    
    try {
      // Check if we're in a Base mini app environment
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        const ethereum = (window as any).ethereum;
        
        // Request account access
        const accounts = await ethereum.request({
          method: 'eth_requestAccounts',
        });
        
        if (accounts.length > 0) {
          const address = accounts[0];
          
          // Try to switch to Base network (Chain ID: 8453)
          try {
            await ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: '0x2105' }], // Base mainnet
            });
          } catch (switchError: any) {
            // If Base network is not added, add it
            if (switchError.code === 4902) {
              await ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [
                  {
                    chainId: '0x2105',
                    chainName: 'Base',
                    nativeCurrency: {
                      name: 'Ethereum',
                      symbol: 'ETH',
                      decimals: 18,
                    },
                    rpcUrls: ['https://mainnet.base.org'],
                    blockExplorerUrls: ['https://basescan.org'],
                  },
                ],
              });
            }
          }
          
          set({ 
            isConnected: true, 
            address: address,
            isConnecting: false,
            error: null 
          });
          
          // Save connection status
          localStorage.setItem('walletConnected', 'true');
          localStorage.setItem('walletAddress', address);
        }
      } else {
        // Fallback for Base mini app or other environments
        // In a real Base mini app, this would use the Base wallet provider
        const mockAddress = "0x" + Math.random().toString(16).substr(2, 40);
        set({ 
          isConnected: true, 
          address: mockAddress,
          isConnecting: false,
          error: null 
        });
        
        localStorage.setItem('walletConnected', 'true');
        localStorage.setItem('walletAddress', mockAddress);
      }
    } catch (error: any) {
      set({ 
        isConnecting: false, 
        error: error.message || 'Failed to connect wallet' 
      });
    }
  },

  disconnect: () => {
    set({ 
      isConnected: false, 
      address: null, 
      error: null 
    });
    
    localStorage.removeItem('walletConnected');
    localStorage.removeItem('walletAddress');
  },

  clearError: () => {
    set({ error: null });
  },
}));

// Auto-connect if previously connected
if (typeof window !== 'undefined') {
  const wasConnected = localStorage.getItem('walletConnected');
  const savedAddress = localStorage.getItem('walletAddress');
  
  if (wasConnected === 'true' && savedAddress) {
    useWallet.setState({ 
      isConnected: true, 
      address: savedAddress 
    });
  }
}
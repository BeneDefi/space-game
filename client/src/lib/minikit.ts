
declare global {
  interface Window {
    MiniKit?: {
      context?: {
        fid?: number;
        username?: string;
        client?: string;
        isAuthenticated?: boolean;
        version?: string;
      };
      user?: {
        fid?: number;
        username?: string;
        displayName?: string;
        pfpUrl?: string;
        verified?: boolean;
      };
      auth?: {
        signIn: () => Promise<any>;
        signOut: () => Promise<void>;
        getAuthToken: () => Promise<string | null>;
        verify: () => Promise<boolean>;
      };
      share?: {
        shareText: (text: string, embeds?: string[]) => Promise<void>;
        shareUrl: (url: string, text?: string) => Promise<void>;
        shareFrame: (frameUrl: string) => Promise<void>;
      };
      wallet?: {
        connectWallet: () => Promise<any>;
        switchNetwork: (chainId: number) => Promise<void>;
        sendTransaction: (tx: any) => Promise<string>;
        getAddress: () => Promise<string>;
        getChainId: () => Promise<number>;
      };
      notifications?: {
        requestPermission: () => Promise<boolean>;
        sendNotification: (title: string, body: string, data?: any) => Promise<void>;
      };
    };
  }
}

export interface MiniKitContext {
  fid?: number;
  username?: string;
  client?: string;
  isAuthenticated?: boolean;
  version?: string;
}

export interface MiniKitUser {
  fid?: number;
  username?: string;
  displayName?: string;
  pfpUrl?: string;
  verified?: boolean;
}

export class MiniKitService {
  private static readonly BASE_CHAIN_ID = 8453;
  private static readonly BASE_RPC = 'https://mainnet.base.org';

  static isAvailable(): boolean {
    return typeof window !== 'undefined' && !!window.MiniKit;
  }

  static isFarcasterContext(): boolean {
    const context = this.getContext();
    return !!context?.fid && !!context?.isAuthenticated;
  }

  static getContext(): MiniKitContext | null {
    if (!this.isAvailable()) return null;
    return window.MiniKit?.context || null;
  }

  static getUser(): MiniKitUser | null {
    if (!this.isAvailable()) return null;
    return window.MiniKit?.user || null;
  }

  // Enhanced authentication
  static async signIn(): Promise<any> {
    if (!this.isAvailable()) throw new Error('MiniKit not available');
    
    try {
      const result = await window.MiniKit?.auth?.signIn();
      
      // Auto-verify after sign in
      if (result) {
        await this.verify();
      }
      
      return result;
    } catch (error) {
      console.error('MiniKit sign-in failed:', error);
      throw error;
    }
  }

  static async signOut(): Promise<void> {
    if (!this.isAvailable()) throw new Error('MiniKit not available');
    return await window.MiniKit?.auth?.signOut();
  }

  static async getAuthToken(): Promise<string | null> {
    if (!this.isAvailable()) return null;
    return await window.MiniKit?.auth?.getAuthToken();
  }

  static async verify(): Promise<boolean> {
    if (!this.isAvailable()) return false;
    try {
      return await window.MiniKit?.auth?.verify() || false;
    } catch {
      return false;
    }
  }

  // Enhanced sharing with Base context
  static async shareScore(score: number, gameUrl?: string): Promise<void> {
    if (!this.isAvailable()) throw new Error('MiniKit not available');
    
    const user = this.getUser();
    const shareText = `🚀 Just scored ${score} points in Space Dodger on Base! ${user?.username ? `@${user.username}` : ''} Think you can beat it?`;
    const embeds = gameUrl ? [gameUrl] : [];
    
    return await window.MiniKit?.share?.shareText(shareText, embeds);
  }

  static async shareText(text: string, embeds?: string[]): Promise<void> {
    if (!this.isAvailable()) throw new Error('MiniKit not available');
    return await window.MiniKit?.share?.shareText(text, embeds);
  }

  static async shareUrl(url: string, text?: string): Promise<void> {
    if (!this.isAvailable()) throw new Error('MiniKit not available');
    return await window.MiniKit?.share?.shareUrl(url, text);
  }

  static async shareFrame(frameUrl: string): Promise<void> {
    if (!this.isAvailable()) throw new Error('MiniKit not available');
    return await window.MiniKit?.share?.shareFrame(frameUrl);
  }

  // Base-optimized wallet functions
  static async connectWallet(): Promise<any> {
    if (!this.isAvailable()) throw new Error('MiniKit not available');
    
    try {
      const result = await window.MiniKit?.wallet?.connectWallet();
      
      // Auto-switch to Base after connecting
      await this.ensureBaseNetwork();
      
      return result;
    } catch (error) {
      console.error('Wallet connection failed:', error);
      throw error;
    }
  }

  static async ensureBaseNetwork(): Promise<void> {
    if (!this.isAvailable()) return;
    
    try {
      const currentChainId = await window.MiniKit?.wallet?.getChainId();
      
      if (currentChainId !== this.BASE_CHAIN_ID) {
        await this.switchToBase();
      }
    } catch (error) {
      console.warn('Could not verify/switch to Base network:', error);
    }
  }

  static async switchToBase(): Promise<void> {
    if (!this.isAvailable()) throw new Error('MiniKit not available');
    return await window.MiniKit?.wallet?.switchNetwork(this.BASE_CHAIN_ID);
  }

  static async sendTransaction(tx: any): Promise<string> {
    if (!this.isAvailable()) throw new Error('MiniKit not available');
    
    // Ensure we're on Base before sending transaction
    await this.ensureBaseNetwork();
    
    return await window.MiniKit?.wallet?.sendTransaction(tx);
  }

  static async getWalletAddress(): Promise<string> {
    if (!this.isAvailable()) throw new Error('MiniKit not available');
    return await window.MiniKit?.wallet?.getAddress();
  }

  static async getChainId(): Promise<number> {
    if (!this.isAvailable()) throw new Error('MiniKit not available');
    return await window.MiniKit?.wallet?.getChainId();
  }

  // Notifications
  static async requestNotifications(): Promise<boolean> {
    if (!this.isAvailable()) return false;
    
    try {
      return await window.MiniKit?.notifications?.requestPermission() || false;
    } catch {
      return false;
    }
  }

  static async sendNotification(title: string, body: string, data?: any): Promise<void> {
    if (!this.isAvailable()) throw new Error('MiniKit not available');
    return await window.MiniKit?.notifications?.sendNotification(title, body, data);
  }

  // Utility functions
  static getBaseExplorerUrl(hash: string): string {
    return `https://basescan.org/tx/${hash}`;
  }

  static formatBaseAddress(address: string): string {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  static isBaseNetwork(): boolean {
    try {
      return this.getChainId() === this.BASE_CHAIN_ID;
    } catch {
      return false;
    }
  }
}

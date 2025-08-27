
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MiniKitService, type MiniKitContext, type MiniKitUser } from '../minikit';

interface FarcasterState {
  context: MiniKitContext | null;
  user: MiniKitUser | null;
  authToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  notificationsEnabled: boolean;
  
  // Actions
  initialize: () => void;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  shareScore: (score: number, gameUrl?: string) => Promise<void>;
  shareGameInvite: (customMessage?: string) => Promise<void>;
  enableNotifications: () => Promise<boolean>;
  submitScore: (score: number, gameData?: any) => Promise<void>;
  clearError: () => void;
}

export const useFarcaster = create<FarcasterState>()(
  persist(
    (set, get) => ({
      context: null,
      user: null,
      authToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      notificationsEnabled: false,

      initialize: () => {
        console.log('🔧 Initializing Farcaster store...');
        try {
          const context = MiniKitService.getContext();
          const user = MiniKitService.getUser();
          const isFarcasterContext = MiniKitService.isFarcasterContext();
          
          console.log('📱 Farcaster context:', { context, user, isFarcasterContext });
          
          set({
            context,
            user,
            isAuthenticated: isFarcasterContext,
            error: null
          });

          // Analytics tracking
          if (context?.fid) {
            console.log('🎯 Farcaster context initialized:', {
              fid: context.fid,
              username: context.username,
              client: context.client,
              version: context.version
            });
          }
        } catch (error) {
          console.error('❌ Failed to initialize Farcaster context:', error);
          set({ error: 'Failed to initialize Farcaster' });
        }
      },

      signIn: async () => {
        if (!MiniKitService.isAvailable()) {
          set({ error: 'Farcaster MiniKit not available' });
          return;
        }

        set({ isLoading: true, error: null });

        try {
          const authResult = await MiniKitService.signIn();
          const authToken = await MiniKitService.getAuthToken();
          const user = MiniKitService.getUser();
          const context = MiniKitService.getContext();

          // Submit user data to backend
          if (user?.fid) {
            await fetch('/api/user', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                fid: user.fid,
                username: user.username,
                displayName: user.displayName,
                pfpUrl: user.pfpUrl,
                authToken
              })
            });
          }

          set({
            user,
            context,
            authToken,
            isAuthenticated: true,
            isLoading: false
          });

          console.log('✅ Farcaster sign-in successful:', {
            fid: user?.fid,
            username: user?.username
          });
        } catch (error) {
          console.error('❌ Farcaster sign-in failed:', error);
          set({
            error: 'Sign-in failed. Please try again.',
            isLoading: false
          });
        }
      },

      signOut: async () => {
        set({ isLoading: true });

        try {
          await MiniKitService.signOut();
          set({
            user: null,
            authToken: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
            notificationsEnabled: false
          });
        } catch (error) {
          console.error('❌ Sign-out failed:', error);
          set({
            error: 'Sign-out failed',
            isLoading: false
          });
        }
      },

      refreshAuth: async () => {
        try {
          const authToken = await MiniKitService.getAuthToken();
          const user = MiniKitService.getUser();
          const context = MiniKitService.getContext();

          set({
            user,
            context,
            authToken,
            isAuthenticated: MiniKitService.isFarcasterContext()
          });
        } catch (error) {
          console.error('❌ Failed to refresh auth:', error);
        }
      },

      shareScore: async (score: number, gameUrl?: string) => {
        const { user } = get();
        
        if (!MiniKitService.isAvailable()) {
          throw new Error('Sharing not available');
        }

        try {
          await MiniKitService.shareScore(score, gameUrl);
          
          console.log('✅ Score shared successfully:', { 
            score, 
            fid: user?.fid,
            username: user?.username 
          });
        } catch (error) {
          console.error('❌ Failed to share score:', error);
          throw error;
        }
      },

      shareGameInvite: async (customMessage?: string) => {
        if (!MiniKitService.isAvailable()) {
          throw new Error('Sharing not available');
        }

        try {
          const message = customMessage || '🚀 Come play Space Dodger with me on Base! Dodge asteroids and earn rewards!';
          const gameUrl = window.location.origin;
          
          await MiniKitService.shareText(message, [gameUrl]);
          
          console.log('✅ Game invite shared successfully');
        } catch (error) {
          console.error('❌ Failed to share game invite:', error);
          throw error;
        }
      },

      enableNotifications: async () => {
        try {
          const enabled = await MiniKitService.requestNotifications();
          set({ notificationsEnabled: enabled });
          
          if (enabled) {
            console.log('✅ Notifications enabled');
          }
          
          return enabled;
        } catch (error) {
          console.error('❌ Failed to enable notifications:', error);
          return false;
        }
      },

      submitScore: async (score: number, gameData?: any) => {
        const { user } = get();
        
        if (!user?.fid) {
          throw new Error('User not authenticated');
        }

        try {
          const response = await fetch('/api/game/score', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fid: user.fid,
              score,
              gameData: {
                timestamp: new Date().toISOString(),
                version: '1.0.0',
                ...gameData
              }
            })
          });

          if (!response.ok) {
            throw new Error('Failed to submit score');
          }

          const result = await response.json();
          console.log('✅ Score submitted successfully:', result);
          
          return result;
        } catch (error) {
          console.error('❌ Failed to submit score:', error);
          throw error;
        }
      },

      clearError: () => set({ error: null })
    }),
    {
      name: 'farcaster-store',
      partialize: (state) => ({
        authToken: state.authToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        notificationsEnabled: state.notificationsEnabled
      })
    }
  )
);

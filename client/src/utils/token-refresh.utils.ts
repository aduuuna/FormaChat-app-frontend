import { getAccessToken } from './auth.utils';
import { refreshAccessToken } from './api.utils';

let refreshTimer: number | null = null;

export const startTokenRefreshTimer = () => {
  if (refreshTimer) {
    clearInterval(refreshTimer);
  }
  
  console.log('[TokenRefresh] Starting automatic refresh timer');
  
  refreshTimer = window.setInterval(async () => {
    const token = getAccessToken();
    
    if (!token) {
      console.log('[TokenRefresh] No token, skipping refresh');
      return;
    }
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiryTime = payload.exp * 1000;
      const timeLeft = expiryTime - Date.now();
      
      console.log('[TokenRefresh] Token check - Time left:', Math.floor(timeLeft / 1000), 'seconds');
      
      if (timeLeft < 120000) {
        console.log('[TokenRefresh] Token expiring soon, refreshing...');
        const success = await refreshAccessToken();
        
        if (!success) {
          console.error('[TokenRefresh] Failed to refresh token');
          stopTokenRefreshTimer();
        } else {
          console.log('[TokenRefresh] Token refreshed successfully');
        }
      }
    } catch (error) {
      console.error('[TokenRefresh] Error checking token expiry:', error);
    }
  }, 60000); 
};

export const stopTokenRefreshTimer = () => {
  if (refreshTimer) {
    clearInterval(refreshTimer);
    refreshTimer = null;
    console.log('[TokenRefresh] Stopped automatic refresh timer');
  }
};
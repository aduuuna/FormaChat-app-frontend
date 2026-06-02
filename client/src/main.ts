import './style.css';
import { router } from './router';
import { 
  getAccessToken, 
  getRefreshToken, 
  logout, 
  isTokenExpired 
} from './utils/auth.utils';
import { refreshAccessToken } from './utils/api.utils';
import { 
  startTokenRefreshTimer, 
  stopTokenRefreshTimer 
} from './utils/token-refresh.utils';

console.log('[App] Initializing FormaChat Frontend...');

function isEmbedMode(): boolean {
 
  return window.location.hash.includes('embed=true') || 
         window.location.search.includes('embed=true') || 
         (window.self !== window.top);
}

function isChatRoute(): boolean {
  const hash = window.location.hash.slice(1);
  return hash.startsWith('/chat/');
}

async function initApp() {
  if (isEmbedMode()) {
    console.log('[App] Embed/Widget mode detected.');
    (window as any).__EMBED_MODE__ = true;
    router.init();
    return; 
  }

  if (isChatRoute()) {
    console.log('[App] Public chat route detected');
    router.init();
    return;
  }

  console.log('[App] Standard app mode');
  const accessToken = getAccessToken();
  const refreshToken = getRefreshToken();
  
  if (accessToken && refreshToken) {
    if (isTokenExpired(accessToken)) {
      console.warn('[App] Access token expired, attempting refresh...');
      const refreshed = await refreshAccessToken();
      
      if (!refreshed) {
        console.error('[App] Token refresh failed - logging out');
        logout();
        window.location.hash = '/login';
        return;
      }
    }
    startTokenRefreshTimer();
  } else if (accessToken || refreshToken) {
    console.warn('[App] Incomplete token state, clearing');
    logout();
  }
  
 
  router.init();
  console.log('[App] Standard App Initialized.');
}


window.addEventListener('beforeunload', () => {
  stopTokenRefreshTimer();
});

initApp().catch(error => {
  console.error('[App] Initialization failed:', error);
});
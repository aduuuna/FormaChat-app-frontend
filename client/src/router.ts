import { isAuthenticated, getAccessToken, isTokenExpired, logout } from './utils/auth.utils';
import { refreshAccessToken } from './utils/api.utils';
import { renderTo } from './utils/dom.utils';

import { renderHome } from './pages/public/home';
import { renderLogin } from './pages/public/login';
import { renderRegister } from './pages/public/register';
import { renderVerifyEmail } from './pages/public/verify-email';
import { renderDashboardLayout } from './pages/dashboard/layout';
import { renderDashboardHome } from './pages/dashboard/home';
import { renderBusinessList } from './pages/dashboard/businesses/list';
import { renderBusinessCreate } from './pages/dashboard/businesses/create';
import { renderBusinessEdit } from './pages/dashboard/businesses/edit';
import { renderChannelsIndex } from './pages/dashboard/channels/index';
import { renderChannelsDetail } from './pages/dashboard/channels/detail';
import { renderAnalyticsIndex } from './pages/dashboard/analytics/index';
import { renderAnalyticsDetail } from './pages/dashboard/analytics/detail';
import { renderChatWidget } from './pages/public/chat-widget';

type RouteHandler = () => void | Promise<void>;

interface Route {
  path: string;
  handler: RouteHandler;
  isProtected: boolean;
}

class Router {
  private routes: Route[] = [];

  public route(path: string, handler: RouteHandler): void {
    this.routes.push({ path, handler, isProtected: false });
  }

  public protectedRoute(path: string, handler: RouteHandler): void {
    this.routes.push({ path, handler, isProtected: true });
  }

  public navigate(path: string): void {
    window.location.hash = path;
  }

  private getCurrentPath(): string {
    let hash = window.location.hash.slice(1); 
    if (!hash) return '/';

    let path = hash.split('?')[0];

    if (path.length > 1 && path.endsWith('/')) {
        path = path.slice(0, -1);
    }

    return path || '/';
  }

  private isEmbedMode(): boolean {
    return !!(window as any).__EMBED_MODE__;
  }

  private extractParams(routePath: string, actualPath: string): Record<string, string> | null {
    const routeParts = routePath.split('/');
    const actualParts = actualPath.split('/');

    if (routeParts.length !== actualParts.length) {
      return null;
    }

    const params: Record<string, string> = {};

    for (let i = 0; i < routeParts.length; i++) {
      if (routeParts[i].startsWith(':')) {
        const paramName = routeParts[i].slice(1);
        params[paramName] = actualParts[i];
      } else if (routeParts[i] !== actualParts[i]) {
        return null;
      }
    }

    return params;
  }

  private findRoute(path: string): { route: Route; params: Record<string, string> } | null {
    for (const route of this.routes) {
      const params = this.extractParams(route.path, path);
      if (params !== null) {
        return { route, params };
      }
    }
    return null;
  }

  private async handleRoute(): Promise<void> {
    const path = this.getCurrentPath();
    const embedMode = this.isEmbedMode();

    console.log(`[Router] Processing path: "${path}" | Embed Mode: ${embedMode}`);

    const match = this.findRoute(path);

    if (!match) {
      console.warn(`[Router] 404 - No route matched for "${path}".`);
    
      if (embedMode) {
        const appRoot = document.getElementById('app');
        if (appRoot) {
          appRoot.innerHTML = '<div style="padding:40px;text-align:center;color:red;">Invalid chat link</div>';
        }
        return;
      }
      this.navigate('/');
      return;
    }

    const { route, params } = match;

    if (embedMode) {
      console.log('[Router] Embed mode active');
     
      (window as any).routeParams = params;
      try {
        await route.handler();
      } catch (error) {
        console.error('[Router] Handler error:', error);
      }
      return; 
    }

    if (route.isProtected) {
      const authenticated = isAuthenticated();
      
      if (!authenticated) {
        console.warn('[Router] Unauthorized. Redirecting to login.');
        this.navigate('/login');
        return;
      }
      
      const accessToken = getAccessToken();
      if (accessToken && isTokenExpired(accessToken)) {
        const refreshed = await refreshAccessToken();
        if (!refreshed) {
          logout();
          this.navigate('/login');
          return;
        }
      }
    }

    (window as any).routeParams = params;

    try {
      await route.handler();
    } catch (error) {
      console.error('[Router] Handler error:', error);
    }
  }

  public init(): void {
    this.registerRoutes();
    window.addEventListener('hashchange', () => this.handleRoute());
    this.handleRoute();
  }

  private registerRoutes(): void {
    const appRoot = document.getElementById('app');
    if (!appRoot) return;

    this.route('/', () => renderTo(appRoot, renderHome()));
    this.route('/home', () => renderTo(appRoot, renderHome()));
    this.route('/login', () => renderTo(appRoot, renderLogin()));
    this.route('/register', () => renderTo(appRoot, renderRegister()));
    this.route('/verify-email', () => renderTo(appRoot, renderVerifyEmail()));

    this.route('/chat/:businessId', async () => {
      const params = this.getParams();
      const embedMode = this.isEmbedMode();
      
      console.log('[Router] Loading chat widget...', { businessId: params.businessId, embedMode });
      
      try {
        const content = await renderChatWidget(params.businessId, embedMode);
        renderTo(appRoot, content);
      } catch (error) {
        console.error('[Router] Chat load error', error);
        appRoot.innerHTML = '<div style="color:red; text-align:center; padding:20px;">Failed to load chat.</div>';
      }
    });

    this.protectedRoute('/dashboard', async () => {
      const content = renderDashboardHome();
      const layout = await renderDashboardLayout(content);
      renderTo(appRoot, layout);
    });

    this.protectedRoute('/dashboard/businesses', async () => {
      const content = await renderBusinessList();
      const layout = await renderDashboardLayout(content);
      renderTo(appRoot, layout);
    });

    this.protectedRoute('/dashboard/businesses/create', async () => {
      const content = await renderBusinessCreate();
      const layout = await renderDashboardLayout(content);
      renderTo(appRoot, layout);
    });

    this.protectedRoute('/dashboard/businesses/:id/edit', async () => {
      const params = this.getParams();
      const content = await renderBusinessEdit(params.id);
      const layout = await renderDashboardLayout(content);
      renderTo(appRoot, layout);
    });

    this.protectedRoute('/dashboard/channels', async () => {
      const content = await renderChannelsIndex();
      const layout = await renderDashboardLayout(content);
      renderTo(appRoot, layout);
    });

    this.protectedRoute('/dashboard/channels/:id', async () => {
        const params = this.getParams();
        const content = await renderChannelsDetail(params.id);
        const layout = await renderDashboardLayout(content);
        renderTo(appRoot, layout);
    });

    this.protectedRoute('/dashboard/analytics', async () => {
      const content = await renderAnalyticsIndex();
      const layout = await renderDashboardLayout(content);
      renderTo(appRoot, layout);
    });

    this.protectedRoute('/dashboard/analytics/:id', async () => {
      const params = this.getParams();
      const content = await renderAnalyticsDetail(params.id);
      const layout = await renderDashboardLayout(content);
      renderTo(appRoot, layout);
    });
  }

  public getParams(): Record<string, string> {
    return (window as any).routeParams || {};
  }

  public back(): void {
    window.history.back();
  }
}

export const router = new Router();
export const getRouteParams = (): Record<string, string> => router.getParams();
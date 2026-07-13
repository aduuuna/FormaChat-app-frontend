import { isAuthenticated, getAccessToken, isTokenExpired, logout } from './utils/auth.utils';
import { refreshAccessToken } from './utils/api.utils';
import { renderTo } from './utils/dom.utils';

// Every page is dynamically imported inside its own route handler instead of
// statically imported up here. Static imports at module scope meant every
// visitor - even someone just landing on the public homepage - downloaded
// one bundle containing the entire dashboard, business management,
// analytics, and chat widget code before anything could render. Dynamic
// import() gives Vite/Rollup a natural split point: each page becomes its
// own chunk, fetched only when that route is actually visited.

type RouteHandler = () => void | Promise<void>;

interface Route {
  path: string;
  handler: RouteHandler;
  isProtected: boolean;
  // Browser tab title for this route. Hash-routed SPAs serve identical HTML
  // (and identical og:*/twitter:* meta tags) for every path - the meta tags
  // can't be fixed without server-side rendering per route, but the tab
  // title/history entry is a real DOM API we control client-side, so at
  // least bookmarks, browser history, and the tab itself are accurate.
  title?: string;
}

const DEFAULT_TITLE = 'FormaChat - AI-Powered Customer Support for Your Business';

class Router {
  private routes: Route[] = [];

  public route(path: string, handler: RouteHandler, title?: string): void {
    this.routes.push({ path, handler, isProtected: false, title });
  }

  public protectedRoute(path: string, handler: RouteHandler, title?: string): void {
    this.routes.push({ path, handler, isProtected: true, title });
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
      const appRoot = document.getElementById('app');
      if (appRoot) {
        const { renderNotFound } = await import('./pages/public/not-found');
        renderTo(appRoot, renderNotFound());
      }
      return;
    }

    const { route, params } = match;

    if (!embedMode) {
      document.title = route.title || DEFAULT_TITLE;
    }

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

    this.route('/', async () => {
      const { renderHome } = await import('./pages/public/home');
      renderTo(appRoot, renderHome());
    }, DEFAULT_TITLE);

    this.route('/home', async () => {
      const { renderHome } = await import('./pages/public/home');
      renderTo(appRoot, renderHome());
    }, DEFAULT_TITLE);

    this.route('/login', async () => {
      const { renderLogin } = await import('./pages/public/login');
      renderTo(appRoot, renderLogin());
    }, 'Log In - FormaChat');

    this.route('/register', async () => {
      const { renderRegister } = await import('./pages/public/register');
      renderTo(appRoot, renderRegister());
    }, 'Create Your Account - FormaChat');

    this.route('/verify-email', async () => {
      const { renderVerifyEmail } = await import('./pages/public/verify-email');
      renderTo(appRoot, renderVerifyEmail());
    }, 'Verify Your Email - FormaChat');

    this.route('/forgot-password', async () => {
      const { renderForgotPassword } = await import('./pages/public/forgot-password');
      renderTo(appRoot, renderForgotPassword());
    }, 'Reset Your Password - FormaChat');

    this.route('/magic-login', async () => {
      const { renderMagicLogin } = await import('./pages/public/magic-login');
      renderTo(appRoot, renderMagicLogin());
    }, 'Signing You In - FormaChat');

    this.route('/chat/:businessId', async () => {
      const params = this.getParams();
      const embedMode = this.isEmbedMode();

      console.log('[Router] Loading chat widget...', { businessId: params.businessId, embedMode });

      try {
        const { renderChatWidget } = await import('./pages/public/chat-widget');
        const content = await renderChatWidget(params.businessId, embedMode);
        renderTo(appRoot, content);
      } catch (error) {
        console.error('[Router] Chat load error', error);
        appRoot.innerHTML = '<div style="color:red; text-align:center; padding:20px;">Failed to load chat.</div>';
      }
    }, 'Chat - FormaChat');

    this.protectedRoute('/dashboard/settings', async () => {
      const [{ renderSettingsPage }, { renderDashboardLayout }] = await Promise.all([
        import('./pages/dashboard/settings'),
        import('./pages/dashboard/layout'),
      ]);
      const content = renderSettingsPage();
      const layout = await renderDashboardLayout(content);
      renderTo(appRoot, layout);
    }, 'Settings - FormaChat');

    this.protectedRoute('/dashboard', async () => {
      const [{ renderDashboardHome }, { renderDashboardLayout }] = await Promise.all([
        import('./pages/dashboard/home'),
        import('./pages/dashboard/layout'),
      ]);
      const content = await renderDashboardHome();
      const layout = await renderDashboardLayout(content);
      renderTo(appRoot, layout);
    }, 'Dashboard - FormaChat');

    this.protectedRoute('/dashboard/businesses', async () => {
      const [{ renderBusinessList }, { renderDashboardLayout }] = await Promise.all([
        import('./pages/dashboard/businesses/list'),
        import('./pages/dashboard/layout'),
      ]);
      const content = await renderBusinessList();
      const layout = await renderDashboardLayout(content);
      renderTo(appRoot, layout);
    }, 'Your Businesses - FormaChat');

    this.protectedRoute('/dashboard/businesses/create', async () => {
      const [{ renderBusinessCreate }, { renderDashboardLayout }] = await Promise.all([
        import('./pages/dashboard/businesses/create'),
        import('./pages/dashboard/layout'),
      ]);
      const content = await renderBusinessCreate();
      const layout = await renderDashboardLayout(content);
      renderTo(appRoot, layout);
    }, 'Create a Business - FormaChat');

    this.protectedRoute('/dashboard/businesses/:id/edit', async () => {
      const params = this.getParams();
      const [{ renderBusinessEdit }, { renderDashboardLayout }] = await Promise.all([
        import('./pages/dashboard/businesses/edit'),
        import('./pages/dashboard/layout'),
      ]);
      const content = await renderBusinessEdit(params.id);
      const layout = await renderDashboardLayout(content);
      renderTo(appRoot, layout);
    }, 'Business Questionnaire - FormaChat');

    this.protectedRoute('/dashboard/businesses/:id/products', async () => {
      const params = this.getParams();
      const [{ renderProductsPage }, { renderDashboardLayout }] = await Promise.all([
        import('./pages/dashboard/businesses/products'),
        import('./pages/dashboard/layout'),
      ]);
      const content = await renderProductsPage(params.id);
      const layout = await renderDashboardLayout(content);
      renderTo(appRoot, layout);
    }, 'Products - FormaChat');

    this.protectedRoute('/dashboard/businesses/:id/documents', async () => {
      const params = this.getParams();
      const [{ renderDocumentsPage }, { renderDashboardLayout }] = await Promise.all([
        import('./pages/dashboard/businesses/documents'),
        import('./pages/dashboard/layout'),
      ]);
      const content = await renderDocumentsPage(params.id);
      const layout = await renderDashboardLayout(content);
      renderTo(appRoot, layout);
    }, 'Documents - FormaChat');

    this.protectedRoute('/dashboard/channels', async () => {
      const [{ renderChannelsIndex }, { renderDashboardLayout }] = await Promise.all([
        import('./pages/dashboard/channels/index'),
        import('./pages/dashboard/layout'),
      ]);
      const content = await renderChannelsIndex();
      const layout = await renderDashboardLayout(content);
      renderTo(appRoot, layout);
    }, 'Channels - FormaChat');

    this.protectedRoute('/dashboard/channels/:id', async () => {
      const params = this.getParams();
      const [{ renderChannelsDetail }, { renderDashboardLayout }] = await Promise.all([
        import('./pages/dashboard/channels/detail'),
        import('./pages/dashboard/layout'),
      ]);
      const content = await renderChannelsDetail(params.id);
      const layout = await renderDashboardLayout(content);
      renderTo(appRoot, layout);
    }, 'Channel Settings - FormaChat');

    this.protectedRoute('/dashboard/analytics', async () => {
      const [{ renderAnalyticsIndex }, { renderDashboardLayout }] = await Promise.all([
        import('./pages/dashboard/analytics/index'),
        import('./pages/dashboard/layout'),
      ]);
      const content = await renderAnalyticsIndex();
      const layout = await renderDashboardLayout(content);
      renderTo(appRoot, layout);
    }, 'Analytics - FormaChat');

    this.protectedRoute('/dashboard/analytics/:id', async () => {
      const params = this.getParams();
      const [{ renderAnalyticsDetail }, { renderDashboardLayout }] = await Promise.all([
        import('./pages/dashboard/analytics/detail'),
        import('./pages/dashboard/layout'),
      ]);
      const content = await renderAnalyticsDetail(params.id);
      const layout = await renderDashboardLayout(content);
      renderTo(appRoot, layout);
    }, 'Analytics - FormaChat');
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

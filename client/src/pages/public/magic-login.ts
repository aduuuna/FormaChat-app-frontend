import { verifyMagicLink } from '../../services/auth.service';
import { saveTokens, saveUser } from '../../utils/auth.utils';

function injectMagicLoginStyles() {
  if (document.getElementById('magic-login-page-styles')) return;
  const style = document.createElement('style');
  style.id = 'magic-login-page-styles';
  style.textContent = `
    .magic-login-container {
      max-width: 400px;
      margin: 100px auto;
      padding: 40px 30px;
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(10px);
      border-radius: 16px;
      border: 1px solid rgba(255, 255, 255, 0.5);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
      text-align: center;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
    .magic-login-title {
      font-size: 1.6rem;
      font-weight: 800;
      color: #636b2f;
      margin: 0 0 12px 0;
    }
    .magic-login-message {
      color: #555;
      font-size: 0.95rem;
      margin-bottom: 20px;
      line-height: 1.5;
    }
    .magic-login-spinner {
      width: 32px;
      height: 32px;
      border: 3px solid #e1e1e1;
      border-top-color: #636b2f;
      border-radius: 50%;
      margin: 0 auto 20px;
      animation: magic-login-spin 0.8s linear infinite;
    }
    @keyframes magic-login-spin {
      to { transform: rotate(360deg); }
    }
    .magic-login-error {
      background: rgba(220, 53, 69, 0.1);
      color: #dc3545;
      padding: 12px;
      border-radius: 6px;
      font-size: 0.9rem;
      margin-bottom: 16px;
      border-left: 3px solid #dc3545;
    }
    .magic-login-link {
      color: #636b2f;
      font-weight: 600;
      text-decoration: none;
    }
    .magic-login-link:hover { text-decoration: underline; }
  `;
  document.head.appendChild(style);
}

function getQueryParams(): { email: string | null; token: string | null } {
  const hash = window.location.hash.slice(1);
  const queryIndex = hash.indexOf('?');
  if (queryIndex === -1) return { email: null, token: null };

  const params = new URLSearchParams(hash.slice(queryIndex + 1));
  return {
    email: params.get('email'),
    token: params.get('token'),
  };
}

export function renderMagicLogin(): HTMLElement {
  injectMagicLoginStyles();

  const container = document.createElement('div');
  container.className = 'magic-login-container';

  const spinner = document.createElement('div');
  spinner.className = 'magic-login-spinner';
  container.appendChild(spinner);

  const title = document.createElement('h1');
  title.className = 'magic-login-title';
  title.textContent = 'Signing you in...';
  container.appendChild(title);

  const message = document.createElement('p');
  message.className = 'magic-login-message';
  message.textContent = 'Please wait while we verify your sign-in link.';
  container.appendChild(message);

  (async () => {
    const { email, token } = getQueryParams();

    if (!email || !token) {
      spinner.remove();
      title.textContent = 'Invalid Link';
      message.remove();
      const err = document.createElement('div');
      err.className = 'magic-login-error';
      err.textContent = 'This sign-in link is missing required information.';
      container.appendChild(err);
      appendBackToLogin(container);
      return;
    }

    try {
      const response = await verifyMagicLink(email, token);

      if (!response.success) {
        spinner.remove();
        title.textContent = 'Link Expired or Invalid';
        message.remove();
        const err = document.createElement('div');
        err.className = 'magic-login-error';
        err.textContent = response.error.message || 'This sign-in link is no longer valid. Please request a new one.';
        container.appendChild(err);
        appendBackToLogin(container);
        return;
      }

      saveTokens(response.data.tokens);
      saveUser(response.data.user);

      title.textContent = 'Signed In!';
      message.textContent = 'Redirecting to your dashboard...';
      spinner.remove();

      setTimeout(() => {
        window.location.hash = '#/dashboard';
      }, 500);

    } catch {
      spinner.remove();
      title.textContent = 'Something Went Wrong';
      message.remove();
      const err = document.createElement('div');
      err.className = 'magic-login-error';
      err.textContent = 'We could not verify your sign-in link. Please try again.';
      container.appendChild(err);
      appendBackToLogin(container);
    }
  })();

  return container;
}

function appendBackToLogin(container: HTMLElement) {
  const link = document.createElement('a');
  link.href = '#/login';
  link.className = 'magic-login-link';
  link.textContent = 'Back to login';
  container.appendChild(link);
}

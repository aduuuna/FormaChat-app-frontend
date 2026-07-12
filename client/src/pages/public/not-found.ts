import { isAuthenticated } from '../../utils/auth.utils';

function injectNotFoundStyles() {
  if (document.getElementById('not-found-styles')) return;
  const style = document.createElement('style');
  style.id = 'not-found-styles';
  style.textContent = `
    .not-found-page {
      min-height: 70vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 40px 20px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
    .not-found-code {
      font-size: 5rem;
      font-weight: 900;
      color: #636b2f;
      line-height: 1;
      margin: 0 0 12px 0;
    }
    .not-found-title {
      font-size: 1.4rem;
      font-weight: 700;
      color: #1a1a1a;
      margin: 0 0 8px 0;
    }
    .not-found-message {
      color: #666;
      font-size: 0.95rem;
      margin: 0 0 28px 0;
      max-width: 400px;
    }
    .not-found-link {
      background: #636b2f;
      color: white;
      text-decoration: none;
      padding: 12px 24px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 0.9rem;
      transition: background 0.2s;
    }
    .not-found-link:hover {
      background: #4a5122;
    }
  `;
  document.head.appendChild(style);
}

export function renderNotFound(): HTMLElement {
  injectNotFoundStyles();

  const container = document.createElement('div');
  container.className = 'not-found-page';

  const code = document.createElement('p');
  code.className = 'not-found-code';
  code.textContent = '404';
  container.appendChild(code);

  const title = document.createElement('h1');
  title.className = 'not-found-title';
  title.textContent = "This page doesn't exist";
  container.appendChild(title);

  const message = document.createElement('p');
  message.className = 'not-found-message';
  message.textContent = "The link you followed might be broken, or the page may have been moved.";
  container.appendChild(message);

  const link = document.createElement('a');
  link.className = 'not-found-link';
  const loggedIn = isAuthenticated();
  link.href = loggedIn ? '#/dashboard' : '#/';
  link.textContent = loggedIn ? 'Back to Dashboard' : 'Back to Home';
  container.appendChild(link);

  return container;
}

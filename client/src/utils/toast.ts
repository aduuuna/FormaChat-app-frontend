type ToastType = 'success' | 'error' | 'info';

function ensureContainer(): HTMLElement {
  const existing = document.getElementById('toast-container');
  if (existing) return existing;

  const container = document.createElement('div');
  container.id = 'toast-container';
  container.style.cssText = `
    position: fixed;
    top: 24px;
    right: 24px;
    z-index: 99999;
    display: flex;
    flex-direction: column;
    gap: 10px;
    pointer-events: none;
  `;
  document.body.appendChild(container);
  return container;
}

const OLIVE_CARD_BG = '#f4f6ea';
const OLIVE_CARD_BORDER = '#dde2c8';

const COLORS: Record<ToastType, { borderBottom: string; text: string; icon: string }> = {
  success: { borderBottom: '#636b2f', text: '#3a4014', icon: '✓' },
  error:   { borderBottom: '#dc3545', text: '#3a4014', icon: '✕' },
  info:    { borderBottom: '#636b2f', text: '#3a4014', icon: 'ℹ' },
};

export function showToast(message: string, type: ToastType = 'info', durationMs = 4000): void {
  const container = ensureContainer();
  const c = COLORS[type];

  const toast = document.createElement('div');
  toast.style.cssText = `
    display: flex;
    align-items: center;
    gap: 10px;
    background: ${OLIVE_CARD_BG};
    border: 1px solid ${OLIVE_CARD_BORDER};
    border-bottom: 4px solid ${c.borderBottom};
    color: ${c.text};
    padding: 13px 18px;
    border-radius: 10px;
    font-size: 0.9rem;
    font-weight: 500;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    box-shadow: 0 8px 24px rgba(74, 81, 34, 0.15);
    max-width: 360px;
    pointer-events: auto;
    opacity: 0;
    transform: translateY(8px);
    transition: opacity 0.25s ease, transform 0.25s ease;
  `;

  const icon = document.createElement('span');
  icon.textContent = c.icon;
  icon.style.cssText = `
    flex-shrink: 0;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: ${c.borderBottom};
    color: #fff;
    font-size: 0.7rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
  `;
  toast.appendChild(icon);

  const text = document.createElement('span');
  text.textContent = message;
  text.style.cssText = 'flex: 1; line-height: 1.4;';
  toast.appendChild(text);

  container.appendChild(toast);

  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
  });

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(8px)';
    setTimeout(() => toast.remove(), 280);
  }, durationMs);
}

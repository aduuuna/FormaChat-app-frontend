type ToastType = 'success' | 'error' | 'info';

function ensureContainer(): HTMLElement {
  const existing = document.getElementById('toast-container');
  if (existing) return existing;

  const container = document.createElement('div');
  container.id = 'toast-container';
  container.style.cssText = `
    position: fixed;
    bottom: 24px;
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

const COLORS: Record<ToastType, { bg: string; border: string; text: string }> = {
  success: { bg: '#f0fff4', border: '#28a745', text: '#155724' },
  error:   { bg: '#fff5f5', border: '#dc3545', text: '#721c24' },
  info:    { bg: '#f9fff3', border: '#636b2f', text: '#1a1a1a' },
};

export function showToast(message: string, type: ToastType = 'info', durationMs = 4000): void {
  const container = ensureContainer();
  const c = COLORS[type];

  const toast = document.createElement('div');
  toast.style.cssText = `
    background: ${c.bg};
    border-left: 4px solid ${c.border};
    color: ${c.text};
    padding: 12px 18px;
    border-radius: 8px;
    font-size: 0.9rem;
    font-weight: 500;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    box-shadow: 0 4px 16px rgba(0,0,0,0.12);
    max-width: 340px;
    pointer-events: auto;
    opacity: 0;
    transform: translateY(8px);
    transition: opacity 0.25s ease, transform 0.25s ease;
  `;
  toast.textContent = message;
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

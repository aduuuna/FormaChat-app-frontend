interface BottomNavItem {
  label: string;
  path: string;
  icon: string;
}

const NAV_ITEMS: BottomNavItem[] = [
  {
    label: 'Home',
    path: '#/dashboard',
    icon: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline>',
  },
  {
    label: 'Businesses',
    path: '#/dashboard/businesses',
    icon: '<rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>',
  },
  {
    label: 'Channels',
    path: '#/dashboard/channels',
    icon: '<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>',
  },
  {
    label: 'Analytics',
    path: '#/dashboard/analytics',
    icon: '<line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line>',
  },
  {
    label: 'Settings',
    path: '#/dashboard/settings',
    icon: '<circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>',
  },
];

function injectMobileBottomNavStyles() {
  if (document.getElementById('mobile-bottom-nav-styles')) return;

  const style = document.createElement('style');
  style.id = 'mobile-bottom-nav-styles';
  style.textContent = `
    .mobile-bottom-nav {
      display: none;
    }

    @media (max-width: 768px) {
      .mobile-bottom-nav {
        display: flex;
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        background: rgba(255, 255, 255, 0.97);
        backdrop-filter: blur(12px);
        border-top: 1px solid rgba(0, 0, 0, 0.08);
        box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.05);
        z-index: 100;
        padding-bottom: env(safe-area-inset-bottom, 0);
      }

      .mobile-bottom-nav-link {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 3px;
        padding: 8px 4px 6px;
        text-decoration: none;
        color: #888;
        font-size: 0.68rem;
        font-weight: 600;
        transition: color 0.15s;
      }

      .mobile-bottom-nav-link.active {
        color: #636b2f;
      }

      .mobile-bottom-nav-link svg {
        flex-shrink: 0;
      }

      /* Leave room at the bottom of scrollable content so the nav never covers it */
      .dashboard-content {
        padding-bottom: 76px;
      }
    }
  `;
  document.head.appendChild(style);
}

export function createMobileBottomNav(): HTMLElement {
  injectMobileBottomNavStyles();

  const nav = document.createElement('nav');
  nav.className = 'mobile-bottom-nav';
  nav.setAttribute('aria-label', 'Mobile navigation');

  const links: HTMLAnchorElement[] = [];

  NAV_ITEMS.forEach(item => {
    const link = document.createElement('a');
    link.href = item.path;
    link.className = 'mobile-bottom-nav-link';

    const currentHash = window.location.hash || '#/dashboard';
    if (currentHash === item.path) {
      link.classList.add('active');
    }

    link.innerHTML = `
      <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${item.icon}</svg>
      <span>${item.label}</span>
    `;

    links.push(link);
    nav.appendChild(link);
  });

  window.addEventListener('hashchange', () => {
    const currentHash = window.location.hash || '#/dashboard';
    links.forEach(l => {
      l.classList.toggle('active', l.getAttribute('href') === currentHash);
    });
  });

  return nav;
}

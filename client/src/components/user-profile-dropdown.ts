import { logout } from '../utils/auth.utils';

export interface UserProfileData {
  username: string;
  lastLogin?: string;
}

function injectProfileStyles() {
  if (document.getElementById('profile-dropdown-styles')) return;

  const style = document.createElement('style');
  style.id = 'profile-dropdown-styles';
  style.textContent = `
    :root {
      --primary: #636b2f;
      --bg-glass: rgba(255, 255, 255, 0.95);
      --text-main: #1a1a1a;
      --text-muted: #666;
    }

    /* Profile Container */
    .user-profile-dropdown {
      position: relative;
    }

    /* Trigger Button */
    .profile-trigger {
      background: rgba(99, 107, 47, 0.1);
      border: 1px solid rgba(99, 107, 47, 0.2);
      color: var(--primary);
      font-weight: 600;
      padding: 8px 16px;
      border-radius: 10px;
      cursor: pointer;
      font-size: 0.9rem;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .profile-trigger:hover {
      background: rgba(99, 107, 47, 0.15);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    }

    .profile-trigger svg {
      flex-shrink: 0;
    }

    .profile-username {
      white-space: nowrap;
    }

    /* Dropdown Menu */
    .profile-menu {
      position: absolute;
      top: calc(100% + 10px);
      right: 0;
      min-width: 220px;
      background: var(--bg-glass);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.5);
      border-radius: 12px;
      padding: 12px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      display: none;
      z-index: 50;
    }

    /* Last Login Info */
    .profile-menu p {
      margin: 0 0 12px 0;
      padding: 8px 12px;
      font-size: 0.85rem;
      color: var(--text-muted);
      border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    }

    /* Logout Button */
    .profile-menu button {
      width: 100%;
      background: transparent;
      border: 1px solid rgba(99, 107, 47, 0.2);
      color: var(--primary);
      font-weight: 600;
      padding: 10px 16px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 0.9rem;
      transition: all 0.2s ease;
    }

    .profile-menu button:hover {
      background: rgba(99, 107, 47, 0.1);
      border-color: var(--primary);
    }

    /* Mobile Optimization - Hide username, show only icon */
    @media (max-width: 768px) {
      .profile-trigger {
        padding: 10px;
        min-width: 40px;
        justify-content: center;
      }

      .profile-username {
        display: none;
      }

      .profile-menu {
        min-width: 200px;
        right: -10px; /* Adjust alignment for smaller button */
      }
    }

    /* Tablet - Show abbreviated username */
    @media (min-width: 769px) and (max-width: 1024px) {
      .profile-trigger {
        padding: 8px 12px;
      }

      .profile-username {
        max-width: 80px;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
  `;
  document.head.appendChild(style);
}

export function createUserProfileDropdown(user: UserProfileData): HTMLElement {
  injectProfileStyles();

  const container = document.createElement('div');
  container.className = 'user-profile-dropdown';
  
  const trigger = document.createElement('button');
  trigger.className = 'profile-trigger';
  trigger.setAttribute('aria-label', 'User menu');
  
  trigger.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
      <circle cx="12" cy="7" r="4"></circle>
    </svg>
    <span class="profile-username">${user.username}</span>
  `;
  
  const menu = document.createElement('div');
  menu.className = 'profile-menu';
  menu.style.display = 'none';
  
  if (user.lastLogin) {
    const lastLogin = document.createElement('p');
    lastLogin.textContent = `Last login: ${new Date(user.lastLogin).toLocaleString()}`;
    menu.appendChild(lastLogin);
  }
  
  const logoutBtn = document.createElement('button');
  logoutBtn.textContent = 'Logout';
  logoutBtn.addEventListener('click', () => {
    logout();
    window.location.hash = '#/login';
  });
  menu.appendChild(logoutBtn);
  
 
  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
  });
  

  menu.addEventListener('click', (e) => {
    e.stopPropagation();
  });
  
  document.addEventListener('click', () => {
    menu.style.display = 'none';
  });
  
  container.appendChild(trigger);
  container.appendChild(menu);
  
  return container;
}
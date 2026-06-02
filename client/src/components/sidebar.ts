export interface SidebarItem {
  label: string;
  path: string;
  icon: string;
}

function injectSidebarDropdownStyles() {
  if (document.getElementById('sidebar-dropdown-styles')) return;

  const style = document.createElement('style');
  style.id = 'sidebar-dropdown-styles';
  style.textContent = `
    :root {
      --primary: #636b2f;
      --secondary: #bac095;
      --bg-glass: rgba(255, 255, 255, 0.95);
      --text-main: #1a1a1a;
    }

    /* Sidebar Dropdown Container */
    .sidebar-dropdown {
      position: relative;
    }

    /* Dropdown Menu */
    .sidebar-menu {
      position: absolute;
      top: calc(100% + 10px);
      left: 0;
      min-width: 240px;
      background: var(--bg-glass);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.5);
      border-radius: 12px;
      padding: 12px 8px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      display: none;
      z-index: 50;
    }

    /* Navigation List */
    .sidebar-menu ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .sidebar-menu li {
      margin-bottom: 4px;
    }

    /* Links */
    .sidebar-link {
      display: flex;
      align-items: center;
      padding: 12px 16px;
      text-decoration: none;
      color: #555;
      font-weight: 500;
      border-radius: 10px;
      transition: all 0.2s ease;
      font-size: 0.95rem;
    }

    /* Icons */
    .sidebar-icon {
      margin-right: 12px;
      color: #999;
      transition: color 0.2s ease;
      flex-shrink: 0;
    }

    /* Hover State */
    .sidebar-link:hover {
      background: rgba(186, 192, 149, 0.15);
      color: var(--primary);
    }
    .sidebar-link:hover .sidebar-icon {
      color: var(--primary);
    }

    /* Active State */
    .sidebar-link.active {
      background: rgba(99, 107, 47, 0.1);
      color: var(--primary);
      font-weight: 700;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.03);
    }
    .sidebar-link.active .sidebar-icon {
      color: var(--primary);
    }

    /* Mobile Optimization */
    @media (max-width: 768px) {
      .sidebar-menu {
        min-width: 280px;
        max-width: 90vw;
      }
    }
  `;
  document.head.appendChild(style);
}

export function createSidebarDropdown(): HTMLElement {
  injectSidebarDropdownStyles();

  const container = document.createElement('div');
  container.className = 'sidebar-dropdown';

  const menu = document.createElement('div');
  menu.className = 'sidebar-menu';
  menu.style.display = 'none';

  const navItems: SidebarItem[] = [
    { 
      label: 'Home', 
      path: '#/dashboard',
      icon: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline>'
    },
    { 
      label: 'Businesses', 
      path: '#/dashboard/businesses',
      icon: '<rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>'
    },
    { 
      label: 'Channels', 
      path: '#/dashboard/channels',
      icon: '<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>'
    },
    { 
      label: 'Analytics', 
      path: '#/dashboard/analytics',
      icon: '<line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line>'
    }
  ];
  
  const nav = document.createElement('nav');
  const ul = document.createElement('ul');
  
  navItems.forEach(item => {
    const li = document.createElement('li');
    
    const link = document.createElement('a');
    link.href = item.path;
    link.className = 'sidebar-link';
    
    const iconSpan = document.createElement('span');
    iconSpan.className = 'sidebar-icon';
    iconSpan.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${item.icon}</svg>`;
    
    link.appendChild(iconSpan);
    link.appendChild(document.createTextNode(item.label));
    
    const currentHash = window.location.hash || '#/dashboard';
    if (currentHash === item.path) {
      link.classList.add('active');
    }
    
    link.addEventListener('click', (e) => {
      e.preventDefault();
      
      const allLinks = menu.querySelectorAll('.sidebar-link');
      allLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      
      window.location.hash = item.path;
      
      menu.style.display = 'none';
    });
    
    li.appendChild(link);
    ul.appendChild(li);
  });
  
  nav.appendChild(ul);
  menu.appendChild(nav);
  container.appendChild(menu);
  
  window.addEventListener('hashchange', () => {
    const links = menu.querySelectorAll('.sidebar-link');
    links.forEach(l => {
      const href = l.getAttribute('href');
      if (window.location.hash === href) {
        l.classList.add('active');
      } else {
        l.classList.remove('active');
      }
    });
  });
  
  menu.addEventListener('click', (e) => {
    e.stopPropagation();
  });
  
  return container;
}
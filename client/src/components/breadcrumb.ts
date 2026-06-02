export interface BreadcrumbItem {
  label: string;
  path?: string; 
}

function injectBreadcrumbStyles() {
  if (document.getElementById('breadcrumb-styles')) return;

  const style = document.createElement('style');
  style.id = 'breadcrumb-styles';
  style.textContent = `
    /* The Glass Container */
    .breadcrumb-nav ol {
      display: inline-flex;
      align-items: center;
      list-style: none;
      margin: 0;
      padding: 8px 16px;
      
      /* Glassmorphism Effect */
      background: rgba(255, 255, 255, 0.7);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255, 255, 255, 0.4);
      border-radius: 50px; /* Pill shape */
      box-shadow: 0 2px 10px rgba(0,0,0,0.03);
      
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 14px;
    }

    .breadcrumb-li {
      display: flex;
      align-items: center;
    }

    /* Links (Parents) */
    .breadcrumb-link {
      color: #888;
      text-decoration: none;
      font-weight: 500;
      transition: all 0.2s ease;
      padding: 4px 8px;
      border-radius: 6px;
    }

    .breadcrumb-link:hover {
      color: #1a1a1a;
      background: rgba(0,0,0,0.04);
      transform: translateY(-1px); /* Micro-interaction */
    }

    /* Current Page (Active) */
    .breadcrumb-current {
      color: #636b2f; /* Brand Primary */
      font-weight: 600;
      padding: 4px 8px;
      cursor: default;
    }

    /* Separator */
    .breadcrumb-separator {
      color: #ccc;
      font-size: 16px;
      margin: 0 2px;
      user-select: none;
      line-height: 1;
    }
  `;
  document.head.appendChild(style);
}

export function createBreadcrumb(items: BreadcrumbItem[]): HTMLElement {
  injectBreadcrumbStyles();

  const nav = document.createElement('nav');
  nav.setAttribute('aria-label', 'Breadcrumb');
  nav.className = 'breadcrumb-nav';
  
  const ol = document.createElement('ol');
  
  items.forEach((item, index) => {
    const li = document.createElement('li');
    li.className = 'breadcrumb-li';
    
    if (item.path) {

      const link = document.createElement('a');
      link.href = item.path;
      link.textContent = item.label;
      link.className = 'breadcrumb-link';
      
      link.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.hash = item.path!;
      });
      li.appendChild(link);
    } else {
      
      const span = document.createElement('span');
      span.textContent = item.label;
      span.className = 'breadcrumb-current';
      span.setAttribute('aria-current', 'page');
      li.appendChild(span);
    }
    
    if (index < items.length - 1) {
      const separator = document.createElement('span');
      separator.className = 'breadcrumb-separator';
     
      separator.innerHTML = '&rsaquo;'; 
      li.appendChild(separator);
    }
    
    ol.appendChild(li);
  });
  
  nav.appendChild(ol);
  return nav;
}
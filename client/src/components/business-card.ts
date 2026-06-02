export interface BusinessCardData {
  id: string;
  name: string;
  createdAt: Date | string;
  status?: 'active' | 'inactive';
}

function injectBusinessCardStyles() {
  if (document.getElementById('business-card-styles')) return;

  const style = document.createElement('style');
  style.id = 'business-card-styles';
  style.textContent = `
    :root {
      --primary: #636b2f;
      --primary-light: #7a8441;
      --secondary: #bac095;
      --text-main: #1a1a1a;
      --text-muted: #666;
    }

    .business-card {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.5);
      border-radius: 12px;
      padding: 20px;
      position: relative;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
      display: flex;
      flex-direction: column;
      gap: 12px;
      min-height: 120px;
    }

    .business-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 8px 20px rgba(99, 107, 47, 0.12);
      border-color: rgba(99, 107, 47, 0.2);
    }

    .business-card:active {
      transform: translateY(-1px);
    }

    /* Header Row: Avatar + Status */
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    /* Compact Avatar */
    .business-avatar {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, #f4f6e6 0%, #e8ead5 100%);
      color: var(--primary);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      font-weight: 700;
      text-transform: uppercase;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }

    /* Minimal Status Badge */
    .status-badge {
      font-size: 11px;
      font-weight: 600;
      padding: 4px 10px;
      border-radius: 12px;
      text-transform: capitalize;
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .status-active {
      background: rgba(16, 185, 129, 0.1);
      color: #059669;
    }
    
    .status-inactive {
      background: rgba(156, 163, 175, 0.15);
      color: #6b7280;
    }

    .status-dot {
      width: 5px;
      height: 5px;
      border-radius: 50%;
      background-color: currentColor;
    }

    /* Business Name */
    .business-name {
      font-size: 1.1rem;
      font-weight: 700;
      color: var(--text-main);
      margin: 0;
      line-height: 1.3;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* Compact Footer */
    .card-footer {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      color: var(--text-muted);
      margin-top: auto;
      padding-top: 8px;
      border-top: 1px solid rgba(0, 0, 0, 0.04);
    }

    .card-footer svg {
      opacity: 0.5;
      flex-shrink: 0;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .business-card {
        min-height: 110px;
        padding: 16px;
      }
      
      .business-name {
        font-size: 1rem;
      }
    }
  `;
  document.head.appendChild(style);
}

export function createBusinessCard(
  business: BusinessCardData,
  onClickPath?: string 
): HTMLElement {
  injectBusinessCardStyles();

  const card = document.createElement('div');
  card.className = 'business-card';
  
  if (onClickPath) {
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.style.cursor = 'pointer'; 
    
    const navigate = () => {
      window.location.hash = onClickPath;
    };

    card.addEventListener('click', navigate);
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        navigate();
      }
    });
  } else {
  
    card.style.cursor = 'default';
  }

  const header = document.createElement('div');
  header.className = 'card-header';

  const avatar = document.createElement('div');
  avatar.className = 'business-avatar';
  avatar.textContent = business.name.charAt(0) || 'B';
  header.appendChild(avatar);

  if (business.status) {
    const status = document.createElement('span');
    status.className = `status-badge status-${business.status}`;
    
    const dot = document.createElement('span');
    dot.className = 'status-dot';
    
    status.appendChild(dot);
    status.appendChild(document.createTextNode(business.status));
    header.appendChild(status);
  }

  card.appendChild(header);

  const name = document.createElement('h3');
  name.className = 'business-name';
  name.textContent = business.name;
  card.appendChild(name);

  const footer = document.createElement('div');
  footer.className = 'card-footer';
  
  footer.innerHTML = `
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
      <line x1="16" y1="2" x2="16" y2="6"></line>
      <line x1="8" y1="2" x2="8" y2="6"></line>
      <line x1="3" y1="10" x2="21" y2="10"></line>
    </svg>
  `;

  const dateText = document.createElement('span');
  const createdDate = new Date(business.createdAt);
  dateText.textContent = `Created ${createdDate.toLocaleDateString()}`;
  footer.appendChild(dateText);
  
  card.appendChild(footer);

  return card;
}
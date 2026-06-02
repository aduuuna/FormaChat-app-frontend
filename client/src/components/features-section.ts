export interface Feature {
  title: string;
  description: string[]; // ✅ Changed back to array for list rendering
  status?: 'available' | 'coming-soon';
}

function injectFeatureStyles() {
  if (document.getElementById('feature-section-styles')) return;

  const style = document.createElement('style');
  style.id = 'feature-section-styles';
  style.textContent = `
    :root {
      --primary: #636b2f;       /* Dark Olive */
      --secondary: #bac095;     /* Light Olive */
      --text-main: #1a1a1a;
      --text-muted: #666;
      --text-light: #ffffff;
    }

    .features-section {
      width: 100%;
      box-sizing: border-box; 
      padding: 20px 0;
    }

    .features-header {
      text-align: center;
      margin-bottom: 40px;
    }
    
    .features-title {
      font-size: 1.8rem;
      font-weight: 800;
      color: var(--text-main);
      margin: 0 0 8px 0;
      letter-spacing: -0.5px;
    }
    
    .features-subtitle {
      color: var(--text-muted);
      font-size: 0.95rem;
      margin: 0;
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 20px;
    }

    /* --- CARD BASE --- */
    .feature-card {
      border-radius: 16px;
      padding: 24px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      display: flex;
      flex-direction: column;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
      border: 1px solid transparent;
    }

    .feature-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 12px 30px rgba(0, 0, 0, 0.1);
    }

    /* --- COLOR VARIANTS --- */
    
    /* 1. Primary (Olive) - Dark Background */
    .card-variant-primary {
      background: var(--primary);
      color: white;
    }
    .card-variant-primary .feature-title { color: white; }
    .card-variant-primary .feature-list li { 
      color: rgba(255, 255, 255, 0.9); /* Slight transparency for list text */
    }
    .card-variant-primary .feature-icon-box {
      background: rgba(255, 255, 255, 0.2);
      color: white;
    }
    .card-variant-primary .status-badge {
      background: rgba(255, 255, 255, 0.2);
      color: white;
      border: 1px solid rgba(255,255,255,0.3);
    }

    /* 2. White - Light Background */
    .card-variant-white {
      background: white;
      border: 2px solid var(--primary);
      color: var(--text-main);
    }
    .card-variant-white .feature-list li { color: var(--text-muted); }
    .card-variant-white .feature-icon-box {
      background: #f4f6e6; 
      color: var(--primary);
    }

    
  
    /* --- CONTENT STYLES --- */
    .feature-icon-box {
      width: 44px;
      height: 44px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 20px;
    }

    .feature-title {
      font-size: 1.25rem;
      font-weight: 700;
      margin: 0 0 15px 0;
      line-height: 1.3;
    }

    /* ✅ LIST STYLING (The requested spacing) */
    .feature-list {
      list-style: none; /* No bullets */
      padding: 0;
      margin: 0 0 20px 0;
      flex-grow: 1;

    }

    .feature-list li {
      font-size: 0.95rem;
      line-height: 1.5;
      margin-bottom: 8px; /* Breathing room between items */
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
    }
    
    /* Optional: Custom dash if you want a subtle marker, remove if you want pure text */
    /* .feature-list li::before {
       content: "-";
       margin-right: 8px;
       opacity: 0.7;
    } */

    .feature-list li:last-child {
      margin-bottom: 0;
    }

    /* Badges */
    .status-badge {
      display: inline-flex;
      align-items: center;
      padding: 5px 12px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 700;
      width: fit-content;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .card-variant-white .status-available {
      background: #ecfdf5; color: #047857; border: 1px solid #d1fae5;
    }
    .card-variant-white .status-coming-soon {
      background: #f3f4f6; color: #6b7280; border: 1px solid #e5e7eb;
    }

    @media (max-width: 768px) {
      .features-grid {
        grid-template-columns: 1fr;
        gap: 16px;
      }
    }
  `;
  document.head.appendChild(style);
}

export function createFeaturesSection(features: Feature[]): HTMLElement {
  injectFeatureStyles();

  const container = document.createElement('div');
  container.className = 'features-section';
  
  const header = document.createElement('div');
  header.className = 'features-header';
  
  const heading = document.createElement('h2');
  heading.className = 'features-title';
  heading.textContent = 'Features & Pricing';
  header.appendChild(heading);

  const sub = document.createElement('p');
  sub.className = 'features-subtitle';
  header.appendChild(sub);

  container.appendChild(header);
  
  const grid = document.createElement('div');
  grid.className = 'features-grid';
  
  features.forEach((feature, index) => {
    const card = document.createElement('div');
    
    // Cycle: 0=Primary (Olive), 1=White, 2=Secondary (Light Olive)
    const cycle = index % 2;
    let variantClass = 'card-variant-white'; 
    if (cycle === 0) variantClass = 'card-variant-primary';
    

    card.className = `feature-card ${variantClass}`;
    if (feature.status === 'coming-soon') {
        card.style.opacity = '0.85'; 
    }
    
    // Icon
    const iconBox = document.createElement('div');
    iconBox.className = 'feature-icon-box';
    if (feature.status === 'coming-soon') {
      iconBox.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`;
    } else {
      iconBox.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
    }
    card.appendChild(iconBox);

    // Title
    const title = document.createElement('h3');
    title.className = 'feature-title';
    title.textContent = feature.title;
    card.appendChild(title);
    
    // Description List (Updated Logic)
    const list = document.createElement('ul');
    list.className = 'feature-list';
    
    feature.description.forEach(text => {
        const li = document.createElement('li');
        li.textContent = text;
        list.appendChild(li);
    });
    
    card.appendChild(list);
    
    // Status Badge
    if (feature.status) {
      const status = document.createElement('span');
      status.textContent = feature.status === 'coming-soon' ? 'Coming Soon' : 'Available';
      status.className = `status-badge status-${feature.status}`;
      card.appendChild(status);
    }
    
    grid.appendChild(card);
  });
  
  container.appendChild(grid);
  return container;
}
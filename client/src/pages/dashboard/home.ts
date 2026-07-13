import { createFeedbackForm } from '../../components/feedback-form';
import type { Feature } from '../../components/features-section';
import { createFeaturesSection } from '../../components/features-section';
import { createBusinessCard } from '../../components/business-card';
import type { BusinessCardData } from '../../components/business-card';
import { getBusinesses } from '../../services/business.service';
import { getUser } from '../../utils/auth.utils';

function injectHomeStyles() {
  if (document.getElementById('dashboard-home-styles')) return;

  const style = document.createElement('style');
  style.id = 'dashboard-home-styles';
  style.textContent = `
    :root {
      --primary: #636b2f;
      --primary-dark: #4a5122;
      --secondary: #bac095;
      --text-main: #1a1a1a;
      --text-white: #ffffff;
      --bg-ash: #f5f5f5;
    }
    
    .dashboard-home {
      min-height: 100vh;
      background: var(--bg-ash);
      padding: 80px 20px 60px;
    }

    .dashboard-home-container {
      max-width: 1200px;
      margin: 0 auto;
      background: var(--bg-ash);
    }

    .hero-section {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.5);
      border-radius: 12px;
      padding: 50px 30px;
      text-align: center;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
      margin-bottom: 60px;
    }

    .hero-section h1 {
      font-size: 2.2rem;
      font-weight: 800;
      color: var(--text-main);
      margin: 0 0 20px 0;
      line-height: 1.3;
      letter-spacing: -0.5px;
    }

    .hero-section p {
      font-size: 1.05rem;
      color: #666;
      margin: 0 0 30px 0;
      line-height: 1.6;
      max-width: 600px;
      margin-left: auto;
      margin-right: auto;
    }

    .cta-button {
      background: var(--primary);
      color: var(--text-white);
      border: none;
      padding: 14px 32px;
      border-radius: 10px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.25s ease;
      box-shadow: 0 4px 12px rgba(99, 107, 47, 0.3);
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }

    .cta-button:hover {
      background: var(--primary-dark);
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(99, 107, 47, 0.4);
    }

    .cta-button:active {
      transform: translateY(0);
    }

    .cta-button-secondary {
      background: transparent;
      color: var(--primary);
      border: 2px solid var(--primary);
      box-shadow: none;
    }

    .cta-button-secondary:hover {
      background: rgba(99, 107, 47, 0.08);
      transform: translateY(-2px);
      box-shadow: none;
    }

    .hero-actions {
      display: flex;
      gap: 14px;
      justify-content: center;
      flex-wrap: wrap;
    }

    .section-spacing {
      margin-bottom: 60px;
    }

    /* --- Quick-access businesses grid for returning users --- */
    .quick-access-header {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      margin-bottom: 20px;
      gap: 12px;
      flex-wrap: wrap;
    }

    .quick-access-title {
      font-size: 1.3rem;
      font-weight: 800;
      color: var(--text-main);
      margin: 0;
    }

    .quick-access-viewall {
      color: var(--primary);
      font-weight: 600;
      font-size: 0.9rem;
      text-decoration: none;
    }

    .quick-access-viewall:hover {
      text-decoration: underline;
    }

    .quick-access-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: 16px;
    }

    @media (max-width: 768px) {
      .dashboard-home {
        padding: 80px 16px 40px;
      }

      .hero-section {
        padding: 40px 24px;
        margin-bottom: 40px;
      }

      .hero-section h1 {
        font-size: 1.75rem;
      }

      .hero-section p {
        font-size: 0.95rem;
      }

      .cta-button {
        width: 100%;
        justify-content: center;
        padding: 16px 24px;
      }

      .section-spacing {
        margin-bottom: 40px;
      }
    }
  `;
  document.head.appendChild(style);
}

export async function renderDashboardHome(): Promise<HTMLElement> {
  injectHomeStyles();

  const wrapper = document.createElement('div');
  wrapper.className = 'dashboard-home';

  const container = document.createElement('div');
  container.className = 'dashboard-home-container';

  // A returning owner with businesses already set up gets a different hero
  // than a brand new signup - showing "create your first bot" to someone
  // who already has three businesses running is exactly the kind of empty,
  // generic screen that prompted "I want to see something" in the first
  // place. Best-effort: if the fetch fails, fall back to the first-time
  // hero rather than blocking the page on it.
  let businesses: Awaited<ReturnType<typeof getBusinesses>> = [];
  try {
    businesses = await getBusinesses(1, 6);
  } catch {
    businesses = [];
  }

  const user = getUser();
  const heroSection = document.createElement('section');
  heroSection.className = 'hero-section';

  if (businesses.length > 0) {
    const heroTitle = document.createElement('h1');
    heroTitle.textContent = user?.firstName ? `Welcome back, ${user.firstName}` : 'Welcome back';
    heroSection.appendChild(heroTitle);

    const heroDesc = document.createElement('p');
    const count = businesses.length;
    heroDesc.textContent = count === 1
      ? 'You have one business set up. Add another, or jump back into managing it below.'
      : `You have ${count} businesses set up. Jump back into one below, or add another.`;
    heroSection.appendChild(heroDesc);

    const actions = document.createElement('div');
    actions.className = 'hero-actions';

    const manageBtn = document.createElement('button');
    manageBtn.className = 'cta-button';
    manageBtn.innerHTML = `
      <span>Manage Your Businesses</span>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="5" y1="12" x2="19" y2="12"></line>
        <polyline points="12 5 19 12 12 19"></polyline>
      </svg>
    `;
    manageBtn.addEventListener('click', () => {
      window.location.hash = '#/dashboard/businesses';
    });
    actions.appendChild(manageBtn);

    const addBtn = document.createElement('button');
    addBtn.className = 'cta-button cta-button-secondary';
    addBtn.textContent = '+ Add Another Business';
    addBtn.addEventListener('click', () => {
      window.location.hash = '#/dashboard/businesses/create';
    });
    actions.appendChild(addBtn);

    heroSection.appendChild(actions);
    container.appendChild(heroSection);

    const quickAccess = document.createElement('div');
    quickAccess.className = 'section-spacing';

    const quickHeader = document.createElement('div');
    quickHeader.className = 'quick-access-header';
    const quickTitle = document.createElement('h2');
    quickTitle.className = 'quick-access-title';
    quickTitle.textContent = 'Your businesses';
    quickHeader.appendChild(quickTitle);

    if (businesses.length >= 6) {
      const viewAll = document.createElement('a');
      viewAll.className = 'quick-access-viewall';
      viewAll.href = '#/dashboard/businesses';
      viewAll.textContent = 'View all →';
      quickHeader.appendChild(viewAll);
    }
    quickAccess.appendChild(quickHeader);

    const grid = document.createElement('div');
    grid.className = 'quick-access-grid';
    businesses.forEach((business: any) => {
      const cardData: BusinessCardData = {
        id: business._id,
        name: business.basicInfo.businessName,
        createdAt: business.createdAt,
        status: business.isActive ? 'active' : 'inactive',
        chatbotTone: business.customerSupport?.chatbotTone,
        vectorStatus: business.vectorInfo?.vectorStatus
      };
      grid.appendChild(createBusinessCard(cardData, `#/dashboard/businesses/${business._id}/edit`));
    });
    quickAccess.appendChild(grid);
    container.appendChild(quickAccess);
  } else {
    const heroTitle = document.createElement('h1');
    heroTitle.textContent = 'Welcome to FormaChat';
    heroSection.appendChild(heroTitle);

    const heroDesc = document.createElement('p');
    heroDesc.textContent = 'Create intelligent chatbots powered by your business knowledge. Deploy across multiple channels and automate your customer support instantly.';
    heroSection.appendChild(heroDesc);

    const ctaButton = document.createElement('button');
    ctaButton.className = 'cta-button';
    ctaButton.innerHTML = `
      <span>Create Your Business Bot</span>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="5" y1="12" x2="19" y2="12"></line>
        <polyline points="12 5 19 12 12 19"></polyline>
      </svg>
    `;
    ctaButton.addEventListener('click', () => {
      window.location.hash = '#/dashboard/businesses/create';
    });
    heroSection.appendChild(ctaButton);

    container.appendChild(heroSection);
  }

  const features: Feature[] = [
    {
      title: 'What\'s Live Now',
      description: [
        'AI agent answers questions instantly using your uploaded business data',
        'Install anywhere: website embed, direct link, or QR code',
        'Automatic lead capture with instant email notifications to you',
        'Conversation tracking, analytics, and lead export to CSV',
        'Custom AI tone, greeting, and additional instructions per business',
        'Weekly performance digest delivered to your inbox every Monday'
      ],
      status: 'available'
    },
    {
      title: 'Coming Soon',
      description: [
        'Human handoff: join a live conversation when the AI needs backup',
        'WhatsApp and Telegram channel integrations',
        'Developer API and API key access for custom builds',
        'OAuth login (Google, GitHub)',
        'Voice AI agents for phone support',
        'Direct sales and payment processing through the chat widget'
      ],
      status: 'coming-soon'
    }
  ];
  
  const featuresWrapper = document.createElement('div');
  featuresWrapper.className = 'section-spacing';
  featuresWrapper.appendChild(createFeaturesSection(features));
  container.appendChild(featuresWrapper);
  
  const feedbackWrapper = document.createElement('div');
  feedbackWrapper.className = 'section-spacing';
  feedbackWrapper.appendChild(createFeedbackForm());
  container.appendChild(feedbackWrapper);
  
  wrapper.appendChild(container);
  return wrapper;
}
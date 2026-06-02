import { createFeedbackForm } from '../../components/feedback-form';
import type { Feature } from '../../components/features-section';
import { createFeaturesSection } from '../../components/features-section';

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

    .section-spacing {
      margin-bottom: 60px;
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

export function renderDashboardHome(): HTMLElement {
  injectHomeStyles();

  const wrapper = document.createElement('div');
  wrapper.className = 'dashboard-home';
  
  const container = document.createElement('div');
  container.className = 'dashboard-home-container';
  
  const heroSection = document.createElement('section');
  heroSection.className = 'hero-section';
  
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
  
  const features: Feature[] = [
    {
      title: 'Beta Perks 🎁',
      description: [
      // Use "FREE" for emphasis
      '100% Free access during the entire beta period',
      '40% off the subscription for the first 6 months after launch',
      // Grouping related ideas
      'Priority support from the core team',
      'Direct input on future feature roadmap and design',
      'First access to all new features before public release'
      ],
      status: 'available'
    },
    {
      title: 'What\'s Live Now ✅',
      description: [
        // Emphasize the core mechanism
        'AI agent answers questions instantly using your business info',
        'Install anywhere: website embed, direct link, or QR code',
        'Automatic lead capture, conversation tracking, and data export',
        'Instant business data updates with real-time AI knowledge base adaptation',
        'Seamless conversation handoff to a human agent when needed (if applicable)' // Added useful feature
      ],
      status: 'available'
    },
    {
      title: 'Coming Soon 🚀',
      description: [
        'Real-time lead alerts: instant notifications when prospects engage and share contact information.',
        'Advanced Integrations: WhatsApp and Telegram',
        'AI agents for voice conversation support',
        'Direct sales & payment processing through the chat widget',
        'Developer API and API key access for custom builds',
        'OAuth login (Google, GitHub) and enhanced team features'
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
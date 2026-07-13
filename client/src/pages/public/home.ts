import { createFeaturesSection } from '../../components/features-section';
import type { Feature } from '../../components/features-section';

export function renderHome(): HTMLElement {

  const style = document.createElement('style');
  style.textContent = `
    :root {
      --primary: #636b2f;
      --primary-dark: #4f5625;
      --secondary: #bac095;
      --text-main: #1a1a1a;
      --text-muted: #666;
      --light-olive: #f4f6ea;
    }

    .home-container {
      max-width: 1000px;
      margin: 0 auto;
      padding: 40px 20px 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      overflow-x: hidden;
    }

    /* Animations */
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .hero-section {
      text-align: center;
      margin-bottom: 60px;
    }

    .animate-item {
      opacity: 0;
      animation: fadeInUp 0.8s ease forwards;
    }

    .delay-1 { animation-delay: 0.1s; }
    .delay-2 { animation-delay: 0.2s; }
    .delay-3 { animation-delay: 0.3s; }
    .delay-4 { animation-delay: 0.4s; }
    .delay-5 { animation-delay: 0.5s; }

    h1.hero-title {
      font-size: clamp(2.5rem, 5vw, 4rem);
      margin: 0 0 20px 0;
      color: var(--text-main);
      line-height: 1.1;
      font-weight: 800;
      letter-spacing: -0.02em;
    }

    p.hero-subtitle {
      font-size: clamp(1.1rem, 2vw, 1.25rem);
      color: var(--text-muted);
      margin: 0 auto 30px auto;
      max-width: 600px;
      line-height: 1.6;
    }

    .button-group {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 15px;
      margin-top: 30px;
    }

    @media (min-width: 600px) {
      .button-group {
        flex-direction: row;
        justify-content: center;
      }
    }

    .btn {
      padding: 14px 32px;
      text-decoration: none !important;
      border-radius: 8px;
      font-weight: 600;
      transition: all 0.2s ease;
      font-size: 16px;
      width: 100%;
      box-sizing: border-box;
      cursor: pointer;
    }

    @media (min-width: 600px) {
      .btn { width: auto; }
    }

    .btn-login {
      background: var(--secondary);
      color: white !important;
    }
    .btn-login:hover {
      background: #a3a980;
      transform: translateY(-2px);
      color: white !important;
    }

    .btn-register {
      background: var(--primary);
      color: white !important;
      box-shadow: 0 10px 15px -3px rgba(99, 107, 47, 0.3);
    }
    .btn-register:hover {
      background: var(--primary-dark);
      transform: translateY(-2px);
      box-shadow: 0 20px 25px -5px rgba(99, 107, 47, 0.4);
      color: white !important;
    }

    .trust-signal {
      margin-top: 40px;
      color: #999;
      font-size: 14px;
      letter-spacing: 0.5px;
    }

    /* --- Screenshot showcase: real product screenshots, not placeholders --- */
    .showcase-section {
      margin: 20px 0 80px;
      animation: fadeInUp 1s ease forwards 0.5s;
      opacity: 0;
    }

    .showcase-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
    }

    .showcase-card {
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 14px;
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(0,0,0,0.06);
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }

    .showcase-card:hover {
      transform: translateY(-6px);
      box-shadow: 0 16px 40px rgba(0,0,0,0.1);
    }

    .showcase-card img {
      width: 100%;
      display: block;
      border-bottom: 1px solid #f0f0f0;
    }

    .showcase-caption {
      padding: 14px 16px;
      font-size: 0.9rem;
      font-weight: 600;
      color: var(--text-main);
    }

    @media (max-width: 700px) {
      .showcase-grid {
        grid-template-columns: 1fr;
      }
    }

    /* --- How it works --- */
    .section {
      margin-bottom: 80px;
    }

    .section-header {
      text-align: center;
      margin-bottom: 40px;
    }

    .section-title {
      font-size: 1.8rem;
      font-weight: 800;
      color: var(--text-main);
      margin: 0 0 8px 0;
      letter-spacing: -0.5px;
    }

    .section-subtitle {
      color: var(--text-muted);
      font-size: 0.95rem;
      margin: 0;
    }

    .steps-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
    }

    .step-card {
      text-align: center;
      padding: 20px;
    }

    .step-number {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: var(--primary);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 1.2rem;
      margin: 0 auto 18px;
    }

    .step-title {
      font-size: 1.1rem;
      font-weight: 700;
      color: var(--text-main);
      margin: 0 0 10px;
    }

    .step-desc {
      font-size: 0.92rem;
      color: var(--text-muted);
      line-height: 1.6;
      margin: 0;
    }

    @media (max-width: 700px) {
      .steps-grid { grid-template-columns: 1fr; }
    }

    /* --- FAQ --- */
    .faq-list {
      max-width: 720px;
      margin: 0 auto;
    }

    .faq-item {
      border-bottom: 1px solid #e5e7eb;
    }

    .faq-question {
      width: 100%;
      background: none;
      border: none;
      text-align: left;
      padding: 20px 4px;
      font-size: 1rem;
      font-weight: 700;
      color: var(--text-main);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      font-family: inherit;
    }

    .faq-question svg {
      flex-shrink: 0;
      transition: transform 0.25s ease;
      color: var(--primary);
    }

    .faq-item.open .faq-question svg {
      transform: rotate(180deg);
    }

    .faq-answer {
      max-height: 0;
      overflow: hidden;
      transition: max-height 0.3s ease;
    }

    .faq-answer p {
      margin: 0 4px 20px;
      color: var(--text-muted);
      font-size: 0.92rem;
      line-height: 1.65;
    }

    /* --- Footer --- */
    .home-footer {
      border-top: 1px solid #e5e7eb;
      margin-top: 60px;
      padding: 40px 0;
    }

    .footer-inner {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      text-align: center;
    }

    .footer-brand {
      font-weight: 800;
      font-size: 1.1rem;
      color: var(--primary);
    }

    .footer-links {
      display: flex;
      gap: 24px;
      flex-wrap: wrap;
      justify-content: center;
    }

    .footer-links a {
      color: var(--text-muted);
      text-decoration: none;
      font-size: 0.9rem;
      font-weight: 600;
    }

    .footer-links a:hover {
      color: var(--primary);
    }

    .footer-copy {
      color: #999;
      font-size: 0.82rem;
    }
  `;
  document.head.appendChild(style);

  const container = document.createElement('div');
  container.className = 'home-container';

  // === HERO ===
  const hero = document.createElement('div');
  hero.className = 'hero-section';

  const title = document.createElement('h1');
  title.className = 'hero-title animate-item delay-2';
  title.innerHTML = 'Never Miss a Customer<br/>Question Again';
  hero.appendChild(title);

  const subtitle = document.createElement('p');
  subtitle.className = 'hero-subtitle animate-item delay-3';
  subtitle.textContent = 'Automate your support with an AI agent that knows your business. Setup takes 5 minutes, works 24/7, and answers customers instantly so you can focus on growing.';
  hero.appendChild(subtitle);

  const buttonSection = document.createElement('div');
  buttonSection.className = 'button-group animate-item delay-4';

  const registerBtn = document.createElement('a');
  registerBtn.href = '#/register';
  registerBtn.textContent = 'Get Started Free';
  registerBtn.className = 'btn btn-register';
  buttonSection.appendChild(registerBtn);

  const loginBtn = document.createElement('a');
  loginBtn.href = '#/login';
  loginBtn.textContent = 'Login';
  loginBtn.className = 'btn btn-login';
  buttonSection.appendChild(loginBtn);

  hero.appendChild(buttonSection);

  const trustSignal = document.createElement('p');
  trustSignal.className = 'trust-signal animate-item delay-5';
  trustSignal.innerHTML = '✓ No credit card required &nbsp;•&nbsp; ✓ Setup in 5 minutes &nbsp;•&nbsp; ✓ Instant 24/7 responses';
  hero.appendChild(trustSignal);

  container.appendChild(hero);

  // === SCREENSHOT SHOWCASE (real product screenshots) ===
  const showcase = document.createElement('div');
  showcase.className = 'showcase-section';
  const showcaseGrid = document.createElement('div');
  showcaseGrid.className = 'showcase-grid';

  const showcaseItems = [
    { src: '/assets/shot1.png', caption: 'Track sessions, leads, and conversions' },
    { src: '/assets/shot5.png', caption: 'Test your bot before it goes live' },
    { src: '/assets/shot3.png', caption: 'Share a QR code, no app required' },
  ];

  showcaseItems.forEach(item => {
    const card = document.createElement('div');
    card.className = 'showcase-card';
    const img = document.createElement('img');
    img.src = item.src;
    img.alt = item.caption;
    img.loading = 'lazy';
    card.appendChild(img);
    const caption = document.createElement('div');
    caption.className = 'showcase-caption';
    caption.textContent = item.caption;
    card.appendChild(caption);
    showcaseGrid.appendChild(card);
  });

  showcase.appendChild(showcaseGrid);
  container.appendChild(showcase);

  // === HOW IT WORKS ===
  const howItWorks = document.createElement('div');
  howItWorks.className = 'section';

  const howHeader = document.createElement('div');
  howHeader.className = 'section-header';
  const howTitle = document.createElement('h2');
  howTitle.className = 'section-title';
  howTitle.textContent = 'How it works';
  howHeader.appendChild(howTitle);
  const howSub = document.createElement('p');
  howSub.className = 'section-subtitle';
  howSub.textContent = 'From signup to your first customer conversation in about five minutes.';
  howHeader.appendChild(howSub);
  howItWorks.appendChild(howHeader);

  const stepsGrid = document.createElement('div');
  stepsGrid.className = 'steps-grid';

  const steps = [
    {
      title: 'Tell us about your business',
      desc: 'Paste your website text or upload a document. FormaChat drafts your business profile automatically, so you are not starting from a blank form.'
    },
    {
      title: 'Add your products and documents',
      desc: 'Add product photos, prices, and stock, and upload PDFs or manuals so your AI has real answers, not guesses.'
    },
    {
      title: 'Embed one script tag',
      desc: 'Copy one line of code onto your site, or share a direct link or QR code. Your chatbot is live and answering customers.'
    }
  ];

  steps.forEach((step, i) => {
    const card = document.createElement('div');
    card.className = 'step-card';
    const num = document.createElement('div');
    num.className = 'step-number';
    num.textContent = String(i + 1);
    card.appendChild(num);
    const t = document.createElement('h3');
    t.className = 'step-title';
    t.textContent = step.title;
    card.appendChild(t);
    const d = document.createElement('p');
    d.className = 'step-desc';
    d.textContent = step.desc;
    card.appendChild(d);
    stepsGrid.appendChild(card);
  });

  howItWorks.appendChild(stepsGrid);
  container.appendChild(howItWorks);

  // === FEATURES (reuses the same component the dashboard home page uses) ===
  const features: Feature[] = [
    {
      title: 'Available today',
      description: [
        'AI chatbot trained on your own business data, not generic answers',
        'Live product catalog with real time stock and pricing',
        'Document knowledge base: upload PDFs and manuals',
        'Embeddable widget, customizable to match your brand',
        'Automatic lead capture with instant notifications',
        'Analytics dashboard with sessions, leads, and CSV export',
        'Webhooks to connect your CRM, Zapier, or any tool',
        'Two factor authentication and secure multi device sessions'
      ],
      status: 'available'
    },
    {
      title: 'Coming next',
      description: [
        'Live streaming responses',
        'Multi language support',
        'Human handoff for conversations that need a real person',
        'WhatsApp, Telegram, and Instagram integrations',
        'Simple pricing plans as FormaChat grows with you',
        'A developer API and SDK for custom integrations'
      ],
      status: 'coming-soon'
    }
  ];

  const featuresSection = document.createElement('div');
  featuresSection.className = 'section';
  featuresSection.appendChild(createFeaturesSection(features));
  container.appendChild(featuresSection);

  // === FAQ ===
  const faqSection = document.createElement('div');
  faqSection.className = 'section';
  const faqHeader = document.createElement('div');
  faqHeader.className = 'section-header';
  const faqTitle = document.createElement('h2');
  faqTitle.className = 'section-title';
  faqTitle.textContent = 'Questions people actually ask';
  faqHeader.appendChild(faqTitle);
  faqSection.appendChild(faqHeader);

  const faqList = document.createElement('div');
  faqList.className = 'faq-list';

  const faqs = [
    {
      q: 'Is my business data safe?',
      a: 'Yes. Accounts are protected with two factor authentication, breach checked passwords, and secure session management, and you can sign out any device at any time from your settings.'
    },
    {
      q: 'Do I need to be technical to set this up?',
      a: 'No. You can paste your website text or upload a document and FormaChat drafts your business profile for you. Going live just means copying one script tag onto your site.'
    },
    {
      q: 'Can I control what the chatbot says?',
      a: 'Yes. You set the tone, a custom greeting, and any restrictions or instructions the AI should follow, and it only answers from the information and products you give it.'
    },
    {
      q: 'Does it work on mobile?',
      a: 'Yes. The chat widget is fully responsive and switches to a full screen layout on phones, and your dashboard works the same way on any device.'
    },
    {
      q: 'What happens if I want to stop using FormaChat?',
      a: 'Deactivating your account signs you out everywhere immediately. If you change your mind, logging back in within 30 days reactivates your account automatically.'
    }
  ];

  faqs.forEach(item => {
    const faqItem = document.createElement('div');
    faqItem.className = 'faq-item';

    const question = document.createElement('button');
    question.type = 'button';
    question.className = 'faq-question';
    question.innerHTML = `<span>${item.q}</span><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>`;

    const answer = document.createElement('div');
    answer.className = 'faq-answer';
    const answerP = document.createElement('p');
    answerP.textContent = item.a;
    answer.appendChild(answerP);

    question.addEventListener('click', () => {
      const isOpen = faqItem.classList.contains('open');
      faqItem.classList.toggle('open', !isOpen);
      answer.style.maxHeight = isOpen ? '0' : `${answer.scrollHeight}px`;
    });

    faqItem.appendChild(question);
    faqItem.appendChild(answer);
    faqList.appendChild(faqItem);
  });

  faqSection.appendChild(faqList);
  container.appendChild(faqSection);

  // === FOOTER ===
  const footer = document.createElement('footer');
  footer.className = 'home-footer';
  const footerInner = document.createElement('div');
  footerInner.className = 'footer-inner';

  const footerBrand = document.createElement('div');
  footerBrand.className = 'footer-brand';
  footerBrand.textContent = 'FormaChat';
  footerInner.appendChild(footerBrand);

  const footerLinks = document.createElement('div');
  footerLinks.className = 'footer-links';
  footerLinks.innerHTML = `
    <a href="#/register">Get Started</a>
    <a href="#/login">Login</a>
    <a href="mailto:support@formachat.com">Contact</a>
  `;
  footerInner.appendChild(footerLinks);

  const footerCopy = document.createElement('div');
  footerCopy.className = 'footer-copy';
  footerCopy.textContent = `© ${new Date().getFullYear()} FormaChat. All rights reserved.`;
  footerInner.appendChild(footerCopy);

  footer.appendChild(footerInner);
  container.appendChild(footer);

  return container;
}

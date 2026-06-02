export function renderHome(): HTMLElement {
 
  const style = document.createElement('style');
  style.textContent = `
    :root {
      --primary: #636b2f;
      --secondary: #bac095;
      --text-main: #1a1a1a;
      --text-muted: #666;
      --badge-bg: #D1FAE5;
      --badge-text: #059669;
    }

    .home-container {
      max-width: 1000px;
      margin: 0 auto;
      padding: 40px 20px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      overflow: hidden; /* Prevents animation scrollbars */
      min-height: 100vh; /* Add this - ensures container fills viewport */
      overflow-x: hidden;
    }

    /* Animations */
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes float {
      0% { transform: translateY(0px); }
      50% { transform: translateY(-10px); }
      100% { transform: translateY(0px); }
    }

    @keyframes glow {
      0% { box-shadow: 0 0 20px rgba(99, 107, 47, 0.1); }
      50% { box-shadow: 0 0 40px rgba(99, 107, 47, 0.3); }
      100% { box-shadow: 0 0 20px rgba(99, 107, 47, 0.1); }
    }

    .hero-section {
      text-align: center;
      margin-bottom: 60px;
    }

    .animate-item {
      opacity: 0; /* Start hidden */
      animation: fadeInUp 0.8s ease forwards;
    }

    /* Stagger delays */
    .delay-1 { animation-delay: 0.1s; }
    .delay-2 { animation-delay: 0.2s; }
    .delay-3 { animation-delay: 0.3s; }
    .delay-4 { animation-delay: 0.4s; }
    .delay-5 { animation-delay: 0.5s; }

    .beta-badge {
      display: inline-block;
      padding: 8px 16px;
      background: var(--badge-bg);
      color: var(--badge-text);
      border-radius: 50px;
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 24px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    }

    h1.hero-title {
      font-size: clamp(2.5rem, 5vw, 4rem); /* Responsive font size */
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

    /* Button Styling */
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
      background: #a3a980; /* Slightly darker shade of secondary */
      transform: translateY(-2px);
      color: white !important;
    }

    .btn-register {
      background: var(--primary);
      color: white !important;
      box-shadow: 0 10px 15px -3px rgba(99, 107, 47, 0.3);
    }
    .btn-register:hover {
      background: #4f5625; /* Darker primary */
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

    /* The "Intrigue" Placeholder Graphic */
    .visual-placeholder {
    margin-top: 60px;
    position: relative;
    height: 300px;
    max-width: 800px;
    margin-left: auto;
    margin-right: auto;
    background: #f3f4f6;
    border: 1px solid #e5e7eb;
    border-radius: 12px 12px 0 0;
    box-shadow: 0 -20px 60px -10px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    animation: fadeInUp 1s ease forwards 0.6s;
    opacity: 0;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    grid-template-rows: repeat(2, 1fr);
    gap: 10px;
    padding: 10px;
  }

  .screenshot-box {
    background-size: cover;
    background-position: center;
    border-radius: 8px;
    animation: fadeBox 8s infinite;
    opacity: 0.8;
  }

  /* Stagger animation delays for each box */
  .screenshot-box:nth-child(1) { animation-delay: 0s; }
  .screenshot-box:nth-child(2) { animation-delay: 1s; }
  .screenshot-box:nth-child(3) { animation-delay: 2s; }
  .screenshot-box:nth-child(4) { animation-delay: 3s; }
  .screenshot-box:nth-child(5) { animation-delay: 4s; }
  .screenshot-box:nth-child(6) { animation-delay: 5s; }
  .screenshot-box:nth-child(7) { animation-delay: 6s; }
  .screenshot-box:nth-child(8) { animation-delay: 7s; }

  @keyframes fadeBox {
    0%, 100% { opacity: 0.6; transform: scale(1); }
    50% { opacity: 1; transform: scale(1.05); }
  }

    /* Abstract UI Elements to create "Placeholder Vibe" */
    .abstract-sidebar {
      position: absolute;
      left: 0; top: 0; bottom: 0;
      width: 20%;
      background: white;
      border-right: 1px solid #e5e7eb;
    }
    .abstract-header {
      position: absolute;
      top: 0; left: 20%; right: 0;
      height: 50px;
      border-bottom: 1px solid #e5e7eb;
      background: var(--primary);
    }
    .abstract-bubble {
      position: absolute;
      left: 25%;
      height: 12px;
      background: #e5e7eb;
      border-radius: 6px;
    }
    
    /* Floating Interaction Card */
    .floating-card {
      position: absolute;
      top: 40px;
      left: 50%;
      transform: translateX(-50%);
      width: 60%;
      height: 180px;
      background: 
    linear-gradient(180deg, rgba(255,255,255,0.1) 0%, rgba(243,244,246,0.3) 100%),
    url('/assets/shot1.png') center/cover no-repeat;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255,255,255,0.8);
      border-radius: 16px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.08);
      animation: float 6s ease-in-out infinite;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }
    
    .loading-pulse {
      width: 80px;
      height: 80px;
      border-radius:50%;
      background: transparent;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--badge-text);
      font-size: 20px;
      margin-bottom: 15px;
      animation: glow 3s infinite;
    }
    
    .loading-line {
      height: 8px;
      background: #f3f4f6;
      border-radius: 4px;
      width: 70%;
      margin-bottom: 10px;
    }
  `;
  document.head.appendChild(style);

  const container = document.createElement('div');
  container.className = 'home-container';

  const hero = document.createElement('div');
  hero.className = 'hero-section';

  const betaBadge = document.createElement('div');
  betaBadge.className = 'beta-badge animate-item delay-1';
  betaBadge.innerHTML = '🎉 FREE for Beta Users - Limited Spots!';
  hero.appendChild(betaBadge);

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
  registerBtn.textContent = 'Start Free Beta Access';
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

  const visual = document.createElement('div');
  visual.className = 'visual-placeholder';

  const screenshots = [
    '/assets/shot1.png',
    '/assets/logo.png',
    '/assets/shot2.png',
    '/assets/shot3.png',
    '/assets/logo.png',
    '/assets/shot3.png',
    '/assets/logo.png',
    '/assets/shot5.png'
  ];

  screenshots.forEach(src => {
    const box = document.createElement('div');
    box.className = 'screenshot-box';
    box.style.backgroundImage = `url('${src}')`;
    visual.appendChild(box);
  });

  
  const sidebar = document.createElement('div');
  sidebar.className = 'abstract-sidebar';
  visual.appendChild(sidebar);
  
  const header = document.createElement('div');
  header.className = 'abstract-header';
  visual.appendChild(header);

  const floatingCard = document.createElement('div');
  floatingCard.className = 'floating-card';
  
  const icon = document.createElement('img');
  icon.src = '/assets/logo.png';
  icon.className = 'loading-pulse';
  icon.style.width = '40px';
  icon.style.height = '40px';
  icon.style.objectFit = 'contain';
  floatingCard.appendChild(icon);
  
  const line1 = document.createElement('div');
  line1.className = 'loading-line';
  floatingCard.appendChild(line1);
  
  const line2 = document.createElement('div');
  line2.className = 'loading-line';
  line2.style.width = '50%';
  floatingCard.appendChild(line2);

  visual.appendChild(floatingCard);
  hero.appendChild(visual);

  container.appendChild(hero);

  return container;
}
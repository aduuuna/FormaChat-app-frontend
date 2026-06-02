import { createBreadcrumb } from '../../../components/breadcrumb';
import { createLoadingSpinner, hideLoadingSpinner } from '../../../components/loading-spinner';
import { getBusinessById } from '../../../services/business.service';
import { showModal } from '../../../components/modal';
import QRCode from 'qrcode';

function injectChannelStyles() {
  if (document.getElementById('channels-detail-styles')) return;

  const style = document.createElement('style');
  style.id = 'channels-detail-styles';
  style.textContent = `
    :root {
      --primary: #636b2f;
      --primary-hover: #4a5122;
      --secondary: #bac095;
      --text-main: #1a1a1a;
      --text-muted: #666;
      --bg-glass: rgba(255, 255, 255, 0.85);
      --code-bg: #1e293b;
      --code-text: #e2e8f0;
    }

    .channels-detail {
      padding: 0 20px 60px;
      max-width: 1200px;
      margin: 0 auto;
    }

    /* Header */
    .page-header { 
      margin-bottom: 32px; 
      text-align: center; 
    }
    .page-header h1 { 
      font-size: 1.75rem; 
      font-weight: 800; 
      color: var(--text-main); 
      margin-bottom: 8px; 
    }
    .page-description { 
      color: var(--text-muted); 
      font-size: 0.95rem; 
      max-width: 650px; 
      line-height: 1.6;
      margin: 0 auto;
    }

    /* Layout Grid */
    .channels-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 20px;
    }

    /* Glass Cards */
    .glass-card {
      background: var(--bg-glass);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255,255,255,0.6);
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 2px 12px rgba(0,0,0,0.04);
      transition: all 0.2s ease;
    }
    .glass-card:hover { 
      box-shadow: 0 4px 20px rgba(0,0,0,0.06); 
    }

    .card-title {
      font-size: 1.1rem; 
      font-weight: 700; 
      margin: 0 0 6px 0; 
      color: var(--text-main);
      display: flex; 
      align-items: center; 
      gap: 8px;
    }
    .card-desc { 
      color: var(--text-muted); 
      font-size: 0.88rem; 
      margin-bottom: 20px; 
      line-height: 1.5;
    }

    /* Test Bot Button */
    .test-bot-btn {
      background: var(--primary);
      color: white;
      border: none;
      width: 100%;
      padding: 14px;
      border-radius: 10px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      display: flex; 
      align-items: center; 
      justify-content: center; 
      gap: 8px;
      box-shadow: 0 4px 15px rgba(99, 107, 47, 0.25);
      transition: all 0.2s;
    }
    .test-bot-btn:hover { 
      background: var(--primary-hover); 
      transform: translateY(-1px);
      box-shadow: 0 6px 20px rgba(99, 107, 47, 0.3);
    }
    .test-bot-btn:active {
      transform: translateY(0);
    }

    /* Input Groups */
    .input-group-wrapper {
      margin-bottom: 16px;
    }
    .input-group-wrapper:last-child {
      margin-bottom: 0;
    }
    .input-label {
      display: block;
      margin-bottom: 6px;
      font-weight: 600;
      font-size: 0.85rem;
      color: var(--text-main);
    }
    .input-group {
      display: flex;
      align-items: stretch;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      overflow: hidden;
      transition: border-color 0.2s;
      background: white;
    }
    .input-group:focus-within { 
      border-color: var(--primary); 
      box-shadow: 0 0 0 3px rgba(99, 107, 47, 0.08); 
    }
    
    .url-input {
      flex: 1; 
      border: none; 
      padding: 10px 12px; 
      font-size: 0.85rem; 
      color: var(--text-main); 
      background: transparent; 
      outline: none;
      font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
    }
    .copy-btn {
      background: transparent; 
      border: none; 
      border-left: 1px solid #e2e8f0; 
      padding: 0 16px;
      cursor: pointer; 
      font-weight: 600; 
      font-size: 0.85rem;
      color: var(--primary); 
      transition: all 0.2s;
      white-space: nowrap;
    }
    .copy-btn:hover { 
      background: #f8fafc; 
    }

    /* Code Type Selector */
    .code-type-selector {
      display: flex;
      gap: 8px;
      margin-bottom: 12px;
      padding: 4px;
      background: rgba(0,0,0,0.03);
      border-radius: 8px;
    }
    .code-type-btn {
      flex: 1;
      padding: 8px 12px;
      border: none;
      background: transparent;
      color: var(--text-muted);
      font-size: 0.85rem;
      font-weight: 600;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .code-type-btn.active {
      background: white;
      color: var(--primary);
      box-shadow: 0 2px 4px rgba(0,0,0,0.06);
    }
    .code-type-btn:hover:not(.active) {
      color: var(--text-main);
    }

    /* QR Code */
    .qr-section {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .qr-content {
      display: flex;
      align-items: center;
      justify-content: center;
      background: white;
      border-radius: 10px;
      padding: 20px;
      border: 2px dashed #e2e8f0;
      min-height: 200px;
    }
    .qr-content.has-qr {
      border: 1px solid #e2e8f0;
      border-style: solid;
    }
    .qr-placeholder {
      color: #999;
      font-size: 0.9rem;
      text-align: center;
    }
    .qr-actions { 
      display: grid; 
      grid-template-columns: 1fr 1fr; 
      gap: 10px; 
    }
    .btn-secondary {
      background: white; 
      border: 1px solid #e2e8f0; 
      color: var(--text-main);
      padding: 10px 16px; 
      border-radius: 8px; 
      font-weight: 600; 
      font-size: 0.9rem;
      cursor: pointer; 
      transition: all 0.2s;
    }
    .btn-secondary:hover:not(:disabled) { 
      background: #f8fafc; 
      border-color: var(--primary);
      transform: translateY(-1px);
    }
    .btn-secondary:disabled { 
      opacity: 0.5; 
      cursor: not-allowed; 
    }

    /* Tips */
    .tips-list { 
      list-style: none; 
      padding: 0; 
      margin: 0; 
    }
    .tip-item {
      display: flex; 
      align-items: flex-start; 
      gap: 10px;
      padding: 10px 12px; 
      background: rgba(255,255,255,0.5); 
      border-radius: 8px; 
      margin-bottom: 8px;
      font-size: 0.88rem; 
      color: var(--text-main);
      line-height: 1.5;
    }
    .tip-item:last-child {
      margin-bottom: 0;
    }
    .tip-icon { 
      color: var(--primary); 
      font-size: 1rem;
      flex-shrink: 0;
    }

    /* Desktop: 2 columns for main content */
    @media (min-width: 900px) {
      .page-header h1 { 
        font-size: 2rem; 
      }
      .page-description {
        font-size: 1rem;
      }
      
      .channels-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 24px;
      }
      
      .glass-card {
        padding: 28px;
      }
      
      .full-width {
        grid-column: 1 / -1;
      }
    }

    /* Tablet: Single column but wider */
    @media (min-width: 600px) and (max-width: 899px) {
      .channels-detail {
        padding: 0 24px 50px;
      }
      
      .channels-grid {
        max-width: 700px;
        margin: 0 auto;
      }
      
      .glass-card {
        padding: 24px;
      }
    }

    /* Mobile: Optimized spacing */
    @media (max-width: 599px) {
      .channels-detail {
        padding: 0 16px 40px;
      }
      
      .page-header {
        margin-bottom: 24px;
      }
      
      .page-header h1 {
        font-size: 1.5rem;
      }
      
      .glass-card {
        padding: 20px;
      }
      
      .card-title {
        font-size: 1rem;
      }
      
      .test-bot-btn {
        padding: 12px;
        font-size: 0.95rem;
      }
      
      .url-input {
        font-size: 0.75rem;
        padding: 9px 10px;
      }
      
      .copy-btn {
        padding: 0 12px;
        font-size: 0.8rem;
      }
      
      .qr-content {
        min-height: 180px;
        padding: 16px;
      }
      
      .qr-actions {
        grid-template-columns: 1fr;
      }
      
      .code-type-selector {
        flex-direction: column;
        gap: 6px;
      }
      
      .code-type-btn {
        padding: 10px 12px;
      }
    }
  `;
  document.head.appendChild(style);
}

export async function renderChannelsDetail(businessId: string): Promise<HTMLElement> {
  injectChannelStyles();

  const container = document.createElement('div');
  container.className = 'channels-detail';
  
  const spinner = createLoadingSpinner('Loading business details...');
  container.appendChild(spinner);
  
  try {
    const business = await getBusinessById(businessId);
    hideLoadingSpinner(spinner);
    
    const breadcrumb = createBreadcrumb([
      { label: 'Channels', path: '#/dashboard/channels' },
      { label: business.basicInfo.businessName }
    ]);
    container.appendChild(breadcrumb);
    
    const header = document.createElement('div');
    header.className = 'page-header';
    
    const title = document.createElement('h1');
    title.textContent = 'Distribution Channels';
    header.appendChild(title);
    
    const description = document.createElement('p');
    description.className = 'page-description';
    description.textContent = 'Test your chatbot, generate shareable links, or integrate it into your website.';
    header.appendChild(description);
    
    container.appendChild(header);

    const grid = document.createElement('div');
    grid.className = 'channels-grid';


    // const currentDomain = window.location.origin;
    const productionDomain = 'https://formachat.com'; 
    // const localChatUrl = `${currentDomain}/#/chat/${business._id}`;
    const prodChatUrl = `${productionDomain}/#/chat/${business._id}`;

    const testCard = document.createElement('section');
    testCard.className = 'glass-card';
    testCard.innerHTML = `
      <h2 class="card-title">Test Your Bot</h2>
      <p class="card-desc">Launch a live preview to test conversations before going public.</p>
    `;
    const testBtn = document.createElement('button');
    testBtn.className = 'test-bot-btn';
    testBtn.innerHTML = `
      <span>Launch Simulator</span> 
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
        <polyline points="15 3 21 3 21 9"></polyline>
        <line x1="10" y1="14" x2="21" y2="3"></line>
      </svg>
    `;
    testBtn.addEventListener('click', () => {
      window.open(prodChatUrl, '_blank', 'width=450,height=650');
    });
    testCard.appendChild(testBtn);
    grid.appendChild(testCard);

    const qrCard = document.createElement('section');
    qrCard.className = 'glass-card';
    qrCard.innerHTML = `
      <h2 class="card-title">QR Code</h2>
      <p class="card-desc">Perfect for print materials, menus, or in-store displays.</p>
    `;

    const qrSection = document.createElement('div');
    qrSection.className = 'qr-section';

    const qrContent = document.createElement('div');
    qrContent.className = 'qr-content';
    qrContent.innerHTML = '<div class="qr-placeholder">Click Generate to create QR code</div>';
    qrSection.appendChild(qrContent);

    const qrActions = document.createElement('div');
    qrActions.className = 'qr-actions';

    const btnGenerate = document.createElement('button');
    btnGenerate.className = 'btn-secondary';
    btnGenerate.textContent = 'Generate QR';
    
    const btnDownload = document.createElement('button');
    btnDownload.className = 'btn-secondary';
    btnDownload.textContent = 'Download PNG';
    btnDownload.disabled = true;

    btnGenerate.addEventListener('click', async () => {
      try {
        btnGenerate.textContent = 'Generating...';
        btnGenerate.disabled = true;
        
        const url = await QRCode.toDataURL(prodChatUrl, {
          width: 200,
          margin: 1,
          color: { dark: '#1a1a1a', light: '#FFFFFF' }
        });

        qrContent.innerHTML = `<img src="${url}" alt="QR Code" style="width: 100%; max-width: 200px; height: auto; display: block;">`;
        qrContent.classList.add('has-qr');
        
        btnDownload.disabled = false;
        btnDownload.dataset.url = url;
        
        btnGenerate.textContent = 'Regenerate';
        btnGenerate.disabled = false;
      } catch (e) {
        console.error(e);
        showModal({
          title: 'Error',
          content: '<p style="margin: 0;">Failed to generate QR code. Please try again.</p>',
          showCloseButton: true
        });
        btnGenerate.textContent = 'Generate QR';
        btnGenerate.disabled = false;
      }
    });

    btnDownload.addEventListener('click', () => {
      const url = btnDownload.dataset.url;
      if (!url) return;
      const link = document.createElement('a');
      link.href = url;
      link.download = `${business.basicInfo.businessName.replace(/\s+/g, '-')}-qr.png`;
      link.click();
    });

    qrActions.appendChild(btnGenerate);
    qrActions.appendChild(btnDownload);
    qrSection.appendChild(qrActions);
    qrCard.appendChild(qrSection);
    grid.appendChild(qrCard);

    const shareCard = document.createElement('section');
    shareCard.className = 'glass-card full-width';
    shareCard.innerHTML = `
      <h2 class="card-title">Share & Embed</h2>
      <p class="card-desc">Direct links and embed codes for your website or social media.</p>
    `;
    
    shareCard.appendChild(createInputGroup('Chat Link', prodChatUrl));
    
    const embedWrapper = document.createElement('div');
    embedWrapper.className = 'input-group-wrapper';
    
    const embedLabel = document.createElement('label');
    embedLabel.className = 'input-label';
    embedLabel.textContent = 'Website Embed Code';
    embedWrapper.appendChild(embedLabel);
    
    const codeSelector = document.createElement('div');
    codeSelector.className = 'code-type-selector';
    
    const widgetBtn = document.createElement('button');
    widgetBtn.className = 'code-type-btn active';
    widgetBtn.textContent = 'Widget (Recommended)';
    widgetBtn.dataset.type = 'widget';
    
    const iframeBtn = document.createElement('button');
    iframeBtn.className = 'code-type-btn';
    iframeBtn.textContent = 'Iframe';
    iframeBtn.dataset.type = 'iframe';
    
    codeSelector.appendChild(widgetBtn);
    codeSelector.appendChild(iframeBtn);
    embedWrapper.appendChild(codeSelector);
    
    // Code snippets
    const widgetScript = `<script src="https://formachat.com/widget.js"></script>
<script>FormachatWidget.init({ businessId: '${business._id}' });</script>`;
    
    const iframeScript = `<iframe src="${prodChatUrl}" width="100%" height="600" frameborder="0"></iframe>`;
    
    const embedGroup = document.createElement('div');
    embedGroup.className = 'input-group';
    
    const embedInput = document.createElement('input');
    embedInput.type = 'text';
    embedInput.className = 'url-input';
    embedInput.readOnly = true;
    embedInput.value = widgetScript;
    embedInput.addEventListener('click', () => embedInput.select());
    
    const embedCopyBtn = document.createElement('button');
    embedCopyBtn.className = 'copy-btn';
    embedCopyBtn.textContent = 'Copy';
    
    embedCopyBtn.addEventListener('click', async () => {
      await navigator.clipboard.writeText(embedInput.value);
      embedCopyBtn.textContent = 'Copied!';
      embedCopyBtn.style.color = '#059669';
      setTimeout(() => {
        embedCopyBtn.textContent = 'Copy';
        embedCopyBtn.style.color = '';
      }, 2000);
    });
    
    const toggleCodeType = (type: string) => {
      widgetBtn.classList.toggle('active', type === 'widget');
      iframeBtn.classList.toggle('active', type === 'iframe');
      embedInput.value = type === 'widget' ? widgetScript : iframeScript;
    };
    
    widgetBtn.addEventListener('click', () => toggleCodeType('widget'));
    iframeBtn.addEventListener('click', () => toggleCodeType('iframe'));
    
    embedGroup.appendChild(embedInput);
    embedGroup.appendChild(embedCopyBtn);
    embedWrapper.appendChild(embedGroup);
    shareCard.appendChild(embedWrapper);
    
    grid.appendChild(shareCard);

    const tipsCard = document.createElement('section');
    tipsCard.className = 'glass-card full-width';
    tipsCard.innerHTML = `
      <h2 class="card-title">💡 Quick Tips</h2>
      <ul class="tips-list">
        <li class="tip-item">
          <span class="tip-icon">✓</span>
          <span>Add the chat link to your email signature for instant customer support</span>
        </li>
        <li class="tip-item">
          <span class="tip-icon">✓</span>
          <span>Print the QR code on receipts, menus, or business cards</span>
        </li>
        <li class="tip-item">
          <span class="tip-icon">✓</span>
          <span>Share the link in your Instagram, Twitter, or LinkedIn bio</span>
        </li>
        <li class="tip-item">
          <span class="tip-icon">✓</span>
          <span>Use the floating widget for seamless website integration</span>
        </li>
      </ul>
    `;
    grid.appendChild(tipsCard);

    container.appendChild(grid);

  } catch (error) {
    hideLoadingSpinner(spinner);
    const err = document.createElement('div');
    err.className = 'glass-card';
    err.style.color = 'var(--text-main)';
    err.style.textAlign = 'center';
    err.style.padding = '40px 20px';
    err.textContent = 'Failed to load channel details. Please try again.';
    container.appendChild(err);
    console.error(error);
  }
  
  return container;
}

function createInputGroup(label: string, value: string): HTMLElement {
  const wrapper = document.createElement('div');
  wrapper.className = 'input-group-wrapper';
  
  const lbl = document.createElement('label');
  lbl.className = 'input-label';
  lbl.textContent = label;
  wrapper.appendChild(lbl);

  const group = document.createElement('div');
  group.className = 'input-group';

  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'url-input';
  input.readOnly = true;
  input.value = value;
  input.addEventListener('click', () => input.select());

  const btn = document.createElement('button');
  btn.className = 'copy-btn';
  btn.textContent = 'Copy';
  btn.addEventListener('click', async () => {
    await navigator.clipboard.writeText(value);
    btn.textContent = 'Copied!';
    btn.style.color = '#059669';
    setTimeout(() => {
      btn.textContent = 'Copy';
      btn.style.color = '';
    }, 2000);
  });

  group.appendChild(input);
  group.appendChild(btn);
  wrapper.appendChild(group);

  return wrapper;
}
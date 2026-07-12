import { createBreadcrumb } from '../../../components/breadcrumb';
import { createLoadingSpinner, hideLoadingSpinner } from '../../../components/loading-spinner';
import {
  getBusinessById,
  updateBusiness,
  getWebhookEvents,
  listWebhooks,
  createWebhook,
  deleteWebhook,
  listWebhookDeliveries,
  retryWebhookDelivery,
  type Webhook,
} from '../../../services/business.service';
import { showModal, closeAllModals } from '../../../components/modal';
import { showToast } from '../../../utils/toast';
import { getPublicAppUrl, PRODUCTION_APP_URL } from '../../../config/api.config';
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


    const currentDomain = getPublicAppUrl();
    const prodChatUrl = `${currentDomain}/#/chat/${business._id}`;

    const testCard = document.createElement('section');
    testCard.className = 'glass-card';
    testCard.innerHTML = `
      <h2 class="card-title">Test Your Bot</h2>
      <p class="card-desc">Launch a live preview to test conversations before going public.</p>
    `;
    const testBtn = document.createElement('button');
    testBtn.className = 'test-bot-btn';
    const testBtnLabel = document.createElement('span');
    testBtnLabel.textContent = 'Launch Simulator';
    testBtn.appendChild(testBtnLabel);
    testBtn.insertAdjacentHTML('beforeend', `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
        <polyline points="15 3 21 3 21 9"></polyline>
        <line x1="10" y1="14" x2="21" y2="3"></line>
      </svg>
    `);
    testCard.appendChild(testBtn);

    // Inline simulator panel - lazy-loads the iframe src only when first opened
    const simulatorPanel = document.createElement('div');
    simulatorPanel.style.cssText = 'display:none; margin-top:16px; border-radius:12px; overflow:hidden; border:1px solid #e2e8f0; height:600px; max-width:450px;';
    const simulatorFrame = document.createElement('iframe');
    simulatorFrame.style.cssText = 'width:100%; height:100%; border:0;';
    simulatorFrame.title = 'Chatbot simulator';
    simulatorPanel.appendChild(simulatorFrame);
    testCard.appendChild(simulatorPanel);

    let simulatorOpen = false;
    testBtn.addEventListener('click', () => {
      simulatorOpen = !simulatorOpen;
      if (simulatorOpen) {
        if (!simulatorFrame.src) simulatorFrame.src = prodChatUrl;
        simulatorPanel.style.display = 'block';
        testBtnLabel.textContent = 'Close Simulator';
      } else {
        simulatorPanel.style.display = 'none';
        testBtnLabel.textContent = 'Launch Simulator';
      }
    });
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
    const widgetScript = `<script src="${PRODUCTION_APP_URL}/widget.js"></script>
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

    // Widget appearance card — best-effort, don't break the page if it fails
    try {
      grid.appendChild(renderWidgetAppearanceCard(business));
    } catch { /* widget appearance is non-critical */ }

    // Webhooks card — best-effort, don't break the page if it fails
    try {
      grid.appendChild(await renderWebhooksCard(business._id));
    } catch { /* webhooks are non-critical */ }

    container.appendChild(grid);

  } catch (error: any) {
    hideLoadingSpinner(spinner);
    const err = document.createElement('div');
    err.className = 'glass-card';
    err.style.color = 'var(--text-main)';
    err.style.textAlign = 'center';
    err.style.padding = '40px 20px';
    err.textContent = error?.message || 'Failed to load channel details. Please try again.';
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

function renderWidgetAppearanceCard(business: any): HTMLElement {
  const card = document.createElement('section');
  card.className = 'glass-card';

  const title = document.createElement('h2');
  title.className = 'card-title';
  title.textContent = 'Widget Appearance';
  card.appendChild(title);

  const desc = document.createElement('p');
  desc.className = 'card-desc';
  desc.textContent = 'Customize how the chat widget looks when embedded on your site.';
  card.appendChild(desc);

  const current = business.widgetConfig || {};

  const colorField = document.createElement('div');
  colorField.style.cssText = 'margin:16px 0 14px;';
  const colorLabel = document.createElement('label');
  colorLabel.textContent = 'Primary color';
  colorLabel.style.cssText = 'display:block; font-weight:600; font-size:0.85rem; margin-bottom:6px; color:#1a1a1a;';
  colorField.appendChild(colorLabel);

  const colorRow = document.createElement('div');
  colorRow.style.cssText = 'display:flex; align-items:center; gap:10px;';
  const colorPicker = document.createElement('input');
  colorPicker.type = 'color';
  colorPicker.value = current.primaryColor || '#636b2f';
  colorPicker.style.cssText = 'width:44px; height:36px; border:1px solid #e1e1e1; border-radius:8px; cursor:pointer; padding:2px;';
  colorRow.appendChild(colorPicker);
  const colorText = document.createElement('input');
  colorText.type = 'text';
  colorText.value = current.primaryColor || '#636b2f';
  colorText.style.cssText = 'flex:1; padding:9px 12px; border:1px solid #e1e1e1; border-radius:8px; font-size:0.85rem; font-family:monospace;';
  colorRow.appendChild(colorText);
  colorPicker.addEventListener('input', () => { colorText.value = colorPicker.value; });
  colorText.addEventListener('input', () => {
    if (/^#[0-9a-fA-F]{6}$/.test(colorText.value)) colorPicker.value = colorText.value;
  });
  colorField.appendChild(colorRow);
  card.appendChild(colorField);

  const positionField = document.createElement('div');
  positionField.style.cssText = 'margin-bottom:14px;';
  const positionLabel = document.createElement('label');
  positionLabel.textContent = 'Position';
  positionLabel.style.cssText = 'display:block; font-weight:600; font-size:0.85rem; margin-bottom:6px; color:#1a1a1a;';
  positionField.appendChild(positionLabel);
  const positionSelect = document.createElement('select');
  positionSelect.style.cssText = 'width:100%; padding:9px 12px; border:1px solid #e1e1e1; border-radius:8px; font-size:0.85rem; background:#fff;';
  [['bottom-right', 'Bottom right'], ['bottom-left', 'Bottom left']].forEach(([value, label]) => {
    const opt = document.createElement('option');
    opt.value = value;
    opt.textContent = label;
    if ((current.position || 'bottom-right') === value) opt.selected = true;
    positionSelect.appendChild(opt);
  });
  positionField.appendChild(positionSelect);
  card.appendChild(positionField);

  const avatarField = document.createElement('div');
  avatarField.style.cssText = 'margin-bottom:16px;';
  const avatarLabel = document.createElement('label');
  avatarLabel.textContent = 'Avatar image URL (optional)';
  avatarLabel.style.cssText = 'display:block; font-weight:600; font-size:0.85rem; margin-bottom:6px; color:#1a1a1a;';
  avatarField.appendChild(avatarLabel);
  const avatarInput = document.createElement('input');
  avatarInput.type = 'url';
  avatarInput.placeholder = 'https://...';
  avatarInput.value = current.avatarUrl || '';
  avatarInput.style.cssText = 'width:100%; box-sizing:border-box; padding:9px 12px; border:1px solid #e1e1e1; border-radius:8px; font-size:0.85rem;';
  avatarField.appendChild(avatarInput);
  card.appendChild(avatarField);

  const saveBtn = document.createElement('button');
  saveBtn.className = 'btn-secondary';
  saveBtn.textContent = 'Save Appearance';
  card.appendChild(saveBtn);

  saveBtn.addEventListener('click', async () => {
    if (!/^#[0-9a-fA-F]{6}$/.test(colorText.value)) {
      showToast('Enter a valid hex color (e.g. #636b2f).', 'error');
      return;
    }
    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving...';
    try {
      await updateBusiness(business._id, {
        widgetConfig: {
          primaryColor: colorText.value,
          position: positionSelect.value as 'bottom-left' | 'bottom-right',
          avatarUrl: avatarInput.value.trim() || undefined,
        },
      });
      showToast('Widget appearance saved.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to save widget appearance.', 'error');
    } finally {
      saveBtn.disabled = false;
      saveBtn.textContent = 'Save Appearance';
    }
  });

  return card;
}

const WEBHOOK_STATUS_COLORS: Record<string, string> = {
  pending: '#d97706',
  success: '#16a34a',
  failed: '#dc2626',
  exhausted: '#6b7280',
};

async function renderWebhooksCard(businessId: string): Promise<HTMLElement> {
  const card = document.createElement('section');
  card.className = 'glass-card full-width';

  const title = document.createElement('h2');
  title.className = 'card-title';
  title.textContent = 'Webhooks';
  card.appendChild(title);

  const desc = document.createElement('p');
  desc.style.cssText = 'color:#666; font-size:0.9rem; margin:0 0 16px 0;';
  desc.textContent = 'Get a signed HTTP POST whenever a lead is captured or a session starts/ends. Failed deliveries retry automatically (up to 3 attempts).';
  card.appendChild(desc);

  const listContainer = document.createElement('div');
  card.appendChild(listContainer);

  const addBtn = document.createElement('button');
  addBtn.className = 'btn-secondary';
  addBtn.textContent = '+ Add Webhook';
  addBtn.style.marginTop = '12px';
  card.appendChild(addBtn);

  const validEvents = await getWebhookEvents().catch(() => ['lead.captured', 'session.started', 'session.ended']);

  const renderList = async () => {
    listContainer.innerHTML = '<p style="color:#999; font-size:0.85rem;">Loading webhooks...</p>';
    try {
      const webhooks = await listWebhooks(businessId);

      if (webhooks.length === 0) {
        listContainer.innerHTML = '<p style="color:#999; font-size:0.85rem; margin:0;">No webhooks configured yet.</p>';
        return;
      }

      listContainer.innerHTML = '';
      webhooks.forEach(webhook => listContainer.appendChild(renderWebhookRow(businessId, webhook, renderList)));
    } catch {
      listContainer.innerHTML = '<p style="color:#dc2626; font-size:0.85rem;">Failed to load webhooks.</p>';
    }
  };

  addBtn.addEventListener('click', () => {
    openAddWebhookModal(businessId, validEvents, renderList);
  });

  await renderList();

  return card;
}

function renderWebhookRow(businessId: string, webhook: Webhook, onChange: () => void): HTMLElement {
  const row = document.createElement('div');
  row.style.cssText = 'display:flex; align-items:center; justify-content:space-between; gap:12px; padding:12px 0; border-bottom:1px solid #f0f0f0; flex-wrap:wrap;';

  const info = document.createElement('div');
  info.style.cssText = 'min-width:0; flex:1;';

  const urlRow = document.createElement('div');
  urlRow.style.cssText = 'display:flex; align-items:center; gap:8px; font-size:0.88rem; font-weight:600; color:#1a1a1a; word-break:break-all;';
  const statusDot = document.createElement('span');
  statusDot.style.cssText = `display:inline-block; width:8px; height:8px; border-radius:50%; background:${webhook.isActive ? '#16a34a' : '#9ca3af'}; flex-shrink:0;`;
  urlRow.appendChild(statusDot);
  const urlText = document.createElement('span');
  urlText.textContent = webhook.url;
  urlRow.appendChild(urlText);
  info.appendChild(urlRow);

  const eventsRow = document.createElement('div');
  eventsRow.style.cssText = 'display:flex; flex-wrap:wrap; gap:6px; margin-top:6px;';
  webhook.events.forEach(evt => {
    const badge = document.createElement('span');
    badge.style.cssText = 'background:#f4f6ea; border:1px solid #dde2c8; color:#3a4014; border-radius:999px; padding:2px 9px; font-size:0.74rem; font-weight:600;';
    badge.textContent = evt;
    eventsRow.appendChild(badge);
  });
  info.appendChild(eventsRow);

  row.appendChild(info);

  const actions = document.createElement('div');
  actions.style.cssText = 'display:flex; gap:8px; flex-shrink:0;';

  const historyBtn = document.createElement('button');
  historyBtn.className = 'btn-secondary';
  historyBtn.style.cssText = 'padding:7px 12px; font-size:0.82rem;';
  historyBtn.textContent = 'History';
  historyBtn.addEventListener('click', () => openDeliveryHistoryModal(businessId, webhook));
  actions.appendChild(historyBtn);

  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'btn-secondary';
  deleteBtn.style.cssText = 'padding:7px 12px; font-size:0.82rem; color:#dc2626; border-color:#fecaca;';
  deleteBtn.textContent = 'Delete';
  deleteBtn.addEventListener('click', async () => {
    if (!window.confirm('Delete this webhook? This cannot be undone.')) return;
    deleteBtn.disabled = true;
    try {
      await deleteWebhook(businessId, webhook.id);
      showToast('Webhook deleted.', 'success');
      onChange();
    } catch (error: any) {
      showToast(error?.message || 'Failed to delete webhook.', 'error');
      deleteBtn.disabled = false;
    }
  });
  actions.appendChild(deleteBtn);

  row.appendChild(actions);

  return row;
}

function openAddWebhookModal(businessId: string, validEvents: string[], onCreated: () => void) {
  const content = document.createElement('div');

  const urlLabel = document.createElement('label');
  urlLabel.textContent = 'Endpoint URL';
  urlLabel.style.cssText = 'display:block; font-weight:600; font-size:0.85rem; margin-bottom:6px; color:#1a1a1a;';
  content.appendChild(urlLabel);

  const urlInput = document.createElement('input');
  urlInput.type = 'url';
  urlInput.placeholder = 'https://your-app.com/webhooks/formachat';
  urlInput.style.cssText = 'width:100%; box-sizing:border-box; padding:10px 12px; border:1px solid #e1e1e1; border-radius:8px; font-size:0.9rem; margin-bottom:16px;';
  content.appendChild(urlInput);

  const eventsLabel = document.createElement('label');
  eventsLabel.textContent = 'Events';
  eventsLabel.style.cssText = 'display:block; font-weight:600; font-size:0.85rem; margin-bottom:8px; color:#1a1a1a;';
  content.appendChild(eventsLabel);

  const checkboxes: HTMLInputElement[] = [];
  validEvents.forEach(evt => {
    const row = document.createElement('label');
    row.style.cssText = 'display:flex; align-items:center; gap:8px; margin-bottom:8px; font-size:0.88rem; color:#333; cursor:pointer;';
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = true;
    checkbox.value = evt;
    checkboxes.push(checkbox);
    row.appendChild(checkbox);
    row.appendChild(document.createTextNode(evt));
    content.appendChild(row);
  });

  const createBtn = document.createElement('button');
  createBtn.className = 'btn-secondary';
  createBtn.textContent = 'Create Webhook';
  createBtn.style.cssText = 'margin-top:12px; width:100%;';
  content.appendChild(createBtn);

  createBtn.addEventListener('click', async () => {
    const url = urlInput.value.trim();
    if (!url || !/^https?:\/\//.test(url)) {
      showToast('Enter a valid http(s) URL.', 'error');
      return;
    }
    const events = checkboxes.filter(c => c.checked).map(c => c.value);
    if (events.length === 0) {
      showToast('Select at least one event.', 'error');
      return;
    }

    createBtn.disabled = true;
    createBtn.textContent = 'Creating...';

    try {
      const webhook = await createWebhook(businessId, url, events);
      closeAllModals();
      showToast('Webhook created!', 'success');
      onCreated();

      if (webhook.secret) {
        setTimeout(() => openSecretRevealModal(webhook.secret!), 300);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to create webhook.', 'error');
      createBtn.disabled = false;
      createBtn.textContent = 'Create Webhook';
    }
  });

  showModal({ title: 'Add Webhook', content });
}

function openSecretRevealModal(secret: string) {
  const content = document.createElement('div');

  const warning = document.createElement('p');
  warning.style.cssText = 'color:#856404; background:#fff8f0; border-left:3px solid #e8a23a; padding:10px 14px; border-radius:6px; font-size:0.85rem; margin:0 0 14px 0;';
  warning.textContent = 'Save this signing secret now - it will not be shown again. Use it to verify the X-FormaChat-Signature header on incoming deliveries.';
  content.appendChild(warning);

  const secretBox = document.createElement('div');
  secretBox.style.cssText = 'display:flex; gap:8px; align-items:center;';

  const secretInput = document.createElement('input');
  secretInput.type = 'text';
  secretInput.readOnly = true;
  secretInput.value = secret;
  secretInput.style.cssText = 'flex:1; padding:10px 12px; border:1px solid #e1e1e1; border-radius:8px; font-family:monospace; font-size:0.85rem;';
  secretBox.appendChild(secretInput);

  const copyBtn = document.createElement('button');
  copyBtn.className = 'copy-btn';
  copyBtn.textContent = 'Copy';
  copyBtn.addEventListener('click', async () => {
    await navigator.clipboard.writeText(secret);
    copyBtn.textContent = 'Copied!';
    setTimeout(() => { copyBtn.textContent = 'Copy'; }, 2000);
  });
  secretBox.appendChild(copyBtn);

  content.appendChild(secretBox);

  showModal({ title: 'Webhook Secret', content });
}

async function openDeliveryHistoryModal(businessId: string, webhook: Webhook) {
  const content = document.createElement('div');
  content.innerHTML = '<p style="color:#999; font-size:0.85rem;">Loading delivery history...</p>';
  showModal({ title: 'Delivery History', content });

  try {
    const deliveries = await listWebhookDeliveries(businessId, webhook.id);
    content.innerHTML = '';

    if (deliveries.length === 0) {
      content.innerHTML = '<p style="color:#999; font-size:0.85rem;">No deliveries yet.</p>';
      return;
    }

    deliveries.forEach(delivery => {
      const row = document.createElement('div');
      row.style.cssText = 'padding:10px 0; border-bottom:1px solid #f0f0f0;';

      const topRow = document.createElement('div');
      topRow.style.cssText = 'display:flex; justify-content:space-between; align-items:center; gap:8px;';

      const eventLabel = document.createElement('span');
      eventLabel.style.cssText = 'font-weight:600; font-size:0.85rem; color:#1a1a1a;';
      eventLabel.textContent = delivery.event;
      topRow.appendChild(eventLabel);

      const statusBadge = document.createElement('span');
      const color = WEBHOOK_STATUS_COLORS[delivery.status] || '#6b7280';
      statusBadge.style.cssText = `color:${color}; font-weight:700; font-size:0.78rem; text-transform:uppercase;`;
      statusBadge.textContent = `${delivery.status}${delivery.httpStatus ? ` (${delivery.httpStatus})` : ''}`;
      topRow.appendChild(statusBadge);

      row.appendChild(topRow);

      const meta = document.createElement('div');
      meta.style.cssText = 'font-size:0.78rem; color:#888; margin-top:3px;';
      const when = new Date(delivery.createdAt).toLocaleString();
      meta.textContent = `${when} · attempt ${delivery.attempt}/${delivery.maxAttempts}${delivery.error ? ` · ${delivery.error}` : ''}`;
      row.appendChild(meta);

      if (delivery.status === 'failed' || delivery.status === 'exhausted') {
        const retryBtn = document.createElement('button');
        retryBtn.className = 'copy-btn';
        retryBtn.textContent = 'Retry now';
        retryBtn.style.marginTop = '6px';
        retryBtn.addEventListener('click', async () => {
          retryBtn.disabled = true;
          try {
            await retryWebhookDelivery(businessId, delivery.id);
            showToast('Retry attempted.', 'success');
            closeAllModals();
            openDeliveryHistoryModal(businessId, webhook);
          } catch {
            showToast('Retry failed.', 'error');
            retryBtn.disabled = false;
          }
        });
        row.appendChild(retryBtn);
      }

      content.appendChild(row);
    });
  } catch {
    content.innerHTML = '<p style="color:#dc2626; font-size:0.85rem;">Failed to load delivery history.</p>';
  }
}
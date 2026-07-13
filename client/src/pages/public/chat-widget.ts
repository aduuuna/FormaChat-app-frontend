import { getBusinessById } from '../../services/business.service';
import {
  createChatSession,
  sendChatMessage,
  endChatSession
} from '../../services/chat.service';
import type { ChatProduct } from '../../services/chat.service';
import { showModal } from '../../components/modal';

/** Darken (negative percent) or lighten (positive) a #rrggbb hex color, for hover-state shades. */
function shadeColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const r = Math.max(0, Math.min(255, (num >> 16) + amt));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00ff) + amt));
  const b = Math.max(0, Math.min(255, (num & 0x0000ff) + amt));
  return `#${(0x1000000 + r * 0x10000 + g * 0x100 + b).toString(16).slice(1)}`;
}

/**
 * Talk to widget.js (the launcher script running on the host page). No-op
 * when not actually embedded in an iframe (standalone preview/testing), so
 * every call site can fire this unconditionally without checking embed mode
 * itself. widget.js listens for `source: 'formachat-widget'` messages -
 * see public/widget.js's `window.addEventListener('message', ...)`.
 * Closing the widget is deliberately not part of this bridge - the external
 * launcher button already toggles open/closed, so an in-widget close button
 * would just be a second, redundant way to do the same thing.
 */
function notifyParent(type: 'ready' | 'message', payload: Record<string, any> = {}): void {
  if (window.parent === window) return;
  window.parent.postMessage({ source: 'formachat-widget', type, ...payload }, '*');
}

/**
 * Minimal, safe markdown-ish formatting for bot messages. HTML-escapes the
 * raw text FIRST, then layers on a small allowlist of tags (bold, italic,
 * links restricted to http(s) URLs, bullet lists, paragraphs) - so even if
 * the LLM's output contains literal HTML/script-looking text (whether from
 * the model itself or echoed back from a prompt-injection attempt in the
 * user's message), it can never end up as live markup. Only the tags this
 * function explicitly constructs ever reach innerHTML.
 */
function renderMarkdownLite(text: string): string {
  const escapeHtml = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const inline = (s: string) =>
    escapeHtml(s)
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/(?<!\*)\*([^*\n]+?)\*(?!\*)/g, '<em>$1</em>')
      .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

  const lines = text.split('\n');
  let html = '';
  let inList = false;

  for (const line of lines) {
    const bulletMatch = line.match(/^\s*[-*]\s+(.+)/);
    if (bulletMatch) {
      if (!inList) { html += '<ul class="msg-list">'; inList = true; }
      html += `<li>${inline(bulletMatch[1])}</li>`;
      continue;
    }
    if (inList) { html += '</ul>'; inList = false; }

    if (line.trim() === '') continue;
    html += `<p class="msg-para">${inline(line)}</p>`;
  }
  if (inList) html += '</ul>';

  return html || escapeHtml(text);
}

function formatTimestamp(date: Date): string {
  return date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

function injectWidgetStyles() {
  if (document.getElementById('chat-widget-styles')) return;

  const style = document.createElement('style');
  style.id = 'chat-widget-styles';
  style.textContent = `
    /* FIX 1: box-sizing ensures padding doesn't make elements huge */
    * { box-sizing: border-box; }

    :root {
      --primary: #636b2f;
      --primary-dark: #4a5122;
      --secondary: #bac095;
      --bg-chat: #f4f6f0;
      --white: #ffffff;
      --text-main: #1a1a1a;
      --text-light: #ffffff;
      --text-muted: #6b7280;
      --shadow-soft: 0 4px 20px rgba(0,0,0,0.08);
    }

    /* FIX 2: Ensure html/body are strictly 100% height with no overflow.
       Transparent by default - the iframe's own element background in
       widget.js is also transparent now, so nothing white shows through at
       the chat card's rounded corners on the host page. Standalone/testing
       mode (opened directly, not embedded) restores an opaque page
       background below since there's no host page behind it to show. */
    html, body {
      margin: 0;
      padding: 0;
      height: 100%;
      width: 100%;
      overflow: hidden;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background: transparent;
    }

    /* Main Container */
    .chat-widget-container {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      /* Default centering for Standalone Mode only */
      justify-content: center;
      align-items: center;
      background: #f5f5f5;
      position: relative;
    }

    /* FIX 3: Override for Embed Mode - LOCK TO TOP */
    .chat-widget-container.is-embed {
      background: transparent;
      justify-content: flex-start !important; /* Snap to top */
      align-items: stretch !important;        /* Stretch full width */
    }

    /* The Chat Card (UI) */
    .chat-ui {
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100%;
      background: var(--white);
      overflow: hidden;
    }

    .chat-ui.standalone-ui {
      max-width: 480px;
      height: 700px;
      border: 2px solid var(--primary);
      border-radius: 20px;
      box-shadow: 0 20px 50px rgba(0,0,0,0.15);
    }

    .chat-ui.embed-ui {
      height: 100%;
      border: 2px solid var(--primary);
      border-radius: 20px;
      box-sizing: border-box;
    }

    /* Below ~480px, widget.js switches the iframe itself to a full-screen
       takeover (no floating card look makes sense there) - drop the
       border/radius so the chat fills the screen edge-to-edge instead of
       looking like an inset card with dead space around it. */
    @media (max-width: 480px) {
      .chat-ui.embed-ui { border: none; border-radius: 0; }
    }

    /* ... REST OF YOUR CSS (Header, Messages, etc.) STAYS THE SAME ... */
    
    .chat-header {
      display: flex;
      flex-direction: column;
      background: var(--primary);
      color: var(--white);
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      z-index: 10;
      flex-shrink: 0; /* Prevent header from squishing */
    }

    .header-main-row {
      padding: 15px 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .chat-messages {
      flex: 1; /* Take up all remaining space */
      overflow-y: auto;
      padding: 20px;
      background-color: var(--bg-chat);
      background-image: radial-gradient(#636b2f 0.5px, transparent 0.5px);
      background-size: 20px 20px;
    }

    .chat-input-area {
      padding: 15px;
      background: var(--white);
      border-top: 1px solid #f0f0f0;
      display: flex;
      align-items: center;
      gap: 10px;
      flex-shrink: 0; /* Prevent input area from squishing */
    }
    
    /* ... KEEP THE REST OF YOUR CSS AS IS ... */
    /* (The rest of your CSS was fine, just ensure you keep the parts below input-area) */
    .header-info { display: flex; align-items: center; gap: 12px; min-width: 0; }
    .bot-avatar { width: 42px; height: 42px; border-radius: 50%; background: rgba(255,255,255,0.2); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; font-size: 20px; border: 2px solid rgba(255,255,255,0.3); flex-shrink: 0; }
    .bot-details { min-width: 0; }
    .bot-details h3 { margin: 0; font-size: 16px; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .header-actions { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
    .btn-end-chat { background: #dc2626; border: 1px solid rgba(255,255,255,0.2); color: white; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 500; cursor: pointer; transition: all 0.2s; white-space: nowrap; }
    .btn-end-chat:hover {
      color: white;
      background: #b91c1c;
      transform: translateY(-1px); }
    .btn-end-chat:disabled { opacity: 0.5; cursor: default; }
    .chat-messages::-webkit-scrollbar { width: 6px; }
    .chat-messages::-webkit-scrollbar-thumb { background: #ccc; border-radius: 3px; }
    .message-row { display: flex; flex-direction: column; max-width: 80%; margin-bottom: 12px; }
    .message-row.row-user { align-self: flex-end; align-items: flex-end; }
    .message-row.row-bot { align-self: flex-start; align-items: flex-start; }
    .message-bubble { padding: 12px 16px; position: relative; font-size: 15px; line-height: 1.5; box-shadow: 0 1px 2px rgba(0,0,0,0.05); animation: popIn 0.3s cubic-bezier(0.25, 0.8, 0.25, 1); word-wrap: break-word; max-width: 100%; }
    @keyframes popIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    .message-bot { background: var(--white); color: var(--text-main); border-radius: 18px 18px 18px 2px; border: 1px solid #e5e7eb; }
    .message-user { background: var(--primary); color: var(--white); border-radius: 18px 18px 2px 18px; box-shadow: 0 4px 10px rgba(99, 107, 47, 0.2); }
    .message-system { align-self: center; background: rgba(0,0,0,0.05); color: var(--text-muted); border-radius: 12px; font-size: 13px; padding: 6px 12px; box-shadow: none; margin: 10px auto; text-align: center; }
    .message-timestamp { font-size: 11px; color: var(--text-muted); margin-top: 4px; padding: 0 4px; }
    .msg-para { margin: 0 0 6px; }
    .msg-para:last-child { margin-bottom: 0; }
    .msg-list { margin: 0 0 6px; padding-left: 18px; }
    .msg-list:last-child { margin-bottom: 0; }
    .message-bot a { color: var(--primary); font-weight: 600; }
    .message-user .msg-para, .message-user .msg-list { color: var(--white); }
    .product-cards-wrapper { display: flex; flex-direction: column; gap: 8px; max-width: 80%; align-self: flex-start; margin: -4px 0 12px; }
    .product-chat-card { display: flex; gap: 10px; background: var(--white); border: 1px solid #e5e7eb; border-radius: 14px; overflow: hidden; box-shadow: 0 1px 2px rgba(0,0,0,0.05); animation: popIn 0.3s cubic-bezier(0.25, 0.8, 0.25, 1); }
    .product-chat-card-image { width: 64px; height: 64px; object-fit: cover; flex-shrink: 0; }
    .product-chat-card-body { padding: 10px 12px 10px 0; display: flex; flex-direction: column; justify-content: center; gap: 4px; min-width: 0; }
    .product-chat-card-name { font-weight: 700; font-size: 14px; color: var(--text-main); }
    .product-chat-card-price-row { display: flex; align-items: center; gap: 8px; }
    .product-chat-card-price { font-weight: 700; color: var(--primary); font-size: 14px; }
    .product-chat-card-stock { font-size: 12px; font-weight: 600; }
    .product-chat-card-stock.in-stock { color: #16a34a; }
    .product-chat-card-stock.out-of-stock { color: #dc2626; }
    .input-wrapper { flex: 1; position: relative; display: flex; align-items: center; }
    .chat-input { width: 100%; padding: 14px 20px; padding-right: 50px; border: 1px solid #e0e0e0; border-radius: 30px; font-size: 15px; outline: none; background: #f9f9f9; transition: all 0.2s; font-family: inherit; color: black }
    .chat-input:focus { background: var(--white); border-color: var(--primary); box-shadow: 0 0 0 3px rgba(99, 107, 47, 0.1); }
    .btn-send { width: 46px; height: 46px; border-radius: 50%; background: var(--primary); color: white; border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 10px rgba(99, 107, 47, 0.3); }
    .btn-send:hover:not(:disabled) { background: var(--primary-dark); transform: scale(1.05); }
    .btn-send:disabled { background: #ccc; box-shadow: none; cursor: not-allowed; }
    .typing-dots { display: flex; gap: 4px; padding: 8px 12px; background: white; border-radius: 12px; width: fit-content; margin-bottom: 10px; border: 1px solid #e5e7eb; animation: popIn 0.3s; }
    .typing-dot { width: 6px; height: 6px; background: #ccc; border-radius: 50%; animation: bounce 1.4s infinite ease-in-out both; }
    .typing-dot:nth-child(1) { animation-delay: -0.32s; }
    .typing-dot:nth-child(2) { animation-delay: -0.16s; }
    @keyframes bounce { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1); } }
    .status-view { text-align: center; padding: 40px; background: white; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); max-width: 90%; width: 350px; margin: auto;}
    .status-icon { font-size: 48px; margin-bottom: 15px; }
    .status-title { font-size: 18px; font-weight: 700; color: var(--text-main); margin-bottom: 10px; }
    .status-msg { color: var(--text-muted); font-size: 14px; line-height: 1.5; }

    /* Mobile: widen bubbles a little since screen real estate is already
       tight, and shrink the End Chat button slightly so it doesn't crowd
       the business name in a narrow header. */
    @media (max-width: 480px) {
      .message-row { max-width: 88%; }
      .btn-end-chat { padding: 6px 10px; font-size: 11px; }
    }
  `;
  document.head.appendChild(style);
}

export async function renderChatWidget(businessId: string, embedMode: boolean = false): Promise<HTMLElement> {
  injectWidgetStyles();

  const container = document.createElement('div');
  container.className = 'chat-widget-container';
  
  const urlParams = new URLSearchParams(window.location.search);
  const isEmbedMode = embedMode || urlParams.get('embed') === 'true';
  
  if (isEmbedMode) {
    // FIX 4: Add the class to trigger "Snap to top" CSS
    container.classList.add('is-embed');
  }

  // ... (REST OF THE FUNCTION REMAINS THE SAME) ...
  console.log('[Chat Widget] Initializing...', { businessId, isEmbedMode });
  const loadingDiv = createLoadingView();
  container.appendChild(loadingDiv);
  try {
    const business = await getBusinessById(businessId, true);

    // Apply owner-customized widget theme (falls back to the default olive
    // theme set on :root in injectWidgetStyles if no widgetConfig is set)
    const primaryColor = (business as any).widgetConfig?.primaryColor;
    if (primaryColor) {
      container.style.setProperty('--primary', primaryColor);
      container.style.setProperty('--primary-dark', shadeColor(primaryColor, -15));
    }

    // widget.js (the launcher on the host page) can't call the API directly
    // - CORS only allows FormaChat's own origins, not arbitrary embedding
    // sites - so the iframe (which CAN fetch, since it's same-origin with
    // the API) is the only place this config exists. Hand it over via
    // postMessage so the launcher button (color, position) matches what the
    // owner actually configured in the dashboard instead of always falling
    // back to the embed snippet's hardcoded defaults.
    notifyParent('ready', {
      primaryColor: primaryColor || null,
      avatarUrl: (business as any).widgetConfig?.avatarUrl || null,
      position: (business as any).widgetConfig?.position || null,
    });

    if (!business.isActive || business.freezeInfo?.isFrozen) {
      container.removeChild(loadingDiv);
      const errorView = createErrorView(
        'Service Unavailable',
        'This chatbot is currently unavailable. Please contact the business directly.'
      );
      container.appendChild(errorView);
      return container;
    }
    const session = await createChatSession(businessId);
    container.removeChild(loadingDiv);
    const chatUI = createChatUI(business, session, isEmbedMode);
    container.appendChild(chatUI);
  } catch (error: any) {
    console.error('[Chat Widget] Init failed:', error);
    container.removeChild(loadingDiv);
    const errorView = createErrorView(
      'Connection Error',
      error.message || 'Failed to start chat. Please refresh and try again.'
    );
    container.appendChild(errorView);
  }
  return container;
}

function createLoadingView(): HTMLElement {
  const wrapper = document.createElement('div');
  wrapper.className = 'status-view';
  wrapper.innerHTML = `
    <div class="status-title">Starting Chat...</div>
    <div class="status-msg">Connecting you to the assistant</div>
  `;

  return wrapper;
}

function createErrorView( title: string, message: string): HTMLElement {
  const wrapper = document.createElement('div');
  wrapper.className = 'status-view';
  wrapper.innerHTML = `
   
    <div class="status-title">${title}</div>
    <div class="status-msg">${message}</div>
  `;
  return wrapper;
}

function createChatUI(
  business: any,
  session: { sessionId: string; businessInfo: any },
  isEmbedMode: boolean
): HTMLElement {
  const chatContainer = document.createElement('div');
  chatContainer.className = isEmbedMode ? 'chat-ui embed-ui' : 'chat-ui standalone-ui';

  const header = createChatHeader(business, session.sessionId);
  chatContainer.appendChild(header);

  const messagesContainer = document.createElement('div');
  messagesContainer.className = 'chat-messages';
  messagesContainer.id = 'chat-messages';
  chatContainer.appendChild(messagesContainer);

  const greeting = session.businessInfo?.chatbotGreeting ||
    `Hi! Welcome to ${business.basicInfo.businessName}. How can I help you today?`;
  addMessageToUI(messagesContainer, greeting, 'bot');

  const inputArea = createInputArea(session.sessionId, messagesContainer);
  chatContainer.appendChild(inputArea);

  return chatContainer;
}

function createChatHeader(business: any, sessionId: string): HTMLElement {
  const header = document.createElement('div');
  header.className = 'chat-header';

  const mainRow = document.createElement('div');
  mainRow.className = 'header-main-row';

  const infoGroup = document.createElement('div');
  infoGroup.className = 'header-info';

  const avatarUrl = business.widgetConfig?.avatarUrl;
  if (avatarUrl) {
    const avatar = document.createElement('img');
    avatar.src = avatarUrl;
    avatar.alt = business.basicInfo.businessName;
    avatar.className = 'bot-avatar';
    avatar.style.cssText = 'object-fit:cover;';
    infoGroup.appendChild(avatar);
  }

  const details = document.createElement('div');
  details.className = 'bot-details';
  details.innerHTML = `<h3>${business.basicInfo.businessName}</h3>`;

  infoGroup.appendChild(details);
  mainRow.appendChild(infoGroup);

  const endButton = document.createElement('button');
  endButton.className = 'btn-end-chat';
  endButton.textContent = 'End Chat';
  
  endButton.addEventListener('click', async () => {
  // Create custom content with buttons
    const content = document.createElement('div');
    content.style.textAlign = 'center';
    
    const message = document.createElement('p');
    message.textContent = 'Are you sure you want to end this conversation?';
    message.style.marginBottom = '20px';
    content.appendChild(message);
    
    const buttonGroup = document.createElement('div');
    buttonGroup.style.display = 'flex';
    buttonGroup.style.gap = '10px';
    buttonGroup.style.justifyContent = 'center';
    
    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Cancel';
    cancelBtn.style.cssText = 'padding: 10px 20px; border: none; background: #636b2f; border-radius: 8px; cursor: pointer; font-weight: 600; color: white';
    
    const yesBtn = document.createElement('button');
    yesBtn.textContent = 'Yes, End Chat';
    yesBtn.style.cssText = 'padding: 10px 20px; border: none; background: #dc2626; color: white; border-radius: 8px; cursor: pointer; font-weight: 600;';
    
    buttonGroup.appendChild(cancelBtn);
    buttonGroup.appendChild(yesBtn);
    content.appendChild(buttonGroup);
    
    const modal = showModal({
      title: 'End Conversation',
      content: content,
      showCloseButton: true
    });
    
    cancelBtn.onclick = () => {
      modal.remove();
    };
    
    yesBtn.onclick = async () => {
      modal.remove();
      
      try {
        await endChatSession(sessionId);
      
        const messagesContainer = document.getElementById('chat-messages');
        if (messagesContainer) {
          addMessageToUI(messagesContainer, 'Chat session ended by user.', 'system');
        }
        
        const input = document.getElementById('chat-input') as HTMLInputElement;
        const sendBtn = document.getElementById('send-btn') as HTMLButtonElement;
        if (input) { input.disabled = true; input.placeholder = 'Chat ended'; }
        if (sendBtn) sendBtn.disabled = true;
        
        endButton.textContent = 'Ended';
        endButton.disabled = true;
        
      } catch (error: any) {
        console.error(error);
        showModal({
          title: 'Error',
          content: '<p style="margin: 0;">Failed to end session. Please try again.</p>',
          showCloseButton: true
        });
      }
    };
  });

  const actions = document.createElement('div');
  actions.className = 'header-actions';
  actions.appendChild(endButton);

  mainRow.appendChild(actions);
  header.appendChild(mainRow);

  return header;
}

function createInputArea(sessionId: string, messagesContainer: HTMLElement): HTMLElement {
  const container = document.createElement('div');
  container.className = 'chat-input-area';

  const input = document.createElement('input');
  input.type = 'text';
  input.id = 'chat-input';
  input.className = 'chat-input';
  input.placeholder = 'Type a message...';
  input.autocomplete = 'off';

  const sendButton = document.createElement('button');
  sendButton.id = 'send-btn';
  sendButton.className = 'btn-send';
  sendButton.disabled = true;

  sendButton.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>`;

  container.appendChild(input);
  container.appendChild(sendButton);

  input.addEventListener('input', () => {
    sendButton.disabled = input.value.trim().length === 0;
  });

  const handleSend = async () => {
    const text = input.value.trim();
    if (!text) return;

    input.disabled = true;
    sendButton.disabled = true;

    addMessageToUI(messagesContainer, text, 'user');
    input.value = '';

    const typingId = addTypingIndicator(messagesContainer);

    try {
      const response = await sendChatMessage(sessionId, text);

      removeTypingIndicator(typingId);
      addMessageToUI(messagesContainer, response.message.content, 'bot');

      if (response.products && response.products.length > 0) {
        addProductCardsToUI(messagesContainer, response.products);
      }

      if (response.contactCaptured) {
        addMessageToUI(messagesContainer, '✓ Contact info saved', 'system');
      }

    } catch (error) {
      removeTypingIndicator(typingId);
      addMessageToUI(messagesContainer, '⚠️ Connection error. Please try again.', 'system');
    } finally {
      input.disabled = false;
      input.focus();
    
      sendButton.disabled = true; 
    }
  };

  sendButton.addEventListener('click', handleSend);
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !sendButton.disabled) handleSend();
  });

  return container;
}

function addMessageToUI(container: HTMLElement, text: string, type: 'user' | 'bot' | 'system'): void {
  if (type === 'system') {
    const bubble = document.createElement('div');
    bubble.className = 'message-bubble message-system';
    bubble.textContent = text;
    container.appendChild(bubble);
    scrollToBottom(container);
    return;
  }

  const row = document.createElement('div');
  row.className = `message-row row-${type}`;

  const bubble = document.createElement('div');
  bubble.className = `message-bubble message-${type}`;
  if (type === 'bot') {
    // Bot text only - renderMarkdownLite HTML-escapes everything before
    // adding its own small set of tags, so this is safe even though the
    // text ultimately traces back to an LLM response.
    bubble.innerHTML = renderMarkdownLite(text);
  } else {
    bubble.textContent = text;
  }
  row.appendChild(bubble);

  const timestamp = document.createElement('div');
  timestamp.className = 'message-timestamp';
  timestamp.textContent = formatTimestamp(new Date());
  row.appendChild(timestamp);

  container.appendChild(row);
  scrollToBottom(container);

  if (type === 'bot') {
    // Let widget.js show an unread badge if the widget is currently closed
    // - the iframe has no way to know its own visible/hidden state from in
    // here (that's controlled by the parent page's CSS), so it just always
    // reports new bot messages and lets the parent decide.
    notifyParent('message', { role: 'bot' });
  }
}

function addProductCardsToUI(container: HTMLElement, products: ChatProduct[]): void {
  const wrapper = document.createElement('div');
  wrapper.className = 'product-cards-wrapper';

  products.forEach(product => {
    const card = document.createElement('div');
    card.className = 'product-chat-card';

    if (product.imageUrl) {
      const img = document.createElement('img');
      img.className = 'product-chat-card-image';
      img.src = product.imageUrl;
      img.alt = product.name;
      card.appendChild(img);
    }

    const body = document.createElement('div');
    body.className = 'product-chat-card-body';

    const name = document.createElement('div');
    name.className = 'product-chat-card-name';
    name.textContent = product.name;
    body.appendChild(name);

    const priceRow = document.createElement('div');
    priceRow.className = 'product-chat-card-price-row';

    const price = document.createElement('span');
    price.className = 'product-chat-card-price';
    price.textContent = `$${product.price.toFixed(2)}`;
    priceRow.appendChild(price);

    const stock = document.createElement('span');
    stock.className = `product-chat-card-stock ${product.stockQuantity > 0 ? 'in-stock' : 'out-of-stock'}`;
    stock.textContent = product.stockQuantity > 0 ? `${product.stockQuantity} in stock` : 'Out of stock';
    priceRow.appendChild(stock);

    body.appendChild(priceRow);
    card.appendChild(body);
    wrapper.appendChild(card);
  });

  container.appendChild(wrapper);
  scrollToBottom(container);
}

function addTypingIndicator(container: HTMLElement): string {
  const id = `typing-${Date.now()}`;
  const indicator = document.createElement('div');
  indicator.id = id;
  indicator.className = 'typing-dots';
  indicator.innerHTML = `
    <div class="typing-dot"></div>
    <div class="typing-dot"></div>
    <div class="typing-dot"></div>
  `;
  container.appendChild(indicator);
  scrollToBottom(container);
  return id;
}

function removeTypingIndicator(id: string): void {
  const el = document.getElementById(id);
  if (el) el.remove();
}

function scrollToBottom(container: HTMLElement): void {
  setTimeout(() => {
    container.scrollTop = container.scrollHeight;
  }, 10);
}
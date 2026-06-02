import { getBusinessById } from '../../services/business.service';
import { 
  createChatSession, 
  sendChatMessage,
  endChatSession
} from '../../services/chat.service';
import { showModal } from '../../components/modal';

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
      --shadow-soft: 0 4px 20px rgba(0,0,0,0.08);
    }

    /* FIX 2: Ensure html/body are strictly 100% height with no overflow */
    html, body { 
      margin: 0; 
      padding: 0;
      height: 100%; 
      width: 100%;
      overflow: hidden; 
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; 
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

    /* ... REST OF YOUR CSS (Header, Messages, etc.) STAYS THE SAME ... */
    
    .chat-header {
      padding: 15px 20px;
      background: var(--primary);
      color: var(--white);
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      z-index: 10;
      flex-shrink: 0; /* Prevent header from squishing */
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
    .header-info { display: flex; align-items: center; gap: 12px; }
    .bot-avatar { width: 42px; height: 42px; border-radius: 50%; background: rgba(255,255,255,0.2); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; font-size: 20px; border: 2px solid rgba(255,255,255,0.3); }
    .bot-details h3 { margin: 0; font-size: 16px; font-weight: 600; }
    .bot-status { font-size: 12px; opacity: 0.9; display: flex; align-items: center; gap: 4px; }
    .status-dot { width: 8px; height: 8px; background: #4ade80; border-radius: 50%; display: inline-block; }
    .btn-end-chat { background: #dc2626; border: 1px solid rgba(255,255,255,0.2); color: white; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 500; cursor: pointer; transition: all 0.2s; }
    .btn-end-chat:hover {
      color: white;
      background: #b91c1c;
      transform: translateY(-1px); }
    .btn-end-chat:disabled { opacity: 0.5; cursor: default; }
    .chat-messages::-webkit-scrollbar { width: 6px; }
    .chat-messages::-webkit-scrollbar-thumb { background: #ccc; border-radius: 3px; }
    .message-bubble { max-width: 80%; padding: 12px 16px; margin-bottom: 12px; position: relative; font-size: 15px; line-height: 1.5; box-shadow: 0 1px 2px rgba(0,0,0,0.05); animation: popIn 0.3s cubic-bezier(0.25, 0.8, 0.25, 1); word-wrap: break-word; }
    @keyframes popIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    .message-bot { align-self: flex-start; background: var(--white); color: var(--text-main); border-radius: 18px 18px 18px 2px; border: 1px solid #e5e7eb; margin-right: auto; }
    .message-user { align-self: flex-end; background: var(--primary); color: var(--white); border-radius: 18px 18px 2px 18px; margin-left: auto; box-shadow: 0 4px 10px rgba(99, 107, 47, 0.2); }
    .message-system { align-self: center; background: rgba(0,0,0,0.05); color: var(--text-muted); border-radius: 12px; font-size: 13px; padding: 6px 12px; box-shadow: none; margin: 10px auto; text-align: center; }
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
  chatContainer.className = 'chat-ui';
  
  if (!isEmbedMode) {
    chatContainer.style.maxWidth = '480px'; 
    chatContainer.style.height = '700px';
    chatContainer.style.border = '1px solid #4a5122';
    chatContainer.style.borderRadius = '20px';
    chatContainer.style.boxShadow = '0 20px 50px rgba(0,0,0,0.15)';
  } else {
    chatContainer.style.height = '100%';
    chatContainer.style.borderRadius = '0';
    chatContainer.style.border = '1px solid #4a5122';
    chatContainer.style.borderRadius = '20px';
  }

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

  const infoGroup = document.createElement('div');
  infoGroup.className = 'header-info';

  const details = document.createElement('div');
  details.className = 'bot-details';
  details.innerHTML = `
    <h3>${business.basicInfo.businessName}</h3>
    <div class="bot-status"><span class="status-dot"></span> Online</div>
  `;


  infoGroup.appendChild(details);
  header.appendChild(infoGroup);

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

  header.appendChild(endButton);

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
  const bubble = document.createElement('div');
  bubble.className = `message-bubble message-${type}`;
  bubble.textContent = text;
  container.appendChild(bubble);
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
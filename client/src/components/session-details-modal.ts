import { showModal } from './modal';
import { getSessionDetails, deleteSession } from '../services/chat.service';
import { createLoadingSpinner } from './loading-spinner';
import { showDeleteConfirmation } from './delete-confirmation';

function injectSessionStyles() {
  if (document.getElementById('session-details-styles')) return;

  const style = document.createElement('style');
  style.id = 'session-details-styles';
  style.textContent = `
    :root {
       --primary: #636b2f;
      --secondary: #bac095;
      --bg-chat: #f9f9f9;
      --bubble-user: #636b2f;
      --bubble-ai: #ffffff;
      --text-main: #1a1a1a;
      --text-muted: #666;
      --bg-glass: rgba(255, 255, 255, 0.85);
      --danger: #ef4444;
      --success: #10b981;
    }

    .session-details-container {
      display: flex;
      flex-direction: column;
      gap: 24px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      padding-bottom: 20px;
      width: 100%;
    }

    /* --- INFO CARDS (Glass Effect) --- */
    .info-card {
      background: var(--bg-glass);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255,255,255,0.6);
      border-radius: 16px;
      padding: 20px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.05);
      animation: fadeIn 0.3s ease-out;
    }

    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }


    /* NEW: Header row to hold Title + Delete Button */
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 1px dashed rgba(0,0,0,0.1);
    }

    .card-header.no-border {
      border-bottom: none;
      padding-bottom: 0;
    }

    .section-title {
      font-size: 0.85rem;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: var(--text-muted);
      margin: 0;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    /* Grid Layout for Metadata */
    .session-info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 20px;
    }

    .info-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .info-label { font-size: 0.75rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase; }
    .info-value { font-size: 0.95rem; font-weight: 600; color: var(--text-main); word-break: break-all; }

    /* Status Badge */
    .status-badge { display: inline-block; padding: 4px 10px; border-radius: 6px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; }
    .status-active { background: #dcfce7; color: #166534; }
    .status-closed { background: #f3f4f6; color: #4b5563; }
    .status-deleted { background: #fee2e2; color: #991b1b; }

    /* --- TRANSCRIPT AREA --- */
    .messages-container {
      background: var(--bg-chat);
      border-radius: 12px;
      padding: 20px;
      max-height: 400px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 15px;
      border: 1px solid rgba(0,0,0,0.05);
      scroll-behavior: smooth;
    }

    .messages-container::-webkit-scrollbar { width: 6px; }
    .messages-container::-webkit-scrollbar-thumb { background: #ccc; border-radius: 3px; }

    /* Message Bubbles */
    .message-bubble { 
      max-width: 80%; 
      padding: 12px 16px; 
      border-radius: 12px; 
      position: relative; 
      box-shadow: 0 1px 2px rgba(0,0,0,0.05); 
      font-size: 0.95rem;
      line-height: 1.5;
    }
    
    .message-assistant { align-self: flex-start; background: var(--bubble-ai); border: 1px solid #e5e7eb; border-bottom-left-radius: 2px; color: var(--text-main); }
    .message-user { align-self: flex-end; background: var(--primary); color: white; border-bottom-right-radius: 2px; }
    .message-system { align-self: center; background: transparent; box-shadow: none; font-size: 0.8rem; color: var(--text-muted); font-style: italic; padding: 5px; text-align: center; }
    
    .message-timestamp { font-size: 0.7rem; margin-top: 4px; opacity: 0.7; text-align: right; }

    /* UPDATED: Delete Button (More compact for header) */
    .delete-btn {
      background: transparent;
      color: #dc2626;
      border: 1px solid #dc2626; /* Outline style looks better in header */
      padding: 6px 12px;         /* Smaller padding */
      border-radius: 6px;
      font-weight: 600;
      font-size: 0.8rem;         /* Smaller font */
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s;
      /* Removed margin-top */
    }
    .delete-btn:hover {
      background: #dc2626;
      color: white;
      box-shadow: 0 4px 12px rgba(220, 38, 38, 0.2);
    }
    .delete-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `;
  document.head.appendChild(style);
}
export async function showSessionDetailsModal(
  businessId: string,
  sessionId: string
): Promise<void> {
  injectSessionStyles();

  const loadingContent = document.createElement('div');
  loadingContent.style.padding = '60px 20px';
  loadingContent.style.textAlign = 'center';
  
  const spinner = createLoadingSpinner('Retrieving conversation history...');
  loadingContent.appendChild(spinner);

  const modal = showModal({
    title: 'Session Details',
    content: loadingContent,
    showCloseButton: true
  });

  try {
    const sessionDetails = await getSessionDetails(businessId, sessionId);
    const content = buildSessionDetailsContent(sessionDetails, businessId, sessionId);

    const modalContent = modal.querySelector('.modal-content');
    if (modalContent) {
      modalContent.innerHTML = '';
      modalContent.appendChild(content);
    }
  } catch (error) {
    console.error('Failed to load session details:', error);

    const errorContent = document.createElement('div');
    errorContent.className = 'error-message';
    errorContent.style.padding = '30px';
    errorContent.style.textAlign = 'center';
    errorContent.innerHTML = `
        <div style="font-size: 40px; margin-bottom: 10px;">⚠️</div>
        <h3 style="margin: 0; color: #dc2626;">Failed to load session</h3>
        <p style="color: #666;">Please check your connection and try again.</p>
    `;

    const modalContent = modal.querySelector('.modal-content');
    if (modalContent) {
      modalContent.innerHTML = '';
      modalContent.appendChild(errorContent);
    }
  }
}

function buildSessionDetailsContent(sessionDetails: any, businessId: string, sessionId: string): HTMLElement {
  const container = document.createElement('div');
  container.className = 'session-details-container';

  // 1. CREATE DELETE BUTTON FIRST (So we can place it anywhere)
  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'delete-btn';
  deleteBtn.innerHTML = `
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <polyline points="3 6 5 6 21 6"></polyline>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    </svg>
    Delete
  `;

  deleteBtn.addEventListener('click', async () => {
    const hasMessages = sessionDetails.session.messageCount > 0;
    const hasContact = sessionDetails.session.contact?.captured;

    let warningMessage = 'This session will be marked as deleted.';
    
    if (hasMessages || hasContact) {
      warningMessage = `
        <strong>⚠️ Warning:</strong> This session contains ${
          hasMessages ? `<strong>${sessionDetails.session.messageCount} messages</strong>` : ''
        }${hasMessages && hasContact ? ' and ' : ''}${
          hasContact ? '<strong>captured contact data</strong>' : ''
        }.<br><br>
        It will be marked as deleted but preserved in the database.
      `;
    }

    const confirmDiv = document.createElement('div');
    confirmDiv.innerHTML = warningMessage;
    confirmDiv.style.lineHeight = '1.6';

    showDeleteConfirmation({
      itemName: `Session ${sessionDetails.session.sessionId.substring(0, 8)}...`,
      onConfirm: async () => {
        try {
          deleteBtn.disabled = true;
          deleteBtn.textContent = '...';

          const result = await deleteSession(businessId, sessionId);

          // NEW: Handle lead protection error from backend
          if (!result.success && result.error?.code === 'SESSION_HAS_LEADS') {
            showModal({
              title: 'Cannot Delete',
              content: '<p style="margin: 0;">This session contains captured lead information. Leads must be preserved.</p>',
              showCloseButton: true
            });
            deleteBtn.disabled = false;
            deleteBtn.innerHTML = `
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
              Delete
            `;
            return;
          }

          // Handle other errors
          if (!result.success) {
            throw new Error(result.error?.message || 'Failed to delete session');
          }

          const overlay = document.querySelector('.modal-overlay');
          if (overlay) overlay.remove();

          showModal({
            title: 'Success',
            content: '<p style="margin: 0;">Session deleted successfully.</p>',
            showCloseButton: true
          });
          window.location.reload();

        } catch (error) {
          console.error('Delete failed:', error);
          showModal({
            title: 'Error',
            content: '<p style="margin: 0;">Failed to delete session. Please try again.</p>',
            showCloseButton: true
          });
          deleteBtn.disabled = false;
          deleteBtn.innerHTML = `
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
            Delete
          `;
        }
      },
      onCancel: () => {
        console.log('Delete cancelled');
      }
    });
  });


  // 2. METADATA SECTION (With Header Row)
  const infoSection = document.createElement('div');
  infoSection.className = 'info-card';

  // Create a Header Row: Title on Left, Button on Right
  const headerRow = document.createElement('div');
  headerRow.className = 'card-header';

  const infoTitle = document.createElement('h4');
  infoTitle.className = 'section-title';
  infoTitle.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg> Metadata`;
  
  // Add Title and Button to the Header Row
  headerRow.appendChild(infoTitle);
  headerRow.appendChild(deleteBtn);

  infoSection.appendChild(headerRow);

  const infoGrid = document.createElement('div');
  infoGrid.className = 'session-info-grid';
  infoGrid.appendChild(createInfoItem('Session ID', sessionDetails.session.sessionId));
  const statusHtml = `<span class="status-badge status-${sessionDetails.session.status.toLowerCase()}">${sessionDetails.session.status}</span>`;
  infoGrid.appendChild(createInfoItem('Status', statusHtml));
  infoGrid.appendChild(createInfoItem('Started', new Date(sessionDetails.session.startedAt).toLocaleString()));
  if (sessionDetails.session.endedAt) {
    infoGrid.appendChild(createInfoItem('Ended', new Date(sessionDetails.session.endedAt).toLocaleString()));
  }
  infoGrid.appendChild(createInfoItem('Messages', sessionDetails.session.messageCount.toString()));
  
  infoSection.appendChild(infoGrid);
  container.appendChild(infoSection);


  // 3. CONTACT SECTION
  if (sessionDetails.session.contact?.captured) {
    const contactSection = document.createElement('div');
    contactSection.className = 'info-card contact-card';

    const contactTitle = document.createElement('h4');
    contactTitle.className = 'section-title';
    contactTitle.style.marginBottom = '15px';
    contactTitle.style.color = 'var(--primary)';
    contactTitle.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg> Captured Contact`;
    contactSection.appendChild(contactTitle);

    const contactGrid = document.createElement('div');
    contactGrid.className = 'session-info-grid';
    if (sessionDetails.session.contact.name) contactGrid.appendChild(createInfoItem('Name', sessionDetails.session.contact.name));
    if (sessionDetails.session.contact.email) {
      const emailLink = `<a href="mailto:${sessionDetails.session.contact.email}" style="color: var(--primary); text-decoration: none;">${sessionDetails.session.contact.email}</a>`;
      contactGrid.appendChild(createInfoItem('Email', emailLink));
    }
    if (sessionDetails.session.contact.phone) contactGrid.appendChild(createInfoItem('Phone', sessionDetails.session.contact.phone));
    contactSection.appendChild(contactGrid);
    container.appendChild(contactSection);
  }


  // 4. TRANSCRIPT SECTION
  const conversationSection = document.createElement('div');
  conversationSection.className = 'conversation-section';

  const convTitle = document.createElement('h4');
  convTitle.className = 'section-title';
  convTitle.style.marginBottom = '15px';
  convTitle.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg> Transcript`;
  conversationSection.appendChild(convTitle);

  const messagesContainer = document.createElement('div');
  messagesContainer.className = 'messages-container';

  if (sessionDetails.messages && sessionDetails.messages.length > 0) {
    sessionDetails.messages.forEach((message: any) => {
      messagesContainer.appendChild(createMessageBubble(message));
    });
    setTimeout(() => { messagesContainer.scrollTop = messagesContainer.scrollHeight; }, 100);
  } else {
    const emptyState = document.createElement('div');
    emptyState.style.textAlign = 'center';
    emptyState.style.padding = '40px';
    emptyState.style.color = '#999';
    emptyState.innerHTML = '<i>No messages recorded in this session.</i>';
    messagesContainer.appendChild(emptyState);
  }

  conversationSection.appendChild(messagesContainer);
  container.appendChild(conversationSection);

  return container;
}
function createInfoItem(label: string, valueHtml: string): HTMLElement {
  const div = document.createElement('div');
  div.className = 'info-item';

  const labelElement = document.createElement('span');
  labelElement.className = 'info-label';
  labelElement.textContent = label;
  div.appendChild(labelElement);

  const valueElement = document.createElement('span');
  valueElement.className = 'info-value';
  valueElement.innerHTML = valueHtml;
  div.appendChild(valueElement);

  return div;
}


function createMessageBubble(message: any): HTMLElement {
  const messageDiv = document.createElement('div');
  
  messageDiv.className = `message-bubble message-${message.role}`;

  const contentDiv = document.createElement('div');
  contentDiv.className = 'message-content';
  contentDiv.textContent = message.content;
  messageDiv.appendChild(contentDiv);

  if (message.role !== 'system') {
    const timestampDiv = document.createElement('div');
    timestampDiv.className = 'message-timestamp';
    timestampDiv.textContent = new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    messageDiv.appendChild(timestampDiv);
  }

  return messageDiv;
}
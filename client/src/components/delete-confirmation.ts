export interface DeleteConfirmationConfig {
  itemName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

function injectDeleteStyles() {
  if (document.getElementById('delete-modal-styles')) return;

  const style = document.createElement('style');
  style.id = 'delete-modal-styles';
  style.textContent = `
    :root {
      --danger-red: #dc2626;
      --danger-bg: #fef2f2;
      --primary: #636b2f;
      --text-main: #1a1a1a;
      --text-muted: #666;
    }

    /* 1. The Reality Blur Overlay */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(25, 25, 25, 0.4);
      backdrop-filter: blur(12px);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9999;
      opacity: 0;
      animation: fadeIn 0.3s forwards;
    }

    /* 2. The Modal Card - Matching your card style */
    .delete-confirmation-modal {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.5);
      width: 80%;
      max-width: 30px
      max-width: 300px;
      padding: 30px;
      border-radius: 12px; /* ✅ Matches your cards */
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08); /* ✅ Matches your components */
      text-align: center;
      transform: scale(0.9);
      opacity: 0;
      animation: springPopup 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards 0.1s;
      position: relative;
    }

    /* 3. The Warning Icon */
    .icon-wrapper {
      width: 60px;
      height: 60px;
      background: var(--danger-bg);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 20px auto;
      color: var(--danger-red);
      position: relative;
      box-shadow: 0 2px 8px rgba(220, 38, 38, 0.1);
    }

    /* Subtle Pulse Ring */
    .icon-wrapper::after {
      content: '';
      position: absolute;
      width: 100%;
      height: 100%;
      border-radius: 50%;
      border: 2px solid var(--danger-red);
      opacity: 0;
      animation: pulse-ring 1.5s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
    }

    .warning-icon {
      width: 28px;
      height: 28px;
    }

    /* 4. Typography - Matching your style */
    .modal-title {
      font-size: 1.4rem;
      font-weight: 700; 
      color: var(--text-main);
      margin: 0 0 10px 0;
      letter-spacing: -0.5px;
    }

    .modal-message {
      color: var(--text-muted);
      font-size: 0.95rem;
      line-height: 1.6;
      margin-bottom: 30px;
    }
    
    .highlight-item {
      color: var(--text-main);
      font-weight: 600;
      background: rgba(99, 107, 47, 0.08); /* ✅ Subtle primary tint */
      padding: 2px 6px;
      border-radius: 4px;
    }

    /* 5. Buttons - Matching your button style */
    .modal-buttons {
      display: flex;
      gap: 12px;
      justify-content: center;
    }

    .btn-modal {
      padding: 12px 24px;
      border-radius: 10px; /* ✅ Matches your buttons */
      font-size: 0.95rem;
      font-weight: 600;
      cursor: pointer;
      border: none;
      transition: all 0.25s ease; /* ✅ Matches your transitions */
      flex: 1;
    }

    /* Cancel Button - Matching your secondary style */
    .btn-cancel {
      background: #636b2f;
      
      color: white;
    }
    .btn-cancel:hover {
      background: #4a5122;
      transform: translateY(-1px);
      border: #4a5122 !important;
    }

    /* Delete Button - Solid danger style like your primary buttons */
    .btn-danger {
      background: var(--danger-red);
      color: white;
      box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3); /* ✅ Matches your button shadows */
    }
    .btn-danger:hover {
      background: #b91c1c;
      transform: translateY(-1px);
      box-shadow: 0 6px 16px rgba(220, 38, 38, 0.4); /* ✅ Matches your hover shadows */
    }
    .btn-danger:active {
      transform: translateY(0);
    }

    /* Animations */
    @keyframes fadeIn { 
      to { opacity: 1; } 
    }
    @keyframes springPopup { 
      to { opacity: 1; transform: scale(1); } 
    }
    @keyframes pulse-ring {
      0% { transform: scale(0.8); opacity: 0.6; }
      100% { transform: scale(1.8); opacity: 0; }
    }

    /* Mobile Responsive */
    @media (max-width: 768px) {
      .delete-confirmation-modal {
        padding: 24px 20px;
      }
      
      .modal-title {
        font-size: 1.2rem;
      }
      
      .modal-buttons {
        flex-direction: column-reverse;
        gap: 10px;
      }
      
      .btn-modal {
        width: 100%;
      }
    }
  `;
  document.head.appendChild(style);
}

export function createDeleteConfirmation(config: DeleteConfirmationConfig): HTMLElement {
  injectDeleteStyles();

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      config.onCancel();
      removeModal(overlay);
    }
  });

  const modal = document.createElement('div');
  modal.className = 'delete-confirmation-modal';
  
  const iconWrapper = document.createElement('div');
  iconWrapper.className = 'icon-wrapper';
  iconWrapper.innerHTML = `
    <svg class="warning-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  `;
  modal.appendChild(iconWrapper);

  const heading = document.createElement('h3');
  heading.className = 'modal-title';
  heading.textContent = 'Delete this item?';
  modal.appendChild(heading);

  const message = document.createElement('p');
  message.className = 'modal-message';
  message.innerHTML = `This action cannot be undone. You are about to permanently delete <span class="highlight-item">${config.itemName}</span>.`;
  modal.appendChild(message);

  const buttons = document.createElement('div');
  buttons.className = 'modal-buttons';

  const cancelBtn = document.createElement('button');
  cancelBtn.textContent = 'Cancel';
  cancelBtn.className = 'btn-modal btn-cancel';
  cancelBtn.onclick = () => {
    config.onCancel();
    removeModal(overlay);
  };
  buttons.appendChild(cancelBtn);

  const confirmBtn = document.createElement('button');
  confirmBtn.textContent = 'Delete';
  confirmBtn.className = 'btn-modal btn-danger';
  confirmBtn.onclick = () => {
    confirmBtn.textContent = 'Deleting...';
    confirmBtn.style.opacity = '0.7';
    confirmBtn.disabled = true;
    config.onConfirm();
    removeModal(overlay);
  };
  buttons.appendChild(confirmBtn);

  modal.appendChild(buttons);
  overlay.appendChild(modal);

  setTimeout(() => cancelBtn.focus(), 100);

  return overlay;
}

function removeModal(overlay: HTMLElement) {
  overlay.style.transition = 'opacity 0.2s';
  overlay.style.opacity = '0';
  setTimeout(() => {
    if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
  }, 200);
}

export function showDeleteConfirmation(config: DeleteConfirmationConfig): void {
  const modal = createDeleteConfirmation(config);
  document.body.appendChild(modal);
}
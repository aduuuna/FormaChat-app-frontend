export function createLoadingSpinner(message: string = 'Loading...'): HTMLElement {

  if (!document.getElementById('spinner-styles')) {
    const style = document.createElement('style');
    style.id = 'spinner-styles';
    style.textContent = `
      :root {
        --primary: #636b2f;
        --secondary: #bac095;
      }

      /* Container: The Glass Overlay */
      .loading-spinner-container {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(255, 255, 255, 0.6); /* Semi-transparent */
        backdrop-filter: blur(8px); /* The Blur Effect */
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        z-index: 50; /* Sit above content */
        opacity: 0;
        animation: fadeIn 0.3s forwards;
        border-radius: inherit; /* Match parent rounded corners */
      }

      /* Wrapper to hold the rings */
      .spinner-wrapper {
        position: relative;
        width: 60px;
        height: 60px;
        margin-bottom: 20px;
      }

      /* Ring 1: The Outer Primary Ring */
      .spinner-ring-1 {
        position: absolute;
        width: 100%;
        height: 100%;
        border: 3px solid transparent;
        border-top-color: var(--primary);
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }

      /* Ring 2: The Inner Secondary Ring */
      .spinner-ring-2 {
        position: absolute;
        top: 10%;
        left: 10%;
        width: 80%;
        height: 80%;
        border: 3px solid transparent;
        border-bottom-color: var(--secondary);
        border-radius: 50%;
        animation: spin-reverse 1.5s linear infinite;
      }

      /* Loading Text */
      .loading-text {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        color: var(--primary);
        font-weight: 600;
        font-size: 0.95rem;
        letter-spacing: 0.5px;
        animation: pulse-text 1.5s ease-in-out infinite;
      }

      /* Animations */
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

      @keyframes spin-reverse {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(-360deg); }
      }

      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
      }
      
      @keyframes pulse-text {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.6; }
      }
    `;
    document.head.appendChild(style);
  }

 
  const container = document.createElement('div');
  container.className = 'loading-spinner-container';
  

  const wrapper = document.createElement('div');
  wrapper.className = 'spinner-wrapper';
  
  const ring1 = document.createElement('div');
  ring1.className = 'spinner-ring-1';
  
  const ring2 = document.createElement('div');
  ring2.className = 'spinner-ring-2';
  
  wrapper.appendChild(ring1);
  wrapper.appendChild(ring2);
  

  const text = document.createElement('p');
  text.className = 'loading-text';
  text.textContent = message;
  
  container.appendChild(wrapper);
  container.appendChild(text);
  
  return container;
}

export function showLoadingSpinner(
  parent: HTMLElement,
  message: string = 'Processing...'
): HTMLElement {
 
  const parentStyle = window.getComputedStyle(parent);
  if (parentStyle.position === 'static') {
      parent.style.position = 'relative';
  }

  const spinner = createLoadingSpinner(message);
  parent.appendChild(spinner);
  return spinner;
}

export function hideLoadingSpinner(spinner: HTMLElement): void {
  
  spinner.style.animation = 'fadeOut 0.3s forwards';
  
  spinner.addEventListener('animationend', () => {
    if (spinner.parentNode) {
      spinner.parentNode.removeChild(spinner);
    }
  });
}
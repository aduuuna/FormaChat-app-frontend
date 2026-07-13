const EYE_OPEN = `<svg class="eye-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>`;
const EYE_CLOSED = `<svg class="eye-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;

function injectPasswordToggleStyles(): void {
  if (document.getElementById('password-toggle-styles')) return;
  const style = document.createElement('style');
  style.id = 'password-toggle-styles';
  style.textContent = `
    .password-toggle-btn {
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      background: transparent;
      border: none;
      cursor: pointer;
      padding: 5px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #666;
      transition: color 0.2s ease;
    }
    .password-toggle-btn:hover { color: #636b2f; }
    .password-toggle-btn:focus { outline: none; }
    .eye-icon { pointer-events: none; }
  `;
  document.head.appendChild(style);
}

/**
 * Adds the show/hide eye-icon toggle to a password <input>, matching the
 * pattern originally built for the login page - this is the single source
 * of that behavior now, rather than every page hand-copying its own SVG
 * toggle (which is how settings.ts and forgot-password.ts ended up missing
 * it entirely). Call this once, right after the input is attached to its
 * real parent - that parent becomes the positioning context for the button,
 * upgraded to position:relative automatically if it isn't already.
 */
export function attachPasswordToggle(input: HTMLInputElement): void {
  injectPasswordToggleStyles();

  const wrapper = input.parentElement;
  if (wrapper && window.getComputedStyle(wrapper).position === 'static') {
    wrapper.style.position = 'relative';
  }

  input.style.paddingRight = '45px';

  const toggleBtn = document.createElement('button');
  toggleBtn.type = 'button';
  toggleBtn.className = 'password-toggle-btn';
  toggleBtn.setAttribute('aria-label', 'Show password');
  toggleBtn.innerHTML = EYE_OPEN;

  toggleBtn.addEventListener('click', () => {
    if (input.type === 'password') {
      input.type = 'text';
      toggleBtn.innerHTML = EYE_CLOSED;
      toggleBtn.setAttribute('aria-label', 'Hide password');
    } else {
      input.type = 'password';
      toggleBtn.innerHTML = EYE_OPEN;
      toggleBtn.setAttribute('aria-label', 'Show password');
    }
  });

  input.insertAdjacentElement('afterend', toggleBtn);
}

import { requestPasswordReset, confirmPasswordReset } from '../../services/auth.service';
import { showToast } from '../../utils/toast';

function injectForgotPasswordStyles() {
  if (document.getElementById('forgot-password-styles')) return;
  const style = document.createElement('style');
  style.id = 'forgot-password-styles';
  style.textContent = `
    .forgot-container {
      max-width: 400px;
      margin: 60px auto;
      padding: 40px 30px;
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(10px);
      border-radius: 16px;
      border: 1px solid rgba(255, 255, 255, 0.5);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
      animation: floatUp 0.6s ease-out forwards;
      opacity: 0;
      transform: translateY(20px);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
    @keyframes floatUp { to { opacity: 1; transform: translateY(0); } }
    .forgot-title {
      font-size: 1.8rem;
      font-weight: 800;
      color: #636b2f;
      margin: 0 0 8px 0;
      text-align: center;
      letter-spacing: -0.5px;
    }
    .forgot-subtitle {
      text-align: center;
      color: #666;
      margin-bottom: 28px;
      font-size: 0.95rem;
      line-height: 1.5;
    }
    .forgot-form-group { margin-bottom: 18px; }
    .forgot-label {
      display: block;
      margin-bottom: 7px;
      font-weight: 600;
      color: #1a1a1a;
      font-size: 0.9rem;
    }
    .forgot-input {
      width: 100%;
      padding: 12px 16px;
      box-sizing: border-box;
      border: 1px solid #e1e1e1;
      border-radius: 8px;
      background: #f7f9fb;
      font-size: 1rem;
      color: #1a1a1a;
      transition: border-color 0.2s ease;
    }
    .forgot-input:focus { outline: none; border-color: #636b2f; background: #fff; }
    .forgot-btn {
      width: 100%;
      padding: 13px;
      background: #636b2f;
      color: #fff;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 700;
      cursor: pointer;
      margin-top: 6px;
      transition: background 0.2s ease;
    }
    .forgot-btn:hover { background: #4a5122; }
    .forgot-btn:disabled { opacity: 0.65; cursor: not-allowed; }
    .forgot-link {
      display: block;
      text-align: center;
      margin-top: 20px;
      font-size: 0.88rem;
      color: #636b2f;
      text-decoration: none;
      font-weight: 600;
    }
    .forgot-link:hover { text-decoration: underline; }
  `;
  document.head.appendChild(style);
}

export function renderForgotPassword(): HTMLElement {
  injectForgotPasswordStyles();

  const wrapper = document.createElement('div');
  wrapper.style.cssText = 'min-height:100vh; background:#f5f5f5; display:flex; flex-direction:column; justify-content:center;';

  const container = document.createElement('div');
  container.className = 'forgot-container';

  // ---- Step 1: email form ----
  const step1 = document.createElement('div');

  const title1 = document.createElement('h1');
  title1.className = 'forgot-title';
  title1.textContent = 'Reset Password';
  step1.appendChild(title1);

  const subtitle1 = document.createElement('p');
  subtitle1.className = 'forgot-subtitle';
  subtitle1.textContent = 'Enter the email address on your account and we\'ll send you a reset code.';
  step1.appendChild(subtitle1);

  const emailGroup = document.createElement('div');
  emailGroup.className = 'forgot-form-group';
  const emailLabel = document.createElement('label');
  emailLabel.className = 'forgot-label';
  emailLabel.textContent = 'Email address';
  const emailInput = document.createElement('input');
  emailInput.type = 'email';
  emailInput.className = 'forgot-input';
  emailInput.placeholder = 'you@example.com';
  emailInput.required = true;
  emailGroup.appendChild(emailLabel);
  emailGroup.appendChild(emailInput);
  step1.appendChild(emailGroup);

  const sendBtn = document.createElement('button');
  sendBtn.className = 'forgot-btn';
  sendBtn.textContent = 'Send Reset Code';
  step1.appendChild(sendBtn);

  const backToLogin = document.createElement('a');
  backToLogin.href = '#/login';
  backToLogin.className = 'forgot-link';
  backToLogin.textContent = 'Back to login';
  step1.appendChild(backToLogin);

  container.appendChild(step1);

  // ---- Step 2: OTP + new password form ----
  const step2 = document.createElement('div');
  step2.style.display = 'none';

  const title2 = document.createElement('h1');
  title2.className = 'forgot-title';
  title2.textContent = 'Set New Password';
  step2.appendChild(title2);

  const subtitle2 = document.createElement('p');
  subtitle2.className = 'forgot-subtitle';
  subtitle2.id = 'forgot-subtitle2';
  subtitle2.textContent = 'Enter the code we sent to your email and choose a new password.';
  step2.appendChild(subtitle2);

  const otpGroup = document.createElement('div');
  otpGroup.className = 'forgot-form-group';
  const otpLabel = document.createElement('label');
  otpLabel.className = 'forgot-label';
  otpLabel.textContent = 'Reset code';
  const otpInput = document.createElement('input');
  otpInput.type = 'text';
  otpInput.className = 'forgot-input';
  otpInput.placeholder = '6-digit code';
  otpInput.maxLength = 6;
  otpInput.style.letterSpacing = '4px';
  otpInput.style.textAlign = 'center';
  otpInput.style.fontSize = '1.4rem';
  otpGroup.appendChild(otpLabel);
  otpGroup.appendChild(otpInput);
  step2.appendChild(otpGroup);

  const pwGroup = document.createElement('div');
  pwGroup.className = 'forgot-form-group';
  const pwLabel = document.createElement('label');
  pwLabel.className = 'forgot-label';
  pwLabel.textContent = 'New password';
  const pwInput = document.createElement('input');
  pwInput.type = 'password';
  pwInput.className = 'forgot-input';
  pwInput.placeholder = 'At least 8 characters';
  pwGroup.appendChild(pwLabel);
  pwGroup.appendChild(pwInput);
  step2.appendChild(pwGroup);

  const confirmBtn = document.createElement('button');
  confirmBtn.className = 'forgot-btn';
  confirmBtn.textContent = 'Reset Password';
  step2.appendChild(confirmBtn);

  const backToStep1 = document.createElement('a');
  backToStep1.href = '#';
  backToStep1.className = 'forgot-link';
  backToStep1.textContent = 'Use a different email';
  backToStep1.addEventListener('click', (e) => {
    e.preventDefault();
    step2.style.display = 'none';
    step1.style.display = '';
  });
  step2.appendChild(backToStep1);

  container.appendChild(step2);
  wrapper.appendChild(container);

  // ---- Step 1 submit ----
  sendBtn.addEventListener('click', async () => {
    const email = emailInput.value.trim();
    if (!email) {
      showToast('Please enter your email address.', 'error');
      return;
    }
    sendBtn.disabled = true;
    sendBtn.textContent = 'Sending...';

    try {
      const response = await requestPasswordReset(email);
      if (!response.success) {
        showToast((response as any).error?.message || 'Failed to send reset code.', 'error');
      } else {
        subtitle2.textContent = `We sent a 6-digit code to ${email}. Enter it below along with your new password.`;
        step1.style.display = 'none';
        step2.style.display = '';
        showToast('Reset code sent!', 'success');
      }
    } catch {
      showToast('Something went wrong. Please try again.', 'error');
    } finally {
      sendBtn.disabled = false;
      sendBtn.textContent = 'Send Reset Code';
    }
  });

  // ---- Step 2 submit ----
  confirmBtn.addEventListener('click', async () => {
    const email = emailInput.value.trim();
    const otp = otpInput.value.trim();
    const newPassword = pwInput.value;

    if (!otp || otp.length < 6) {
      showToast('Please enter the 6-digit code from your email.', 'error');
      return;
    }
    if (!newPassword || newPassword.length < 8) {
      showToast('Password must be at least 8 characters.', 'error');
      return;
    }
    confirmBtn.disabled = true;
    confirmBtn.textContent = 'Resetting...';

    try {
      const response = await confirmPasswordReset(email, otp, newPassword);
      if (!response.success) {
        showToast((response as any).error?.message || 'Failed to reset password.', 'error');
      } else {
        showToast('Password reset successfully. Redirecting to login...', 'success');
        confirmBtn.style.display = 'none';
        setTimeout(() => { window.location.hash = '#/login'; }, 2000);
      }
    } catch {
      showToast('Something went wrong. Please try again.', 'error');
    } finally {
      confirmBtn.disabled = false;
      if (confirmBtn.textContent === 'Resetting...') confirmBtn.textContent = 'Reset Password';
    }
  });

  return wrapper;
}

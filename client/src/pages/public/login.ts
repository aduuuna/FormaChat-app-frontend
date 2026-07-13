import { login, verifyTwoFactorLogin, requestMagicLink } from '../../services/auth.service';
import { saveTokens, saveUser } from '../../utils/auth.utils';
import { isTwoFactorRequired } from '../../types/auth.types';
import { showToast } from '../../utils/toast';
import { attachPasswordToggle } from '../../utils/password-field.utils';

function injectLoginStyles() {
   
    if (document.getElementById('login-page-styles')) return;

    const style = document.createElement('style');
    style.id = 'login-page-styles';
    style.textContent = `
        :root {
            --primary: #636b2f; /* Dark Green/Olive */
            --secondary: #bac095; /* Light Olive */
            --text-main: #1a1a1a;
            --text-muted: #666;
            --error-red: #dc3545;
            --bg-light: #f7f9fb;
        }

        /* 1. Main Container (Glassmorphism Card) */
        .login-container {
            max-width: 400px;
            margin: 60px auto; /* Slightly more top margin for breathing room */
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

        @keyframes floatUp {
            to { opacity: 1; transform: translateY(0); }
        }

        /* 2. Typography */
        .login-title {
            font-size: 2rem;
            font-weight: 800;
            color: var(--primary);
            margin: 0 0 10px 0;
            text-align: center;
            letter-spacing: -0.5px;
        }
        
        .login-subtitle {
            text-align: center;
            color: var(--text-muted);
            margin-bottom: 30px;
            font-size: 0.95rem;
        }

        /* 3. Form Fields */
        .form-group {
            margin-bottom: 20px;
        }

        .form-label {
            display: block;
            margin-bottom: 8px;
            font-weight: 600;
            color: var(--text-main);
            font-size: 0.9rem;
        }

        .form-input {
            width: 100%;
            padding: 12px 16px;
            box-sizing: border-box;
            border: 1px solid #e1e1e1;
            border-radius: 8px;
            background: var(--bg-light);
            transition: all 0.2s ease;
            font-size: 1rem;
            color: var(--text-main);
        }

        .form-input:focus {
            border-color: var(--primary);
            background: white;
            box-shadow: 0 0 0 4px rgba(99, 107, 47, 0.1);
            outline: none;
        }

        /* 4. Buttons */
        .btn-submit {
            width: 100%;
            padding: 14px;
            background: var(--primary);
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
            margin-top: 10px;
            box-shadow: 0 4px 6px rgba(99, 107, 47, 0.2);
        }

        .btn-submit:hover:not(:disabled) {
            background: #4f5625;
            transform: translateY(-1px);
            box-shadow: 0 6px 12px rgba(99, 107, 47, 0.3);
        }

        .btn-submit:disabled {
            opacity: 0.7;
            cursor: wait;
        }

        /* 5. Messages & Links */
        .register-link {
            margin-top: 25px;
            text-align: center;
            font-size: 0.9rem;
            color: var(--text-muted);
        }

        .register-link a {
            color: var(--primary);
            text-decoration: none;
            font-weight: 600;
            transition: color 0.2s;
        }

        .register-link a:hover {
            color: #4f5625;
            text-decoration: underline;
        }

    `;
    document.head.appendChild(style);
}

export function renderLogin(): HTMLElement {
    injectLoginStyles();

    const container = document.createElement('div');
    container.className = 'login-container';

    const title = document.createElement('h1');
    title.textContent = 'Welcome Back'; 
    title.className = 'login-title';
    container.appendChild(title);

    const subtitle = document.createElement('p');
    subtitle.textContent = 'Please enter your details to sign in.';
    subtitle.className = 'login-subtitle';
    container.appendChild(subtitle);

    const form = document.createElement('form');

    // === EMAIL FIELD ===
    const emailDiv = document.createElement('div');
    emailDiv.className = 'form-group';

    const emailLabel = document.createElement('label');
    emailLabel.textContent = 'Email';
    emailLabel.className = 'form-label';
    emailDiv.appendChild(emailLabel);

    const emailInput = document.createElement('input');
    emailInput.type = 'email';
    emailInput.name = 'email';
    emailInput.required = true;
    emailInput.className = 'form-input';
    emailInput.placeholder = 'name@company.com'; 
    emailDiv.appendChild(emailInput);

    form.appendChild(emailDiv);

    // === PASSWORD FIELD WITH TOGGLE ===
    const passwordDiv = document.createElement('div');
    passwordDiv.className = 'form-group';

    const passwordLabel = document.createElement('label');
    passwordLabel.textContent = 'Password';
    passwordLabel.className = 'form-label';
    passwordDiv.appendChild(passwordLabel);

    // Create wrapper for input + toggle button
    const inputWrapper = document.createElement('div');
    inputWrapper.style.position = 'relative';

    const passwordInput = document.createElement('input');
    passwordInput.type = 'password';
    passwordInput.name = 'password';
    passwordInput.required = true;
    passwordInput.className = 'form-input';
    passwordInput.placeholder = 'password';

    inputWrapper.appendChild(passwordInput);
    attachPasswordToggle(passwordInput);
    passwordDiv.appendChild(inputWrapper);

    form.appendChild(passwordDiv);

    const forgotLink = document.createElement('div');
    forgotLink.style.cssText = 'text-align:right; margin-bottom:4px; margin-top:-4px;';
    const forgotAnchor = document.createElement('a');
    forgotAnchor.href = '#/forgot-password';
    forgotAnchor.textContent = 'Forgot password?';
    forgotAnchor.style.cssText = 'font-size:0.85rem; color:#636b2f; font-weight:600; text-decoration:none;';
    forgotLink.appendChild(forgotAnchor);
    form.appendChild(forgotLink);

    const magicLinkTrigger = document.createElement('div');
    magicLinkTrigger.style.cssText = 'text-align:right; margin-bottom:16px;';
    const magicLinkAnchor = document.createElement('a');
    magicLinkAnchor.href = '#';
    magicLinkAnchor.textContent = 'Email me a login link instead';
    magicLinkAnchor.style.cssText = 'font-size:0.82rem; color:#666; font-weight:600; text-decoration:none;';
    magicLinkTrigger.appendChild(magicLinkAnchor);
    form.appendChild(magicLinkTrigger);

    // === SUBMIT BUTTON ===
    const submitBtn = document.createElement('button');
    submitBtn.type = 'submit';
    submitBtn.textContent = 'Sign In';
    submitBtn.className = 'btn-submit';
    form.appendChild(submitBtn);

    // === 2FA STEP (hidden until required) ===
    const otpStep = document.createElement('div');
    otpStep.style.display = 'none';

    const otpSubtitle = document.createElement('p');
    otpSubtitle.className = 'login-subtitle';
    otpSubtitle.textContent = 'Enter the 6-digit code we emailed you to finish signing in.';
    otpStep.appendChild(otpSubtitle);

    const otpDiv = document.createElement('div');
    otpDiv.className = 'form-group';
    const otpLabel = document.createElement('label');
    otpLabel.textContent = 'Verification code';
    otpLabel.className = 'form-label';
    const otpInput = document.createElement('input');
    otpInput.type = 'text';
    otpInput.inputMode = 'numeric';
    otpInput.maxLength = 6;
    otpInput.className = 'form-input';
    otpInput.placeholder = '000000';
    otpDiv.appendChild(otpLabel);
    otpDiv.appendChild(otpInput);
    otpStep.appendChild(otpDiv);

    const otpSubmitBtn = document.createElement('button');
    otpSubmitBtn.type = 'button';
    otpSubmitBtn.textContent = 'Verify & Sign In';
    otpSubmitBtn.className = 'btn-submit';
    otpStep.appendChild(otpSubmitBtn);

    let pendingUserId: string | null = null;

    const completeSuccessfulLogin = (data: { user: any; tokens: any; reactivated?: boolean }) => {
        saveTokens(data.tokens);
        saveUser(data.user);
        if (data.reactivated) {
            showToast('Welcome back — your account has been reactivated.', 'success');
        }
        setTimeout(() => {
            window.location.hash = '#/dashboard';
        }, data.reactivated ? 1200 : 500);
    };

    otpSubmitBtn.addEventListener('click', async () => {
        const otp = otpInput.value.trim();
        if (!pendingUserId) return;
        if (!/^\d{6}$/.test(otp)) {
            showToast('Enter the 6-digit code from your email.', 'error');
            return;
        }

        otpSubmitBtn.disabled = true;
        otpSubmitBtn.textContent = 'Verifying...';

        try {
            const response = await verifyTwoFactorLogin(pendingUserId, otp);
            if (!response.success) {
                showToast(response.error.message || 'Invalid or expired code.', 'error');
                return;
            }

            otpSubmitBtn.textContent = 'Success!';
            otpSubmitBtn.style.background = '#28a745';
            completeSuccessfulLogin(response.data);
        } catch {
            showToast('An unexpected error occurred. Please try again.', 'error');
        } finally {
            if (otpSubmitBtn.textContent !== 'Success!') {
                otpSubmitBtn.disabled = false;
                otpSubmitBtn.textContent = 'Verify & Sign In';
            }
        }
    });

    // === MAGIC LINK STEP (hidden until requested) ===
    const magicLinkStep = document.createElement('div');
    magicLinkStep.style.display = 'none';

    const magicLinkSubtitle = document.createElement('p');
    magicLinkSubtitle.className = 'login-subtitle';
    magicLinkSubtitle.textContent = "We'll email you a link to sign in - no password needed.";
    magicLinkStep.appendChild(magicLinkSubtitle);

    const magicLinkEmailDiv = document.createElement('div');
    magicLinkEmailDiv.className = 'form-group';
    const magicLinkEmailLabel = document.createElement('label');
    magicLinkEmailLabel.textContent = 'Email';
    magicLinkEmailLabel.className = 'form-label';
    const magicLinkEmailInput = document.createElement('input');
    magicLinkEmailInput.type = 'email';
    magicLinkEmailInput.className = 'form-input';
    magicLinkEmailInput.placeholder = 'name@company.com';
    magicLinkEmailDiv.appendChild(magicLinkEmailLabel);
    magicLinkEmailDiv.appendChild(magicLinkEmailInput);
    magicLinkStep.appendChild(magicLinkEmailDiv);

    const magicLinkSuccessMessage = document.createElement('p');
    magicLinkSuccessMessage.style.cssText = 'display:none; text-align:center; color:#3a4014; font-size:0.9rem; margin: 4px 0 20px;';
    magicLinkStep.appendChild(magicLinkSuccessMessage);

    const magicLinkSendBtn = document.createElement('button');
    magicLinkSendBtn.type = 'button';
    magicLinkSendBtn.textContent = 'Send Sign-In Link';
    magicLinkSendBtn.className = 'btn-submit';
    magicLinkStep.appendChild(magicLinkSendBtn);

    const backToPasswordLink = document.createElement('div');
    backToPasswordLink.style.cssText = 'text-align:center; margin-top:16px;';
    const backToPasswordAnchor = document.createElement('a');
    backToPasswordAnchor.href = '#';
    backToPasswordAnchor.textContent = 'Back to password sign-in';
    backToPasswordAnchor.style.cssText = 'font-size:0.85rem; color:#636b2f; font-weight:600; text-decoration:none;';
    backToPasswordAnchor.addEventListener('click', (e) => {
        e.preventDefault();
        magicLinkStep.style.display = 'none';
        form.style.display = '';
        subtitle.textContent = 'Please enter your details to sign in.';
    });
    backToPasswordLink.appendChild(backToPasswordAnchor);
    magicLinkStep.appendChild(backToPasswordLink);

    magicLinkAnchor.addEventListener('click', (e) => {
        e.preventDefault();
        magicLinkEmailInput.value = emailInput.value;
        form.style.display = 'none';
        subtitle.textContent = '';
        magicLinkStep.style.display = '';
    });

    magicLinkSendBtn.addEventListener('click', async () => {
        const email = magicLinkEmailInput.value.trim();
        if (!email) {
            showToast('Please enter your email address.', 'error');
            return;
        }
        magicLinkSendBtn.disabled = true;
        magicLinkSendBtn.textContent = 'Sending...';

        try {
            const response = await requestMagicLink(email);
            if (!response.success) {
                showToast(response.error.message || 'Failed to send sign-in link.', 'error');
                return;
            }
            magicLinkSuccessMessage.textContent = `Check ${email} for a link to sign in. It expires in 10 minutes.`;
            magicLinkSuccessMessage.style.display = 'block';
            magicLinkEmailDiv.style.display = 'none';
            magicLinkSendBtn.style.display = 'none';
            showToast('Sign-in link sent!', 'success');
        } catch {
            showToast('An unexpected error occurred. Please try again.', 'error');
        } finally {
            magicLinkSendBtn.disabled = false;
            magicLinkSendBtn.textContent = 'Send Sign-In Link';
        }
    });

    // === FORM SUBMISSION ===
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = emailInput.value;
        const password = passwordInput.value;

        submitBtn.disabled = true;
        submitBtn.textContent = 'Verifying...';

        try {
            const response = await login({ email, password });

            if (!response.success) {

                if (response.error.code === 'EMAIL_NOT_VERIFIED') {
                    showToast('Account not verified. Redirecting to verification...', 'info');

                    localStorage.setItem('pendingVerificationEmail', email);

                    setTimeout(() => {
                        window.location.hash = '#/verify-email';
                    }, 1500);
                    return;
                }

                showToast(response.error.message || 'Invalid email or password.', 'error');
                return;
            }

            if (isTwoFactorRequired(response.data)) {
                pendingUserId = response.data.userId;
                form.style.display = 'none';
                title.textContent = 'Two-Factor Verification';
                subtitle.textContent = '';
                otpStep.style.display = '';
                otpInput.focus();
                return;
            }

            submitBtn.textContent = 'Success!';
            submitBtn.style.background = '#28a745';

            completeSuccessfulLogin(response.data);

        } catch (error: any) {
            showToast('An unexpected error occurred. Please try again.', 'error');
            console.error('Login error:', error);
        } finally {

            if (submitBtn.textContent !== 'Success!') {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Sign In';
            }
        }
    });

    container.appendChild(form);
    container.appendChild(otpStep);
    container.appendChild(magicLinkStep);

    // === REGISTER LINK ===
    const registerLink = document.createElement('p');
    registerLink.className = 'register-link';
    registerLink.innerHTML = `Don't have an account? <a href="#/register">Create one now</a>`;
    container.appendChild(registerLink);

    return container;
}